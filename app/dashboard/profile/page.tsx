"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLoading } from "../loading";
import styles from "../dashboard.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        await import("@/app/lib/firebase/config");
        const firebaseAuth = await import("firebase/auth");
        const auth = firebaseAuth.getAuth();
        unsub = firebaseAuth.onAuthStateChanged(auth, (user) => {
          if (user) {
            setUser(user);
            setDisplayName(user.displayName || "");
          } else {
            router.push("/login");
          }
          setLoading(false);
        });
      } catch (e) {
        console.error("Profile auth init error:", e);
        setLoading(false);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      await import("@/app/lib/firebase/config");
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (e) {
      console.error("Profile logout error:", e);
    }
    router.push("/");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const firebaseAuth = await import("firebase/auth");
      await firebaseAuth.updateProfile(user, { displayName });
      setUser({ ...user, displayName });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Image
              src="/logo.jpeg"
              alt="Light to Life Logo"
              width={160}
              height={76}
              className={styles.logo}
              priority
            />
          </div>
          <nav className={styles.sidebarNav}>
            <ul>
              <li><a href="/dashboard/profile" className={styles.navLink}>👤 Profile</a></li>
              <li><a href="/admin/blogs" className={styles.navLink}>📝 Manage Blogs</a></li>
              <li><a href="/admin/events" className={styles.navLink}>📅 Manage Events</a></li>
              <li><a href="/admin/projects" className={styles.navLink}>🏗️ Manage Projects</a></li>
            </ul>
          </nav>
          <div className={styles.sidebarFooter}>
            <ul>
              <li><a href="/dashboard/settings" className={styles.navLink}>⚙️ Settings</a></li>
              <li>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        </aside>
        <main className={styles.main}>
          <header className={styles.header}>
            <div>
              <h1>👤 Your Profile</h1>
              <p>Manage your account information</p>
            </div>
          </header>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Profile Information</h2>
              <p className={styles.sectionSubtitle}>Update your profile details</p>
            </div>
            <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  placeholder="Your email"
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
