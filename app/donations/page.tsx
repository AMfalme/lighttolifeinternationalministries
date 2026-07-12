"use client";

import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import styles from "./donations.module.css";

export default function DonationsPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.badge}>Giving & Generosity</span>
          <h1>Partner With Us</h1>
          <p className={styles.intro}>
            Your generous giving helps us reach communities with the love of Christ,
            support those in need, and advance the Kingdom of God through impactful
            ministry work. You can give via direct bank transfer using the details below.
          </p>

          {/* Bank Transfer Details */}
          <div className={styles.bankCard}>
            <h3>🏦 Bank Transfer</h3>
            <p>
              Give via direct bank transfer to the account below:
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

          <div className={styles.ctaRow}>
            <Link className={styles.secondaryBtn} href="/">
              ← Back Home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}