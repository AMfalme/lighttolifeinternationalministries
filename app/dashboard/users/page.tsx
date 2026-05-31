"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import { DashboardLoading } from "../loading";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import styles from "../dashboard.module.css";

type ManagedUser = {
  id: string;
  email: string;
  displayName?: string;
  role?: string;
  branchLocation?: string;
  branchMapUrl?: string;
  phoneNumber?: string;
};

const extractMapUrl = (value?: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const url = iframeMatch?.[1] || trimmed;
  return String(url || "").replace(/&amp;/gi, "&");
};

export default function UsersPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [usersList, setUsersList] = useState<ManagedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [roleChecked, setRoleChecked] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const selectedUser = useMemo(
    () => usersList.find((item) => item.id === selectedUserId) || usersList[0] || null,
    [selectedUserId, usersList],
  );

  const getAuthToken = async () => {
    const firebaseAuth = await import("firebase/auth");
    const auth = firebaseAuth.getAuth();
    if (!auth.currentUser) {
      throw new Error("You must be signed in to manage users.");
    }

    return auth.currentUser.getIdToken();
  };

  const loadUsers = async () => {
    if (currentUserRole !== "admin" && currentUserRole !== "leadership") return;

    setLoadingUsers(true);
    try {
      const fsConfig = await import("@/app/lib/firebase/config");
      const db = fsConfig.db;
      if (!db) {
        setUsersList([]);
        return;
      }

      const { collection, getDocs } = await import("firebase/firestore");
      const snapshot = await getDocs(collection(db, "users"));
      const nextUsers = snapshot.docs.map((document) => {
        const data: any = document.data();
        return {
          id: document.id,
          email: data.email || "",
          displayName: data.displayName || "",
          role: data.role || "user",
          branchLocation: data.branchLocation || "",
          branchMapUrl: extractMapUrl(data.branchMapUrl),
          phoneNumber: data.phoneNumber || "",
        } as ManagedUser;
      });

      setUsersList(nextUsers);
      setSelectedUserId((current) => current || nextUsers[0]?.id || "");
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsersList([]);
    } finally {
      setLoadingUsers(false);
    }
  };

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
        if (userDoc.exists()) {
          const data: any = userDoc.data();
          setCurrentUserRole(data.role || "user");
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
    if (roleChecked && user && (currentUserRole === "admin" || currentUserRole === "leadership") && usersList.length === 0) {
      void loadUsers();
    }
  }, [currentUserRole, roleChecked, user, usersList.length]);

  useEffect(() => {
    if (roleChecked && user && currentUserRole !== "admin" && currentUserRole !== "leadership") {
      router.replace("/dashboard");
    }
  }, [currentUserRole, roleChecked, router, user]);

  const saveUser = async (u: ManagedUser) => {
    if (currentUserRole !== "admin" && currentUserRole !== "leadership") return;

    try {
      const token = await getAuthToken();
      setSavingUserId(u.id);
      const response = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: u.role || "user",
          displayName: u.displayName || "",
          branchLocation: u.branchLocation || "",
            branchMapUrl: extractMapUrl(u.branchMapUrl),
          phoneNumber: u.phoneNumber || "",
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to update user.");
      }

      setUsersList((prev) => prev.map((item) => (item.id === u.id ? { ...item, ...payload } : item)));
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error instanceof Error ? error.message : "Failed to update user.");
    } finally {
      setSavingUserId(null);
    }
  };

  const handleLogout = async () => {
    try {
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

  if (roleChecked && currentUserRole !== "admin" && currentUserRole !== "leadership") {
    return (
      <div className={styles.page}>
        <div className={styles.dashboard}>
          <main className={styles.main}>
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h1>Access denied</h1>
                <p className={styles.sectionSubtitle}>Only admins or leadership can manage users.</p>
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

            <div style={{ marginBottom: 12, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => void loadUsers()} className={styles.submitBtn}>
                {loadingUsers ? "Loading..." : "Refresh Users"}
              </button>
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                style={{ minWidth: 260, padding: "12px 14px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.3)" }}
              >
                {usersList.length === 0 ? <option value="">No users loaded yet</option> : null}
                {usersList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.displayName || item.email} {item.role ? `(${item.role})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {selectedUser ? (
              <div style={{ marginBottom: 24, padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.75)", border: "1px solid rgba(148,163,184,0.2)" }}>
                <div className={styles.sectionHeader} style={{ marginBottom: 18 }}>
                  <h2>Promote or Edit User</h2>
                  <p className={styles.sectionSubtitle}>Pick an authenticated user, promote them to leadership or admin, and update safe profile fields.</p>
                </div>

                <div className={styles.form}>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input type="email" value={selectedUser.email} disabled />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Display Name</label>
                    <input
                      type="text"
                      value={selectedUser.displayName || ""}
                      onChange={(event) =>
                        setUsersList((prev) =>
                          prev.map((item) => (item.id === selectedUser.id ? { ...item, displayName: event.target.value } : item)),
                        )
                      }
                      placeholder="Full name"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <select
                      value={selectedUser.role || "user"}
                      onChange={(event) =>
                        setUsersList((prev) => prev.map((item) => (item.id === selectedUser.id ? { ...item, role: event.target.value } : item)))
                      }
                    >
                      <option value="user">user</option>
                      <option value="leadership">leadership</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Branch Location</label>
                    <input
                      type="text"
                      value={selectedUser.branchLocation || ""}
                      onChange={(event) =>
                        setUsersList((prev) =>
                          prev.map((item) => (item.id === selectedUser.id ? { ...item, branchLocation: event.target.value } : item)),
                        )
                      }
                      placeholder="Branch location"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Location Map URL or Embed Code</label>
                    <input
                      type="text"
                      value={selectedUser.branchMapUrl || ""}
                      onChange={(event) =>
                        setUsersList((prev) =>
                          prev.map((item) => (item.id === selectedUser.id ? { ...item, branchMapUrl: event.target.value } : item)),
                        )
                      }
                      placeholder='Paste the copied iframe src or the full <iframe ...> embed code'
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={selectedUser.phoneNumber || ""}
                      onChange={(event) =>
                        setUsersList((prev) => prev.map((item) => (item.id === selectedUser.id ? { ...item, phoneNumber: event.target.value } : item)))
                      }
                      placeholder="Phone number"
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() =>
                          setUsersList((prev) =>
                            prev.map((item) => (item.id === selectedUser.id ? { ...item, role: "leadership" } : item)),
                          )
                        }
                      className={styles.submitBtn}
                    >
                      Promote to Leadership
                    </button>
                    <button type="button" onClick={() => void saveUser(selectedUser)} className={styles.submitBtn}>
                      {savingUserId === selectedUser.id ? "Saving..." : "Save User"}
                    </button>
                    <button type="button" onClick={() => setSelectedUserId("")} className={styles.submitBtn}>
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {usersList.length === 0 ? (
              <p>No users loaded yet. Refresh to fetch users from Firestore.</p>
            ) : (
              <div>
                <table className={styles.usersTable}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Branch Location</th>
                      <th>Location Map</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((u) => (
                      <tr key={u.id}>
                        <td>{u.email}</td>
                        <td>{u.displayName || "—"}</td>
                        <td>
                          {currentUserRole === "admin" || currentUserRole === "leadership" ? (
                            <select
                              value={u.role || "user"}
                              onChange={(event) =>
                                setUsersList((prev) =>
                                  prev.map((item) => (item.id === u.id ? { ...item, role: event.target.value } : item)),
                                )
                              }
                            >
                              <option value="user">user</option>
                              <option value="leadership">leadership</option>
                              <option value="admin">admin</option>
                            </select>
                          ) : (
                            u.role || "user"
                          )}
                        </td>
                        <td>{u.branchLocation || "—"}</td>
                        <td>
                          {u.branchMapUrl ? (
                            <a href={u.branchMapUrl} target="_blank" rel="noreferrer">
                              View map
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{u.phoneNumber || "—"}</td>
                        <td>
                          {currentUserRole === "admin" || currentUserRole === "leadership" ? (
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button
                                type="button"
                                onClick={() => setSelectedUserId(u.id)}
                                className={styles.submitBtn}
                              >
                                Edit
                              </button>
                              <button type="button" onClick={() => void saveUser(u)} className={styles.submitBtn}>
                                {savingUserId === u.id ? "Saving..." : "Save"}
                              </button>
                            </div>
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