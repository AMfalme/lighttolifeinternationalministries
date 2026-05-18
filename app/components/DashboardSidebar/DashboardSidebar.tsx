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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Image src="/logo.jpeg" alt="Light to Life Logo" width={160} height={76} className={styles.logo} priority />
      </div>
      <nav className={styles.sidebarNav}>
        <ul>
          <li><a href="/dashboard" className={styles.navLink}>🎛️ Dashboard</a></li>
          <li><a href="/dashboard/profile" className={styles.navLink}>👤 Profile</a></li>

          {isPrivileged && (
            <>
              <li><a href="/dashboard/blogs" className={styles.navLink}>📝 Manage Blogs</a></li>
              <li><a href="/dashboard/team" className={styles.navLink}>👥 Leadership</a></li>
              <li><a href="/dashboard/events" className={styles.navLink}>📅 Manage Events</a></li>
              <li><a href="/dashboard/projects" className={styles.navLink}>🏗️ Manage Projects</a></li>
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
  );
}
