"use client";

import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import { DashboardLoading } from "./loading";
import styles from "./dashboard.module.css";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");

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
            <div>
              <h1>Welcome back, {user?.displayName || user?.email}! 👋</h1>
              <p>Manage your missionary website and community</p>
            </div>
          </header>
          <div className={styles.stats}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>📊</div>
              <h3>Missions</h3>
              <p>15</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>💰</div>
              <h3>Donations</h3>
              <p>$50,000</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🙋</div>
              <h3>Volunteers</h3>
              <p>200</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>📚</div>
              <h3>Students Sponsored</h3>
              <p>200</p>
            </div>
          </div>
          <div className={styles.content}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>🖼️ Image Library</h2>
                <p className={styles.sectionSubtitle}>Upload images and select them later in other dashboard sections.</p>
              </div>
              <ImageUpload />
            </section>
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