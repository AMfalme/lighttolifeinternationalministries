"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLoading } from "@/app/dashboard/loading";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  Event,
} from "@/app/lib/firebase/firestore";
import styles from "./events.module.css";

export default function AdminEventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<(Event & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Event>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    location: "",
  });

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        await import("@/app/lib/firebase/config");
        const firebaseAuth = await import("firebase/auth");
        const auth = firebaseAuth.getAuth();
        unsub = firebaseAuth.onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
          } else {
            router.push("/login");
          }
          setLoading(false);
        });
      } catch (e) {
        console.error("AdminEvents auth init error:", e);
        setLoading(false);
      }
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [router]);

  useEffect(() => {
    if (!loading && user) {
      fetchEvents();
    }
  }, [loading, user]);

  const fetchEvents = async () => {
    try {
      const fetchedEvents = await getAllEvents();
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEvent(editingId, formData);
      } else {
        await createEvent(formData);
      }
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        fetchEvents();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleEdit = (event: Event & { id: string }) => {
    setFormData(event);
    setEditingId(event.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      location: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📅 Manage Events</h1>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Event"}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Event Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Time *</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
              placeholder="Event location"
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            {editingId ? "Update Event" : "Create Event"}
          </button>
        </form>
      )}

      <div className={styles.eventsList}>
        {events.length === 0 ? (
          <p className={styles.empty}>No events yet. Create your first event!</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventInfo}>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <div className={styles.eventMeta}>
                  <span>📅 {event.date}</span>
                  <span>⏰ {event.time}</span>
                  <span>📍 {event.location}</span>
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(event)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(event.id!)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
