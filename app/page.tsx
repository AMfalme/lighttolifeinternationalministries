"use client";

import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import Navbar from "./components/Navbar/Navbar";
import TeamSection from "./components/TeamSection/TeamSection";
import styles from "./page.module.css";
import ImageUpload from "./components/ImageUpload/ImageUpload";
import { getAllDashboardImages, type DashboardImage } from "./lib/dashboardImages";
import { useFastAuth } from "./lib/firebase/useFastAuth";
import { db } from "./lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {

  const { user, loading: authLoading } = useFastAuth();
  const [carouselImages, setCarouselImages] = useState<DashboardImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const imgs = await getAllDashboardImages();
        if (!mounted) return;
        setCarouselImages(imgs || []);
      } catch (e) {
        console.error("Error loading carousel images:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setRole(null);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!mounted) return;
        setRole(snap.exists() ? (snap.data().role as string) || null : null);
      } catch (err) {
        console.error("Error loading user role for homepage:", err);
        if (mounted) setRole(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    let mounted = true;
    const interval = setInterval(() => {
      if (!mounted) return;
      setCurrentIndex((i) => (i + 1) % carouselImages.length);
    }, 4500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [carouselImages.length]);

  // touch/swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const delta = touchStartX.current - touchEndX.current;
    const threshold = 40; // px
    if (delta > threshold) {
      setCurrentIndex((i) => (i + 1) % carouselImages.length);
    } else if (delta < -threshold) {
      setCurrentIndex((i) => (i - 1 + carouselImages.length) % carouselImages.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main} id="home">
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <div className={styles.verse}>
              <span className={`${styles.badge} ${styles.verseBadge}`}>
                Welcome to
              </span>
              <h1>Light to Life International Ministries</h1>
            </div>
            
            <p>
              Light to Life International Ministries is a Christ-centered ministry committed to transforming lives through the Gospel, discipleship, outreach, and compassionate service. We exist to share the love of Jesus, strengthen believers, and bring hope to communities in need.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="/donate">
                Support us
              </a>
              <a className={styles.secondaryButton} href="#about">
                Join us
              </a>
            </div>

            <div className={styles.heroStats}>
              <div>
                <strong>200+</strong>
                <span>Students sponsored</span>
              </div>
              <div>
                <strong>10+</strong>
                <span>Countries Reached</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Volunteer Driven</span>
              </div>
            </div>
          </div>

          <div className={styles.heroVisual} aria-hidden="true">
            <div className={styles.heroStack}>
              <div className={styles.heroCard}>
                <Image
                  src="/hero.jpeg"
                  alt="Congregation"
                  fill
                  className={styles.heroImage}
                  priority
                />
              </div>

              {/* <div className={styles.heroAccentCard}>
                <Image
                  src="/dove.jpeg"
                  alt="Dove symbol"
                  fill
                  className={styles.heroImage}
                />
              </div> */}
            </div>
          </div>
        </section>

        <section className={styles.verseBanner}>
          <div className={styles.verseBannerContent}>
            <p className={styles.verseBannerText}>
              <strong>John 8:12</strong> — Jesus said, <em>"I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life."</em>
            </p>
          </div>
        </section>

        <section className={styles.featuresSection} id="features">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>CORE VALUES</span>
              <h2 className={styles.sectionHeading}>Our Unique & Awesome Vision</h2>
              <p className={styles.sectionDescription}>
                Dedicated to spreading God's light through community service, spiritual growth, and compassionate ministry.
              </p>
            </div>

            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="44" height="44" viewBox="0 0 44 44" className={styles.iconSvg}>
                    <path d="M11 6.875H33C34.8125 6.875 36.25 8.3125 36.25 10.125V33.875C36.25 35.6875 34.8125 37.125 33 37.125H11C9.1875 37.125 7.75 35.6875 7.75 33.875V10.125C7.75 8.3125 9.1875 6.875 11 6.875Z" opacity="0.5"/>
                    <path d="M14.1667 12.375H29.8333V16.5H14.1667V12.375ZM14.1667 19.25H29.8333V23.375H14.1667V19.25ZM14.1667 26.125H23.375V30.25H14.1667V26.125Z"/>
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Spiritual Growth</h3>
                <p className={styles.featureText}>
                  Nurturing believers through discipleship, Bible study, and worship experiences that deepen faith.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="44" height="44" viewBox="0 0 44 44" className={styles.iconSvg}>
                    <path d="M22 2.75C11.9 2.75 3.66663 11 3.66663 21.1667C3.66663 31.3333 11.9 39.9 22 39.9C32.1 39.9 40.3333 31.3333 40.3333 21.1667C40.3333 11 32.1 2.75 22 2.75Z" opacity="0.5"/>
                    <path d="M22 7.3C13.5833 7.3 7.53329 13.25 7.53329 21.6667C7.53329 30.0833 13.5833 36.0333 22 36.0333C30.4167 36.0333 36.4667 30.0833 36.4667 21.6667V20.1667H27.5V23.375H32.0833C31.625 27.5 28.1667 30.8333 23.8333 30.8333C19.0208 30.8333 15.05 26.8625 15.05 22C15.05 17.1375 19.0208 13.1667 23.8333 13.1667C25.9583 13.1667 27.9167 13.9375 29.3083 15.2458L32.3333 12.2208C30.3542 10.5208 27.8333 9.53996 25.0417 9.53996C22.6458 9.53996 22 8.30829 22 7.3Z"/>
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Global Ministry</h3>
                <p className={styles.featureText}>
                  Extending God's kingdom worldwide through missionary work and international partnerships.
                </p>
              </div>

              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="44" height="44" viewBox="0 0 44 44" className={styles.iconSvg}>
                    <path d="M22 4.125C29.1667 4.125 35 9.95833 35 17.125C35 22.375 31.625 26.8625 27.0417 29.3083L26.125 33.1458C25.8333 34.4542 24.5833 35.3125 23.2083 35.0208C22.55 34.8708 22 34.2875 22 33.5V31.625C17.6042 31.625 14.125 28.1458 14.125 23.75V17.125C14.125 9.95833 19.8333 4.125 22 4.125Z" opacity="0.5"/>
                    <path d="M9 20.25C9 16.0208 12.375 12.5 16.5 12.5C17.1875 12.5 17.875 12.5583 18.5208 12.6875L18.0833 15.4167C17.6042 15.3583 17.0625 15.3125 16.5 15.3125C14.1458 15.3125 12.1875 17.2708 12.1875 19.625V23.75C12.1875 26.1042 14.1458 28.0625 16.5 28.0625H20.6042L20.2917 30.1042C20.1042 31.2625 19.1208 32.0917 18.0417 32.0208C13.6458 31.625 9 26.7083 9 20.25Z"/>
                  </svg>
                </div>
                <h3 className={styles.featureTitle}>Compassionate Care</h3>
                <p className={styles.featureText}>
                  Demonstrating Christ's love by supporting families, widows, orphans, and vulnerable members of society.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.aboutSection} id="about">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>ABOUT US</span>
              <h2 className={styles.sectionHeading}>Know More About Light to Life</h2>
              <p className={styles.sectionDescription}>
                For over two decades, Light to Life International Ministries has been a beacon of hope, spreading God's love and transforming communities across the globe through faith, service, and compassion.
              </p>
            </div>

            <div className={styles.aboutContent}>
              <div className={styles.aboutText}>
                <h3 className={styles.aboutSubheading}>Our Story</h3>
                <p className={styles.aboutParagraph}>
                  Founded on the principles of Jesus Christ, Light to Life began as a small prayer group dedicated to making a tangible difference in the lives of those around us. Today, we operate multiple branches across different nations, serving thousands of individuals annually through education, healthcare, spiritual guidance, and community development.
                </p>
                <p className={styles.aboutParagraph}>
                  Our commitment remains unwavering: to be the hands and feet of Christ in a world that desperately needs His light. Every program we run, every person we serve, and every initiative we undertake is guided by the belief that God's love can transform lives and heal nations.
                </p>
                <div className={styles.aboutHighlights}>
                  <div className={styles.highlight}>
                    <strong>200+</strong>
                    <span>Students Sponsored</span>
                  </div>
                  <div className={styles.highlight}>
                    <strong>10+</strong>
                    <span>Countries Reached</span>
                  </div>
                  <div className={styles.highlight}>
                    <strong>100%</strong>
                    <span>Volunteer Driven</span>
                  </div>
                </div>
              </div>
              <div className={styles.aboutImage}>
                <div className={styles.imageBox}>
                  {carouselImages.length ? (
                    <div
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                      style={{ position: "relative", width: "100%", height: 320, borderRadius: 12, overflow: "hidden" }}
                    >
                      <Image src={carouselImages[currentIndex].url} alt={carouselImages[currentIndex].fileName || "Church community"} fill sizes="(max-width: 768px) 100vw, 400px" style={{ objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>No community images yet</span>
                    </div>
                  )}

                  <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 6 }} aria-hidden>
                        {carouselImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            aria-label={`Show image ${idx + 1}`}
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 99,
                              background: idx === currentIndex ? "var(--button-primary-start)" : "rgba(15,23,42,0.12)",
                              border: "none",
                              padding: 0,
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{carouselImages.length} images</span>
                    </div>

                    {(role === "admin" || role === "leadership") && user ? (
                      <div style={{ marginTop: 8 }}>
                        <button type="button" onClick={() => setShowEditor((s) => !s)} className={styles.secondaryButton}>
                          {showEditor ? "Close Editor" : "Edit Images"}
                        </button>
                      </div>
                    ) : null}

                    {showEditor && (role === "admin" || role === "leadership") && user ? (
                      <div style={{ marginTop: 12 }}>
                        <ImageUpload
                          multiSelect
                          initialSelectedUrls={carouselImages.map((i) => i.url)}
                          onSelectMultiple={(images) => {
                            setCarouselImages(images || []);
                            setCurrentIndex(0);
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.leadershipSection} id="leadership">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>LEADERSHIP</span>
              <h2 className={styles.sectionHeading}>Meet Our Dedicated Branch Team</h2>
              <p className={styles.sectionDescription}>
                The people serving at each branch are managed from the dashboard and shown here automatically.
              </p>
            </div>

            <TeamSection />
          </div>
        </section>

        <section className={styles.testimonialsSection} id="testimonials">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>TESTIMONIES</span>
              <h2 className={styles.sectionHeading}>Hear From Those Whose Lives Have Been Transformed</h2>
              <p className={styles.sectionDescription}>
                Real stories of faith, hope, and transformation through the power of God's love and community support.
              </p>
            </div>

            <div className={styles.testimonialsGrid}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuote}>
                  "Light to Life changed everything for my family. My children now attend school because of their scholarship program. God bless this ministry."
                </div>
                <div className={styles.testimonialAuthor}>
                  <strong>Grace Chijioke</strong>
                  <span>Lagos, Nigeria</span>
                </div>
              </div>

              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuote}>
                  "The spiritual guidance and mentorship I received here gave me direction when I was lost. I've found my purpose in serving others."
                </div>
                <div className={styles.testimonialAuthor}>
                  <strong>David Nnamdi</strong>
                  <span>Enugu, Nigeria</span>
                </div>
              </div>

              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuote}>
                  "As a beneficiary of their healthcare initiative, I witnessed God's compassion in action. The care and dignity shown was remarkable."
                </div>
                <div className={styles.testimonialAuthor}>
                  <strong>Comfort Okafor</strong>
                  <span>Port Harcourt, Nigeria</span>
                </div>
              </div>

              <div className={styles.testimonialCard}>
                <div className={styles.testimonialQuote}>
                  "Volunteering with this ministry opened my eyes to what faith-driven action looks like. It's transformed my entire perspective on life."
                </div>
                <div className={styles.testimonialAuthor}>
                  <strong>Joshua Adebayo</strong>
                  <span>Accra, Ghana</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer moved to global Footer component in layout.tsx */}
      </main>
    </div>
  );
}
