"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar/Navbar";
import BranchStorySection from "@/app/member/page";
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
  branchHistory?: string;
  pastorBiography?: string;
  churchStory?: string;
  vision?: string;
  futureDirection?: string;
  visionGoals?: string[];
  directors?: BranchFeatureItem[];
  projects?: BranchFeatureItem[];
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
  branchHistory?: string;
  pastorBiography?: string;
  churchStory?: string;
  vision?: string;
  futureDirection?: string;
  visionGoals?: string[];
  directors?: BranchFeatureItem[];
  projects?: BranchFeatureItem[];
};

type BranchFeatureItem = {
  id?: string;
  imageURL?: string;
  name?: string;
  role?: string;
  description?: string;
};

type SectionBlock = {
  title: string;
  label: string;
  body?: string;
  items?: string[];
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
  const [relatedBlogs, setRelatedBlogs] = useState<Array<{ id: string; title?: string; excerpt?: string; imageUrl?: string; date?: string }>>([]);
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
  const isMainBranch = /mosocho/i.test(String(member.branchKey || member.branchLocation || ""));
  const sectionBlocks: SectionBlock[] = [
    {
      title: "Branch Description",
      label: "Current identity",
      body: member.branchDescription,
    },
    {
      title: "Church History",
      label: "Past",
      body: member.branchHistory,
    },
    {
      title: "Church Story",
      label: "How it grew",
      body: member.churchStory,
    },
    {
      title: "Pastor Description",
      label: "Current ministry focus",
      body: member.pastorDescription,
    },
    {
      title: "Pastor Biography",
      label: "Education and calling",
      body: member.pastorBiography,
    },
    {
      title: "Vision",
      label: "Future direction",
      body: member.vision,
      items: member.visionGoals || [],
    },
    {
      title: "Future Direction",
      label: "What comes next",
      body: member.futureDirection,
    },
  ].filter((section) => Boolean(section.body) || Boolean(section.items?.length));

  const timelineSections = sectionBlocks.filter((s) => s.title !== "Branch Description" && s.title !== "Pastor Description");
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
                  <Image unoptimized src={pastorPrimaryImage} alt={member.displayName} fill sizes="72px" style={{ objectFit: "cover", objectPosition: "center top" }} />
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
              <Image unoptimized src={pastorPrimaryImage} alt={member.displayName} fill sizes="(max-width: 768px) 100vw, 42vw" style={{ objectFit: "cover", objectPosition: "center top" }} />
            ) : (
              <div className={styles.loading}>No profile image available.</div>
            )}
          </div>
        </section>

        <BranchStorySection
          branchHistory={member.branchHistory || member.churchStory || member.branchDescription}
          pastorBiography={member.pastorBiography || member.pastorDescription}
          pastorName={member.displayName}
          churchTitle="Church History"
          pastorTitle="Pastor Biography"
        />

        {isMainBranch ? (
          <section className={styles.timelineSection}>
            <div className={styles.timelineGrid}>
              {timelineSections.map((section, index) => (
                <article key={section.title} className={styles.timelineCard}>
                  <div className={styles.timelineMeta}>
                    <span className={styles.timelineStep}>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p className={styles.timelineLabel}>{section.label}</p>
                      <h3>{section.title}</h3>
                    </div>
                  </div>
                  {section.body ? <p className={styles.timelineBody}>{section.body}</p> : null}
                  {section.items && section.items.length ? (
                    <ul className={styles.timelineList}>
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className={styles.contentGrid}>
          <article className={styles.profileCard}>
            <div className={styles.profileHead}>
              <div>
                <p className={styles.roleLabel}>{member.pastorTitle || "Branch Pastor"}</p>
                <h2>{member.displayName}</h2>
                <p className={styles.profileSubcopy}>
                  {member.branchKey ? `Branch key: ${member.branchKey}` : "Branch key not set"}
                </p>
              </div>
              {pastorPrimaryImage || pastorGalleryImages.length ? (
                <div className={styles.profileImage}>
                  <Image unoptimized src={pastorPrimaryImage || pastorGalleryImages[0] || ""} alt={member.displayName} fill sizes="180px" style={{ objectFit: "cover", objectPosition: "center top" }} />
                  <button className={styles.viewImagesBtn} onClick={() => setShowPastorModal(true)}>View pastor images</button>
                </div>
              ) : null}
            </div>

            <div className={styles.profileBody}>
              <p className={styles.branchSummary}>
                {member.displayName} leads the {member.branchLocation} branch and serves this community through worship, discipleship, outreach, and pastoral care.
              </p>
              <p>{member.branchDescription}</p>
              <p className={styles.profileMuted}>
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

          {isMainBranch ? (
            <article className={styles.featureSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Leadership</p>
                <h2>Directors and ministry team</h2>
              </div>
              <p className={styles.sectionLead}>
                The people driving the branch forward across children, outreach, worship, administration, and care.
              </p>
            </div>

            {member.directors && member.directors.length ? (
              <div className={styles.featureGrid}>
                {member.directors.map((director, index) => (
                  <article key={director.id || index} className={styles.featureCard}>
                    <div className={styles.featureMedia}>
                      {director.imageURL ? (
                        <Image unoptimized src={director.imageURL} alt={director.name || "Director"} fill sizes="(max-width: 768px) 100vw, 280px" style={{ objectFit: "cover" }} />
                      ) : (
                        <span>{(director.name || "D").slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className={styles.featureBody}>
                      <p className={styles.featureLabel}>Director</p>
                      <h3>{director.name || "Unnamed director"}</h3>
                      <p className={styles.featureRole}>{director.role || "Role not set"}</p>
                      <p>{director.description || "No description provided yet."}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No directors added yet.</p>
            )}
            </article>
          ) : (
            <section className={styles.compactSection}>
              { (member.vision || member.futureDirection || (member.visionGoals && member.visionGoals.length)) ? (
                <article className={styles.infoCard}>
                  <h3>Vision & Future</h3>
                  {member.vision ? <p>{member.vision}</p> : null}
                  {member.futureDirection && !member.vision ? <p>{member.futureDirection}</p> : null}
                  {member.visionGoals && member.visionGoals.length ? (
                    <ul>
                      {member.visionGoals.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ) : null }

              <article className={styles.infoCard}>
                <p className={styles.profileMuted}>For more branch-specific details, see the main church profile on the homepage.</p>
              </article>
            </section>
          )}

          <article className={styles.featureSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.sectionKicker}>Projects</p>
                <h2>Current and future projects</h2>
              </div>
              <p className={styles.sectionLead}>
                Use these to show what the branch is actively building or dreaming about next.
              </p>
            </div>

            {member.projects && member.projects.length ? (
              <div className={styles.featureGrid}>
                {member.projects.map((project, index) => (
                  <article key={project.id || index} className={styles.featureCard}>
                    <div className={styles.featureMedia}>
                      {project.imageURL ? (
                        <Image unoptimized src={project.imageURL} alt={project.name || "Project"} fill sizes="(max-width: 768px) 100vw, 280px" style={{ objectFit: "cover" }} />
                      ) : (
                        <span>{(project.name || "P").slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className={styles.featureBody}>
                      <p className={styles.featureLabel}>Project</p>
                      <h3>{project.name || "Unnamed project"}</h3>
                      <p className={styles.featureRole}>{project.role || "Type not set"}</p>
                      <p>{project.description || "No description provided yet."}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>No projects added yet.</p>
            )}
          </article>

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
              <div className={styles.blogList}>
                {relatedBlogs.map((blog) => (
                  <article key={blog.id} className={styles.blogListItem}>
                    <div className={styles.blogListMeta}>
                      <Link href={`/news/${blog.id}`} className={styles.blogListTitle}>
                        {blog.title || "Read more"}
                      </Link>
                      {blog.date ? <span className={styles.blogListDate}>{blog.date}</span> : null}
                    </div>
                    {blog.excerpt ? <p className={styles.blogListExcerpt}>{blog.excerpt.trim()}...</p> : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.emptyState}>
                No related blog posts yet. <Link href={`/news?branch=${encodeURIComponent(member.branchLocation)}`}>View all news</Link>
              </p>
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
