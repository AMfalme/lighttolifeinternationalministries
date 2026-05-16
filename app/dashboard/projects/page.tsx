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
import styles from "@/app/admin/projects/projects.module.css";
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
    status: "ongoing",
    startDate: new Date().toISOString().split("T")[0],
    imageUrl: "",
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
    setFormData({ ...project, imageUrl: project.imageUrl || "" });
    setEditingId(project.id);
    setShowForm(true);
  };

  const handleSelectImage = (image: { url: string } | null) => setFormData((current) => ({ ...current, imageUrl: image?.url || "" }));
  const resetForm = () => { setFormData({ title: "", description: "", status: "ongoing", startDate: new Date().toISOString().split("T")[0], imageUrl: "" }); setEditingId(null); setShowForm(false); };

  const handleLogout = async () => { try { const firebaseAuth = await import("firebase/auth"); const auth = firebaseAuth.getAuth(); await firebaseAuth.signOut(auth); } catch (error) { console.error(error); } router.push("/"); };

  if (loading || pageLoading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={dashStyles.page}>
      <div className={dashStyles.dashboard}>
        <DashboardSidebar onLogout={handleLogout} />
        <main className={dashStyles.main}>
          <div className={styles.container}>
            <div className={styles.header}><h1>🏗️ Manage Projects</h1><button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "+ Add Project"}</button></div>
            {showForm && (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}><label>Project Title *</label><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
                <div className={styles.formGroup}><label>Description *</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={4} /></div>
                <div className={styles.formRow}><div className={styles.formGroup}><label>Status *</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} required><option value="ongoing">Ongoing</option><option value="completed">Completed</option><option value="planned">Planned</option></select></div>
                <div className={styles.formGroup}><label>Start Date *</label><input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required /></div>
                <div className={styles.formGroup}><label>End Date</label><input type="date" value={formData.endDate || ""} onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })} /></div></div>
                <div className={styles.formGroup}><label>Image URL</label><input type="text" value={formData.imageUrl || ""} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="Select an uploaded image or paste an image URL" /></div>
                <div className={styles.formGroup}><label>Choose from uploaded images</label><ImageUpload onSelectImage={handleSelectImage} initialSelectedUrl={formData.imageUrl || undefined} /></div>
                <button type="submit" className={styles.submitBtn}>{editingId ? "Update Project" : "Create Project"}</button>
              </form>
            )}
            <div className={styles.projectsList}>{projects.length === 0 ? <p className={styles.empty}>No projects yet. Create your first project!</p> : projects.map((p) => (
              <div key={p.id} className={styles.projectCard}><div className={styles.projectInfo}><h3>{p.title}</h3><p>{p.description}</p><div className={styles.projectMeta}><span className={`${styles.status} ${styles[p.status]}`}>{p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span><span>📅 {p.startDate}</span>{p.endDate && <span>✓ {p.endDate}</span>}</div></div><div className={styles.actions}><button className={styles.editBtn} onClick={() => handleEdit(p)}>Edit</button><button className={styles.deleteBtn} onClick={() => handleDelete(p.id!)}>Delete</button></div></div>
            ))}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
