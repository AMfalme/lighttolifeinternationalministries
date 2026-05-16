"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { DashboardLoading } from "../loading";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import styles from "../dashboard.module.css";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [userDetails, setUserDetails] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [saving, setSaving] = useState(false);

  const branches = ["Main Branch", "North Location", "South Location"];

  useEffect(() => {
    if (!user) {
      return;
    }

    setDisplayName(user.displayName || "");
    setPhotoURL(user.photoURL || "");

    (async () => {
      try {
        const { db } = await import("@/app/lib/firebase/config");
        if (!db) {
          return;
        }
        const { doc, getDoc } = await import("firebase/firestore");
        const docSnap = await getDoc(doc(db, "users", user.uid));

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserDetails(data);
          setPhoneNumber(data.phoneNumber || "");
          setBranchLocation(data.branchLocation || "");
          setPhotoURL(data.photoURL || user.photoURL || "");
        }
      } catch (error) {
        console.error("Error loading user details:", error);
      }
    })();
  }, [user]);

  const handleLogout = async () => {
    try {
      await import("@/app/lib/firebase/config");
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (e) {
      console.error("Profile logout error:", e);
    }
    router.push("/");
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const firebaseAuth = await import("firebase/auth");
      await firebaseAuth.updateProfile(user, { displayName, photoURL: photoURL || null });
      
      // Update Firestore
      const { db } = await import("@/app/lib/firebase/config");
      if (!db) {
        throw new Error("Firestore is not configured.");
      }
      const { doc, updateDoc } = await import("firebase/firestore");
      
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        phoneNumber,
        branchLocation,
        photoURL,
        updatedAt: new Date(),
      });
      
      setUserDetails({
        ...userDetails,
        displayName,
        phoneNumber,
        branchLocation,
        photoURL,
      });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>
        <DashboardSidebar onLogout={handleLogout} />
        <main className={styles.main}>
          <header className={styles.header}>
            <div>
              <h1>👤 Your Profile</h1>
              <p>Manage your account information</p>
            </div>
          </header>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Profile Information</h2>
              <p className={styles.sectionSubtitle}>Update your profile details</p>
            </div>
            <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className={styles.formGroup}>
                <label>Profile Image</label>
                {photoURL ? (
                  <div style={{ marginBottom: 16, position: "relative", width: 120, height: 120, borderRadius: 999, overflow: "hidden" }}>
                    <Image src={photoURL} alt={displayName || "Team member"} fill style={{ objectFit: "cover" }} />
                  </div>
                ) : null}
                <input
                  type="text"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="Paste an image URL or choose from uploads"
                />
                <div style={{ marginTop: 12 }}>
                  <ImageUpload onSelectImage={(image) => setPhotoURL(image?.url || "")} initialSelectedUrl={photoURL || undefined} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  placeholder="Your email"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Your phone number"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Branch Location</label>
                <select
                  value={branchLocation}
                  onChange={(e) => setBranchLocation(e.target.value)}
                >
                  <option value="">Select your branch</option>
                  {branches.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
