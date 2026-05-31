"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar/Navbar";
import styles from "./page.module.css";

type TeamBranchDetail = {
  uid: string;
  branchKey?: string;
  displayName: string;
  pastorTitle?: string;
  branchLocation: string;
  branchAddress?: string;
  branchMapUrl?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  churchGallery?: string[];
  pastorGallery?: string[];
  videos?: string[];
  phoneNumber?: string;
  email?: string;
};

type BranchDocumentData = {
  branchKey?: string;
  branchLocation?: string;
  branchAddress?: string;
  branchMapUrl?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorTitle?: string;
  pastorImageURL?: string;
  pastorGallery?: string[];
  gallery?: string[];
  videos?: string[];
};

type TeamMemberDocumentData = {
  displayName?: string;
  pastorTitle?: string;
  branchKey?: string;
  branchLocation?: string;
  branchAddress?: string;
  branchMapUrl?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  pastorGallery?: string[];
  churchGallery?: string[];
  phoneNumber?: string;
  email?: string;
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

const buildMapEmbedUrl = (address?: string) =>
  address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed` : "";

const normalizeMapUrl = (value?: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const url = iframeMatch?.[1] || trimmed;
  return String(url || "").replace(/&amp;/gi, "&");
};

const isPlayableVideo = (value: string) => /res\.cloudinary\.com|\.(mp4|webm|ogg)(\?|$)/i.test(value);

type GalleryPagerProps = {
  title: string;
  images: string[];
  emptyLabel: string;
  pageSize?: number;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

function GalleryPager({ title, images, emptyLabel, pageSize = 6, actionLabel, onAction, compact = false }: GalleryPagerProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(images.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const startIndex = safePage * pageSize;
  const currentImages = images.slice(startIndex, startIndex + pageSize);
  const canPage = images.length > pageSize;

  useEffect(() => {
    setPage(0);
  }, [images.length, pageSize]);

  return (
    <div className={compact ? styles.modalPager : styles.galleryPager}>
      <div className={styles.cardHeader}>
        <div>
          <h3>{title}</h3>
          <p className={styles.pagerMeta}>
            {images.length ? `Showing ${startIndex + 1}-${startIndex + currentImages.length} of ${images.length}` : emptyLabel}
          </p>
        </div>
        <div className={styles.pagerActions}>
          {onAction ? (
            <button type="button" className={styles.viewImagesBtn} onClick={onAction}>
              {actionLabel || "View all"}
            </button>
          ) : null}
          <button
            type="button"
            className={styles.pagerButton}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
            disabled={!canPage || safePage === 0}
          >
            Prev
          </button>
          <button
            type="button"
            className={styles.pagerButton}
            onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
            disabled={!canPage || safePage === totalPages - 1}
          >
            Next
          </button>
        </div>
      </div>

      {images.length ? (
        <>
          <div className={compact ? styles.modalGrid : styles.gallerySlideGrid}>
            {currentImages.map((src, index) => (
              <div key={`${src}-${startIndex + index}`} className={compact ? styles.modalItem : styles.gallerySlideItem}>
                <Image unoptimized src={src} alt={`${title} image ${startIndex + index + 1}`} fill sizes="(max-width: 768px) 50vw, 240px" style={{ objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className={styles.emptyState}>{emptyLabel}</p>
      )}
    </div>
  );
}

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

  const pastorGalleryImages = Array.from(
    new Set([member.pastorImageURL, ...(member.pastorGallery || [])].filter((image): image is string => Boolean(image))),
  );
  const churchGalleryImages = Array.from(
    new Set(
      ((member.churchGallery && member?.churchGallery.length ? member.churchGallery : member.pastorGallery) || [])
        .filter((image): image is string => Boolean(image)),
    ),
  );
  const pastorPrimaryImage = member.pastorImageURL || pastorGalleryImages[0] || "";
  const mapEmbedUrl = normalizeMapUrl(member.branchMapUrl) || buildMapEmbedUrl(member.branchAddress);
  const mapLinkUrl = normalizeMapUrl(member.branchMapUrl) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(member.branchAddress || member.branchLocation)}`;

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.superTitle}>Branch Spotlight</p>
            <div className={styles.titleRow}>
              <div className={styles.profileIcon}>
                {pastorPrimaryImage ? (
                  <Image unoptimized src={pastorPrimaryImage} alt={member.displayName} fill sizes="72px" style={{ objectFit: "cover" }} />
                ) : (
                  <span>{member.displayName?.[0]?.toUpperCase() || "B"}</span>
                )}
              </div>
              <div>
                <h1>{member.branchLocation}</h1>
                <p className={styles.profileTag}>
                  {member.pastorTitle || "Lead Pastor"}: <strong>{member.displayName}</strong>
                </p>
              </div>
            </div>
            <p className={styles.heroSubtitle}>{member.branchAddress}</p>
            <div className={styles.heroMeta}>
              {member.phoneNumber && (
                <a className={styles.infoChip} href={`tel:${member.phoneNumber.replace(/\s+/g, "")}`}>
                  <span className={styles.infoLabel}>Phone</span>
                  <strong className={styles.infoValue}>{member.phoneNumber}</strong>
                  <span className={styles.infoAction}>Call now</span>
                </a>
              )}
              {member.email && (
                <a className={styles.infoChip} href={`mailto:${member.email}`}>
                  <span className={styles.infoLabel}>Email</span>
                  <strong className={styles.infoValue}>{member.email}</strong>
                  <span className={styles.infoAction}>Send email</span>
                </a>
              )}
              {member.branchAddress && (
                <a className={styles.infoChip} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(member.branchAddress)}`} target="_blank" rel="noreferrer">
                  <span className={styles.infoLabel}>Address</span>
                  <strong className={styles.infoValue}>{member.branchAddress}</strong>
                  <span className={styles.infoAction}>Open directions</span>
                </a>
              )}
              {member.branchKey ? (
                <span className={styles.infoChip}>
                  <span className={styles.infoLabel}>Branch ID</span>
                  <strong className={styles.infoValue}>{member.branchKey}</strong>
                  <span className={styles.infoAction}>Internal reference</span>
                </span>
              ) : null}
            </div>
          </div>
          <div className={styles.heroImage}>
            {pastorPrimaryImage ? (
              <Image unoptimized src={pastorPrimaryImage} alt={member.displayName} fill sizes="(max-width: 768px) 100vw, 42vw" style={{ objectFit: "cover" }} />
            ) : (
              <div className={styles.loading}>No profile image available.</div>
            )}
          </div>
        </section>

        <section className={styles.contentGrid}>
          <article className={styles.profileCard}>
            <div className={styles.profileHead}>
              <div>
                <p className={styles.roleLabel}>{member.pastorTitle || "Branch Pastor"}</p>
                <h2>{member.displayName}</h2>
              </div>
              {pastorPrimaryImage || pastorGalleryImages.length ? (
                <div className={styles.profileImage}>
                  <Image unoptimized src={pastorPrimaryImage || pastorGalleryImages[0] || ""} alt={member.displayName} fill sizes="180px" style={{ objectFit: "cover" }} />
                  <button className={styles.viewImagesBtn} onClick={() => setShowPastorModal(true)}>View pastor images</button>
                </div>
              ) : null}
            </div>

            <div className={styles.profileBody}>
              <p className={styles.branchSummary}>
                {member.displayName} leads the {member.branchLocation} branch and serves this community through worship, discipleship, outreach, and pastoral care.
              </p>
              <p>{member.branchDescription}</p>
              <p>
                This branch is designed for modern families, passionate believers, and seekers alike. Explore worship experiences, heart-led small groups, and ministry teams built for deeper connection.
              </p>
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Branch Key</span>
                  <strong className={styles.detailValue}>{member.branchKey || "Not set"}</strong>
                </div>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Branch Address</span>
                  <strong className={styles.detailValue}>{member.branchAddress || "Not provided"}</strong>
                </div>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Phone</span>
                  <strong className={styles.detailValue}>{member.phoneNumber || "Not provided"}</strong>
                </div>
                <div className={styles.detailCard}>
                  <span className={styles.detailLabel}>Email</span>
                  <strong className={styles.detailValue}>{member.email || "Not provided"}</strong>
                </div>
              </div>
              {member.pastorDescription ? (
                <div className={styles.pastorBio}>
                  <h4>About the Pastor</h4>
                  <p>{member.pastorDescription}</p>
                </div>
              ) : null}
            </div>
          </article>

          <div className={styles.sideStack}>
            <article className={styles.mapCard}>
              <div className={styles.cardHeader}>
                <h3>Branch Map</h3>
                {member.branchAddress || member.branchMapUrl ? (
                  <a href={mapLinkUrl} target="_blank" rel="noreferrer">
                    Open in Maps
                  </a>
                ) : null}
              </div>
              {mapEmbedUrl ? (
                <div className={styles.mapFrameWrap}>
                  <iframe
                    className={styles.mapFrame}
                    src={mapEmbedUrl}
                    title={`${member.branchLocation} map`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <p className={styles.emptyState}>No branch address has been provided yet.</p>
              )}
            </article>

            <article className={styles.galleryCard}>
              <GalleryPager
                title="Pastor Gallery"
                images={pastorGalleryImages}
                emptyLabel="No pastor images have been uploaded yet."
                pageSize={6}
                actionLabel="View pastor images"
                onAction={() => setShowPastorModal(true)}
              />
            </article>
          </div>

          <article className={styles.galleryCard}>
            <GalleryPager
              title="Church Gallery"
              images={churchGalleryImages}
              emptyLabel="No church gallery images have been uploaded yet."
              pageSize={6}
              actionLabel="View church images"
              onAction={() => setShowChurchModal(true)}
            />
          </article>

          <article className={styles.videoCard}>
            <h3>Branch Videos</h3>
            {member.videos && member.videos.length ? (
              <div className={styles.videoList}>
                {member.videos.map((v, i) => (
                  <div key={i} className={styles.videoItem}>
                    {isPlayableVideo(v) ? (
                      <video className={styles.videoPlayer} controls playsInline src={v} />
                    ) : v.includes("youtube.com") || v.includes("youtu.be") ? (
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
            <GalleryPager
              title="Pastor Images"
              images={pastorGalleryImages}
              emptyLabel="No pastor images have been uploaded yet."
              pageSize={6}
              compact
            />
            <div className={styles.modalActions}>
              <button onClick={() => setShowPastorModal(false)}>Close</button>
            </div>
          </div>
        </div>
      ) : null}

      {showChurchModal ? (
        <div className={styles.modalOverlay} onClick={() => setShowChurchModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <GalleryPager
              title="Church Images"
              images={churchGalleryImages}
              emptyLabel="No church images have been uploaded yet."
              pageSize={6}
              compact
            />
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
