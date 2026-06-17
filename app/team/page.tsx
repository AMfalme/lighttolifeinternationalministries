"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TeamMemberCard from "@/app/components/TeamMember/TeamMember";
import Navbar from "../components/Navbar/Navbar";
import styles from "./team.module.css";

type LeadershipMember = {
  uid: string;
  displayName?: string;
  role?: string;
  pastorTitle?: string;
  branchLocation?: string;
  pastorDescription?: string;
  branchDescription?: string;
  photoURL?: string;
  pastorImageURL?: string;
};

type ManagementMember = {
  id: string;
  name?: string;
  title?: string;
  role?: string;
  photoURL?: string;
  imageURL?: string;
  background?: string;
  gallery?: string[];
  branchLocation?: string;
  phoneNumber?: string;
  email?: string;
};

const getExcerpt = (text?: string, max = 110) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
};

const getMemberImageUrl = (
  member: LeadershipMember | ManagementMember,
  type: "leadership" | "management"
) => {
  if (type === "leadership") {
    const m = member as LeadershipMember;
    return m.pastorImageURL || m.photoURL;
  }
  const m = member as ManagementMember;
  return m.imageURL || m.photoURL;
};

const getMemberRole = (
  member: LeadershipMember | ManagementMember,
  type: "leadership" | "management"
) => {
  if (type === "leadership") {
    const leader = member as LeadershipMember;
    return leader.pastorTitle || leader.role || leader.branchLocation || "Branch Leader";
  }
  const manager = member as ManagementMember;
  return manager.title || manager.role || manager.branchLocation || "Team Member";
};

const getMemberDescription = (
  member: LeadershipMember | ManagementMember,
  type: "leadership" | "management"
) => {
  if (type === "leadership") {
    const leader = member as LeadershipMember;
    return leader.pastorDescription || leader.branchDescription || "Committed to serving the community with passion and care.";
  }
  const manager = member as ManagementMember;
  return manager.background || "This team member has not yet provided a public summary.";
};

const getMemberName = (
  member: LeadershipMember | ManagementMember,
  type: "leadership" | "management"
) =>
  type === "leadership"
    ? (member as LeadershipMember).displayName || "Leadership"
    : (member as ManagementMember).name || "Team Member";

const getMemberAvatarName = (
  member: LeadershipMember | ManagementMember,
  type: "leadership" | "management"
) =>
  type === "leadership"
    ? (member as LeadershipMember).displayName || "Leader"
    : (member as ManagementMember).name || "Team";

const getMemberGallery = (
  member: LeadershipMember | ManagementMember,
  type: "leadership" | "management"
) =>
  type === "management" ? (member as ManagementMember).gallery : undefined;

