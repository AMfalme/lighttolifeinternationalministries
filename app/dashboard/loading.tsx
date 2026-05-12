"use client";

import Image from "next/image";
import styles from "./dashboard.module.css";

export function DashboardLoading() {
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
              <li><div className={styles.skeletonText} style={{ height: 20, width: 120 }}></div></li>
              <li><div className={styles.skeletonText} style={{ height: 20, width: 140 }}></div></li>
              <li><div className={styles.skeletonText} style={{ height: 20, width: 130 }}></div></li>
              <li><div className={styles.skeletonText} style={{ height: 20, width: 150 }}></div></li>
            </ul>
          </nav>
        </aside>
        <main className={styles.main}>
          <header className={styles.header}>
            <div>
              <div className={styles.skeletonText} style={{ height: 32, width: 200, marginBottom: 12 }}></div>
              <div className={styles.skeletonText} style={{ height: 16, width: 250 }}></div>
            </div>
          </header>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Loading() {
  return <DashboardLoading />;
}
