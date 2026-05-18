"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar/Navbar";
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
  branchKey?: string;
  branchLocation?: string;
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  pastorGallery?: string[];
  gallery?: string[];
  mainImage?: string;
  videos?: string[];
};

type TeamMemberDocumentData = {
  displayName?: string;
  branchKey?: string;
  branchLocation?: string;
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  pastorGallery?: string[];
  churchGallery?: string[];
  phoneNumber?: string;
  email?: string;
  photoURL?: string;
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

export default function TeamMemberBranchPage() {
  const routeParams = useParams<{ uid?: string | string[] }>();
  const routeUid = Array.isArray(routeParams?.uid) ? routeParams.uid[0] : routeParams?.uid || "";
  const [member, setMember] = useState<TeamBranchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState<Array<{ id: string; title?: string }>>([]);
  const [showPastorModal, setShowPastorModal] = useState(false);
  const [showChurchModal, setShowChurchModal] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      try {
        const response = await fetch(`/api/public/team/${encodeURIComponent(routeUid)}`);
        const payload = (await response.json()) as {
          member?: TeamBranchDetail;
          relatedBlogs?: Array<{ id: string; title?: string }>;
          error?: string;
        };
        console.log("API response for leadership details:", payload);

        if (!response.ok || !payload.member) {
          console.error("Error loading branch details:", payload.error || response.statusText);
          setMember(null);
          setRelatedBlogs([]);
          return;
        }

        setMember(payload.member);
        setRelatedBlogs(payload.relatedBlogs || []);
      } catch (error) {
        console.error("Error loading branch details:", error);
        setMember(null);
        setRelatedBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    void loadMember();
  }, [routeUid]);

  if (loading || !member) {
    return (
      <main className={styles.page}>
        <Navbar />
        <div className={styles.loading}>{loading ? "Loading branch details…" : "Leadership not found."}</div>
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
