"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../../components/Navbar/Navbar";
import { auth, db, hasFirebaseClientConfig } from "@/app/lib/firebase/config";
import {
  Event,
  EventRegistration,
  getEventById,
  getEventRegistrations,
  registerUserForEvent,
  unregisterUserFromEvent,
} from "@/app/lib/firebase/firestore";
import styles from "../events.module.css";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;
  const [event, setEvent] = useState<(Event & { id: string }) | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    const loadEvent = async () => {
      if (!eventId || !hasFirebaseClientConfig) {
        setLoading(false);
        return;
      }

      try {
        const [nextEvent, nextRegistrations] = await Promise.all([getEventById(eventId), getEventRegistrations(eventId)]);
        setEvent(nextEvent);
        setRegistrations(nextRegistrations);
      } catch (error) {
        console.error("Error loading event detail:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadEvent();
  }, [eventId]);

  const isPrivilegedUser = currentRole === "admin" || currentRole === "team-member";
  const isRegistered = useMemo(
    () => Boolean(currentUser && registrations.some((registration) => registration.userId === currentUser.uid)),
    [currentUser, registrations],
  );
  const currentRegistration = useMemo(
    () => registrations.find((registration) => registration.userId === currentUser?.uid) || null,
    [currentUser, registrations],
  );

  const handleRegisterToggle = async () => {
    if (!currentUser || !event) {
      return;
    }

    setSaving(true);

    try {
      if (isRegistered) {
        await unregisterUserFromEvent(event.id, currentUser.uid);
      } else {
        await registerUserForEvent({
          eventId: event.id,
          userId: currentUser.uid,
          email: currentUser.email || "",
          displayName: currentUser.displayName || currentUser.email || "Registered user",
          role: currentRole || "user",
        });
      }

      const nextRegistrations = await getEventRegistrations(event.id);
      setRegistrations(nextRegistrations);
    } catch (error) {
      console.error("Error updating event registration:", error);
      alert("Could not update your registration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <section className={styles.pageHero}>
          <div className={styles.sectionContainer}>
            <p className={styles.sectionLabel}>EVENT DETAIL</p>
            <h1 className={styles.pageTitle}>{event?.title || "Event"}</h1>
            <p className={styles.pageDescription}>
              <Link href="/events">Back to events</Link>
            </p>
          </div>
        </section>

        <section className={styles.eventsSection}>
          <div className={styles.sectionContainer}>
            {loading ? (
              <p className={styles.sectionDescription}>Loading event...</p>
            ) : event ? (
              <div className={styles.eventCard}>
                <div className={styles.eventContent}>
                  <h2 className={styles.eventTitle}>{event.title}</h2>
                  <p className={styles.eventTime}>⏰ {event.time}</p>
                  <p className={styles.eventDescription}>{event.description}</p>
                  <p className={styles.eventDescription}>📍 {event.location}</p>

                  <div className={styles.registerPanel}>
                    <div className={styles.registerActions}>
                      <button
                        type="button"
                        className={isRegistered ? styles.unregisterBtn : styles.registerBtn}
                        onClick={() => void handleRegisterToggle()}
                        disabled={saving || !currentUser}
                      >
                        {saving ? "Updating..." : isRegistered ? "Unregister" : currentUser ? "Register" : "Sign in to register"}
                      </button>
                      {isRegistered ? <span className={styles.registrationStatus}>You are registered</span> : null}
                    </div>

                    {currentUser ? (
                      <div className={styles.attendeeSection}>
                        <div className={styles.attendeeHeader}>
                          <strong>Your Registration</strong>
                          <span className={styles.attendeeMeta}>{currentRegistration ? "Saved" : "Not registered"}</span>
                        </div>
                        <div className={styles.attendeeList}>
                          {currentRegistration ? (
                            <span className={styles.attendeeChip}>{currentRegistration.displayName || currentRegistration.email}</span>
                          ) : (
                            <span className={styles.attendeeMeta}>Register to see your entry here.</span>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {isPrivilegedUser ? (
                      <div className={styles.attendeeSection}>
                        <div className={styles.attendeeHeader}>
                          <strong>Registered Users</strong>
                          <span className={styles.attendeeMeta}>{registrations.length} registered</span>
                        </div>
                        <div className={styles.attendeeList}>
                          {registrations.length ? (
                            registrations.map((registration) => (
                              <span key={registration.id} className={styles.attendeeChip} title={registration.email}>
                                {registration.displayName || registration.email}
                              </span>
                            ))
                          ) : (
                            <span className={styles.attendeeMeta}>No registrations yet.</span>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              <p className={styles.sectionDescription}>That event could not be found.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}