export default function TeamPage() {
  const [leadership, setLeadership] = useState<LeadershipMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<ManagementMember[]>([]);
  const [loadingLeadership, setLoadingLeadership] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [selectedMember, setSelectedMember] = useState<LeadershipMember | ManagementMember | null>(null);
  const [selectedMemberType, setSelectedMemberType] = useState<"leadership" | "management" | null>(null);

  const openModal = (
    member: LeadershipMember | ManagementMember,
    type: "leadership" | "management"
  ) => {
    setSelectedMember(member);
    setSelectedMemberType(type);
  };

  const closeModal = () => {
    setSelectedMember(null);
    setSelectedMemberType(null);
  };

  useEffect(() => {
    let mounted = true;

    const loadLeadership = async () => {
      try {
        const response = await fetch("/api/public/team");
        const payload = (await response.json()) as { members?: LeadershipMember[]; error?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load leadership.");
        }
        if (mounted) setLeadership(payload.members || []);
      } catch (error) {
        console.error("Leadership load failed:", error);
        if (mounted) setLeadership([]);
      } finally {
        if (mounted) setLoadingLeadership(false);
      }
    };

    const loadTeamMembers = async () => {
      try {
        const response = await fetch("/api/public/team-members");
        const payload = (await response.json()) as { members?: ManagementMember[]; error?: string };
        if (!response.ok) {
          throw new Error(payload.error || "Failed to load team members.");
        }
        if (mounted) setTeamMembers(payload.members || []);
      } catch (error) {
        console.error("Team members load failed:", error);
        if (mounted) setTeamMembers([]);
      } finally {
        if (mounted) setLoadingTeam(false);
      }
    };

    void Promise.all([loadLeadership(), loadTeamMembers()]);

    return () => {
      mounted = false;
    };
  }, []);

  const loading = loadingLeadership || loadingTeam;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.badge}>OUR PEOPLE</span>
            <h1>Leadership & Team</h1>
            <p>
              Meet the leaders and dedicated management staff who serve our ministry
              around the world.
            </p>
            <Link href="/contact" className={styles.cta}>
              Contact the Team
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2>Leadership & Directors</h2>
            <div className={styles.grid}>
              {loadingLeadership ? (
                [1, 2, 3].map((index) => (
                  <article key={`lead-loading-${index}`} className={styles.card}>
                    {/* Placeholder for skeleton loading, TeamMemberCard doesn't have a built-in skeleton */}
                    <div className={styles.imageWrapper} style={{ backgroundColor: "#e0e0e0", animation: "pulse 1.5s infinite" }} />
                    <div className={styles.info} style={{ padding: "1rem" }}>
                      <div className={styles.skeletonLine} style={{ height: "24px", width: "80%", marginBottom: "8px" }} />
                      <div className={styles.skeletonLineShort} style={{ height: "16px", width: "60%", marginBottom: "12px" }} />
                      <div className={styles.skeletonLine} style={{ height: "16px", width: "90%", marginBottom: "6px" }} />
                      <div className={styles.skeletonLine} style={{ height: "16px", width: "70%" }} />
                    </div>
                    <style>{`
                      @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                      }
                    `}</style>
                  </article>
                ))
              ) : leadership.length ? (
                leadership.map((member) => (
                  <TeamMemberCard
                    key={member.uid}
                    href={`/team/${member.uid}`} 
                    imageSrc={getMemberImageUrl(member, "leadership")}
                    imageAlt={member.displayName || "Leader"}
                    name={member.displayName || "Branch Leader"}
                    role={getMemberRole(member, "leadership")}
                    description={getExcerpt(getMemberDescription(member, "leadership"), 120)}
                    onCtaClick={() => openModal(member, "leadership")}
                    ctaLabel="See more"
                    className={styles.card} // Apply existing card styles
                  />
                ))
              ) : (
                <article className={styles.card}>
                  <div className={styles.info}>
                    <h3>No leadership members published yet</h3>
                    <p className={styles.bio}>Leadership members will appear here once they are added in the dashboard.</p>
                  </div>
                </article>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2>Regional Departmental Heads</h2>
            {loadingTeam ? (
              <p>Loading management members…</p>
            ) : teamMembers.length > 0 ? (
              <div className={styles.grid}>
                {teamMembers.map((member) => (
                  <TeamMemberCard
                    key={member.id}
                    imageSrc={getMemberImageUrl(member, "management")}
                    imageAlt={member.name || "Team Member"}
                    name={member.name || "Team Member"}
                    role={getMemberRole(member, "management")}
                    description={getExcerpt(getMemberDescription(member, "management"), 120)}
                    onCtaClick={() => openModal(member, "management")}
                    ctaLabel="See more"
                    className={styles.card} // Apply existing card styles
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Management team members can be added in the dashboard and will appear here.</p>
              </div>
            )}
          </div>
        </section>

        {selectedMember && selectedMemberType && (
          <div className={styles.modalOverlay} role="dialog" aria-modal="true">
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.kicker}>{selectedMemberType === "leadership" ? "Leadership" : "Team Member"}</p>
                  <h2 className={styles.modalTitle}>{getMemberName(selectedMember, selectedMemberType)}</h2>
                  <p className={styles.role}>{getMemberRole(selectedMember, selectedMemberType)}</p>
                </div>
                <button type="button" className={styles.modalClose} onClick={closeModal} aria-label="Close details">
                  ×
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalImageWrapper}>
                  {getMemberImageUrl(selectedMember, selectedMemberType) ? (
                    <img
                      src={getMemberImageUrl(selectedMember, selectedMemberType) || ""}
                      alt={getMemberAvatarName(selectedMember, selectedMemberType)}
                      className={styles.memberImage}
                    />
                  ) : ( // Fallback for no image, using the TeamMemberCard's internal logic for initials
                    <div className={styles.avatarPlaceholder}>
                      <span>{getMemberAvatarName(selectedMember, selectedMemberType).charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className={styles.bio}>{getMemberDescription(selectedMember, selectedMemberType)}</p>
                  {selectedMemberType === "management" && getMemberGallery(selectedMember, selectedMemberType)?.length ? (
                    <div className={styles.galleryPreview}>
                      <p className={styles.galleryTitle}>Work gallery</p>
                      <div className={styles.galleryGrid}>
                        {getMemberGallery(selectedMember, selectedMemberType)?.slice(0, 4).map((item, index) => (
                          <img key={index} src={item} alt={`Gallery image ${index + 1}`} className={styles.galleryItem} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
