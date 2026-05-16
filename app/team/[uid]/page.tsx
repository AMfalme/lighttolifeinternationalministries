"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import Navbar from "@/app/components/Navbar/Navbar";
import { db, hasFirebaseClientConfig } from "@/app/lib/firebase/config";
import styles from "./page.module.css";

type TeamBranchDetail = {
  uid: string;
  displayName: string;
  branchLocation: string;
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  churchGallery?: string[];
  pastorGallery?: string[];
  videos?: string[];
  phoneNumber?: string;
  email?: string;
  photoURL?: string;
};

const DEFAULT_BRANCH_DETAILS: Record<string, TeamBranchDetail> = {
  "default-main": {
    uid: "default-main",
    displayName: "Pastor Lydia A.",
    branchLocation: "Mosocho",
    branchAddress: "Mosocho, Kisii County",
    branchDescription:
      "Our main church location in Mosocho, Kisii County. This branch is a welcoming center for worship, community support, and spiritual growth across the region.",
    pastorImageURL:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    churchGallery: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509099836639-18ba6f8fd346?auto=format&fit=crop&w=1200&q=80",
    ],
    phoneNumber: "+254 700 000 001",
    email: "mosocho@church.org",
    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
    pastorDescription:
      "Pastor Lydia leads the Mosocho congregation with a focus on pastoral care, family ministry, and community outreach.",
  },
  "default-north": {
    uid: "default-north",
    displayName: "Pastor Emmanuel T.",
    branchLocation: "Omogwa",
    branchAddress: "Omogwa, Kisii County",
    branchDescription:
      "The Omogwa branch serves families and local neighborhoods with heartfelt worship, strong teaching, and community outreach rooted in Kisii County.",
    pastorImageURL:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    churchGallery: [
      "https://images.unsplash.com/photo-1470145318693-9c182fde2a2d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    ],
    phoneNumber: "+254 700 000 002",
    email: "omogwa@church.org",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    pastorDescription:
      "Pastor Emmanuel guides the Omogwa branch with practical discipleship and community programs tailored for local families.",
  },
  "default-south": {
    uid: "default-south",
    displayName: "Pastor Mercy N.",
    branchLocation: "Nyanchwa",
    branchAddress: "Nyanchwa, Kisii County",
    branchDescription:
      "Nyanchwa is a close-knit church community with a focus on discipleship, hospitality, and local transformation for people across Kisii County.",
    pastorImageURL:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    churchGallery: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509099836639-18ba6f8fd346?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1200&q=80",
    ],
    phoneNumber: "+254 700 000 003",
    email: "nyanchwa@church.org",
    photoURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    pastorDescription:
      "Pastor Mercy emphasizes hospitality and discipleship at Nyanchwa, fostering growth through small groups and local outreach.",
  },
};

const getFallbackDetails = (uid: string) => {
  return DEFAULT_BRANCH_DETAILS[uid] || DEFAULT_BRANCH_DETAILS["default-main"];
};

