"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { DEFAULT_DONATION_NUMBER, getDonationNumber } from "../lib/firebase/firestore";
import styles from "./donate.module.css";

export default function DonatePage() {
  const [mpesaNumber, setMpesaNumber] = useState(DEFAULT_DONATION_NUMBER);

  useEffect(() => {
    let mounted = true;

    const loadDonationNumber = async () => {
      const donationNumber = await getDonationNumber();
      if (mounted) {
        setMpesaNumber(donationNumber);
      }
    };

    loadDonationNumber();

    const syncDonationNumber = () => {
      loadDonationNumber();
    };

    window.addEventListener("donationnumberchange", syncDonationNumber as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener("donationnumberchange", syncDonationNumber as EventListener);
    };
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <span className={styles.badge}>Support Us</span>
            <h1>Give to Light to Life</h1>
            <p>
              For now, you can support the ministry through M-Pesa using the trial number below.
              We will move to Paystack when the payment setup is ready.
            </p>

            <div className={styles.ctaRow}>
              <a className={styles.primaryBtn} href={`tel:${mpesaNumber.replace(/\s/g, "")}`}>
                Call / Copy Number
              </a>
              <Link className={styles.secondaryBtn} href="/">
                Back Home
              </Link>
            </div>
          </div>

          <div className={styles.card}>
            <Image src="/logo.jpeg" alt="Light to Life" width={160} height={80} className={styles.logo} />
            <h2>M-Pesa Trial Number</h2>
            <div className={styles.numberBox}>
              <strong>{mpesaNumber}</strong>
            </div>
            <p className={styles.note}>
              Please include your name and reason for giving in the M-Pesa message.
            </p>
            <div className={styles.infoBox}>
              <span>Payment Method</span>
              <strong>M-Pesa</strong>
            </div>
            <div className={styles.infoBox}>
              <span>Future Gateway</span>
              <strong>Paystack</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
