"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import { DashboardLoading } from "./loading";
import styles from "./dashboard.module.css";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import { applyTheme, getStoredTheme, type Theme } from "@/app/lib/theme";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (loading) {
    return <DashboardLoading />;
  }

  const handleLogout = async () => {
    try {
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    }
    router.push("/");
  };

  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>
        <DashboardSidebar onLogout={handleLogout} />
        <main className={styles.main}>
          <header className={styles.header}>
            <div className={styles.welcomeCard}>
              <div className={styles.welcomeAvatar} aria-hidden>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" />
                ) : (
                  <span>{(user?.displayName || user?.email || "U").slice(0,1).toUpperCase()}</span>
                )}
              </div>
              <div className={styles.welcomeContent}>
                <h1>Welcome back, {user?.displayName || user?.email || 'User'}! 👋</h1>
                <p className={styles.welcomeSubtitle}>Manage your missionary website and community</p>
              </div>
              <div className={styles.welcomeActions} ref={profileMenuRef}>
                <button
                  type="button"
                  className={styles.profileTrigger}
                  aria-expanded={profileMenuOpen}
                  aria-label="Open profile menu"
                  onClick={() => setProfileMenuOpen((open) => !open)}
                >
                  <span className={styles.profileTriggerAvatar} aria-hidden>
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="" />
                    ) : (
                      <span>{(user?.displayName || user?.email || "U").slice(0, 1).toUpperCase()}</span>
                    )}
                  </span>
                  <span className={styles.profileTriggerText}>
                    <strong>Profile</strong>
                    <small>Quick actions</small>
                  </span>
                  <span className={styles.profileTriggerChevron} aria-hidden>▾</span>
                </button>

                {profileMenuOpen ? (
                  <div className={styles.profileMenu} role="menu" aria-label="Profile actions">
                    <div className={styles.profileMenuSection}>
                      <span className={styles.profileMenuLabel}>Appearance</span>
                      <div className={styles.themeToggleGroup} role="radiogroup" aria-label="Theme">
                        {(["light", "dark"] as Theme[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`${styles.themeBtn} ${theme === option ? styles.active : ""}`}
                            onClick={() => {
                              setTheme(option);
                              setProfileMenuOpen(false);
                            }}
                          >
                            {option === "light" ? "☀️ Light" : "🌙 Dark"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.profileMenuSection}>
                      <span className={styles.profileMenuLabel}>Account</span>
                      <a href="/dashboard/profile" className={styles.profileMenuLink} onClick={() => setProfileMenuOpen(false)}>
                        👤 Profile
                      </a>
                      <a href="/dashboard/settings" className={styles.profileMenuLink} onClick={() => setProfileMenuOpen(false)}>
                        ⚙️ Settings
                      </a>
                    </div>

                    <div className={styles.profileMenuSection}>
                      <span className={styles.profileMenuLabel}>Navigation</span>
                      <a href="/" className={styles.profileMenuLink} onClick={() => setProfileMenuOpen(false)}>
                        🏠 Go To Homepage
                      </a>
                      <button type="button" onClick={handleLogout} className={styles.profileMenuDanger}>
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </header>
          <div className={styles.stats} role="list">
            <div className={`${styles.card} ${styles.statCard}`} role="listitem">
              <div className={styles.cardIcon}>📊</div>
              <div className={styles.statText}>
                <h4>Missions</h4>
                <strong>15</strong>
              </div>
            </div>
            <div className={`${styles.card} ${styles.statCard}`} role="listitem">
              <div className={styles.cardIcon}>💰</div>
              <div className={styles.statText}>
                <h4>Donations</h4>
                <strong>$50,000</strong>
              </div>
            </div>
            <div className={`${styles.card} ${styles.statCard}`} role="listitem">
              <div className={styles.cardIcon}>🙋</div>
              <div className={styles.statText}>
                <h4>Volunteers</h4>
                <strong>200</strong>
              </div>
            </div>
            <div className={`${styles.card} ${styles.statCard}`} role="listitem">
              <div className={styles.cardIcon}>📚</div>
              <div className={styles.statText}>
                <h4>Students</h4>
                <strong>200</strong>
              </div>
            </div>
          </div>
          <div className={styles.content}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>📝 Manage Site</h2>
                <p className={styles.sectionSubtitle}>Quick links to dashboard sections</p>
              </div>
              <div className={styles.linkGrid}>
                <a href="/dashboard/profile" className={styles.contentLink}>
                  <span className={styles.linkIcon}>👤</span>
                  <div>
                    <h4>Profile</h4>
                    <p>Update your profile information</p>
                  </div>
                </a>
                <a href="/dashboard/blogs" className={styles.contentLink}>
                  <span className={styles.linkIcon}>📝</span>
                  <div>
                    <h4>Blogs</h4>
                    <p>Manage blog posts</p>
                  </div>
                </a>
                <a href="/dashboard/team" className={styles.contentLink}>
                  <span className={styles.linkIcon}>👥</span>
                  <div>
                    <h4>Leadership</h4>
                      <p>Manage leadership accounts</p>
                  </div>
                </a>
                <a href="/dashboard/events" className={styles.contentLink}>
                  <span className={styles.linkIcon}>📅</span>
                  <div>
                    <h4>Events</h4>
                    <p>Manage events and schedules</p>
                  </div>
                </a>
                <a href="/dashboard/projects" className={styles.contentLink}>
                  <span className={styles.linkIcon}>🏗️</span>
                  <div>
                    <h4>Projects</h4>
                    <p>Manage ongoing projects</p>
                  </div>
                </a>
                <a href="/dashboard/users" className={styles.contentLink}>
                  <span className={styles.linkIcon}>🔐</span>
                  <div>
                    <h4>Users</h4>
                    <p>View and manage user roles</p>
                  </div>
                </a>
                <a href="/dashboard/settings" className={styles.contentLink}>
                  <span className={styles.linkIcon}>⚙️</span>
                  <div>
                    <h4>Settings</h4>
                    <p>Dashboard preferences</p>
                  </div>
                </a>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}