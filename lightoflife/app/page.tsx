"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "blue">("light");

  return (
    <div className={styles.page} data-theme={theme}>
      <header className={styles.navbar}>
        <a className={styles.brand} href="#home" aria-label="Go to homepage">
          <Image
            src="/logo.jpeg"
            alt="LightToLife logo"
            width={200}
            height={150}
            priority
          />
        </a>

        <nav className={styles.navLinks} aria-label="Primary navigation">
          <div className={styles.navItem}>
            <a className={styles.navLink} href="#about">About Us</a>
            <ul className={styles.navSub} aria-label="About sub-menu">
              <li><a href="#mission">Mission</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#team">Team</a></li>
            </ul>
          </div>

          <div className={styles.navItem}>
            <a className={styles.navLink} href="#events">Events</a>
            <ul className={styles.navSub} aria-label="Events sub-menu">
              <li><a href="#calendar">Calendar</a></li>
              <li><a href="#upcoming">Upcoming</a></li>
            </ul>
          </div>

          <div className={styles.navItem}>
            <a className={styles.navLink} href="#projects">Projects</a>
            <ul className={styles.navSub} aria-label="Projects sub-menu">
              <li><a href="#ongoing">Ongoing</a></li>
              <li><a href="#partner">Partners</a></li>
            </ul>
          </div>

          <div className={styles.navItem}>
            <a className={styles.navLink} href="#news">News</a>
            <ul className={styles.navSub} aria-label="News sub-menu">
              <li><a href="#blog">Blog</a></li>
              <li><a href="#highlights">Highlights</a></li>
              <li><a href="#gallery">Gallery</a></li>
            </ul>
          </div>
        </nav>

        <div className={styles.navActions}>
          <a className={styles.authLink} href="#login">
            Login
          </a>
          <a className={styles.authLink} href="#register">
            Register
          </a>
          <a className={styles.navButton} href="#contact">
            Support Us
          </a>
          <label className={styles.switch}>
            <input
              type="checkbox"
              className={styles.switchInput}
              checked={theme === "blue"}
              onChange={() => setTheme(theme === "light" ? "blue" : "light")}
              aria-label={theme === "light" ? "Enable blue theme" : "Enable light theme"}
            />
            <span className={styles.switchSlider} />
           
          </label>
        </div>
      </header>

      <main className={styles.main} id="home">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.verse}>
              <span className={`${styles.badge} ${styles.verseBadge}`}>
                John 8:12
              </span>
              <h1>Jesus said,</h1>
              <h1 className={styles.verseHeading}> I'm the Light of the world</h1>
            </div>
            
            <p>
              Start with the essentials: a polished nav bar, a focused hero
              section, and a layout that is easy to extend step by step.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#features">
                Explore Features
              </a>
              <a className={styles.secondaryButton} href="#about">
                Learn More
              </a>
            </div>

            <div className={styles.heroStats}>
              <div>
                <strong>01</strong>
                <span>Navigation</span>
              </div>
              <div>
                <strong>02</strong>
                <span>Hero Section</span>
              </div>
              <div>
                <strong>03</strong>
                <span>Ready to Expand</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroCard}>
              <Image
                src="/congregation.jpg"
                alt="Congregation"
                fill
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
