"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  return (
    <>
      <div className={styles.mobileHeader}>
        <div className={styles.mobileBrand}>
          <Image src="/logo.jpeg" alt="Light to Life" width={140} height={64} className={styles.logo} priority />
        </div>
        <button
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          className={styles.hamburger}
          onClick={() => setMobileOpen((s) => !s)}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <Image src="/logo.jpeg" alt="Light to Life Logo" width={160} height={76} className={styles.logo} priority />
          <button className={styles.closeMobile} onClick={() => setMobileOpen(false)} aria-label="Close menu">✕</button>
        </div>
        <nav className={styles.sidebarNav}>
          <ul>
            <li><a href="/dashboard" className={styles.navLink} onClick={() => setMobileOpen(false)}>🎛️ Dashboard</a></li>
            <li><a href="/dashboard/profile" className={styles.navLink} onClick={() => setMobileOpen(false)}>👤 Profile</a></li>

            {isPrivileged && (
              <>
                <li><a href="/dashboard/blogs" className={styles.navLink} onClick={() => setMobileOpen(false)}>📝 Manage Blogs</a></li>
                <li><a href="/dashboard/team" className={styles.navLink} onClick={() => setMobileOpen(false)}>👥 Leadership</a></li>
                <li><a href="/dashboard/events" className={styles.navLink} onClick={() => setMobileOpen(false)}>📅 Manage Events</a></li>
                <li><a href="/dashboard/projects" className={styles.navLink} onClick={() => setMobileOpen(false)}>🏗️ Manage Projects</a></li>
                <li><a href="/dashboard/users" className={styles.navLink} onClick={() => setMobileOpen(false)}>🔐 Users</a></li>
              </>
            )}
          </ul>
        </nav>
        <div className={styles.sidebarFooter}>
          <ul>
            <li><a href="/dashboard/settings" className={styles.navLink} onClick={() => setMobileOpen(false)}>⚙️ Settings</a></li>
            <li><a href="/" className={styles.navLink} onClick={() => setMobileOpen(false)}>🏠 Go To Homepage</a></li>
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