export default function TeamMemberBranchPage({ params }: { params: { uid: string } }) {
  const [member, setMember] = useState<TeamBranchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Array<{ id: string; title?: string }>>([]);
  const [showPastorModal, setShowPastorModal] = useState(false);
  const [showChurchModal, setShowChurchModal] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      if (!hasFirebaseClientConfig || !db) {
        setMember(getFallbackDetails(params.uid));
        setLoading(false);
        return;
      }

      try {
        const memberRef = doc(db, "users", params.uid);
        const snapshot = await getDoc(memberRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          // base member from user doc
          const base = {
            uid: params.uid,
            displayName: data.displayName || "Branch Leader",
            branchLocation: data.branchLocation || "Church Branch",
            branchAddress: data.branchAddress || "",
            branchDescription:
              data.branchDescription ||
              "A vibrant church community with worship, teaching, and ministry designed to serve every family.",
            pastorDescription: data.pastorDescription || "",
            pastorImageURL: data.pastorImageURL || "",
            churchGallery: Array.isArray(data.churchGallery) ? data.churchGallery : [],
            phoneNumber: data.phoneNumber || "",
            email: data.email || "",
            photoURL: data.photoURL || "",
          } as TeamBranchDetail;

          // try loading branch-level document (branches/{slug}) and prefer that data when available
          try {
            const slug = String(base.branchLocation).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            const branchRef = doc(db, "branches", slug);
            const branchSnap = await getDoc(branchRef);
            if (branchSnap.exists()) {
              const branchData: any = branchSnap.data();
              base.branchDescription = branchData.branchDescription || base.branchDescription;
              base.pastorDescription = branchData.pastorDescription || base.pastorDescription;
              base.pastorImageURL = branchData.pastorImageURL || base.pastorImageURL;
              base.churchGallery = Array.isArray(branchData.gallery) ? branchData.gallery : base.churchGallery;
              base.photoURL = branchData.mainImage || base.photoURL;
              base.videos = Array.isArray(branchData.videos) ? branchData.videos : [];
            }
          } catch (e) {
            console.error("Error loading branch doc:", e);
          }

          setMember(base);
        } else {
          setMember(getFallbackDetails(params.uid));
        }

        // fetch related blogs (by branch field) if db available
        try {
          const branchName = snapshot.exists() ? snapshot.data().branchLocation : params.uid;
          if (branchName) {
            const blogsQuery = query(collection(db, "blogs"), where("branch", "==", branchName));
            const qSnap = await getDocs(blogsQuery);
            const posts = qSnap.docs.map((d) => ({ id: d.id, title: d.data().title }));
            setRelatedBlogs(posts);
          }
        } catch (e) {
          // ignore if blogs are not using branch field
        }
      } catch (error) {
        console.error("Error loading branch details:", error);
        setMember(getFallbackDetails(params.uid));
      } finally {
        setLoading(false);
      }
    };

    void loadMember();
  }, [params.uid]);

  if (loading || !member) {
    return (
      <main className={styles.page}>
        <Navbar />
        <div className={styles.loading}>Loading branch details…</div>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.superTitle}>Branch Spotlight</p>
          <h1>{member.branchLocation}</h1>
          <p className={styles.heroSubtitle}>{member.branchAddress}</p>
          <div className={styles.heroMeta}>
            {member.phoneNumber && <span>{member.phoneNumber}</span>}
            {member.email && <span>{member.email}</span>}
          </div>
        </div>
        <div className={styles.heroImage}>
          <Image src={member.photoURL || member.pastorImageURL} alt={member.displayName} fill style={{ objectFit: "cover" }} />
        </div>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.profileCard}>
          <div className={styles.profileHead}>
            <div>
              <p className={styles.roleLabel}>Branch Pastor</p>
              <h2>{member.displayName}</h2>
            </div>
            {member.pastorImageURL ? (
              <div className={styles.profileImage}>
                <Image src={member.pastorImageURL} alt={member.displayName} fill style={{ objectFit: "cover" }} />
                <button className={styles.viewImagesBtn} onClick={() => setShowPastorModal(true)}>View pastor images</button>
              </div>
            ) : null}
          </div>

          <div className={styles.profileBody}>
            <p>{member.branchDescription}</p>
            <p>
              This branch is designed for modern families, passionate believers, and seekers alike. Explore worship experiences, heart-led small groups, and ministry teams built for deeper connection.
            </p>
            {member.pastorDescription ? (
              <div className={styles.pastorBio}>
                <h4>About the Pastor</h4>
                <p>{member.pastorDescription}</p>
              </div>
            ) : null}
          </div>
        </article>

        <article className={styles.galleryCard}>
          <h3>Church Gallery</h3>
          <button className={styles.viewImagesBtn} onClick={() => setShowChurchModal(true)}>View church images</button>
          <div className={styles.galleryGrid}>
            {(member.churchGallery?.length ? member.churchGallery : [
              "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80",
            ])
              .slice(0, 4)
              .map((src, index) => (
                <div key={index} className={styles.galleryItem}>
                  <Image src={src} alt={`Branch image ${index + 1}`} fill style={{ objectFit: "cover" }} />
                </div>
              ))}
          </div>
        </article>

        <article className={styles.videoCard}>
          <h3>Branch Videos</h3>
          {member.videos && member.videos.length ? (
            <div className={styles.videoList}>
              {member.videos.map((v, i) => (
                <div key={i} className={styles.videoItem}>
                  {v.includes("youtube.com") || v.includes("youtu.be") ? (
                    <iframe
                      src={
                        v.includes("embed")
                          ? v
                          : v.includes("youtu.be")
                          ? `https://www.youtube.com/embed/${v.split("/").pop()}`
                          : `https://www.youtube.com/embed/${new URL(v).searchParams.get("v")}`
                      }
                      title={`Video ${i + 1}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <a href={v} target="_blank" rel="noreferrer" className={styles.videoLink}>
                      Open video {i + 1}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No videos uploaded for this branch yet.</p>
          )}
        </article>

        <article className={styles.blogsCard}>
          <h3>Related Blog Posts</h3>
          {relatedBlogs && relatedBlogs.length ? (
            <ul className={styles.blogList}>
              {relatedBlogs.map((b) => (
                <li key={b.id}>
                  <Link href={`/news?branch=${encodeURIComponent(member.branchLocation)}`}>{b.title || "Read more"}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.emptyState}>No related blog posts yet. <Link href={`/news?branch=${encodeURIComponent(member.branchLocation)}`}>View all news</Link></p>
          )}
        </article>
      </section>

      {showPastorModal ? (
        <div className={styles.modalOverlay} onClick={() => setShowPastorModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Pastor Images</h3>
            <div className={styles.modalGrid}>
              {(member.pastorGallery && member.pastorGallery.length ? member.pastorGallery : member.pastorImageURL ? [member.pastorImageURL] : [])
                .map((src, idx) => (
                  <div key={idx} className={styles.modalItem}>
                    <Image src={src} alt={`Pastor image ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                  </div>
                ))}
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowPastorModal(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      {showChurchModal ? (
        <div className={styles.modalOverlay} onClick={() => setShowChurchModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Church Images</h3>
            <div className={styles.modalGrid}>
              {(member.churchGallery && member.churchGallery.length ? member.churchGallery : [])
                .map((src, idx) => (
                  <div key={idx} className={styles.modalItem}>
                    <Image src={src} alt={`Church image ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                  </div>
                ))}
            </div>
            <div className={styles.modalActions}>
              <button onClick={() => setShowChurchModal(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={styles.footerLink}>
        <Link href="/">← Back to homepage</Link>
      </div>
    </main>
    </>
  );
}
