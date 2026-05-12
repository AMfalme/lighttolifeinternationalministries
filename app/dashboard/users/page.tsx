"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLoading } from "../loading";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase/config";
import styles from "../dashboard.module.css";

export default function UsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        await import("@/app/lib/firebase/config");
        const firebaseAuth = await import("firebase/auth");
        const auth = firebaseAuth.getAuth();
        unsub = firebaseAuth.onAuthStateChanged(auth, async (u) => {
          if (u) {
            setUser(u);
            try {
              const userDoc = await getDoc(doc(db, "users", u.uid));
              if (userDoc && userDoc.exists()) {
                const data: any = userDoc.data();
                setCurrentUserRole(data.role || null);
              } else {
                setCurrentUserRole("user");
              }
            } catch (e) {
              setCurrentUserRole("user");
            }
          } else {
            router.push("/login");
          }
          setRoleChecked(true);
          setLoading(false);
        });
      } catch (e) {
        console.error("Users auth init error:", e);
        setRoleChecked(true);
        setLoading(false);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [router]);

  useEffect(() => {
    if (roleChecked && user && currentUserRole !== "admin") {
      router.replace("/dashboard");
    }
  }, [currentUserRole, roleChecked, router, user]);

  const loadUsers = async () => {
    if (currentUserRole !== "admin") return;

    setLoadingUsers(true);
    try {
      const qSnapshot = await getDocs(collection(db, "users"));
      setUsersList(qSnapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    } catch (e) {
      console.error("Error fetching users:", e);
      setUsersList([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const saveRole = async (u: any) => {
    if (currentUserRole !== "admin") return;

    try {
      const fstore = await import("firebase/firestore");
      const userRef = fstore.doc(db, "users", u.id);
      await fstore.updateDoc(userRef, { role: u.role || "user" });
    } catch (e) {
      console.error("Error updating role:", e);
    }
  };

  const handleLogout = async () => {
    try {
      await import("@/app/lib/firebase/config");
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (e) {
      console.error("Users logout error:", e);
    }
    router.push("/");
  };

  if (loading) return <DashboardLoading />;
  if (!user) return null;
  if (roleChecked && currentUserRole !== "admin") {
    return (
      <div className={styles.page}>
        <div className={styles.dashboard}>
          <main className={styles.main}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h1>Access denied</h1>
                <p className={styles.sectionSubtitle}>Only admins can manage users.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Image src="/logo.jpeg" alt="Light to Life Logo" width={160} height={76} className={styles.logo} priority />
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
              <h1>👥 Users Management</h1>
              <p>View and manage authenticated users and their roles</p>
            </div>
          </header>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Users</h2>
            </div>
            <div style={{ marginBottom: 12 }}>
              <button onClick={loadUsers} className={styles.submitBtn}>
                {loadingUsers ? "Loading..." : "Load Users"}
              </button>
            </div>

            {usersList.length === 0 ? (
              <p>No users loaded. Click "Load Users" to fetch.</p>
            ) : (
              <div>
                <table className={styles.usersTable}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{u.displayName || "—"}</td>
                        <td>{u.role || "user"}</td>
                        <td>
                          {currentUserRole === "admin" ? (
                            <>
                              <select value={u.role || "user"} onChange={(e) => setUsersList((prev) => prev.map((p) => (p.id === u.id ? { ...p, role: e.target.value } : p)))}>
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                              </select>
                              <button style={{ marginLeft: 8 }} onClick={() => saveRole(u)} className={styles.submitBtn}>Save</button>
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
