"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Navbar from "../components/Navbar/Navbar";
import styles from "./projects.module.css";
import { getAllProjects } from "../lib/firebase/firestore";

interface Project {
  id: string | number;
  title: string;
  image: string;
  status: "ongoing" | "future" | "completed";
  location: string;
  category: string;
  plannedAmount: number;
  donatedAmount: number;
  timeline: string;
  beneficiaries: string;
  description: string;
  objectives: string[];
}

type FirestoreProject = Omit<Project, "id" | "image"> & {
  id: string;
  imageUrl?: string;
};

const projects: Project[] = [
  {
    id: 1,
    title: "Light to Life International Ministries School Expansion",
    image: "/images/projects/school.jpg",
    status: "ongoing",
    location: "Kenya",
    category: "Light to Life Education",
    plannedAmount: 50000,
    donatedAmount: 32000,
    timeline: "January 2026 - December 2026",
    beneficiaries: "600+ Students",
    description:
      "Expansion of classrooms, library facilities, and a computer laboratory to advance the educational outreach of Light to Life International Ministries.",
    objectives: [
      "Build 6 additional classrooms",
      "Establish a digital learning center",
      "Expand library resources",
      "Improve student capacity"
    ]
  },

  {
    id: 2,
    title: "Light to Life Church Planting Initiative",
    image: "/images/projects/church.jpg",
    status: "future",
    location: "Uganda",
    category: "Light to Life Church Planting",
    plannedAmount: 80000,
    donatedAmount: 5000,
    timeline: "2027",
    beneficiaries: "3 Communities",
    description:
      "Establishing permanent Light to Life International Ministries worship centers and launching evangelistic outreach programs in underserved communities.",
    objectives: [
      "Acquire land",
      "Construct worship center",
      "Train local leaders",
      "Launch outreach programs"
    ]
  },

  {
    id: 3,
    title: "Light to Life Community Water Access Project",
    image: "/images/projects/water.jpg",
    status: "completed",
    location: "Kenya",
    category: "Light to Life Community Development",
    plannedAmount: 15000,
    donatedAmount: 15000,
    timeline: "Completed 2025",
    beneficiaries: "2,000+ Residents",
    description:
      "Installation of clean water systems and sanitation facilities as part of the holistic community care by Light to Life International Ministries.",
    objectives: [
      "Drill boreholes",
      "Install water storage tanks",
      "Provide sanitation education"
    ]
  },

  {
    id: 4,
    title: "Light to Life Leadership Training Center",
    image: "/images/projects/training.jpg",
    status: "future",
    location: "East Africa",
    category: "Light to Life Leadership Development",
    plannedAmount: 120000,
    donatedAmount: 18000,
    timeline: "2027 - 2028",
    beneficiaries: "500 Church Leaders",
    description:
      "A dedicated training center equipped by Light to Life International Ministries to prepare pastors, missionaries, and ministry leaders for global service.",
    objectives: [
      "Build training facilities",
      "Develop curriculum",
      "Host leadership conferences"
    ]
  },

  {
    id: 5,
    title: "Light to Life Children Feeding Program",
    image: "/images/projects/feeding.jpg",
    status: "ongoing",
    location: "Kenya",
    category: "Light to Life Humanitarian Outreach",
    plannedAmount: 25000,
    donatedAmount: 14000,
    timeline: "Ongoing",
    beneficiaries: "400 Children",
    description:
      "Providing regular nutritious meals and vital educational support to vulnerable children through the Light to Life International Ministries welfare initiative.",
    objectives: [
      "Daily feeding program",
      "School support",
      "Health monitoring"
    ]
  },

  {
    id: 6,
    title: "Light to Life Mission Vehicle Acquisition",
    image: "/images/projects/vehicle.jpg",
    status: "future",
    location: "Kenya & Uganda",
    category: "Light to Life Global Missions",
    plannedAmount: 45000,
    donatedAmount: 7000,
    timeline: "2027",
    beneficiaries: "Multiple Mission Stations",
    description:
      "Acquisition of utility mission vehicles to support the evangelism, relief operations, and field logistics of Light to Life International Ministries.",
    objectives: [
      "Purchase ministry vehicle",
      "Support remote outreaches",
      "Improve logistics"
    ]
  }
];

const mapFirestoreProject = (project: FirestoreProject): Project => {
  const staticFallback = projects.find((item) => item.title === project.title);

  return {
    id: project.id,
    title: project.title,
    image: project.imageUrl || staticFallback?.image || "/images/projects/school.jpg",
    status: project.status,
    location: project.location || staticFallback?.location || "",
    category: project.category || staticFallback?.category || "",
    plannedAmount: project.plannedAmount || staticFallback?.plannedAmount || 0,
    donatedAmount: project.donatedAmount || staticFallback?.donatedAmount || 0,
    timeline: project.timeline || staticFallback?.timeline || "",
    beneficiaries: project.beneficiaries || staticFallback?.beneficiaries || "",
    description: project.description || staticFallback?.description || "",
    objectives:
      project.objectives && project.objectives.length
        ? project.objectives
        : staticFallback?.objectives || [],
  };
};

