"use client";

import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import styles from "./register.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.container}>
        <h1>Register</h1>
        <form className={styles.form}>
          <label>
            Full name
            <input type="text" name="name" />
          </label>
          <label>
            Email
            <input type="email" name="email" />
          </label>
          <label>
            Password
            <input type="password" name="password" />
          </label>
          <label>
            Repeat password
            <input type="password" name="repeatPassword" />
          </label>
          <button type="submit" className={styles.primary}>Create account</button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link href="/login">Login here</Link>
        </p>
      </main>
    </div>
  );
}
