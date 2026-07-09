"use client";

import { useState, useCallback, useEffect } from "react";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

interface UsePaystackPaymentOptions {
  email: string;
  amount: string;
  currency?: string;
  publicKey?: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
}

interface UsePaystackPaymentReturn {
  isReady: boolean;
  isProcessing: boolean;
  statusMessage: string;
  successMessage: string;
  initializePayment: () => Promise<void>;
}

export function usePaystackPayment({
  email,
  amount,
  currency = "NGN",
  publicKey,
  onSuccess,
  onClose,
}: UsePaystackPaymentOptions): UsePaystackPaymentReturn {
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!publicKey || typeof window === "undefined") {
      return;
    }

    if (window.PaystackPop) {
      setIsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setIsReady(true);
    script.onerror = () => setStatusMessage("Unable to load Paystack checkout script.");
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [publicKey]);

  const initializePayment = useCallback(async () => {
    setStatusMessage("");
    setSuccessMessage("");

    const donationValue = Number(amount.replace(/[^0-9.]/g, ""));
    if (!donationValue || donationValue <= 0) {
      setStatusMessage("Please enter a valid donation amount.");
      return;
    }

    if (!email.trim()) {
      setStatusMessage("Please enter your email address.");
      return;
    }

    if (!publicKey) {
      setStatusMessage("Paystack is not configured. Please add a public key.");
      return;
    }

    if (!window.PaystackPop) {
      setStatusMessage("Paystack checkout is not available. Please refresh the page.");
      return;
    }

    setIsProcessing(true);

    try {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email.trim(),
        amount: Math.round(donationValue * 100),
        currency,
        channels: ["card", "bank", "ussd"],
        onClose: () => {
          setIsProcessing(false);
          setStatusMessage("Payment window closed. You can try again anytime.");
          onClose?.();
        },
        callback: async (response: { reference: string }) => {
          try {
            const verifyResponse = await fetch(
              `/api/paystack/verify?reference=${encodeURIComponent(response.reference)}`
            );
            const payload = await verifyResponse.json();
            if (!verifyResponse.ok) {
              setStatusMessage(
                payload?.error || "Payment completed but verification failed."
              );
              setIsProcessing(false);
              return;
            }

            setSuccessMessage(
              `Payment confirmed: ${payload.data.status}. Reference: ${response.reference}`
            );
            onSuccess?.(response.reference);
          } catch (error) {
            setStatusMessage("Payment completed but verification request failed.");
          } finally {
            setIsProcessing(false);
          }
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Paystack checkout error:", error);
      setStatusMessage("Unable to start Paystack checkout. Please try again later.");
      setIsProcessing(false);
    }
  }, [email, amount, currency, publicKey, onSuccess, onClose]);

  return {
    isReady,
    isProcessing,
    statusMessage,
    successMessage,
    initializePayment,
  };
}