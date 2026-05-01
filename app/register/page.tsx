"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar/Navbar";
import styles from "./register.module.css";
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const name = (form.get("name") as string) || "";
    const email = (form.get("email") as string) || "";
    const password = (form.get("password") as string) || "";
    const repeatPassword = (form.get("repeatPassword") as string) || "";

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.header}>
          <Image
            src="/favicon.ico"
            alt="Light to Life Logo"
            width={40}
            height={40}
            className={styles.icon}
          />
          <div>
            <h1>Light to Life</h1>
            <p className={styles.subtitle}>International Ministries</p>
          </div>
        </div>

        <div className={styles.cardContent}>
          <h2>Create Your Account</h2>
          <p className={styles.description}>Join our community and be part of our mission</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label>
              Full Name
              <input type="text" name="name" placeholder="John Doe" required />
            </label>
            <label>
              Email Address
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="••••••••" required />
            </label>
            <label>
              Confirm Password
              <input type="password" name="repeatPassword" placeholder="••••••••" required />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>

          <div className={styles.divider}></div>

          <p className={styles.footer}>
            <Link href="/">Back to Home</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
