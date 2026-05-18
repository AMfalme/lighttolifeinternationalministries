"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  pastorGallery?: string[];
  churchGallery?: string[];
  videos?: string[];
  phoneNumber?: string;
  photoURL?: string;
  createdAt?: string;
}

type UserOption = {
  id: string;
  email: string;
  displayName?: string;
  role?: string;
  branchLocation?: string;
};

type TeamMemberForm = {
  displayName: string;
  email: string;
  branchLocation: string;
  branchAddress: string;
  branchDescription: string;
  pastorDescription: string;
  pastorImageURL: string;
  pastorGallery: string;
  churchGallery: string;
  videos: string;
  phoneNumber: string;
  photoURL: string;
  password: string;
};

const emptyForm = (): TeamMemberForm => ({
  displayName: "",
  email: "",
  branchLocation: "",
  branchAddress: "",
  branchDescription: "",
  pastorDescription: "",
  pastorImageURL: "",
  pastorGallery: "",
  churchGallery: "",
  videos: "",
  phoneNumber: "",
  photoURL: "",
  password: "",
});

const branches = ["Mosocho (Main church headquarters)", "Nyanchwa", "Omogwa"];

export default function DashboardTeamPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberForm>(emptyForm());
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user || !hasFirebaseClientConfig || !db) {
      return;
    }

    (async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
            if (userSnap.exists() && (userSnap.data().role === "admin" || userSnap.data().role === "leadership")) {
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
          const membersQuery = query(collection(db, "users"), where("role", "==", "leadership"));
      const snapshot = await getDocs(membersQuery);

      const members = snapshot.docs.map((document) => {
        const data = document.data();
        return {
          uid: document.id,
          displayName: data.displayName || "",
          email: data.email || "",
          branchLocation: data.branchLocation || "",
          branchAddress: data.branchAddress || "",
          branchDescription: data.branchDescription || "",
          pastorDescription: data.pastorDescription || "",
          pastorImageURL: data.pastorImageURL || "",
          pastorGallery: Array.isArray(data.pastorGallery) ? data.pastorGallery : [],
          churchGallery: Array.isArray(data.churchGallery) ? data.churchGallery : [],
          videos: Array.isArray(data.videos) ? data.videos : [],
          phoneNumber: data.phoneNumber || "",
          photoURL: data.photoURL || "",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || "",
        } as TeamMember;
      });

      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching leadership:", error);
      setTeamMembers([]);
    }
  };

  const openEditForm = (member: TeamMember) => {
    setCreatingMember(false);
    setEditingMember(member);
    setFormData({
      displayName: member.displayName,
      email: member.email,
      branchLocation: member.branchLocation,
      branchAddress: member.branchAddress || "",
      branchDescription: member.branchDescription || "",
      pastorDescription: member.pastorDescription || "",
      pastorImageURL: member.pastorImageURL || "",
      pastorGallery: (member.pastorGallery || []).join(", "),
      churchGallery: (member.churchGallery || []).join(", "),
      videos: (member.videos || []).join(", "),
      phoneNumber: member.phoneNumber || "",
      photoURL: member.photoURL || "",
      password: "",
    });
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeEditor = () => {
    setCreatingMember(false);
    setEditingMember(null);
    setFormData(emptyForm());
  };

  const openCreateForm = () => {
    setCreatingMember(true);
    setEditingMember(null);
    setFormData(emptyForm());
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const getAuthToken = async () => {
    const firebaseAuth = await import("firebase/auth");
    const auth = firebaseAuth.getAuth();
    if (!auth.currentUser) {
      throw new Error("You must be signed in to manage leadership.");
    }

    return auth.currentUser.getIdToken();
  };

  const refreshMembers = async () => {
    await loadTeamMembers();
  };

  const handleSelectPastorImage = useCallback((image: { url: string } | null) => {
    setFormData((current) => {
      const next = image?.url || "";
      if (current.pastorImageURL === next && current.photoURL === (current.photoURL || next)) {
        return current;
      }
      return { ...current, pastorImageURL: next, photoURL: next || current.photoURL };
    });
  }, []);

  const initialPastorGalleryUrls = useMemo(
    () => formData.pastorGallery.split(",").map((item) => item.trim()).filter(Boolean),
    [formData.pastorGallery],
  );

  const initialGalleryUrls = useMemo(
    () => formData.churchGallery.split(",").map((item) => item.trim()).filter(Boolean),
    [formData.churchGallery],
  );

  const handleSelectPastorGalleryImages = useCallback((images: { url: string }[]) => {
    const nextGallery = images.map((image) => image.url).join(", ");
    setFormData((current) => {
      return current.pastorGallery === nextGallery ? current : { ...current, pastorGallery: nextGallery };
    });
  }, []);

  const handleSelectGalleryImages = useCallback((images: { url: string }[]) => {
    const nextGallery = images.map((image) => image.url).join(", ");
    setFormData((current) => {
      return current.churchGallery === nextGallery ? current : { ...current, churchGallery: nextGallery };
    });
  }, []);

  const handleSubmit = async () => {
    if (!editingMember && !creatingMember) {
      alert("Select a leadership account to edit or create a new one.");
      return;
    }

    if (!formData.displayName || !formData.email || !formData.branchLocation) {
      alert("Please fill in all required fields.");
      return;
    }

    if (creatingMember && !formData.password) {
          alert("Password is required when creating a new leadership account.");
      return;
    }

    setSaving(true);

    try {
      const token = await getAuthToken();
      const url = creatingMember ? "/api/admin/team" : `/api/admin/team/${editingMember?.uid}`;

      const response = await fetch(url, {
        method: creatingMember ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          photoURL: formData.pastorImageURL || formData.photoURL,
          pastorGallery: formData.pastorGallery
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          churchGallery: formData.churchGallery
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          videos: formData.videos
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
            throw new Error(payload?.error || "Unable to save leadership.");
      }

      await refreshMembers();
      closeEditor();
          alert(creatingMember ? "Leadership created successfully!" : "Leadership updated successfully!");
    } catch (error) {
      console.error("Leadership save error:", error);
      alert(error instanceof Error ? error.message : "Failed to save leadership.");
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
            throw new Error(payload?.error || "Unable to delete leadership.");
      }

      await refreshMembers();
    } catch (error) {
      console.error("Leadership delete error:", error);
      alert(error instanceof Error ? error.message : "Failed to delete leadership.");
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
                <p className={styles.kicker}>Dashboard / Leadership</p>
                <h1>Leadership Accounts</h1>
                <p className={styles.description}>Review the current branch leaders. Click Edit on a member to open the form in a separate section.</p>
              </div>
                  <button type="button" className={styles.addButton} onClick={openCreateForm}>
                    + Add Leadership
              </button>
            </div>

            {editingMember || creatingMember ? (
              <section ref={editorRef} className={`${styles.editorSection} ${styles.editorActive}`}>
                <div className={styles.editorHeader}>
                  <div>
                    <p className={styles.kicker}>{creatingMember ? "Create Leadership" : "Edit Leadership"}</p>
                      <h2>{creatingMember ? "Add a new leadership" : editingMember?.displayName}</h2>
                    <p className={styles.description}>{creatingMember ? "Create a leadership account and save it directly to Firestore." : "Update branch details and profile information for this member."}</p>
                  </div>
                  <div className={styles.editorActions}>
                    <button type="button" className={styles.cancelBtn} onClick={closeEditor}>
                      Close editor
                    </button>
                  </div>
                </div>

                <div className={styles.editorCard}>
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
                      <input id="email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="Enter email address" disabled={!creatingMember} />
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
                      <label htmlFor="branchAddress">Branch Address</label>
                      <input id="branchAddress" type="text" value={formData.branchAddress} onChange={(event) => setFormData({ ...formData, branchAddress: event.target.value })} placeholder="Enter branch address" />
                    </div>
                    <div className={styles.formGroupWide}>
                      <label htmlFor="branchDescription">Branch Description</label>
                      <textarea id="branchDescription" value={formData.branchDescription} onChange={(event) => setFormData({ ...formData, branchDescription: event.target.value })} placeholder="Describe the branch, worship style, values, and community." rows={5} />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Upload Pastor Image</label>
                      <ImageUpload onSelectImage={handleSelectPastorImage} initialSelectedUrl={formData.pastorImageURL || undefined} />
                    </div>
                    <div className={styles.formGroupWide}>
                      <label>Pastor Gallery</label>
                      <ImageUpload
                        multiSelect
                        initialSelectedUrls={initialPastorGalleryUrls}
                        onSelectMultiple={handleSelectPastorGalleryImages}
                      />
                      <div className={styles.hint}>Select one or more saved images for the pastor gallery.</div>
                    </div>
                    <div className={styles.formGroupWide}>
                      <label htmlFor="pastorDescription">Pastor Description</label>
                      <textarea id="pastorDescription" value={formData.pastorDescription} onChange={(event) => setFormData({ ...formData, pastorDescription: event.target.value })} placeholder="Short bio or description of the pastor." rows={3} />
                    </div>
                    <div className={styles.formGroupWide}>
                      <label>Church Gallery</label>
                      <ImageUpload
                        multiSelect
                        initialSelectedUrls={initialGalleryUrls}
                        onSelectMultiple={handleSelectGalleryImages}
                      />
                      <div className={styles.hint}>Click images to toggle selection; selected images will be saved to the branch gallery.</div>
                    </div>
                    <div className={styles.formGroupWide}>
                      <label htmlFor="videos">Branch Videos (YouTube links, one per line or comma separated)</label>
                      <textarea id="videos" value={formData.videos} onChange={(event) => setFormData({ ...formData, videos: event.target.value })} placeholder="Paste video URLs (YouTube or other)" rows={3} />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })} placeholder="Enter phone number" />
                    </div>
                    <div className={styles.formGroupWide}>
                      <label htmlFor="password">Password</label>
                      <input id="password" type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder={creatingMember ? "Required for new leadership" : "Leave blank to keep current password"} />
                    </div>
                    <div className={styles.formActions}>
                      <button type="button" className={styles.cancelBtn} onClick={closeEditor}>Cancel</button>
                      <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : creatingMember ? "Create Leadership" : "Update Leadership"}</button>
                    </div>
                  </form>
                </div>
              </section>
            ) : null}

            {teamMembers.length === 0 ? (
              <div className={styles.emptyState}>
                <h2>No Leadership Accounts Yet</h2>
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

          </div>
        </main>
      </div>
    </div>
  );
}
