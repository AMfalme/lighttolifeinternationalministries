"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { db, hasFirebaseClientConfig } from "@/app/lib/firebase/config";
import { DashboardLoading } from "@/app/dashboard/loading";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import styles from "@/app/dashboard/team/team.module.css";
import dashStyles from "@/app/dashboard/dashboard.module.css";

interface TeamMember {
  uid: string;
  displayName: string;
  email: string;
  branchLocation: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt?: string;
}

type TeamMemberForm = {
  displayName: string;
  email: string;
  branchLocation: string;
  phoneNumber: string;
  photoURL: string;
  password: string;
};

const emptyForm = (): TeamMemberForm => ({
  displayName: "",
  email: "",
  branchLocation: "",
  phoneNumber: "",
  photoURL: "",
  password: "",
});

const branches = ["Main Branch", "North Location", "South Location"];

export default function DashboardTeamPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberForm>(emptyForm());

  useEffect(() => {
    if (!user || !hasFirebaseClientConfig || !db) {
      return;
    }

    (async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && userSnap.data().role === "admin") {
          await loadTeamMembers();
        } else {
          router.push("/dashboard/profile");
        }
      } catch (error) {
        console.error("Team page init error:", error);
      }
    })();
  }, [router, user]);

  const loadTeamMembers = async () => {
    if (!db) {
      setTeamMembers([]);
      return;
    }

    try {
      const membersQuery = query(collection(db, "users"), where("role", "==", "team-member"));
      const snapshot = await getDocs(membersQuery);

      const members = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          uid: document.id,
          displayName: data.displayName || "",
          email: data.email || "",
          branchLocation: data.branchLocation || "",
          phoneNumber: data.phoneNumber || "",
          photoURL: data.photoURL || "",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || "",
        } as TeamMember;
      });

      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setTeamMembers([]);
    }
  };

  const openCreateForm = () => {
    setEditingMember(null);
    setFormData(emptyForm());
    setShowModal(true);
  };

  const openEditForm = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      displayName: member.displayName,
      email: member.email,
      branchLocation: member.branchLocation,
      phoneNumber: member.phoneNumber || "",
      photoURL: member.photoURL || "",
      password: "",
    });
    setShowModal(true);
  };

  const getAuthToken = async () => {
    const firebaseAuth = await import("firebase/auth");
    const auth = firebaseAuth.getAuth();
    if (!auth.currentUser) {
      throw new Error("You must be signed in to manage team members.");
    }

    return auth.currentUser.getIdToken();
  };

  const refreshMembers = async () => {
    await loadTeamMembers();
  };

  const handleSelectImage = useCallback((image: { url: string } | null) => {
    setFormData((current) => {
      const nextPhotoURL = image?.url || "";
      return current.photoURL === nextPhotoURL ? current : { ...current, photoURL: nextPhotoURL };
    });
  }, []);

  const handleSubmit = async () => {
    if (!formData.displayName || !formData.email || !formData.branchLocation) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!editingMember && !formData.password) {
      alert("Password is required for new accounts.");
      return;
    }

    setSaving(true);

    try {
      const token = await getAuthToken();
      const url = editingMember ? `/api/admin/team/${editingMember.uid}` : "/api/admin/team";
      const method = editingMember ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save team member.");
      }

      await refreshMembers();
      setShowModal(false);
      setEditingMember(null);
      setFormData(emptyForm());
      alert(editingMember ? "Team member updated successfully!" : "Team member created successfully!");
    } catch (error) {
      console.error("Team member save error:", error);
      alert(error instanceof Error ? error.message : "Failed to save team member.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Delete ${member.displayName}? This will remove their login account.`)) {
      return;
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/admin/team/${member.uid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to delete team member.");
      }

      await refreshMembers();
    } catch (error) {
      console.error("Team member delete error:", error);
      alert(error instanceof Error ? error.message : "Failed to delete team member.");
    }
  };

  const handleLogout = async () => {
    try {
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }

    router.push("/");
  };

  if (loading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={dashStyles.page}>
      <div className={dashStyles.dashboard}>
        <DashboardSidebar onLogout={handleLogout} />

        <main className={dashStyles.main}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div>
                <p className={styles.kicker}>Dashboard / Team Members</p>
                <h1>Branch Team Accounts</h1>
                <p className={styles.description}>Create logins, assign branch locations, and attach a profile image for each leader.</p>
              </div>
              <button className={styles.addButton} onClick={openCreateForm}>
                + Add Team Member
              </button>
            </div>

            <div className={styles.summaryRow}>
              <div className={styles.summaryCard}>
                <span>Total team members</span>
                <strong>{teamMembers.length}</strong>
              </div>
              <div className={styles.summaryCard}>
                <span>Branches in use</span>
                <strong>{new Set(teamMembers.map((member) => member.branchLocation)).size || 0}</strong>
              </div>
            </div>

            {teamMembers.length === 0 ? (
              <div className={styles.emptyState}>
                <h2>No Team Members Yet</h2>
                <p>Add the first branch leader account to get started.</p>
              </div>
            ) : (
              <div className={styles.teamGrid}>
                {teamMembers.map((member) => (
                  <article key={member.uid} className={styles.teamCard}>
                    <div className={styles.teamCardHeader}>
                      <div className={styles.memberIdentity}>
                        <div className={styles.avatarWrap}>
                          {member.photoURL ? (
                            <Image src={member.photoURL} alt={member.displayName} fill className={styles.avatarImage} />
                          ) : (
                            <span>{member.displayName?.[0]?.toUpperCase() || "T"}</span>
                          )}
                        </div>
                        <div>
                          <h3 className={styles.teamCardTitle}>{member.displayName}</h3>
                          <p className={styles.teamRole}>{member.branchLocation}</p>
                        </div>
                      </div>
                      <span className={styles.badge}>Active</span>
                    </div>
                    <p className={styles.teamInfo}><strong>Email:</strong> {member.email}</p>
                    {member.phoneNumber ? <p className={styles.teamInfo}><strong>Phone:</strong> {member.phoneNumber}</p> : null}
                    <div className={styles.teamActions}>
                      <button type="button" className={styles.editBtn} onClick={() => openEditForm(member)}>
                        Edit
                      </button>
                      <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(member)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className={`${styles.modal} ${showModal ? styles.active : ""}`}>
              <div className={styles.modalContent}>
                <h2>{editingMember ? "Edit Team Member" : "Add Team Member"}</h2>
                <form
                  className={styles.formGrid}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSubmit();
                  }}
                >
                  <div className={styles.formGroup}>
                    <label htmlFor="displayName">Full Name</label>
                    <input id="displayName" type="text" value={formData.displayName} onChange={(event) => setFormData({ ...formData, displayName: event.target.value })} placeholder="Enter full name" />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="Enter email address" disabled={!!editingMember} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="branchLocation">Branch Location</label>
                    <select id="branchLocation" value={formData.branchLocation} onChange={(event) => setFormData({ ...formData, branchLocation: event.target.value })}>
                      <option value="">Select branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })} placeholder="Enter phone number" />
                  </div>
                  <div className={styles.formGroupWide}>
                    <label htmlFor="photoURL">Profile Image URL</label>
                    <input id="photoURL" type="text" value={formData.photoURL} onChange={(event) => setFormData({ ...formData, photoURL: event.target.value })} placeholder="Select an uploaded image or paste an image URL" />
                  </div>
                  <div className={styles.formGroupWide}>
                    <label>Choose from uploaded images</label>
                    <ImageUpload onSelectImage={handleSelectImage} initialSelectedUrl={formData.photoURL || undefined} />
                  </div>
                  <div className={styles.formGroupWide}>
                    <label htmlFor="password">Password {editingMember ? "(leave blank to keep current)" : ""}</label>
                    <input id="password" type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder="Enter a secure password" />
                  </div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : editingMember ? "Update Team Member" : "Create Team Member"}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
