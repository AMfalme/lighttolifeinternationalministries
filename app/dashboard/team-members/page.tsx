"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { db, hasFirebaseClientConfig } from "@/app/lib/firebase/config";
import { DashboardLoading } from "@/app/dashboard/loading";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import styles from "@/app/dashboard/team/team.module.css";
import dashStyles from "@/app/dashboard/dashboard.module.css";

type ManagementMember = {
  id: string;
  name: string;
  title: string;
  role: string;
  imageURL?: string;
  background?: string;
  gallery?: string[];
  branchLocation?: string;
  phoneNumber?: string;
  email?: string;
  displayOrder?: number;
};

type ManagementMemberForm = {
  name: string;
  title: string;
  role: string;
  branchLocation: string;
  imageURL: string;
  background: string;
  gallery: string;
  phoneNumber: string;
  email: string;
  displayOrder: string;
};

type MediaUploadResult = {
  public_id: string;
  secure_url: string;
  original_filename?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
};

const emptyForm = (): ManagementMemberForm => ({
  name: "",
  title: "",
  role: "Director",
  branchLocation: "",
  imageURL: "",
  background: "",
  gallery: "",
  phoneNumber: "",
  email: "",
  displayOrder: "1",
});

const roles = ["General Ministry Director", "Director", "Coordinator", "Team Member"];

