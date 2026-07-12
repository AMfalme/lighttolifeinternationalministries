"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import ToastContainer, { showToast } from "../components/Toast/Toast";
import styles from "./donate.module.css";
import { createDonation } from "../lib/firebase/firestore";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export default function DonatePage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("500");
  const [currency, setCurrency] = useState("KES");
  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isPaystackReady, setIsPaystackReady] = useState(false);

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  // Load Paystack script
  useEffect(() => {
    if (!publicKey || typeof window === "undefined") return;

    if (window.PaystackPop) {
      setIsPaystackReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setIsPaystackReady(true);
    script.onerror = () => setStatusMessage("Unable to load the Paystack checkout script. Please check your internet connection or browser settings.");
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [publicKey]);

  const handleSuccess = useCallback((reference: string) => {
    showToast("success", `Thank you! Your donation of ${currency === "KES" ? "KSh" : "$"}${Number(amount.replace(/[^0-9.]/g, "") || 0).toLocaleString()} was successful. Reference: ${reference}`);
    // Reset form
    setAmount("500");
    setEmail("");
    setDonorName("");
    setPhone("");
    setMessage("");
    setStatusMessage("");
    console.log("Donation succeeded:", reference);
  }, [amount, currency]);

  const handleDonateSubmit = async () => {
    setStatusMessage("");

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
      setStatusMessage("Paystack checkout is not available yet. Please wait a moment and try again.");
      return;
    }

    setIsProcessing(true);

    try {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: email.trim(),
        amount: Math.round(donationValue * 100),
        currency,
        channels: ["card", "bank", "ussd", "mobile_money", "qr"],
        onClose: function () {
          setIsProcessing(false);
          setStatusMessage("Payment window closed. You can try again anytime.");
        },
        callback: function (response: { reference: string }) {
          void (async () => {
            try {
              const verifyResponse = await fetch(
                `/api/paystack/verify?reference=${encodeURIComponent(response.reference)}`
              );
              const payload = await verifyResponse.json();

              if (!verifyResponse.ok) {
                setStatusMessage(payload?.error || "Payment completed but verification failed.");
                setIsProcessing(false);
                return;
              }

              // Save donation to Firestore
              try {
                await createDonation({
                  email: email.trim(),
                  amount: donationValue,
                  currency,
                  donorName: donorName?.trim() || "",
                  phone: phone?.trim() || "",
                  reference: response.reference,
                  channel: payload.data?.channel || "unknown",
                  status: payload.data?.status || "success",
                  message: message?.trim() || "",
                });
              } catch (dbError) {
                console.error("Error saving donation to Firestore:", dbError);
              }

              // Show success toast
              setIsProcessing(false);
              setStatusMessage("");
              showToast("success", `🎉 Thank you for your generous donation of ${currency === "KES" ? "KSh" : "$"}${donationValue.toLocaleString()}! God bless you abundantly.`);
              handleSuccess(response.reference);
            } catch (error) {
              setStatusMessage("Payment completed but verification request failed.");
              setIsProcessing(false);
            }
          })();
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Donation error:", error);
      setStatusMessage(`Unable to start Paystack checkout. ${error instanceof Error ? error.message : "Please try again later."}`);
      setIsProcessing(false);
    }
  };

  const presetAmounts = [200, 500, 1000, 2000, 5000];

  return (
    <div className={styles.page}>
      <Navbar />
      <ToastContainer />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <span className={styles.badge}>Giving & Generosity</span>
            <h1>Partner With Us</h1>
            <p className={styles.copyIntro}>
              Your generous giving helps us reach communities with the love of Christ,
              support those in need, and advance the Kingdom of God through impactful ministry work.
            </p>

            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>🔒</span>
                <div>
                  <strong>Secured by Paystack</strong>
                  <span>PCI-DSS compliant encryption</span>
                </div>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>📋</span>
                <div>
                  <strong>Instant Receipt</strong>
                  <span>Get email confirmation instantly</span>
                </div>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>🌍</span>
                <div>
                  <strong>Global Giving</strong>
                  <span>KES & USD accepted</span>
                </div>
              </div>
            </div>

            <div className={styles.copyImpact}>
              <h3>Your Giving Changes Lives</h3>
              <div className={styles.impactGrid}>
                <div className={styles.impactCard}>
                  <span className={styles.impactIcon}>🍲</span>
                  <span>Feed the hungry</span>
                </div>
                <div className={styles.impactCard}>
                  <span className={styles.impactIcon}>📖</span>
                  <span>Bible & discipleship</span>
                </div>
                <div className={styles.impactCard}>
                  <span className={styles.impactIcon}>🏗️</span>
                  <span>Church building projects</span>
                </div>
                <div className={styles.impactCard}>
                  <span className={styles.impactIcon}>👶</span>
                  <span>Children & youth programs</span>
                </div>
                <div className={styles.impactCard}>
                  <span className={styles.impactIcon}>💧</span>
                  <span>Water & community projects</span>
                </div>
                <div className={styles.impactCard}>
                  <span className={styles.impactIcon}>🙏</span>
                  <span>Pastoral & outreach support</span>
                </div>
              </div>
            </div>

            <div className={styles.ctaRow}>
              <Link className={styles.secondaryBtn} href="/">
                ← Back Home
              </Link>
            </div>
          </div>

          <div className={styles.cardWrapper}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <Image
                  src="/logo.jpeg"
                  alt="Light to Life International Ministries"
                  width={140}
                  height={70}
                  className={styles.logo}
                />
                <h2>Complete Your Gift</h2>
              </div>

              <div className={styles.paymentForm}>
                {/* Quick Amount Selector */}
                <label>Choose an Amount</label>
                <div className={styles.quickAmounts}>
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`${styles.quickAmount} ${Number(amount) === preset ? styles.quickAmountActive : ""}`}
                      onClick={() => setAmount(String(preset))}
                    >
                      {currency === "KES" ? `KSh ${preset.toLocaleString()}` : `$${preset}`}
                    </button>
                  ))}
                </div>

                <label htmlFor="donationAmount">Or Enter Custom Amount ({currency})</label>
                <input
                  id="donationAmount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={styles.input}
                  placeholder="Enter amount"
                />

                {/* Currency Selector */}
                <label>Currency</label>
                <div className={styles.segmentedControl}>
                  <button
                    type="button"
                    className={`${styles.segment} ${currency === "KES" ? styles.segmentActive : ""}`}
                    onClick={() => setCurrency("KES")}
                  >
                    <span className={styles.segmentIcon}>KSh</span>
                    <span className={styles.segmentLabel}>KES</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.segment} ${currency === "USD" ? styles.segmentActive : ""}`}
                    onClick={() => setCurrency("USD")}
                  >
                    <span className={styles.segmentIcon}>$</span>
                    <span className={styles.segmentLabel}>USD</span>
                  </button>
                </div>

                {/* Donor Info */}
                <label htmlFor="donorName">Your Name (Optional)</label>
                <input
                  id="donorName"
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className={styles.input}
                  placeholder="e.g. John Doe"
                />

                <label htmlFor="donorPhone">Phone Number (Optional)</label>
                <input
                  id="donorPhone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.input}
                  placeholder="e.g. +254 700 000 000"
                />

                <label htmlFor="donorEmail">Email Address *</label>
                <input
                  id="donorEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="your@email.com"
                  required
                />

                <label htmlFor="donorMessage">Prayer Request / Message (Optional)</label>
                <textarea
                  id="donorMessage"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={styles.textarea}
                  placeholder="Share a prayer request or message with us..."
                  rows={3}
                />

                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleDonateSubmit}
                  disabled={!publicKey || isProcessing || !isPaystackReady}
                >
                  {isProcessing ? (
                    <span className={styles.btnProcessing}>
                      <span className={styles.spinner}></span>
                      Processing...
                    </span>
                  ) : (
                    `Give ${currency === "KES" ? "KSh" : "$"}${Number(amount.replace(/[^0-9.]/g, "") || 0).toLocaleString()}`
                  )}
                </button>

                {!publicKey && (
                  <p className={styles.note}>
                    Paystack public key is not configured. Add `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
                    to enable this option.
                  </p>
                )}

                {statusMessage && (
                  <p className={styles.statusMessage}>{statusMessage}</p>
                )}

                {/* Payment methods accepted */}
                <div className={styles.paymentMethods}>
                  <span className={styles.paymentMethodsLabel}>Accepted payment methods:</span>
                  <div className={styles.paymentMethodsIcons}>
                    <span className={styles.pmIcon} title="Card">💳 Card</span>
                    <span className={styles.pmIcon} title="Bank Transfer">🏦 Bank</span>
                    <span className={styles.pmIcon} title="Mobile Money">📱 M-Pesa</span>
                    <span className={styles.pmIcon} title="USSD">📟 USSD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Transfer Details */}
            <div className={styles.bankCard} id="bank">
              <h3>🏦 Bank Transfer</h3>
              <p>
                Prefer to give via direct bank transfer? Use the details below:
              </p>

              <h4 className={styles.bankSubHeading}>Cooperative Bank of Kenya</h4>
              <div className={styles.bankDetails}>
                <div className={styles.bankRow}>
                  <span className={styles.bankLabel}>Account Name</span>
                  <span className={styles.bankValue}>Light to Life International Ministries</span>
                </div>
                <div className={styles.bankRow}>
                  <span className={styles.bankLabel}>Account Number</span>
                  <span className={styles.bankValue}>01109424066100</span>
                </div>
                <div className={styles.bankRow}>
                  <span className={styles.bankLabel}>SWIFT Code</span>
                  <span className={styles.bankValue}>KCOOKENA</span>
                </div>
              </div>

              <p className={styles.bankNote}>
                Please email us at <a href="mailto:dlight360.org@gmail.com">dlight360.org@gmail.com</a> after your transfer so we can confirm and send you a receipt.
              </p>
            </div>

            {/* Tax Info */}
            <div className={styles.taxCard}>
              <h3>📋 Tax-Exempt Giving</h3>
              <p>
                Light to Life International Ministries is a registered non-profit organization.
                All donations are tax-deductible where applicable. A receipt will be sent to your
                email after each successful donation.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}