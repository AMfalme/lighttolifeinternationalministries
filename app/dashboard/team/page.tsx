"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { DashboardLoading } from "@/app/dashboard/loading";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import styles from "@/app/dashboard/team/team.module.css";
import dashStyles from "@/app/dashboard/dashboard.module.css";

interface TeamMember {
  uid: string;
  displayName: string;
  pastorTitle?: string;
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
  pastorTitle: string;
  email: string;
  branchLocation: string;
  branchAddress: string;
  branchDescription: string;
  pastorDescription: string;
  pastorImageURL: string;
  pastorGallery: string[];
  churchGallery: string[];
  videos: string;
  phoneNumber: string;
  password: string;
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

const emptyForm = (): TeamMemberForm => ({
  displayName: "",
  pastorTitle: "",
  email: "",
  branchLocation: "",
  branchAddress: "",
  branchDescription: "",
  pastorDescription: "",
  pastorImageURL: "",
  pastorGallery: [],
  churchGallery: [],
  videos: "",
  phoneNumber: "",
  password: "",
});

const resolvePrimaryImageUrl = (member: Pick<TeamMember, "pastorImageURL">) =>
  member.pastorImageURL || "";

const parseGalleryUrls = (value?: string[] | string | null) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const branches = ["Mosocho (Main church headquarters)", "Nyanchwa", "Omogwa"];

export default function DashboardTeamPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const [creatingMember, setCreatingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState<TeamMemberForm>(emptyForm());
  const editorRef = useRef<HTMLDivElement | null>(null);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() || "";
  const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER?.trim() || "dashboard-images";
  const configReady = useMemo(() => Boolean(cloudName && uploadPreset), [cloudName, uploadPreset]);

  useEffect(() => {
    if (!user) {
      return;
    }

    (async () => {
      try {
        const token = await getAuthToken();
        const response = await fetch("/api/admin/team", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          router.push("/dashboard/profile");
          return;
        }

        const payload = (await response.json()) as { members?: TeamMember[]; error?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load leadership.");
        }

        setTeamMembers(payload.members || []);
      } catch (error) {
        console.error("Team page init error:", error);
        setTeamMembers([]);
      }
    })();
  }, [router, user]);

  const loadTeamMembers = async () => {
    const token = await getAuthToken();
    const response = await fetch("/api/admin/team", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      router.push("/dashboard/profile");
      return;
    }

    const payload = (await response.json()) as { members?: TeamMember[]; error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Failed to load leadership.");
    }

    setTeamMembers(payload.members || []);
  };
  const openEditForm = (member: TeamMember) => {
    setCreatingMember(false);
    setEditingMember(member);
    setFormData({
      displayName: member.displayName,
      pastorTitle: member.pastorTitle || "",
      email: member.email,
      branchLocation: member.branchLocation,
      branchAddress: member.branchAddress || "",
      branchDescription: member.branchDescription || "",
      pastorDescription: member.pastorDescription || "",
      pastorImageURL: member.pastorImageURL || "",
      pastorGallery: parseGalleryUrls(member.pastorGallery),
      churchGallery: parseGalleryUrls(member.churchGallery),
      videos: parseGalleryUrls(member.videos).join(", "),
      phoneNumber: member.phoneNumber || "",
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
      if (current.pastorImageURL === next) {
        return current;
      }
      return { ...current, pastorImageURL: next };
    });
  }, []);

  const initialPastorGalleryUrls = useMemo(
    () => parseGalleryUrls(formData.pastorGallery),
    [formData.pastorGallery],
  );

  const initialGalleryUrls = useMemo(
    () => parseGalleryUrls(formData.churchGallery),
    [formData.churchGallery],
  );

  const videoUrls = useMemo(
    () => formData.videos.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
    [formData.videos],
  );

