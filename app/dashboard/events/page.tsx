"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { DashboardLoading } from "@/app/dashboard/loading";
import {
  Event,
  createEvent,
  deleteEvent,
  getAllEvents,
  updateEvent,
} from "@/app/lib/firebase/firestore";
import styles from "@/app/admin/events/events.module.css";
import dashStyles from "@/app/dashboard/dashboard.module.css";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";

export default function DashboardEventsPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [events, setEvents] = useState<(Event & { id: string })[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Event>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "10:00",
    location: "",
    imageUrl: "",
  });

  const fetchEvents = async () => {
    try {
      const fetched = await getAllEvents();
      setEvents(fetched);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      void fetchEvents();
    }
  }, [loading, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateEvent(editingId, formData);
      } else {
        await createEvent(formData);
      }
      await fetchEvents();
      resetForm();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await deleteEvent(id);
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEdit = (ev: Event & { id: string }) => {
    setFormData({ ...ev, imageUrl: ev.imageUrl || "" });
    setEditingId(ev.id);
    setShowForm(true);
  };

  const handleSelectImage = (image: { url: string } | null) => {
    setFormData((current) => ({ ...current, imageUrl: image?.url || "" }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      location: "",
      imageUrl: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = async () => {
    try {
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
    router.push("/");
  };

  if (loading || pageLoading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={dashStyles.page}>
      <div className={dashStyles.dashboard}>
        <DashboardSidebar onLogout={handleLogout} />
        <main className={dashStyles.main}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>📅 Manage Events</h1>
              <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ Add Event"}</button>
            </div>

            {showForm && (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Event Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>

                <div className={styles.formGroup}>
                  <label>Description *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={4} />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Date *</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Time *</label>
                    <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} required />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Location *</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required placeholder="Event location" />
                </div>

                <div className={styles.formGroup}>
                  <label>Image URL</label>
                  <input type="text" value={formData.imageUrl || ""} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="Select an uploaded image or paste an image URL" />
                </div>

                <div className={styles.formGroup}>
                  <label>Choose from uploaded images</label>
                  <ImageUpload onSelectImage={handleSelectImage} initialSelectedUrl={formData.imageUrl || undefined} />
                </div>

                <button type="submit" className={styles.submitBtn}>{editingId ? "Update Event" : "Create Event"}</button>
              </form>
            )}

            <div className={styles.eventsList}>
              {events.length === 0 ? <p className={styles.empty}>No events yet. Create your first event!</p> : events.map((ev) => (
                <div key={ev.id} className={styles.eventCard}>
                  <div className={styles.eventInfo}>
                    <h3>{ev.title}</h3>
                    <p>{ev.description}</p>
                    <div className={styles.eventMeta}><span>📅 {ev.date}</span><span>⏰ {ev.time}</span><span>📍 {ev.location}</span></div>
                  </div>
                  <div className={styles.actions}><button className={styles.editBtn} onClick={() => handleEdit(ev)}>Edit</button><button className={styles.deleteBtn} onClick={() => handleDelete(ev.id!)}>Delete</button></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
