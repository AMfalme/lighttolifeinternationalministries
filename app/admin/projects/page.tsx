"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLoading } from "@/app/dashboard/loading";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  Project,
} from "@/app/lib/firebase/firestore";
import styles from "./projects.module.css";

export default function AdminProjectsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<(Project & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Project>({
    title: "",
    description: "",
    status: "ongoing",
    startDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        await import("@/app/lib/firebase/config");
        const firebaseAuth = await import("firebase/auth");
        const auth = firebaseAuth.getAuth();
        unsub = firebaseAuth.onAuthStateChanged(auth, (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
          } else {
            router.push("/login");
          }
          setLoading(false);
        });
      } catch (e) {
        console.error("AdminProjects auth init error:", e);
        setLoading(false);
      }
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [router]);

  useEffect(() => {
    if (!loading && user) {
      fetchProjects();
    }
  }, [loading, user]);

  const fetchProjects = async () => {
    try {
      const fetchedProjects = await getAllProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProject(editingId, formData);
      } else {
        await createProject(formData);
      }
      fetchProjects();
      resetForm();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProject(id);
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const handleEdit = (project: Project & { id: string }) => {
    setFormData(project);
    setEditingId(project.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "ongoing",
      startDate: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🏗️ Manage Projects</h1>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancel" : "+ Add Project"}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Project Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                required
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="planned">Planned</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value || undefined })
                }
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn}>
            {editingId ? "Update Project" : "Create Project"}
          </button>
        </form>
      )}

      <div className={styles.projectsList}>
        {projects.length === 0 ? (
          <p className={styles.empty}>No projects yet. Create your first project!</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectInfo}>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className={styles.projectMeta}>
                  <span className={`${styles.status} ${styles[project.status]}`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                  <span>📅 {project.startDate}</span>
                  {project.endDate && <span>✓ {project.endDate}</span>}
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(project)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(project.id!)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
