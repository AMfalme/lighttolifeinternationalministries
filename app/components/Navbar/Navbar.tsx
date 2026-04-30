"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./navbar.module.css";

export default function Navbar() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const initialTheme =
      root.dataset.theme === "dark" || root.dataset.theme === "light"
        ? (root.dataset.theme as "light" | "dark")
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme(initialTheme);
    root.dataset.theme = initialTheme;
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <header className={styles.navbar}>
      <Link className={styles.brand} href="/">
        <Image src="/logo.jpeg" alt="LightToLife" width={180} height={86} priority />
      </Link>

      <nav className={styles.navLinks} aria-label="Primary navigation">
        <div className={styles.navItem}>
          <Link className={styles.navLink} href="/#about">About Us</Link>
          <ul className={styles.navSub} aria-label="About sub-menu">
            <li><Link href="/#features">Mission</Link></li>
            <li><Link href="/#about">About</Link></li>
            <li><Link href="/#leadership">Team</Link></li>
          </ul>
        </div>

        <div className={styles.navItem}>
          <Link className={styles.navLink} href="/events">Events</Link>
          <ul className={styles.navSub} aria-label="Events sub-menu">
            <li><Link href="/events#calendar">Calendar</Link></li>
            <li><Link href="/events#upcoming">Upcoming</Link></li>
          </ul>
        </div>

        <div className={styles.navItem}>
          <Link className={styles.navLink} href="/projects">Projects</Link>
          <ul className={styles.navSub} aria-label="Projects sub-menu">
            <li><Link href="/projects#ongoing">Ongoing</Link></li>
            <li><Link href="/projects#partners">Partners</Link></li>
          </ul>
        </div>

        <div className={styles.navItem}>
          <Link className={styles.navLink} href="/news">News</Link>
          <ul className={styles.navSub} aria-label="News sub-menu">
            <li><Link href="/news#blog">Blog</Link></li>
            <li><Link href="/news#highlights">Highlights</Link></li>
            <li><Link href="/news#gallery">Gallery</Link></li>
          </ul>
        </div>
      </nav>

      <div className={styles.navActions}>
        <Link className={styles.authLink} href="/login">Login</Link>
        <Link className={styles.authLink} href="/register">Register</Link>
        <Link className={styles.navButton} href="/#contact">Support Us</Link>

        <label className={styles.switch}>
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={theme === "dark"}
            onChange={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label={theme === "light" ? "Enable dark theme" : "Enable light theme"}
          />
          <span className={styles.switchSlider}>
            <span className={`${styles.switchIcon} ${styles.sunIcon}`} aria-hidden="true">☀</span>
            <span className={`${styles.switchIcon} ${styles.moonIcon}`} aria-hidden="true">☾</span>
          </span>
        </label>
      </div>
    </header>
  );
}
