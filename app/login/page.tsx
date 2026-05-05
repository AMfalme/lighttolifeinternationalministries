"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "../lib/firebase";
import Navbar from "../components/Navbar/Navbar";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string) || "";
    const password = (form.get("password") as string) || "";

    setLoading(true);
    try {
      const { result, error: signInError } = await signInWithEmailAndPassword(email, password);

      if (signInError) {
        throw signInError;
      }

      if (!result?.user) {
        throw new Error("Sign in failed");
      }

      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Sign in failed");
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
          <h2>Welcome Back</h2>
          <p className={styles.description}>Sign in to your account to continue</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label>
              Email Address
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <input type="password" name="password" placeholder="••••••••" required />
            </label>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.primary} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className={styles.switchText}>
            Don&apos;t have an account? <Link href="/register">Create one</Link>
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
