"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, hasFirebaseClientConfig } from "@/app/lib/firebase/config";
import pageStyles from "@/app/page.module.css";

type TeamMemberRecord = {
  uid: string;
  displayName?: string;
  email?: string;
  branchLocation?: string;
  phoneNumber?: string;
  photoURL?: string;
};

export default function TeamSection() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          uid: document.id,
          ...(document.data() as TeamMemberRecord),
        }));
        setTeamMembers(members);
      } catch (error) {
        console.error("Error loading team members:", error);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTeamMembers();
  }, []);

  return (
    <div className={pageStyles.leadershipGrid}>
      {loading ? (
        <div className={pageStyles.leaderCard}>
          <div className={pageStyles.leaderInfo}>
            <h3 className={pageStyles.leaderName}>Loading team members...</h3>
            <p className={pageStyles.leaderBio}>Pulling the latest branch leaders from the dashboard.</p>
          </div>
        </div>
      ) : teamMembers.length ? (
        teamMembers.map((member) => (
          <div key={member.uid} className={pageStyles.leaderCard}>
            <div className={pageStyles.leaderImageBox}>
              {member.photoURL ? (
                <Image
                  src={member.photoURL}
                  alt={member.displayName || "Team member"}
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
              <h3 className={pageStyles.leaderName}>{member.displayName || "Team Member"}</h3>
              <p className={pageStyles.leaderRole}>{member.branchLocation || "Branch Leader"}</p>
              <p className={pageStyles.leaderBio}>
                {member.email}
                {member.phoneNumber ? ` • ${member.phoneNumber}` : ""}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className={pageStyles.leaderCard}>
          <div className={pageStyles.leaderInfo}>
            <h3 className={pageStyles.leaderName}>No team members published yet</h3>
            <p className={pageStyles.leaderBio}>Add branch leaders in the dashboard and their profiles will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
