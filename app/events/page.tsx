"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar/Navbar";
import styles from "./events.module.css";

export default function EventsPage() {

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.pageHero}>
          <div className={styles.sectionContainer}>
            <h1 className={styles.pageTitle}>Events & Calendar</h1>
            <p className={styles.pageDescription}>
              Join us for worship, fellowship, and community service. Check our
              calendar for upcoming events and gatherings.
            </p>
          </div>
        </section>

        <section className={styles.eventsSection} id="calendar">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>CALENDAR</span>
              <h2 className={styles.sectionHeading}>Upcoming Events</h2>
            </div>

            <div className={styles.eventsList}>
              <div className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span className={styles.eventMonth}>MAY</span>
                  <span className={styles.eventDay}>12</span>
                </div>
                <div className={styles.eventContent}>
                  <h3 className={styles.eventTitle}>Sunday Worship Service</h3>
                  <p className={styles.eventTime}>10:00 AM - 12:30 PM</p>
                  <p className={styles.eventDescription}>
                    Join us for our weekly worship service with prayer, praise,
                    and teaching from God's Word.
                  </p>
                </div>
              </div>

              <div className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span className={styles.eventMonth}>MAY</span>
                  <span className={styles.eventDay}>18</span>
                </div>
                <div className={styles.eventContent}>
                  <h3 className={styles.eventTitle}>
                    Youth Retreat & Fellowship
                  </h3>
                  <p className={styles.eventTime}>3:00 PM - 8:00 PM</p>
                  <p className={styles.eventDescription}>
                    A special gathering for young adults featuring games,
                    discussions, and spiritual growth activities.
                  </p>
                </div>
              </div>

              <div className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span className={styles.eventMonth}>MAY</span>
                  <span className={styles.eventDay}>25</span>
                </div>
                <div className={styles.eventContent}>
                  <h3 className={styles.eventTitle}>
                    Women's Ministry Conference
                  </h3>
                  <p className={styles.eventTime}>9:00 AM - 4:00 PM</p>
                  <p className={styles.eventDescription}>
                    An empowering day of teaching, networking, and encouragement
                    for women of all ages.
                  </p>
                </div>
              </div>

              <div className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span className={styles.eventMonth}>JUN</span>
                  <span className={styles.eventDay}>02</span>
                </div>
                <div className={styles.eventContent}>
                  <h3 className={styles.eventTitle}>
                    Community Outreach Day
                  </h3>
                  <p className={styles.eventTime}>8:00 AM - 2:00 PM</p>
                  <p className={styles.eventDescription}>
                    Serve alongside us as we reach out to families in need with
                    food, supplies, and the Gospel.
                  </p>
                </div>
              </div>

              <div className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span className={styles.eventMonth}>JUN</span>
                  <span className={styles.eventDay}>09</span>
                </div>
                <div className={styles.eventContent}>
                  <h3 className={styles.eventTitle}>
                    Prayer & Fasting Week
                  </h3>
                  <p className={styles.eventTime}>Various Times</p>
                  <p className={styles.eventDescription}>
                    Join us in a week-long prayer initiative seeking God's
                    direction and provision for our ministry.
                  </p>
                </div>
              </div>

              <div className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span className={styles.eventMonth}>JUN</span>
                  <span className={styles.eventDay}>16</span>
                </div>
                <div className={styles.eventContent}>
                  <h3 className={styles.eventTitle}>
                    Summer Camp for Children
                  </h3>
                  <p className={styles.eventTime}>9:00 AM - 5:00 PM</p>
                  <p className={styles.eventDescription}>
                    Fun, education, and faith-building activities for children
                    ages 5-12. Register by May 30.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.upcomingSection} id="upcoming">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>SPECIAL EVENTS</span>
              <h2 className={styles.sectionHeading}>Mark Your Calendars</h2>
              <p className={styles.sectionDescription}>
                Be part of these special occasions and celebrations at Light to
                Life International Ministries.
              </p>
            </div>

            <div className={styles.upcomingGrid}>
              <div className={styles.upcomingCard}>
                <div className={styles.upcomingImage}>
                  <div className={styles.imagePlaceholder}>
                    Church Anniversary Image
                  </div>
                </div>
                <div className={styles.upcomingContent}>
                  <h3>Church Anniversary Celebration</h3>
                  <p className={styles.upcomingDate}>July 15, 2024</p>
                  <p>
                    Join us for a special celebration marking 20 years of
                    ministry, faith, and community service with testimonies and
                    thanksgiving.
                  </p>
                  <a href="#" className={styles.eventLink}>
                    Learn More →
                  </a>
                </div>
              </div>

              <div className={styles.upcomingCard}>
                <div className={styles.upcomingImage}>
                  <div className={styles.imagePlaceholder}>
                    Mission Trip Image
                  </div>
                </div>
                <div className={styles.upcomingContent}>
                  <h3>International Mission Trip</h3>
                  <p className={styles.upcomingDate}>August 1-15, 2024</p>
                  <p>
                    Travel with us as we serve communities in West Africa
                    through education, healthcare, and spiritual ministry
                    programs.
                  </p>
                  <a href="#" className={styles.eventLink}>
                    Learn More →
                  </a>
                </div>
              </div>

              <div className={styles.upcomingCard}>
                <div className={styles.upcomingImage}>
                  <div className={styles.imagePlaceholder}>Concert Image</div>
                </div>
                <div className={styles.upcomingContent}>
                  <h3>Gospel Music Concert</h3>
                  <p className={styles.upcomingDate}>September 10, 2024</p>
                  <p>
                    Experience inspirational gospel music from renowned artists
                    with proceeds supporting our education program.
                  </p>
                  <a href="#" className={styles.eventLink}>
                    Learn More →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer is rendered globally in app/layout.tsx */}
    </div>
  );
}