"use client";

import Image from "next/image";
import pageStyles from "../../page.module.css";

export default function Footer() {
  return (
    <footer className={pageStyles.footer} role="contentinfo">
      <div className={pageStyles.sectionContainer}>
        <div className={pageStyles.footerContent}>
          <div className={pageStyles.footerSection}>
            <h4 className={pageStyles.footerTitle}>Light to Life International Ministries</h4>
            <p className={pageStyles.footerText}>
              Spreading God's light and transforming lives through faith, service, and compassionate ministry.
            </p>
            <div className={pageStyles.socialLinks}>
              <a href="#" className={pageStyles.socialLink} aria-label="Facebook">f</a>
              <a href="#" className={pageStyles.socialLink} aria-label="Twitter">𝕏</a>
              <a href="#" className={pageStyles.socialLink} aria-label="Instagram">📷</a>
            </div>
          </div>

          <div className={pageStyles.footerSection}>
            <h4 className={pageStyles.footerTitle}>Quick Links</h4>
            <ul className={pageStyles.footerLinks}>
              <li><a href="/#about">About Us</a></li>
              <li><a href="/#features">Mission</a></li>
              <li><a href="/#leadership">Leadership</a></li>
              <li><a href="/#testimonials">Testimonials</a></li>
            </ul>
          </div>

          <div className={pageStyles.footerSection}>
            <h4 className={pageStyles.footerTitle}>Programs</h4>
            <ul className={pageStyles.footerLinks}>
              <li><a href="/events">Events</a></li>
              <li><a href="/projects">Projects</a></li>
              <li><a href="/news">News</a></li>
              <li><a href="/#">Contact</a></li>
            </ul>
          </div>

          <div className={pageStyles.footerSection}>
            <h4 className={pageStyles.footerTitle}>Contact</h4>
            <p className={pageStyles.footerText}>
              <strong>Email:</strong><br />
              francisakaki@lighttolifeinternationalministries.org
            </p>
            <p className={pageStyles.footerText}>
              <strong>Phone:</strong><br />
              +254 796 789443
            </p>
          </div>
        </div>

        <div className={pageStyles.footerBottom}>
          <p className={pageStyles.footerCopyright}>
            © 2024 Light to Life International Ministries. All rights reserved. | <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
