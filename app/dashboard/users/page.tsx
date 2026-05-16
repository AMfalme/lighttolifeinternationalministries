"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import { DashboardLoading } from "../loading";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import styles from "../dashboard.module.css";

export default function UsersPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);
  const [editBranchById, setEditBranchById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      try {
        const fsConfig = await import("@/app/lib/firebase/config");
        const db = fsConfig.db;
        if (!db) {
          setCurrentUserRole("user");
          return;
        }
        const { getDoc, doc } = await import("firebase/firestore");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc && userDoc.exists()) {
          const data: any = userDoc.data();
          setCurrentUserRole(data.role || null);
        } else {
          setCurrentUserRole("user");
        }
      } catch (error) {
        console.warn("Firestore unavailable, defaulting role:", error);
        setCurrentUserRole("user");
      } finally {
        setRoleChecked(true);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (roleChecked && user && currentUserRole !== "admin") {
      router.replace("/dashboard");
    }
  }, [currentUserRole, roleChecked, router, user]);

  const loadUsers = async () => {
    if (currentUserRole !== "admin") return;

    setLoadingUsers(true);
    try {
      const fsConfig = await import("@/app/lib/firebase/config");
      const db = fsConfig.db;
      if (!db) {
        setUsersList([]);
        return;
      }
      const { collection, getDocs } = await import("firebase/firestore");
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
      const fsConfig = await import("@/app/lib/firebase/config");
      const db = fsConfig.db;
      if (!db) {
        throw new Error("Firestore is not configured.");
      }
      const { doc, updateDoc } = await import("firebase/firestore");
      const userRef = doc(db, "users", u.id);
      await updateDoc(userRef, {
        role: u.role || "user",
        branchLocation: editBranchById[u.id] || u.branchLocation || "",
      });
    } catch (error) {
      console.error("Error updating user:", error);
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
        <DashboardSidebar onLogout={handleLogout} />
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
                      <th>Branch Location</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{u.displayName || "—"}</td>
                        <td>
                          {currentUserRole === "admin" ? (
                            <select
                              value={u.role || "user"}
                              onChange={(event) =>
                                setUsersList((prev) =>
                                  prev.map((item) => (item.id === u.id ? { ...item, role: event.target.value } : item)),
                                )
                              }
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          ) : (
                            u.role || "user"
                          )}
                        </td>
                        <td>
                          {currentUserRole === "admin" ? (
                            <input
                              type="text"
                              value={editBranchById[u.id] ?? u.branchLocation ?? ""}
                              onChange={(event) => setEditBranchById((prev) => ({ ...prev, [u.id]: event.target.value }))}
                              placeholder="Branch location"
                            />
                          ) : (
                            u.branchLocation || "—"
                          )}
                        </td>
                        <td>
                          {currentUserRole === "admin" ? (
                            <button onClick={() => saveRole(u)} className={styles.submitBtn}>
                              Save
                            </button>
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
