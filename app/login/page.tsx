"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogInWithEmailAndPassword, signInWithGoogle } from "../lib/firebase";
import Navbar from "../components/Navbar/Navbar";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string) || "";
    const password = (form.get("password") as string) || "";

    setLoading(true);
    try {
      const { result, error: signInError } = await LogInWithEmailAndPassword(email, password);

      if (signInError) {
        throw signInError;
      }

      if (!result?.user) {
        throw new Error("Sign in failed");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    try {
      const { result, error: googleError } = await signInWithGoogle();

      if (googleError) {
        throw googleError;
      }

      if (!result?.user) {
        throw new Error("Google sign in failed");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Google sign in failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
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

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className={styles.googleButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Signing in..." : "Sign in with Gmail"}
          </button>

          <p className={styles.switchText}>
            Don&apos;t have an account? <Link href="/register">Create one</Link>
          </p>

          <div className={styles.divider}></div>

          <p className={styles.footer}>
            <Link href="/">Back to Home</Link>
          </p>
        </div>
        </div>
      </main>
    </div>
  );
}
