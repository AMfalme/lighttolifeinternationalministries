"use client";

import Image from "next/image";
import styles from "@/app/dashboard/dashboard.module.css";

type DashboardSidebarProps = {
  onLogout: () => void | Promise<void>;
};

export default function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <Image src="/logo.jpeg" alt="Light to Life Logo" width={160} height={76} className={styles.logo} priority />
      </div>
      <nav className={styles.sidebarNav}>
        <ul>
          
          <li><a href="/dashboard" className={styles.navLink}>🎛️ Dashboard</a></li>
          <li><a href="/dashboard/profile" className={styles.navLink}>👤 Profile</a></li>
          <li><a href="/dashboard/blogs" className={styles.navLink}>📝 Manage Blogs</a></li>
          <li><a href="/dashboard/team" className={styles.navLink}>👥 Team Members</a></li>
          <li><a href="/dashboard/events" className={styles.navLink}>📅 Manage Events</a></li>
          <li><a href="/dashboard/projects" className={styles.navLink}>🏗️ Manage Projects</a></li>
          <li><a href="/dashboard/users" className={styles.navLink}>🔐 Users</a></li>
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
