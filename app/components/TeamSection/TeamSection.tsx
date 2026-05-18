"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, hasFirebaseClientConfig } from "@/app/lib/firebase/config";
import pageStyles from "@/app/page.module.css";

type TeamMemberRecord = {
  uid: string;
  displayName?: string;
  email?: string;
  branchLocation?: string;
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  churchGallery?: string[];
  phoneNumber?: string;
  photoURL?: string;
};

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadTeamMembers = async () => {
      if (!hasFirebaseClientConfig || !db) {
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      try {
        const teamQuery = query(collection(db, "users"), where("role", "==", "team-member"));
        const snapshot = await getDocs(teamQuery);
        const members = snapshot.docs.map((document) => ({
          ...(document.data() as Omit<TeamMemberRecord, "uid">),
          uid: document.id,
        }));
        setTeamMembers(members.slice(0, 3));
      } catch (error) {
        console.error("Error loading team members:", error);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTeamMembers();
  }, []);

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

  return (
    <div className={pageStyles.leadershipGrid}>
      {loading ? (
        <>
          {[1, 2, 3].map((index) => (
            <div key={`skeleton-${index}`} className={pageStyles.leaderCard}>
              <div className={pageStyles.leaderImageBox}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "8px",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              </div>
              <div className={pageStyles.leaderInfo}>
                <div
                  style={{
                    height: "24px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                    marginBottom: "8px",
                    animation: "pulse 1.5s infinite",
                    width: "60%",
                  }}
                />
                <div
                  style={{
                    height: "16px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                    marginBottom: "12px",
                    animation: "pulse 1.5s infinite",
                    width: "40%",
                  }}
                />
                <div
                  style={{
                    height: "16px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                    marginBottom: "6px",
                    animation: "pulse 1.5s infinite",
                  }}
                />
                <div
                  style={{
                    height: "16px",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                    animation: "pulse 1.5s infinite",
                    width: "85%",
                  }}
                />
              </div>
            </div>
          ))}
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </>
      ) : teamMembers.length ? (
        teamMembers.map((member) => (
          <a key={member.uid} href={`/team/${toBranchKey(member.branchLocation || member.uid)}`} className={pageStyles.leaderCard}>
            <div className={pageStyles.leaderImageBox}>
              {member.photoURL ? (
                <Image
                  src={member.photoURL}
                  alt={member.displayName || "Branch leader"}
                  fill
                  className={pageStyles.leaderImage}
                />
              ) : (
                <div className={pageStyles.imagePlaceholder}>
                  <span>{(member.displayName || "T").slice(0, 1).toUpperCase()}</span>
                </div>
              )}
            </div>

            <div className={pageStyles.leaderInfo}>
              <h3 className={pageStyles.leaderName}>{member.displayName || "Branch Leader"}</h3>
              <p className={pageStyles.leaderRole}>{member.branchLocation || "Branch Leader"}</p>
              <p className={pageStyles.leaderBio}>
                {member.pastorDescription
                  ? `${member.pastorDescription.slice(0, 120)}...`
                  : member.branchDescription
                  ? `${member.branchDescription.slice(0, 120)}...`
                  : "Explore the branch worship style, community values, and ministry heartbeat."}
              </p>
            </div>
          </a>
        ))
      ) : (
        <div className={pageStyles.leaderCard}>
          <div className={pageStyles.leaderInfo}>
            <h3 className={pageStyles.leaderName}>No leaders published yet</h3>
            <p className={pageStyles.leaderBio}>Add branch leaders in the dashboard and their profiles will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
