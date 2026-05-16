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
  branchAddress?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  churchGallery?: string[];
  phoneNumber?: string;
  photoURL?: string;
};

const DEFAULT_MEMBERS: TeamMemberRecord[] = [
  {
    uid: "default-main",
    displayName: "Pastor Lydia A.",
    email: "mosocho@church.org",
    branchLocation: "Mosocho",
    branchAddress: "Mosocho, Kisii County",
    branchDescription:
      "The main church in Mosocho, Kisii County. This branch serves as the regional hub for worship, outreach, and spiritual growth in the area.",
    pastorDescription:
      "Pastor Lydia leads the Mosocho congregation with pastoral care, teaching, and community outreach. She has a heart for families and local transformation.",
    pastorImageURL: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    churchGallery: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80",
    ],
    photoURL: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
  },
  {
    uid: "default-north",
    displayName: "Pastor Emmanuel T.",
    email: "omogwa@church.org",
    branchLocation: "Omogwa",
    branchAddress: "Omogwa, Kisii County",
    branchDescription:
      "The Omogwa branch serves local families with vibrant worship, community care, and discipleship grounded in Kisii County culture.",
    pastorDescription:
      "Pastor Emmanuel heads the Omogwa branch, focusing on practical discipleship and community programs for all ages.",
    pastorImageURL: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    churchGallery: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1470145318693-9c182fde2a2d?auto=format&fit=crop&w=900&q=80",
    ],
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  },
  {
    uid: "default-south",
    displayName: "Pastor Mercy N.",
    email: "nyanchwa@church.org",
    branchLocation: "Nyanchwa",
    branchAddress: "Nyanchwa, Kisii County",
    branchDescription:
      "The Nyanchwa branch is a soulful church community in Kisii County, focused on discipleship, hospitality, and local transformation.",
    pastorDescription:
      "Pastor Mercy leads with an emphasis on hospitality and deep discipleship, helping communities grow in faith and service.",
    pastorImageURL: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    churchGallery: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=900&q=80",
    ],
    photoURL: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  },
];

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
        const displayMembers = members.slice(0, 3);
        if (displayMembers.length < 3) {
          setTeamMembers([...displayMembers, ...DEFAULT_MEMBERS.slice(displayMembers.length, 3)]);
        } else {
          setTeamMembers(displayMembers);
        }
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
          <a key={member.uid} href={`/team/${member.uid}`} className={pageStyles.leaderCard}>
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
            <h3 className={pageStyles.leaderName}>No team members published yet</h3>
            <p className={pageStyles.leaderBio}>Add branch leaders in the dashboard and their profiles will appear here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