export default function DashboardTeamMembersPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [members, setMembers] = useState<ManagementMember[]>([]);
  const [branchOptions, setBranchOptions] = useState<string[]>(["General Ministry"]);
  const [saving, setSaving] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<ManagementMember | null>(null);
  const [formData, setFormData] = useState<ManagementMemberForm>(emptyForm());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || "";
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER?.trim() || "dashboard-images";
  const configReady = useMemo(() => Boolean(cloudName && uploadPreset), [cloudName, uploadPreset]);

  useEffect(() => {
    if (!user || !hasFirebaseClientConfig || !db) {
      return;
    }

    (async () => {
      try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (userSnap.exists() && (userSnap.data().role === "admin" || userSnap.data().role === "leadership")) {
          await Promise.all([loadMembers(), loadLeadershipBranches()]);
        } else {
          router.push("/dashboard/profile");
        }
      } catch (error) {
        console.error("Team members page init error:", error);
      }
    })();
  }, [router, user]);

  const getAuthToken = async () => {
    const firebaseAuth = await import("firebase/auth");
    const auth = firebaseAuth.getAuth();
    if (!auth.currentUser) {
      throw new Error("You must be signed in to manage team members.");
    }

    return auth.currentUser.getIdToken();
  };

  const loadMembers = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch("/api/admin/team-members", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch team members.");
      }
      
      const sorted = ((payload.members || []) as ManagementMember[]).sort(
        (a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999)
      );
      setMembers(sorted);
    } catch (error) {
      console.error("Error fetching team members:", error);
      setMembers([]);
    }
  };

  const loadLeadershipBranches = async () => {
    if (!db) return;

    try {
      const leadershipQuery = query(collection(db, "users"), where("role", "==", "leadership"));
      const snapshot = await getDocs(leadershipQuery);
      const locations = new Set<string>(["General Ministry"]);

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const branchLocation = String(data.branchLocation || "").trim();
        if (branchLocation) {
          locations.add(branchLocation);
        }
      });

      setBranchOptions(Array.from(locations));
    } catch (error) {
      console.error("Error loading leadership branches:", error);
      setBranchOptions(["General Ministry"]);
    }
  };

  const openEditForm = (member: ManagementMember) => {
    setCreatingMember(false);
    setEditingMember(member);
    setFormData({
      name: member.name,
      title: member.title,
      role: member.role,
      branchLocation: member.branchLocation || "",
      imageURL: member.imageURL || "",
      background: member.background || "",
      gallery: (member.gallery || []).join(", "),
      phoneNumber: member.phoneNumber || "",
      email: member.email || "",
      displayOrder: member.displayOrder !== undefined ? String(member.displayOrder) : "999",
    });
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeEditor = () => {
    setCreatingMember(false);
    setEditingMember(null);
    setFormData(emptyForm());
    setErrorMessage(null);
  };

  const openCreateForm = () => {
    setCreatingMember(true);
    setEditingMember(null);
    setFormData(emptyForm());
    setErrorMessage(null);
    requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const refreshMembers = async () => {
    await loadMembers();
  };

  const handleSelectImage = useCallback((image: { url: string } | null) => {
    setFormData((current) => ({
      ...current,
      imageURL: image?.url || current.imageURL,
    }));
  }, []);

  const initialGalleryUrls = useMemo(
    () => formData.gallery.split(",").map((item) => item.trim()).filter(Boolean),
    [formData.gallery],
  );

  const handleSelectGalleryImages = useCallback((images: { url: string }[]) => {
    const nextGallery = images.map((image) => image.url).join(", ");
    setFormData((current) => ({ ...current, gallery: nextGallery }));
  }, []);

  const handleSubmit = async () => {
    if (!formData.name || !formData.title || !formData.role) {
      setErrorMessage("Name, title, and role are required.");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const token = await getAuthToken();
      const url = creatingMember ? "/api/admin/team-members" : `/api/admin/team-members/${editingMember?.id}`;
      const response = await fetch(url, {
        method: creatingMember ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title,
          role: formData.role,
          branchLocation: formData.branchLocation,
          displayOrder: formData.displayOrder === "" ? 999 : Number(formData.displayOrder),
          imageURL: formData.imageURL,
          background: formData.background,
          gallery: formData.gallery
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          phoneNumber: formData.phoneNumber,
          email: formData.email,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Unable to save team member.");
      }

      await refreshMembers();
      closeEditor();
      alert(creatingMember ? "Team member created successfully!" : "Team member updated successfully!");
    } catch (error) {
      console.error("Team member save error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to save team member.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: ManagementMember) => {
    if (!confirm(`Delete ${member.name}?`)) {
      return;
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/admin/team-members/${member.id}`, {
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
                <h1>Regional Departmental Heads</h1>
                <p className={styles.description}>Manage branch-level management staff and contributors who support the ministry.</p>
              </div>
              <button type="button" className={styles.addButton} onClick={openCreateForm}>
                + Add Team Member
              </button>
            </div>

            {editingMember || creatingMember ? (
              <section ref={editorRef} className={`${styles.editorSection} ${styles.editorActive}`}>
                <div className={styles.editorHeader}>
                  <div>
                    <p className={styles.kicker}>{creatingMember ? "Create Team Member" : "Edit Team Member"}</p>
                    <h2>{creatingMember ? "Add a new team member" : editingMember?.name}</h2>
                    <p className={styles.description}>{creatingMember ? "Add a management team member and capture their profile." : "Update profile details and background information for this member."}</p>
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
                      <label htmlFor="name">Name</label>
                      <input id="name" type="text" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Enter full name" />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="title">Title</label>
                      <input id="title" type="text" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} placeholder="Enter role title, e.g. Community Director" />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="role">Role</label>
                      <select id="role" value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value })}>
                        {roles.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="branchLocation">Branch Location</label>
                      <select id="branchLocation" value={formData.branchLocation} onChange={(event) => setFormData({ ...formData, branchLocation: event.target.value })}>
                        <option value="">Select branch</option>
                        {branchOptions.map((branch) => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                      <div className={styles.hint}>Branch locations are populated from leadership branch assignments, and include a general ministry option for headquarters roles.</div>
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="displayOrder">Hierarchy Rank (Order)</label>
                      <input id="displayOrder" type="number" value={formData.displayOrder} onChange={(event) => setFormData({ ...formData, displayOrder: event.target.value })} placeholder="e.g. 1 for top" />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email</label>
                      <input id="email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="Enter contact email" />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="phoneNumber">Phone Number</label>
                      <input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })} placeholder="Enter phone number" />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Profile Image</label>
                      <ImageUpload onSelectImage={handleSelectImage} initialSelectedUrl={formData.imageURL || undefined} />
                    </div>
                    <div className={styles.formGroupWide}>
                      <label>Gallery</label>
                      <ImageUpload
                        multiSelect
                        initialSelectedUrls={initialGalleryUrls}
                        onSelectMultiple={handleSelectGalleryImages}
                      />
                      <div className={styles.hint}>Upload images that showcase this member’s work, events, or ministry contributions.</div>
                    </div>
                    <div className={styles.formGroupWide}>
                      <label htmlFor="background">Background</label>
                      <textarea id="background" value={formData.background} onChange={(event) => setFormData({ ...formData, background: event.target.value })} placeholder="Write a short background summary." rows={5} />
                    </div>
                    {errorMessage ? (
                      <div className={styles.videoError}>{errorMessage}</div>
                    ) : null}
                    <div className={styles.formActions}>
                      <button type="button" className={styles.cancelBtn} onClick={closeEditor}>Cancel</button>
                      <button type="submit" className={styles.saveBtn} disabled={saving}>{saving ? "Saving..." : creatingMember ? "Create Team Member" : "Update Team Member"}</button>
                    </div>
                  </form>
                </div>
              </section>
            ) : null}

            {members.length === 0 ? (
              <div className={styles.emptyState}>
                <h2>No Management Members Yet</h2>
                <p>Add the first management member to get started.</p>
              </div>
            ) : (
              <div className={styles.teamGrid}>
                {members.map((member) => (
                  <article key={member.id} className={styles.teamCard}>
                    <div className={styles.teamCardHeader}>
                      <div className={styles.memberIdentity}>
                        <div className={styles.avatarWrap}>
                          {member.imageURL ? (
                            <Image src={member.imageURL} alt={member.name} fill className={styles.avatarImage} unoptimized />
                          ) : (
                            <span>{member.name?.[0]?.toUpperCase() || "M"}</span>
                          )}
                        </div>
                        <div>
                          <h3 className={styles.teamCardTitle}>{member.name}</h3>
                          <p className={styles.teamRole}>{member.title} • {member.role}</p>
                        </div>
                      </div>
                      <span className={styles.badge}>Active</span>
                    </div>
                    {member.background ? <p className={styles.teamInfo}>{member.background}</p> : null}
                    {member.branchLocation ? <p className={styles.teamInfo}><strong>Branch:</strong> {member.branchLocation}</p> : null}
                    {member.email ? <p className={styles.teamInfo}><strong>Email:</strong> {member.email}</p> : null}
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
