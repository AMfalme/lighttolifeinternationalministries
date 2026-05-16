"use client";

import styles from "./dashboard.module.css";

export function DashboardLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.skeletonText} style={{ height: 56, width: 140, borderRadius: 16 }} />
          </div>
          <nav className={styles.sidebarNav} aria-label="Loading navigation">
            <ul>
              <li><div className={styles.skeletonText} style={{ height: 18, width: 120 }} /></li>
              <li><div className={styles.skeletonText} style={{ height: 18, width: 140 }} /></li>
              <li><div className={styles.skeletonText} style={{ height: 18, width: 130 }} /></li>
              <li><div className={styles.skeletonText} style={{ height: 18, width: 150 }} /></li>
            </ul>
          </nav>
        </aside>
        <main className={styles.main}>
          <header className={styles.header}>
            <div>
              <div className={styles.skeletonText} style={{ height: 28, width: 220, marginBottom: 10 }} />
              <div className={styles.skeletonText} style={{ height: 14, width: 260 }} />
            </div>
          </header>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Loading() {
  return <DashboardLoading />;
}
