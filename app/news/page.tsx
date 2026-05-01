"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar/Navbar";
import styles from "./news.module.css";

export default function NewsPage() {

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.pageHero}>
          <div className={styles.sectionContainer}>
            <h1 className={styles.pageTitle}>News & Stories</h1>
            <p className={styles.pageDescription}>
              Stay updated with the latest news, stories, and highlights from Light to Life International Ministries.
            </p>
          </div>
        </section>

        <section className={styles.blogSection} id="blog">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>LATEST STORIES</span>
              <h2 className={styles.sectionHeading}>Blog & Articles</h2>
              <p className={styles.sectionDescription}>
                Inspiring stories and insights from our ministry work around the world.
              </p>
            </div>

            <div className={styles.blogGrid}>
              <article className={styles.blogCard}>
                <div className={styles.blogImage}>
                  <div className={styles.imagePlaceholder}>Featured Image</div>
                </div>
                <div className={styles.blogContent}>
                  <span className={styles.blogDate}>March 15, 2024</span>
                  <h3 className={styles.blogTitle}>Transforming Lives Through Education</h3>
                  <p className={styles.blogExcerpt}>
                    Discover how our scholarship program has changed the trajectory of over 500 students in West Africa.
                  </p>
                  <a href="#" className={styles.readMore}>Read More →</a>
                </div>
              </article>

              <article className={styles.blogCard}>
                <div className={styles.blogImage}>
                  <div className={styles.imagePlaceholder}>Featured Image</div>
                </div>
                <div className={styles.blogContent}>
                  <span className={styles.blogDate}>March 8, 2024</span>
                  <h3 className={styles.blogTitle}>Healthcare Reaches Remote Villages</h3>
                  <p className={styles.blogExcerpt}>
                    Our mobile clinic initiative brings essential medical care to communities with limited healthcare access.
                  </p>
                  <a href="#" className={styles.readMore}>Read More →</a>
                </div>
              </article>

              <article className={styles.blogCard}>
                <div className={styles.blogImage}>
                  <div className={styles.imagePlaceholder}>Featured Image</div>
                </div>
                <div className={styles.blogContent}>
                  <span className={styles.blogDate}>February 28, 2024</span>
                  <h3 className={styles.blogTitle}>Building Sustainable Communities</h3>
                  <p className={styles.blogExcerpt}>
                    From water wells to training centers, learn how we're creating lasting change in local communities.
                  </p>
                  <a href="#" className={styles.readMore}>Read More →</a>
                </div>
              </article>

              <article className={styles.blogCard}>
                <div className={styles.blogImage}>
                  <div className={styles.imagePlaceholder}>Featured Image</div>
                </div>
                <div className={styles.blogContent}>
                  <span className={styles.blogDate}>February 20, 2024</span>
                  <h3 className={styles.blogTitle}>Youth Empowerment Success Stories</h3>
                  <p className={styles.blogExcerpt}>
                    Meet the young entrepreneurs who have completed our skills training and now support their families.
                  </p>
                  <a href="#" className={styles.readMore}>Read More →</a>
                </div>
              </article>

              <article className={styles.blogCard}>
                <div className={styles.blogImage}>
                  <div className={styles.imagePlaceholder}>Featured Image</div>
                </div>
                <div className={styles.blogContent}>
                  <span className={styles.blogDate}>February 12, 2024</span>
                  <h3 className={styles.blogTitle}>Women's Conference Empowers Thousands</h3>
                  <p className={styles.blogExcerpt}>
                    Celebrating the impact of our annual women's gathering with inspiring speakers and networking.
                  </p>
                  <a href="#" className={styles.readMore}>Read More →</a>
                </div>
              </article>

              <article className={styles.blogCard}>
                <div className={styles.blogImage}>
                  <div className={styles.imagePlaceholder}>Featured Image</div>
                </div>
                <div className={styles.blogContent}>
                  <span className={styles.blogDate}>February 5, 2024</span>
                  <h3 className={styles.blogTitle}>Annual Report: Impact & Growth</h3>
                  <p className={styles.blogExcerpt}>
                    Review our comprehensive 2023 annual report showcasing achievements across all ministry areas.
                  </p>
                  <a href="#" className={styles.readMore}>Read More →</a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.highlightsSection} id="highlights">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>HIGHLIGHTS</span>
              <h2 className={styles.sectionHeading}>In the News</h2>
              <p className={styles.sectionDescription}>
                Recent highlights and announcements from our organization.
              </p>
            </div>

            <div className={styles.highlightsGrid}>
              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>📰</div>
                <h3 className={styles.highlightTitle}>Press Release: New Partnership Announcement</h3>
                <p className={styles.highlightText}>
                  We're excited to announce a strategic partnership with Global Education Foundation to expand our scholarship reach.
                </p>
                <span className={styles.highlightDate}>March 18, 2024</span>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>🏆</div>
                <h3 className={styles.highlightTitle}>Recognition: Award for Community Service</h3>
                <p className={styles.highlightText}>
                  Our organization received the 2024 Community Leadership Award for outstanding contributions to social development.
                </p>
                <span className={styles.highlightDate}>March 10, 2024</span>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>🎉</div>
                <h3 className={styles.highlightTitle}>Milestone: 10,000 Students Reached</h3>
                <p className={styles.highlightText}>
                  We celebrate reaching our milestone of 10,000 students through our education programs since inception.
                </p>
                <span className={styles.highlightDate}>March 1, 2024</span>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>💼</div>
                <h3 className={styles.highlightTitle}>Business Feature: Social Enterprise Report</h3>
                <p className={styles.highlightText}>
                  Featured in BusinessNews Magazine for our innovative social enterprise approach to sustainable development.
                </p>
                <span className={styles.highlightDate}>February 25, 2024</span>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>🌍</div>
                <h3 className={styles.highlightTitle}>Expansion: New Office in East Africa</h3>
                <p className={styles.highlightText}>
                  Opening our first office in East Africa to expand our impact and serve more communities across the continent.
                </p>
                <span className={styles.highlightDate}>February 15, 2024</span>
              </div>

              <div className={styles.highlightCard}>
                <div className={styles.highlightIcon}>🤝</div>
                <h3 className={styles.highlightTitle}>Volunteer Drive: Join Our Team</h3>
                <p className={styles.highlightText}>
                  Calling for passionate volunteers to join our various programs. Share your skills and make a difference today.
                </p>
                <span className={styles.highlightDate}>February 8, 2024</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.gallerySection} id="gallery">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>GALLERY</span>
              <h2 className={styles.sectionHeading}>Photo Gallery</h2>
              <p className={styles.sectionDescription}>
                Visual stories from our ministry work and community impact.
              </p>
            </div>

            <div className={styles.galleryGrid}>
              <div className={styles.galleryImage}>
                <div className={styles.imageFrame}>
                  <div className={styles.imagePlaceholder}>Photo 1</div>
                </div>
              </div>

              <div className={styles.galleryImage}>
                <div className={styles.imageFrame}>
                  <div className={styles.imagePlaceholder}>Photo 2</div>
                </div>
              </div>

              <div className={styles.galleryImage}>
                <div className={styles.imageFrame}>
                  <div className={styles.imagePlaceholder}>Photo 3</div>
                </div>
              </div>

              <div className={styles.galleryImage}>
                <div className={styles.imageFrame}>
                  <div className={styles.imagePlaceholder}>Photo 4</div>
                </div>
              </div>

              <div className={styles.galleryImage}>
                <div className={styles.imageFrame}>
                  <div className={styles.imagePlaceholder}>Photo 5</div>
                </div>
              </div>

              <div className={styles.galleryImage}>
                <div className={styles.imageFrame}>
                  <div className={styles.imagePlaceholder}>Photo 6</div>
                </div>
              </div>

              <div className={styles.galleryImage}>
                <div className={styles.imageFrame}>
                  <div className={styles.imagePlaceholder}>Photo 7</div>
                </div>
              </div>

              <div className={styles.galleryImage}>
                <div className={styles.imageFrame}>
                  <div className={styles.imagePlaceholder}>Photo 8</div>
                </div>
              </div>

              <div className={styles.galleryImage}>
                <div className={styles.imageFrame}>
                  <div className={styles.imagePlaceholder}>Photo 9</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
