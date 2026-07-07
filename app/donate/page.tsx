"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import styles from "./donate.module.css";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export default function DonatePage() {
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
  const paystackCurrency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || "NGN";

  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("5000");
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!paystackPublicKey || typeof window === "undefined") {
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
  }, [paystackPublicKey]);

  const handlePayment = async () => {
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

    if (!paystackPublicKey) {
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
        key: paystackPublicKey,
        email: email.trim(),
        amount: Math.round(donationValue * 100),
        currency: paystackCurrency,
        channels: ["card", "bank", "ussd"],
        onClose: () => {
          setIsProcessing(false);
          setStatusMessage("Payment window closed. You can try again anytime.");
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
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <span className={styles.badge}>Support Us</span>
            <h1>Give to Light to Life</h1>
            <p>
              Donate using Paystack or the account/SWIFT details below. Paystack is enabled when
              the public key is configured.
            </p>

            <div className={styles.ctaRow}>
              <Link className={styles.secondaryBtn} href="/">
                Back Home
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <Image
              src="/logo.jpeg"
              alt="Light to Life"
              width={160}
              height={80}
              className={styles.logo}
            />

            <h2>Paystack Donation</h2>

            <div className={styles.paymentForm}>
              <label htmlFor="donationAmount">Amount ({paystackCurrency})</label>
              <input
                id="donationAmount"
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.input}
                placeholder="Enter amount"
              />

              <label htmlFor="donorEmail">Email</label>
              <input
                id="donorEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="your@email.com"
              />

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handlePayment}
                disabled={!paystackPublicKey || isProcessing || !isReady}
              >
                {isProcessing ? "Processing..." : "Donate with Paystack"}
              </button>

              {!paystackPublicKey && (
                <p className={styles.note}>
                  Paystack public key is not configured. Add `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
                  to enable this option.
                </p>
              )}

              {statusMessage && (
                <p className={styles.statusMessage}>{statusMessage}</p>
              )}

              {successMessage && (
                <p className={styles.successMessage}>{successMessage}</p>
              )}
            </div>

            <div className={styles.detailBox}>
              <h3>Bank Transfer / SWIFT</h3>
              <p>
                Use the account and SWIFT details you have received for bank transfer donations.
              </p>
              <p>
                If you need the bank details added to this page, I can help place them here.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
