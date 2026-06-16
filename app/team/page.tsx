"use client";

import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar/Navbar";
import styles from "./team.module.css";

type Member = {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
};

const TEAM: Member[] = [
  {
    id: "1",
    name: "Bishop Francis Akaki",
    role: "Founder & Lead Pastor",
    bio: "Visionary leader guiding our global ministry and outreach.",
  },
  {
    id: "2",
    name: "Pastor Charles Maisiba",
    role: "Director of Community Outreach",
    bio: "Leads volunteer mobilization and local partnerships.",
  },
  {
    id: "3",
    name: "Pastor Nicholas Nyarongo",
    role: "Missions Director",
    bio: "Oversees international mission projects and partner relations.",
  },
  {
    id: "4",
    name: "Mary Wanjiru",
    role: "Finance Director",
    bio: "Manages finance, compliance, and donor relations.",
  },
  {
    id: "5",
    name: "Samuel Otieno",
    role: "Program Coordinator",
    bio: "Coordinates education and health programs on the ground.",
  },
  {
    id: "6",
    name: "Grace Mwende",
    role: "Communications Lead",
    bio: "Storytells our impact through digital and printed media.",
  },
];

const leadership = TEAM.filter((m) =>
  /director|lead|pastor|founder|bishop|chair/i.test(m.role)
);
const members = TEAM.filter((m) => !leadership.includes(m));

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return <div className={styles.avatar}>{initials}</div>;
}

export default function TeamPage() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <span className={styles.badge}>OUR PEOPLE</span>
            <h1>Leadership & Team</h1>
            <p>
              Meet the leaders and dedicated team members who serve our ministry
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
              {leadership.map((m) => (
                <article key={m.id} className={styles.card}>
                  <Avatar name={m.name} />
                  <div className={styles.info}>
                    <h3>{m.name}</h3>
                    <p className={styles.role}>{m.role}</p>
                    <p className={styles.bio}>{m.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <h2>Team Members</h2>
            <div className={styles.grid}>
              {members.map((m) => (
                <article key={m.id} className={styles.card}>
                  <Avatar name={m.name} />
                  <div className={styles.info}>
                    <h3>{m.name}</h3>
                    <p className={styles.role}>{m.role}</p>
                    <p className={styles.bio}>{m.bio}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}