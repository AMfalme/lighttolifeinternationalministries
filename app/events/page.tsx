"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../components/Navbar/Navbar";
import { auth, db, hasFirebaseClientConfig } from "@/app/lib/firebase/config";
import {
  Event,
  EventRegistration,
  getAllEvents,
  getAllEventRegistrations,
  registerUserForEvent,
  unregisterUserFromEvent,
} from "@/app/lib/firebase/firestore";
import styles from "./events.module.css";

type EventWithId = Event & { id: string };

const formatDateParts = (dateValue: string) => {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return { month: dateValue.slice(0, 3).toUpperCase() || "EVT", day: dateValue.slice(-2) || "--" };
  }

  return {
    month: parsedDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: parsedDate.toLocaleDateString("en-US", { day: "2-digit" }),
  };
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithId[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingEventId, setSavingEventId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setCurrentUser(nextUser);

      if (!nextUser || !db) {
        setCurrentRole(null);
        return;
      }

      try {
        const snapshot = await getDoc(doc(db, "users", nextUser.uid));
        setCurrentRole(snapshot.exists() ? snapshot.data().role || null : null);
      } catch (error) {
        console.error("Error loading current user role:", error);
        setCurrentRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const [fetchedEvents, fetchedRegistrations] = await Promise.all([getAllEvents(), getAllEventRegistrations()]);
        setEvents(fetchedEvents);
        setRegistrations(fetchedRegistrations);
      } catch (error) {
        console.error("Error loading public events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (hasFirebaseClientConfig) {
      void loadEvents();
    } else {
      setLoading(false);
    }
  }, []);

  const registrationsByEvent = useMemo(() => {
    return registrations.reduce<Record<string, EventRegistration[]>>((accumulator, registration) => {
      if (!accumulator[registration.eventId]) {
        accumulator[registration.eventId] = [];
      }
      accumulator[registration.eventId].push(registration);
      return accumulator;
    }, {});
  }, [registrations]);

  const isPrivilegedUser = currentRole === "admin" || currentRole === "leadership";

  const handleRegisterToggle = async (eventId: string) => {
    if (!currentUser) {
      alert("Please sign in to register for an event.");
      return;
    }

    const alreadyRegistered = registrations.some((registration) => registration.eventId === eventId && registration.userId === currentUser.uid);
    setSavingEventId(eventId);

    try {
      if (alreadyRegistered) {
        await unregisterUserFromEvent(eventId, currentUser.uid);
      } else {
        await registerUserForEvent({
          eventId,
          userId: currentUser.uid,
          email: currentUser.email || "",
          displayName: currentUser.displayName || currentUser.email || "Registered user",
          role: currentRole || "user",
        });
      }

      const nextRegistrations = await getAllEventRegistrations();
      setRegistrations(nextRegistrations);
    } catch (error) {
      console.error("Error updating event registration:", error);
      alert("Could not update your registration.");
    } finally {
      setSavingEventId(null);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.pageHero}>
          <div className={styles.sectionContainer}>
            <h1 className={styles.pageTitle}>Events & Calendar</h1>
            <p className={styles.pageDescription}>
              Join us for worship, fellowship, and community service. Register for an event and see who is attending.
            </p>
          </div>
        </section>

        <section className={styles.eventsSection} id="calendar">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>CALENDAR</span>
              <h2 className={styles.sectionHeading}>Upcoming Events</h2>
            </div>

            {loading ? (
              <p className={styles.sectionDescription}>Loading events...</p>
            ) : events.length === 0 ? (
              <p className={styles.sectionDescription}>No events have been published yet.</p>
            ) : (
              <div className={styles.eventsList}>
                {events.map((event) => {
                  const eventRegistrations = registrationsByEvent[event.id] || [];
                  const isRegistered = Boolean(currentUser && eventRegistrations.some((registration) => registration.userId === currentUser.uid));
                  const { month, day } = formatDateParts(event.date);

                  return (
                    <div key={event.id} className={styles.eventCard}>
                      <div className={styles.eventDate}>
                        <span className={styles.eventMonth}>{month}</span>
                        <span className={styles.eventDay}>{day}</span>
                      </div>
                      <div className={styles.eventContent}>
                        <h3 className={styles.eventTitle}>
                          <Link href={`/events/${event.id}`}>{event.title}</Link>
                        </h3>
                        <p className={styles.eventTime}>⏰ {event.time}</p>
                        <p className={styles.eventDescription}>{event.description}</p>
                        <p className={styles.eventDescription}>📍 {event.location}</p>

                        <div className={styles.registerPanel}>
                          <div className={styles.registerActions}>
                            <button
                              type="button"
                              className={isRegistered ? styles.unregisterBtn : styles.registerBtn}
                              onClick={() => void handleRegisterToggle(event.id)}
                              disabled={savingEventId === event.id}
                            >
                              {savingEventId === event.id
                                ? "Updating..."
                                : isRegistered
                                ? "Unregister"
                                : currentUser
                                ? "Register"
                                : "Sign in to register"}
                            </button>
                            {isRegistered ? <span className={styles.registrationStatus}>You are registered</span> : null}
                          </div>

                          {isPrivilegedUser ? (
                            <div className={styles.attendeeSection}>
                              <div className={styles.attendeeHeader}>
                                <strong>Registered Users</strong>
                                <span className={styles.attendeeMeta}>{eventRegistrations.length} registered</span>
                              </div>
                              <div className={styles.attendeeList}>
                                {eventRegistrations.length ? (
                                  eventRegistrations.map((registration) => (
                                    <span key={registration.id} className={styles.attendeeChip} title={registration.email}>
                                      {registration.displayName || registration.email}
                                    </span>
                                  ))
                                ) : (
                                  <span className={styles.attendeeMeta}>No registrations yet.</span>
                                )}
                              </div>
                              <p className={styles.attendeeMeta}>Admins and leadership can review the attendee list above.</p>
                            </div>
                          ) : isRegistered ? (
                            <div className={styles.attendeeSection}>
                              <span className={styles.attendeeMeta}>Only your registration is shown on this page.</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className={styles.upcomingSection} id="upcoming">
          <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>YOUR REGISTRATIONS</span>
              <h2 className={styles.sectionHeading}>Events You Registered For</h2>
              <p className={styles.sectionDescription}>Quick reference to the events you have already joined.</p>
            </div>

            {currentUser ? (
              <div className={styles.upcomingGrid}>
                {registrations
                  .filter((registration) => registration.userId === currentUser.uid)
                  .map((registration) => {
                    const event = events.find((item) => item.id === registration.eventId);
                    if (!event) return null;

                    return (
                      <div key={registration.id} className={styles.upcomingCard}>
                        <div className={styles.upcomingContent}>
                          <h3>{event.title}</h3>
                          <p className={styles.upcomingDate}>{event.date}</p>
                          <p>{event.location}</p>
                          <button type="button" className={styles.unregisterBtn} onClick={() => void handleRegisterToggle(event.id)}>
                            Unregister
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className={styles.sectionDescription}>
                Sign in to register for events and keep track of the events you have joined.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* Footer is rendered globally in app/layout.tsx */}
    </div>
  );
}
