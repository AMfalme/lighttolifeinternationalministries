"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { applyTheme, getStoredTheme, type Theme } from "@/app/lib/theme";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import styles from "@/app/dashboard/dashboard.module.css";

export default function DashboardTopBar() {
  const router = useRouter();
  const { user } = useFastAuth("/login");
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    try {
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (error) {
      console.error("Dashboard top bar logout error:", error);
    }

    setProfileMenuOpen(false);
    router.push("/");
  };

  return (
    <header className={styles.dashboardTopBar}>
      <div className={styles.dashboardTopBarInner}>
        <div>
          <p className={styles.dashboardTopBarKicker}>Dashboard</p>
          <h1 className={styles.dashboardTopBarTitle}>Manage your site</h1>
        </div>

        <div className={styles.dashboardTopBarActions} ref={profileMenuRef}>
          <button
            type="button"
            className={styles.profileTrigger}
            aria-expanded={profileMenuOpen}
            aria-label="Open dashboard profile menu"
            onClick={() => setProfileMenuOpen((open) => !open)}
          >
            <span className={styles.profileTriggerAvatar} aria-hidden>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" />
              ) : (
                <span>{(user?.displayName || user?.email || "D").slice(0, 1).toUpperCase()}</span>
              )}
            </span>
          </button>

          {profileMenuOpen ? (
            <div className={styles.profileMenu} role="menu" aria-label="Dashboard profile actions">
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
                <a href="/dashboard" className={styles.profileMenuLink} onClick={() => setProfileMenuOpen(false)}>
                  🎛️ Dashboard
                </a>
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
  );
}