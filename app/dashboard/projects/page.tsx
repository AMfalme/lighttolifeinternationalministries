"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { DashboardLoading } from "@/app/dashboard/loading";
import {
  Project,
  createProject,
  deleteProject,
  getAllProjects,
  updateProject,
} from "@/app/lib/firebase/firestore";
// import styles from "./projects.module.css";
import styles from "@/app/projects/projects.module.css";
import dashStyles from "@/app/dashboard/dashboard.module.css";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";

export default function DashboardProjectsPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [projects, setProjects] = useState<(Project & { id: string })[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Project>({
      title: "",
      description: "",

      category: "",
      location: "",

      status: "ongoing",

      plannedAmount: 0,
      donatedAmount: 0,

      beneficiaries: "",
      timeline: "",

      imageUrl: "",

      objectives: [],

      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
    });

  const fetchProjects = async () => {
    try {
      const fetched = await getAllProjects();
      setProjects(fetched);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      void fetchProjects();
    }
  }, [loading, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateProject(editingId, formData);
      } else {
        await createProject(formData);
      }
      await fetchProjects();
      resetForm();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) {
      return;
    }

    try {
      await deleteProject(id);
      await fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const handleEdit = (project: Project & { id: string }) => {
  setFormData({
    title: project.title,
    description: project.description,
    category: project.category || "",
    location: project.location || "",
    status: project.status,
    plannedAmount: project.plannedAmount || 0,
    donatedAmount: project.donatedAmount || 0,
    beneficiaries: project.beneficiaries || "",
    timeline: project.timeline || "",
    imageUrl: project.imageUrl || "",
    objectives: project.objectives || [],
    startDate: project.startDate,
    endDate: project.endDate || "",
  });

  setEditingId(project.id);
  setShowForm(true);
};

  const handleSelectImage = (image: { url: string } | null) => setFormData((current) => ({ ...current, imageUrl: image?.url || "" }));
  const resetForm = () => {
  setFormData({
    title: "",
    description: "",
    category: "",
    location: "",
    status: "ongoing",
    plannedAmount: 0,
    donatedAmount: 0,
    beneficiaries: "",
    timeline: "",
    imageUrl: "",
    objectives: [],
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
  });

  setEditingId(null);
  setShowForm(false);
};

  const handleLogout = async () => { try { const firebaseAuth = await import("firebase/auth"); const auth = firebaseAuth.getAuth(); await firebaseAuth.signOut(auth); } catch (error) { console.error(error); } router.push("/"); };

  if (loading || pageLoading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={dashStyles.page}>
      <div className={dashStyles.dashboard}>
        <DashboardSidebar onLogout={handleLogout} />
        <main className={dashStyles.main}>
        <div className={styles.statsGrid}>
  <div className={styles.statCard}>
    <div className={styles.statIcon}>🏗️</div>

    <div>
      <h3>{projects.length}</h3>
      <span>Total Projects</span>
    </div>
  </div>

  <div className={styles.statCard}>
    <div className={styles.statIcon}>💰</div>

    <div>
      <h3>
        $
        {projects
          .reduce(
            (total, project) =>
              total + (project.donatedAmount || 0),
            0
          )
          .toLocaleString()}
      </h3>
      <span>Total Funds Raised</span>
    </div>
  </div>

  <div className={styles.statCard}>
    <div className={styles.statIcon}>🚀</div>

    <div>
      <h3>
        {
          projects.filter(
            (project) => project.status === "future"
          ).length
        }
      </h3>
      <span>Future Projects</span>
    </div>
  </div>

  <div className={styles.statCard}>
    <div className={styles.statIcon}>✅</div>

    <div>
      <h3>
        {
          projects.filter(
            (project) => project.status === "completed"
          ).length
        }
      </h3>
      <span><h3>
  {Math.round(
    (projects.reduce(
      (sum, p) => sum + (p.donatedAmount || 0),
      0
    ) /
      Math.max(
        projects.reduce(
          (sum, p) => sum + (p.plannedAmount || 0),
          0
        ),
        1
      )) *
      100
  )}
  %
</h3>
<span>Funding Progress</span></span>
    </div>
  </div>
</div>
          <div className={styles.container}>
            <div className={styles.header}>
  <div>
    <h1>🏗️ Ministry Projects</h1>
    <p>
      Manage ongoing projects, future initiatives,
      donations, and community impact.
    </p>
  </div>

  <button
    className={styles.addBtn}
    onClick={() => setShowForm(!showForm)}
  >
    {showForm ? "✕ Cancel" : "+ Add Project"}
  </button>
</div>
            {showForm && (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}><label>Project Title *</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
                <div className={styles.formGroup}><label>Description *</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={4} /></div>
                <div className={styles.formRow}>
  <div className={styles.formGroup}>
    <label>Category</label>
    <input
      type="text"
      value={formData.category}
      onChange={(e) =>
        setFormData({
          ...formData,
          category: e.target.value,
        })
      }
    />
  </div>

  <div className={styles.formGroup}>
    <label>Location</label>
    <input
      type="text"
      value={formData.location}
      onChange={(e) =>
        setFormData({
          ...formData,
          location: e.target.value,
        })
      }
    />
  </div>
</div>

<div className={styles.formRow}>
  <div className={styles.formGroup}>
    <label>Planned Amount ($)</label>
    <input
      type="number"
      value={formData.plannedAmount}
      onChange={(e) =>
        setFormData({
          ...formData,
          plannedAmount: Number(e.target.value),
        })
      }
    />
  </div>

  <div className={styles.formGroup}>
    <label>Amount Raised ($)</label>
    <input
      type="number"
      value={formData.donatedAmount}
      onChange={(e) =>
        setFormData({
          ...formData,
          donatedAmount: Number(e.target.value),
        })
      }
    />
  </div>
</div>

<div className={styles.formRow}>
  <div className={styles.formGroup}>
    <label>Beneficiaries</label>
    <input
      type="text"
      value={formData.beneficiaries}
      onChange={(e) =>
        setFormData({
          ...formData,
          beneficiaries: e.target.value,
        })
      }
    />
  </div>

  <div className={styles.formGroup}>
    <label>Timeline</label>
    <input
      type="text"
      value={formData.timeline}
      onChange={(e) =>
        setFormData({
          ...formData,
          timeline: e.target.value,
        })
      }
      placeholder="January 2026 - December 2026"
    />
  </div>
</div><div className={styles.formRow}><div className={styles.formGroup}><label>Status *</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Project["status"] })} required><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="future">Planned</option></select></div>
                <div className={styles.formGroup}><label>Start Date *</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
                <div className={styles.formGroup}><label>End Date</label><input type="date" value={formData.endDate || ""} onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })} /></div></div>
                <div className={styles.formGroup}><label>Image URL</label><input type="text" value={formData.imageUrl || ""} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="Select an uploaded image or paste an image URL" /></div>
                <div className={styles.formGroup}><label>Choose from uploaded images</label><ImageUpload onSelectImage={handleSelectImage} initialSelectedUrl={formData.imageUrl || undefined} /></div>
                <button type="submit" className={styles.submitBtn}>{editingId ? "Update Project" : "Create Project"}</button>
              </form>
            )}
            <div className={styles.projectsList}>{projects.length === 0 ? <p className={styles.empty}>No projects yet. Create your first project!</p> : projects.map((p) => (
             <div key={p.id} className={styles.projectCard}>
  {p.imageUrl && (
    <img
      src={p.imageUrl}
      alt={p.title}
      className={styles.projectImage}
    />
  )}

  <div className={styles.projectInfo}>
    <div className={styles.projectHeader}>
      <h3>{p.title}</h3>

      <span className={`${styles.status} ${styles[p.status]}`}>
        {p.status}
      </span>
    </div>

    <p>{p.description}</p>

    <div className={styles.projectTags}>
      {p.category && (
        <span className={styles.tag}>
          📂 {p.category}
        </span>
      )}

      {p.location && (
        <span className={styles.tag}>
          📍 {p.location}
        </span>
      )}
    </div>

    <div className={styles.fundingSection}>
      <div className={styles.fundingHeader}>
        <span>
          Raised: $
          {Number(p.donatedAmount || 0).toLocaleString()}
        </span>

        <span>
          Goal: $
          {Number(p.plannedAmount || 0).toLocaleString()}
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${Math.min(
              ((p.donatedAmount || 0) /
                Math.max(p.plannedAmount || 1, 1)) *
                100,
              100
            )}%`,
          }}
        />
      </div>

      <div className={styles.progressText}>
        {Math.round(
          ((p.donatedAmount || 0) /
            Math.max(p.plannedAmount || 1, 1)) *
            100
        )}
        % Funded
      </div>
    </div>

    {p.timeline && (
      <div className={styles.projectExtra}>
        🗓️ {p.timeline}
      </div>
    )}

    {p.beneficiaries && (
      <div className={styles.projectExtra}>
        👨‍👩‍👧‍👦 {p.beneficiaries}
      </div>
    )}
  </div>

  <div className={styles.actions}>
    <button
      className={styles.editBtn}
      onClick={() => handleEdit(p)}
    >
      Edit
    </button>

    <button
      className={styles.deleteBtn}
      onClick={() => handleDelete(p.id!)}
    >
      Delete
    </button>
  </div>
</div>
            ))}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
