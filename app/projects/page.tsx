"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar/Navbar";
import styles from "./projects.module.css";

export default function ProjectsPage() {

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.pageHero}>
          <div className={styles.sectionContainer}>
            <h1 className={styles.pageTitle}>Our Projects</h1>
            <p className={styles.pageDescription}>
              Discover the transformative initiatives and partnerships that are making a difference in communities around the world.
            </p>
          </div>
        </section>

        <section className={styles.ongoingSection} id="ongoing">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>CURRENT INITIATIVES</span>
              <h2 className={styles.sectionHeading}>Ongoing Projects</h2>
              <p className={styles.sectionDescription}>
                Transforming communities through education, healthcare, and spiritual development.
              </p>
            </div>

            <div className={styles.projectsGrid}>
              <div className={styles.projectCard}>
                <div className={styles.projectIcon}>📚</div>
                <h3 className={styles.projectTitle}>Scholarship Program</h3>
                <p className={styles.projectDescription}>
                  Providing educational opportunities for underprivileged children through full scholarships and mentorship, impacting over 500 students annually.
                </p>
                <div className={styles.projectProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{width: '75%'}}></div>
                  </div>
                  <span className={styles.progressText}>75% Funded</span>
                </div>
              </div>

              <div className={styles.projectCard}>
                <div className={styles.projectIcon}>⚕️</div>
                <h3 className={styles.projectTitle}>Healthcare Initiative</h3>
                <p className={styles.projectDescription}>
                  Free medical clinics and health awareness campaigns serving remote communities with preventive care and treatment.
                </p>
                <div className={styles.projectProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{width: '60%'}}></div>
                  </div>
                  <span className={styles.progressText}>60% Funded</span>
                </div>
              </div>

              <div className={styles.projectCard}>
                <div className={styles.projectIcon}>🏘️</div>
                <h3 className={styles.projectTitle}>Community Center</h3>
                <p className={styles.projectDescription}>
                  Building multi-purpose centers in villages for education, skill training, and community gatherings.
                </p>
                <div className={styles.projectProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{width: '45%'}}></div>
                  </div>
                  <span className={styles.progressText}>45% Funded</span>
                </div>
              </div>

              <div className={styles.projectCard}>
                <div className={styles.projectIcon}>💼</div>
                <h3 className={styles.projectTitle}>Skills Training</h3>
                <p className={styles.projectDescription}>
                  Vocational training programs in agriculture, tailoring, and small business to empower youth for self-sufficiency.
                </p>
                <div className={styles.projectProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{width: '82%'}}></div>
                  </div>
                  <span className={styles.progressText}>82% Funded</span>
                </div>
              </div>

              <div className={styles.projectCard}>
                <div className={styles.projectIcon}>💧</div>
                <h3 className={styles.projectTitle}>Water Access</h3>
                <p className={styles.projectDescription}>
                  Installing clean water wells and sanitation facilities in communities lacking safe water resources.
                </p>
                <div className={styles.projectProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{width: '55%'}}></div>
                  </div>
                  <span className={styles.progressText}>55% Funded</span>
                </div>
              </div>

              <div className={styles.projectCard}>
                <div className={styles.projectIcon}>🌱</div>
                <h3 className={styles.projectTitle}>Agricultural Development</h3>
                <p className={styles.projectDescription}>
                  Teaching sustainable farming practices and providing seeds/tools to increase food security and income.
                </p>
                <div className={styles.projectProgress}>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{width: '68%'}}></div>
                  </div>
                  <span className={styles.progressText}>68% Funded</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.partnersSection} id="partners">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>PARTNERSHIPS</span>
              <h2 className={styles.sectionHeading}>Our Partners</h2>
              <p className={styles.sectionDescription}>
                Working with organizations and individuals committed to the same vision of global transformation.
              </p>
            </div>

            <div className={styles.partnersGrid}>
              <div className={styles.partnerCard}>
                <div className={styles.partnerLogo}>
                  <div className={styles.logoBg}>Partner Logo</div>
                </div>
                <h3 className={styles.partnerName}>Global Education Foundation</h3>
                <p className={styles.partnerRole}>Education Partner</p>
                <p className={styles.partnerDescription}>
                  Supporting our scholarship and educational programs across West Africa.
                </p>
              </div>

              <div className={styles.partnerCard}>
                <div className={styles.partnerLogo}>
                  <div className={styles.logoBg}>Partner Logo</div>
                </div>
                <h3 className={styles.partnerName}>Medical Aid International</h3>
                <p className={styles.partnerRole}>Healthcare Partner</p>
                <p className={styles.partnerDescription}>
                  Providing medical equipment and training for our health initiatives.
                </p>
              </div>

              <div className={styles.partnerCard}>
                <div className={styles.partnerLogo}>
                  <div className={styles.logoBg}>Partner Logo</div>
                </div>
                <h3 className={styles.partnerName}>Hope Development Agency</h3>
                <p className={styles.partnerRole}>Community Development Partner</p>
                <p className={styles.partnerDescription}>
                  Collaborating on sustainable community development and advocacy.
                </p>
              </div>

              <div className={styles.partnerCard}>
                <div className={styles.partnerLogo}>
                  <div className={styles.logoBg}>Partner Logo</div>
                </div>
                <h3 className={styles.partnerName}>Youth Empowerment Initiative</h3>
                <p className={styles.partnerRole}>Youth Partner</p>
                <p className={styles.partnerDescription}>
                  Supporting skills training and youth leadership development programs.
                </p>
              </div>

              <div className={styles.partnerCard}>
                <div className={styles.partnerLogo}>
                  <div className={styles.logoBg}>Partner Logo</div>
                </div>
                <h3 className={styles.partnerName}>Clean Water Foundation</h3>
                <p className={styles.partnerRole}>Water & Sanitation Partner</p>
                <p className={styles.partnerDescription}>
                  Helping establish clean water access and sanitation infrastructure.
                </p>
              </div>

              <div className={styles.partnerCard}>
                <div className={styles.partnerLogo}>
                  <div className={styles.logoBg}>Partner Logo</div>
                </div>
                <h3 className={styles.partnerName}>Sustainable Agriculture Network</h3>
                <p className={styles.partnerRole}>Agriculture Partner</p>
                <p className={styles.partnerDescription}>
                  Promoting sustainable farming and food security initiatives.
                </p>
              </div>
            </div>

            <div className={styles.partneredBanner}>
              <h3>Become a Partner</h3>
              <p>Organizations and institutions interested in partnering with us are welcome to reach out.</p>
              <a href="#" className={styles.partnersCtaButton}>Get in Touch</a>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
