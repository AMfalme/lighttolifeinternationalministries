"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import styles from "./donate.module.css";
import { usePaystackPayment } from "../hooks/usePaystackPayment";

export default function DonatePage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("500");
  const [currency, setCurrency] = useState("KES");

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  const handleSuccess = useCallback((reference: string) => {
    console.log("Donation succeeded:", reference);
  }, []);

  const handleClose = useCallback(() => {
    console.log("Payment closed");
  }, []);

  const { isReady, isProcessing, statusMessage, successMessage, initializePayment } =
    usePaystackPayment({
      email,
      amount,
      currency,
      publicKey,
      onSuccess: handleSuccess,
      onClose: handleClose,
    });

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
              <label htmlFor="donationAmount">Amount ({currency})</label>
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

              <label>Select Currency</label>
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

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={initializePayment}
                disabled={!publicKey || isProcessing || !isReady}
              >
                {isProcessing ? "Processing..." : "Donate with Paystack"}
              </button>

              {!publicKey && (
                <p className={styles.note}>
                  Paystack public key is not configured. Add `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
                  to enable this option.
                </p>
              )}

              {statusMessage && <p className={styles.statusMessage}>{statusMessage}</p>}

              {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
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