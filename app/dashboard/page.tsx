"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLoading } from "./loading";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        // ensure firebase app is initialized before using auth
        await import("@/app/lib/firebase/config");
        const firebaseAuth = await import("firebase/auth");
        const auth = firebaseAuth.getAuth();
        unsub = firebaseAuth.onAuthStateChanged(auth, async (u) => {
          if (u) {
            setUser(u);
            // fetch user's role from Firestore users collection
            try {
              const { db } = await import("@/app/lib/firebase/config");
              const fstore = await import("firebase/firestore");
              const userDoc = await fstore.getDoc(fstore.doc(db, "users", u.uid));
              if (userDoc && userDoc.exists()) {
                const data: any = userDoc.data();
                setCurrentUserRole(data.role || null);
              } else {
                setCurrentUserRole(null);
              }
            } catch (e) {
              setCurrentUserRole(null);
            }
          } else {
            router.push("/login");
          }
          setLoading(false);
        });
      } catch (e) {
        // if anything goes wrong, avoid crashing the page
        console.error("Auth init error:", e);
        setLoading(false);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [router]);

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
              <h1>Welcome back, {user.displayName || user.email}! 👋</h1>
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
                  <span className={styles.linkIcon}>👥</span>
                  <div>
                    <h4>Users</h4>
                    <p>View and manage user roles (admin only)</p>
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