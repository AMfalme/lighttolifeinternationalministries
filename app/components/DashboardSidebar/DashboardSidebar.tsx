"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { applyTheme, getStoredTheme, type Theme } from "@/app/lib/theme";
import styles from "@/app/dashboard/dashboard.module.css";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import { db } from "@/app/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

type DashboardSidebarProps = {
  onLogout: () => void | Promise<void>;
};

export default function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  const { user, loading } = useFastAuth("/login");
  const [role, setRole] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user || !db) return;

    let mounted = true;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (!mounted) return;
        setRole(snap.exists() ? (snap.data().role as string) || null : null);
      } catch (error) {
        console.error("Error loading sidebar role:", error);
        if (mounted) setRole(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  const isPrivileged = role === "admin" || role === "leadership";

  useEffect(() => {
    // On initial load, if desktop, ensure sidebar is open
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setMobileOpen(true);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      const trigger = document.querySelector("[data-dashboard-profile-trigger]");
      const menu = document.querySelector("[data-dashboard-profile-menu]");
      if (!(target instanceof Node)) return;
      if (trigger?.contains(target) || menu?.contains(target)) return;
      setProfileMenuOpen(false);
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

  useEffect(() => {
    if (mobileOpen && window.innerWidth < 1024) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <>
      <div className={styles.mobileHeader} style={!mobileOpen ? { display: 'flex' } : undefined}>
        <div className={styles.mobileBrand}>
          <Image src="/logo.jpeg" alt="Light to Life" width={140} height={64} className={styles.logo} priority />
        </div>
        <div className={styles.sidebarProfileActions}>
          <button
            type="button"
            className={styles.profileTrigger}
            aria-expanded={profileMenuOpen}
            aria-label="Open dashboard profile menu"
            data-dashboard-profile-trigger
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
            <div className={styles.profileMenu} role="menu" aria-label="Dashboard profile menu" data-dashboard-profile-menu>
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
                <button
                  type="button"
                  onClick={async () => {
                    setProfileMenuOpen(false);
                    await onLogout();
                  }}
                  className={styles.profileMenuDanger}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <button
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className={styles.hamburger}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((s) => !s)}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          <Image src="/logo.jpeg" alt="Light to Life Logo" width={160} height={76} className={styles.logo} priority />
          <button className={styles.closeMobile} onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <nav className={styles.sidebarNav}>
          <ul>
            <li><a href="/dashboard" className={styles.navLink}>🎛️ Dashboard</a></li>
            <li><a href="/dashboard/profile" className={styles.navLink}>👤 Profile</a></li>

            {isPrivileged && (
              <>
                <li><a href="/dashboard/blogs" className={styles.navLink}>📝 Manage Blogs</a></li>
                <li><a href="/dashboard/team" className={styles.navLink}>👥 Leadership</a></li>
                <li><a href="/dashboard/team-members" className={styles.navLink}>👥 Team Members</a></li>
                <li><a href="/dashboard/events" className={styles.navLink}>📅 Manage Events</a></li>
                <li><a href="/dashboard/projects" className={styles.navLink}>🏗️ Projects</a></li>
                <li><a href="/dashboard/projects" className={styles.navLink}>🏗️ Manage Projects</a></li>
                <li><a href="/dashboard/donations" className={styles.navLink}>💰 Donations</a></li>
                <li><a href="/dashboard/users" className={styles.navLink}>🔐 Users</a></li>
              </>
            )}
          </ul>
        </nav>
        <div className={styles.sidebarFooter}>
          <ul>
            <li><a href="/dashboard/settings" className={styles.navLink}>⚙️ Settings</a></li>
            <li><a href="/" className={styles.navLink}>🏠 Go To Homepage</a></li>
            <li>
              <button type="button" onClick={onLogout} className={styles.logoutBtn}>
                🚪 Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {mobileOpen && <div className={styles.backdrop} onClick={() => setMobileOpen(false)} />}
    </>
  );
}