  const uploadToCloudinary = async (file: File) => {
    if (!configReady) {
      throw new Error("Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable uploads.");
    }

    const mediaFormData = new FormData();
    mediaFormData.append("file", file);
    mediaFormData.append("upload_preset", uploadPreset);
    mediaFormData.append("folder", `${folder}/videos`);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
      method: "POST",
      body: mediaFormData,
    });

    const responseBody = await response.text();

    if (!response.ok) {
      throw new Error(responseBody || "Video upload failed.");
    }

    return JSON.parse(responseBody) as MediaUploadResult;
  };

  const handleVideoUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (!files.length || videoUploading) {
      return;
    }

    if (!configReady) {
      setVideoUploadError("Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to enable uploads.");
      event.target.value = "";
      return;
    }

    const oversized = files.filter((file) => file.size > 100 * 1024 * 1024);
    const acceptedFiles = files.filter((file) => file.size <= 100 * 1024 * 1024);

    if (!acceptedFiles.length) {
      setVideoUploadError("All selected videos exceed the 100MB limit.");
      event.target.value = "";
      return;
    }

    if (oversized.length) {
      setVideoUploadError("Some videos exceeded the 100MB limit and were skipped.");
    } else {
      setVideoUploadError(null);
    }

    setVideoUploading(true);

    try {
      const uploadedUrls = await Promise.all(
        acceptedFiles.map(async (file) => {
          const uploadResult = await uploadToCloudinary(file);
          return uploadResult.secure_url;
        }),
      );

      setFormData((current) => {
        const currentVideos = current.videos.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
        const nextVideos = Array.from(new Set([...currentVideos, ...uploadedUrls]));
        return { ...current, videos: nextVideos.join(", ") };
      });
    } catch (error) {
      console.error("Video upload error:", error);
      setVideoUploadError(error instanceof Error ? error.message : "Failed to upload video.");
    } finally {
      setVideoUploading(false);
      event.target.value = "";
    }
  }, [videoUploading]);

  const removeVideoUrl = useCallback((url: string) => {
    setFormData((current) => {
      const nextVideos = current.videos
        .split(/\n|,/
)
        .map((item) => item.trim())
        .filter((item) => item && item !== url);

      return { ...current, videos: nextVideos.join(", ") };
    });
  }, []);

  const getVideoLabel = (url: string, index: number) => {
    try {
      const pathname = new URL(url).pathname;
      const fileName = decodeURIComponent(pathname.split("/").pop() || "").trim();
      return fileName || `Video ${index + 1}`;
    } catch {
      return `Video ${index + 1}`;
    }
  };

  const handleSelectPastorGalleryImages = useCallback((images: { url: string }[]) => {
    const nextGallery = images.map((image) => image.url).filter(Boolean);
    setFormData((current) => ({ ...current, pastorGallery: nextGallery }));
  }, []);

  const handleSelectGalleryImages = useCallback((images: { url: string }[]) => {
    const nextGallery = images.map((image) => image.url).filter(Boolean);
    setFormData((current) => ({ ...current, churchGallery: nextGallery }));
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

    if (creatingMember && formData.password.length < 6) {
          alert("Password must be at least 6 characters long.");
      return;
    }

    setSaving(true);

    try {
      const token = await getAuthToken();
      const url = creatingMember ? "/api/admin/team" : `/api/admin/team/${editingMember?.uid}`;
      const churchGalleryList = formData.churchGallery;
      const pastorGalleryList = formData.pastorGallery;

      console.log("Leadership submit payload:", {
        method: creatingMember ? "POST" : "PATCH",
        url,
        branchLocation: formData.branchLocation,
        rawChurchGallery: formData.churchGallery,
        churchGalleryCount: churchGalleryList.length,
      });

      const response = await fetch(url, {
        method: creatingMember ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          pastorTitle: formData.pastorTitle || "",
          pastorGallery: pastorGalleryList,
          churchGallery: churchGalleryList,
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
                      <label htmlFor="pastorTitle">Pastor Title</label>
                      <input id="pastorTitle" type="text" value={formData.pastorTitle} onChange={(event) => setFormData({ ...formData, pastorTitle: event.target.value })} placeholder="Enter title, for example Lead Pastor" />
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
                    <section className={styles.mediaSection}>
                      <div className={styles.mediaSectionHeader}>
                        <h3>Media</h3>
                        <p>Choose the one primary pastor image first, then add the two galleries that support the branch page.</p>
                      </div>

                      <div className={`${styles.mediaStep} ${styles.mediaStepHighlight}`}>
                        <div className={styles.mediaStepHeader}>
                          <span className={styles.mediaStepBadge}>1</span>
                          <div className={styles.mediaStepText}>
                            <strong>Pastor profile image</strong>
                            <span>This is the single image shown on the leadership card and public branch page. It syncs to the profile fields automatically.</span>
                          </div>
                        </div>
                        <ImageUpload
                          title="Pastor Profile Image"
                          description="Upload or choose the single primary image shown for this pastor on the dashboard and public team pages."
                          selectedLabel="Current profile image"
                          selectedSummary="This is the one primary image used for the pastor profile on the dashboard and public pages."
                          libraryTitle="Saved profile images"
                          libraryDescription="Pick the exact image that should represent this pastor everywhere."
                          uploadButtonLabel="Upload profile image"
                          onSelectImage={handleSelectPastorImage}
                          initialSelectedUrl={formData.pastorImageURL || undefined}
                        />
                      </div>

                      <div className={styles.mediaGalleryPair}>
                        <div className={styles.mediaStep}>
                          <div className={styles.mediaStepHeader}>
                            <span className={styles.mediaStepBadge}>2</span>
                            <div className={styles.mediaStepText}>
                              <strong>Pastor gallery</strong>
                              <span>Select the saved images that belong in the pastor gallery on the branch detail page.</span>
                            </div>
                          </div>
                          <ImageUpload
                            multiSelect
                            title="Pastor Gallery"
                            description="Select one or more saved images for the pastor gallery shown on the branch detail page."
                            selectedLabel="Saved pastor gallery images"
                            selectedSummary="These images are already attached to the pastor gallery. The grid shows what is currently saved."
                            libraryTitle="Saved gallery images"
                            libraryDescription="Choose multiple images that belong in the pastor gallery."
                            uploadButtonLabel="Upload gallery images"
                            initialSelectedUrls={initialPastorGalleryUrls}
                            onSelectMultiple={handleSelectPastorGalleryImages}
                          />
                        </div>

                        <div className={styles.mediaStep}>
                          <div className={styles.mediaStepHeader}>
                            <span className={styles.mediaStepBadge}>3</span>
                            <div className={styles.mediaStepText}>
                              <strong>Church gallery</strong>
                              <span>Select the branch photos that should appear in the church gallery on the public page.</span>
                            </div>
                          </div>
                          <ImageUpload
                            multiSelect
                            title="Church Gallery"
                            description="Select the images that should appear in the church gallery for this branch."
                            selectedLabel="Saved church gallery images"
                            selectedSummary="These images are already attached to the church gallery. The grid shows what is currently saved."
                            libraryTitle="Saved church gallery images"
                            libraryDescription="Choose multiple images that belong in the church gallery."
                            uploadButtonLabel="Upload church gallery images"
                            initialSelectedUrls={initialGalleryUrls}
                            onSelectMultiple={handleSelectGalleryImages}
                          />
                        </div>
                      </div>
                    </section>
                    <div className={styles.formGroupWide}>
                      <label htmlFor="pastorDescription">Pastor Description</label>
                      <textarea id="pastorDescription" value={formData.pastorDescription} onChange={(event) => setFormData({ ...formData, pastorDescription: event.target.value })} placeholder="Short bio or description of the pastor." rows={3} />
                    </div>
                    <div className={styles.formGroupWide}>
                      <div className={styles.hint}>The media section above keeps the primary image separate from the gallery images so it is easier to review and update.</div>
                    </div>
                    <div className={styles.formGroupWide}>
                      <label>Branch Videos</label>
                      <label className={styles.uploadButton}>
                        <input type="file" accept="video/*" multiple onChange={handleVideoUpload} disabled={videoUploading} aria-label="Upload videos" />
                        {videoUploading ? "Uploading videos..." : "Upload branch videos"}
                      </label>
                      <div className={styles.hint}>Upload video files to Cloudinary. They will be saved automatically and used on the branch page.</div>
                      {videoUploadError ? <div className={styles.videoError}>{videoUploadError}</div> : null}
                      {videoUrls.length ? (
                        <div className={styles.videoList}>
                          {videoUrls.map((url, index) => (
                            <div key={`${url}-${index}`} className={styles.videoItem}>
                              <div>
                                <strong>{getVideoLabel(url, index)}</strong>
                                <span>{url}</span>
                              </div>
                              <div className={styles.videoItemActions}>
                                <a href={url} target="_blank" rel="noreferrer">Preview</a>
                                <button type="button" onClick={() => removeVideoUrl(url)}>Remove</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.hint}>No branch videos uploaded yet.</div>
                      )}
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
                          {member.pastorImageURL ? (
                            <Image src={member.pastorImageURL} alt={member.displayName} fill sizes="62px" className={styles.avatarImage} />
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