export default function ProjectsPage() {
  const [filter, setFilter] = useState<
    "all" | "ongoing" | "future" | "completed"
  >("all");

  const [projectsData, setProjectsData] = useState<Project[]>(projects);
  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const fetched = await getAllProjects();
        if (fetched && fetched.length > 0) {
          setProjectsData(fetched.map(mapFirestoreProject));
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    void fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (filter === "all") return projectsData;
    return projectsData.filter((project) => project.status === filter);
  }, [filter, projectsData]);

  const totalBudget = projectsData.reduce(
    (sum, project) => sum + project.plannedAmount,
    0
  );

  const totalRaised = projectsData.reduce(
    (sum, project) => sum + project.donatedAmount,
    0
  );

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        {/* HERO */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>
              PROJECTS & FUTURE PROJECTIONS
            </span>

            <h1 className={styles.heroTitle}>
              Building Communities, Transforming Lives
            </h1>

            <p className={styles.heroDescription}>
              Through education, church planting, missions, humanitarian aid,
              and leadership development, we are impacting lives across Africa.
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className={styles.statsSection}>
          <div className={styles.statCard}>
            <h3>{projects.length}</h3>
            <span>Total Projects</span>
          </div>

          <div className={styles.statCard}>
            <h3>${totalRaised.toLocaleString()}</h3>
            <span>Funds Raised</span>
          </div>

          <div className={styles.statCard}>
            <h3>${totalBudget.toLocaleString()}</h3>
            <span>Project Budget</span>
          </div>

          <div className={styles.statCard}>
            <h3>8,500+</h3>
            <span>Lives Impacted</span>
          </div>
        </section>

        {/* FILTERS */}
        <section className={styles.filtersSection}>
          <button
            onClick={() => setFilter("all")}
            className={`${styles.filterButton} ${
              filter === "all" ? styles.activeFilter : ""
            }`}
          >
            All
          </button>

          <button
            onClick={() => setFilter("ongoing")}
            className={`${styles.filterButton} ${
              filter === "ongoing" ? styles.activeFilter : ""
            }`}
          >
            Ongoing
          </button>

          <button
            onClick={() => setFilter("future")}
            className={`${styles.filterButton} ${
              filter === "future" ? styles.activeFilter : ""
            }`}
          >
            Future Projections
          </button>

          <button
            onClick={() => setFilter("completed")}
            className={`${styles.filterButton} ${
              filter === "completed" ? styles.activeFilter : ""
            }`}
          >
            Completed
          </button>
        </section>

        {/* PROJECT GRID */}
        <section className={styles.projectsSection}>
          <div className={styles.projectsGrid}>
            {filteredProjects.map((project) => {
              const percentage = Math.min(
                100,
                Math.round(
                  (project.donatedAmount / project.plannedAmount) * 100
                )
              );

              return (
                <article
                  key={project.id}
                  className={styles.projectCard}
                >
                  <div className={styles.projectImageWrapper}>
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className={styles.projectImage}
                    />
                  </div>

                  <div className={styles.projectContent}>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[project.status]
                      }`}
                    >
                      {project.status === "future"
                        ? "Future Projection"
                        : project.status}
                    </span>

                    <h3 className={styles.projectTitle}>
                      {project.title}
                    </h3>

                    <p className={styles.projectDescription}>
                      {project.description}
                    </p>

                    <div className={styles.projectMeta}>
                      <span>{project.location}</span>
                      <span>{project.category}</span>
                    </div>

                    <div className={styles.progressSection}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <small>
                        ${project.donatedAmount.toLocaleString()} raised
                        of ${project.plannedAmount.toLocaleString()}
                      </small>
                    </div>

                    <button
                      className={styles.readMoreButton}
                      onClick={() => setSelectedProject(project)}
                    >
                      Read More
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h2>Support Our Mission</h2>

          <p>
            Every contribution helps us expand our impact and bring hope,
            education and spiritual transformation to communities.
          </p>

          <a href="/donate" className={styles.ctaButton}>
            Donate Today
          </a>
        </section>
      </main>

      {/* MODAL */}
      {selectedProject && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedProject(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalImageWrapper}>
              <Image
                src={selectedProject.image}
                alt={selectedProject.title}
                fill
                className={styles.modalImage}
              />
            </div>

            <div className={styles.modalContent}>
              <h2>{selectedProject.title}</h2>

              <p>{selectedProject.description}</p>

              <div className={styles.modalStats}>
                <div className={styles.modalStat}>
                  <strong>
                    $
                    {selectedProject.plannedAmount.toLocaleString()}
                  </strong>
                  <span>Budget</span>
                </div>

                <div className={styles.modalStat}>
                  <strong>
                    $
                    {selectedProject.donatedAmount.toLocaleString()}
                  </strong>
                  <span>Raised</span>
                </div>

                <div className={styles.modalStat}>
                  <strong>
                    $
                    {(
                      selectedProject.plannedAmount -
                      selectedProject.donatedAmount
                    ).toLocaleString()}
                  </strong>
                  <span>Remaining</span>
                </div>
              </div>

              <div className={styles.objectives}>
                <h4>Project Objectives</h4>

                <ul>
                  {selectedProject.objectives.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <p>
                <strong>Timeline:</strong>{" "}
                {selectedProject.timeline}
              </p>

              <p>
                <strong>Beneficiaries:</strong>{" "}
                {selectedProject.beneficiaries}
              </p>

              <div className={styles.modalActions}>
                <button
                  className={styles.closeButton}
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </button>

                <a
                  href="/donate"
                  className={styles.supportButton}
                >
                  Support This Project
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}