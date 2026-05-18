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

type BranchDocumentData = {
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  pastorGallery?: string[];
  gallery?: string[];
  mainImage?: string;
  videos?: string[];
};

const toLocationSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toBranchKey = (value: string) =>
  toLocationSlug(value)
    .replace(/-(branch|church|location|site|center|centre)$/g, "")
    .replace(/-(branch|church|location|site|center|centre)-/g, "-");

export default function TeamMemberBranchPage({ params }: { params: { uid: string } }) {
  const [member, setMember] = useState<TeamBranchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Array<{ id: string; title?: string }>>([]);
  const [showPastorModal, setShowPastorModal] = useState(false);
  const [showChurchModal, setShowChurchModal] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      if (!hasFirebaseClientConfig || !db) {
        setMember(null);
        setLoading(false);
        return;
      }

      try {
        const teamSnapshot = await getDocs(query(collection(db, "users"), where("role", "==", "team-member")));
        const normalizedParams = toBranchKey(params.uid);
        const matchedDoc = teamSnapshot.docs.find((document) => {
          const data = document.data();
          const branchKey = toBranchKey(String(data.branchLocation || ""));
          return document.id === params.uid || branchKey === normalizedParams || branchKey.includes(normalizedParams) || normalizedParams.includes(branchKey);
        });

        if (!matchedDoc) {
          setMember(null);
          setRelatedBlogs([]);
          return;
        }

        const data = matchedDoc.data();
        const base = {
          uid: matchedDoc.id,
          displayName: data.displayName || "Branch Leader",
          branchLocation: data.branchLocation || "Church Branch",
          branchAddress: data.branchAddress || "",
          branchDescription:
            data.branchDescription ||
            "A vibrant church community with worship, teaching, and ministry designed to serve every family.",
          pastorDescription: data.pastorDescription || "",
          pastorImageURL: data.pastorImageURL || "",
          pastorGallery: Array.isArray(data.pastorGallery) ? data.pastorGallery : [],
          churchGallery: Array.isArray(data.churchGallery) ? data.churchGallery : [],
          phoneNumber: data.phoneNumber || "",
          email: data.email || "",
          photoURL: data.photoURL || "",
        } as TeamBranchDetail;

        try {
          const slug = toBranchKey(String(base.branchLocation));
          const branchRef = doc(db, "branches", slug);
          const branchSnap = await getDoc(branchRef);
          if (branchSnap.exists()) {
            const branchData = branchSnap.data() as BranchDocumentData;
            base.branchDescription = branchData.branchDescription || base.branchDescription;
            base.pastorDescription = branchData.pastorDescription || base.pastorDescription;
            base.pastorImageURL = branchData.pastorImageURL || base.pastorImageURL;
            base.pastorGallery = Array.isArray(branchData.pastorGallery) ? branchData.pastorGallery : base.pastorGallery;
            base.churchGallery = Array.isArray(branchData.gallery) ? branchData.gallery : base.churchGallery;
            base.photoURL = branchData.mainImage || base.photoURL;
            base.videos = Array.isArray(branchData.videos) ? branchData.videos : [];
          }
        } catch (error) {
          console.error("Error loading branch doc:", error);
        }

        setMember(base);

        try {
          const branchName = base.branchLocation;
          const blogsQuery = query(collection(db, "blogs"), where("branch", "==", branchName));
          const qSnap = await getDocs(blogsQuery);
          const posts = qSnap.docs.map((d) => ({ id: d.id, title: d.data().title }));
          setRelatedBlogs(posts);
        } catch {
          // ignore if blogs are not using branch field
        }
      } catch (error) {
        console.error("Error loading branch details:", error);
        setMember(null);
        setRelatedBlogs([]);
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
        <div className={styles.loading}>{loading ? "Loading branch details…" : "Team member not found."}</div>
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
          {member.photoURL || member.pastorImageURL ? (
            <Image src={member.photoURL || member.pastorImageURL || ""} alt={member.displayName} fill style={{ objectFit: "cover" }} />
          ) : (
            <div className={styles.loading}>No profile image available.</div>
          )}
        </div>
      </section>

      <section className={styles.contentGrid}>
        <article className={styles.profileCard}>
          <div className={styles.profileHead}>
            <div>
              <p className={styles.roleLabel}>Branch Pastor</p>
              <h2>{member.displayName}</h2>
            </div>
            {member.pastorImageURL || member.pastorGallery?.length ? (
              <div className={styles.profileImage}>
                <Image src={member.pastorImageURL || member.pastorGallery?.[0] || ""} alt={member.displayName} fill style={{ objectFit: "cover" }} />
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
          {member.churchGallery?.length ? (
            <>
              <button className={styles.viewImagesBtn} onClick={() => setShowChurchModal(true)}>View church images</button>
              <div className={styles.galleryGrid}>
                {member.churchGallery.slice(0, 4).map((src, index) => (
                  <div key={index} className={styles.galleryItem}>
                    <Image src={src} alt={`Branch image ${index + 1}`} fill style={{ objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className={styles.emptyState}>No church gallery images have been uploaded yet.</p>
          )}
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
              {(member.pastorGallery && member.pastorGallery.length ? member.pastorGallery : member.pastorImageURL ? [member.pastorImageURL] : []).map((src, idx) => (
                  <div key={idx} className={styles.modalItem}>
                    <Image src={src} alt={`Pastor image ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                  </div>
                ))}
              {!member.pastorGallery?.length && !member.pastorImageURL ? (
                <p className={styles.emptyState}>No pastor images have been uploaded yet.</p>
              ) : null}
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
              {(member.churchGallery && member.churchGallery.length ? member.churchGallery : []).map((src, idx) => (
                  <div key={idx} className={styles.modalItem}>
                    <Image src={src} alt={`Church image ${idx + 1}`} fill style={{ objectFit: "cover" }} />
                  </div>
                ))}
              {!member.churchGallery?.length ? <p className={styles.emptyState}>No church images have been uploaded yet.</p> : null}
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
