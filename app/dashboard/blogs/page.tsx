"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import ImageUpload from "@/app/components/ImageUpload/ImageUpload";
import { DashboardLoading } from "@/app/dashboard/loading";
import {
  BlogPost,
  createBlog,
  deleteBlog,
  getAllBlogs,
  updateBlog,
} from "@/app/lib/firebase/firestore";
import styles from "./blogs.module.css";
import dashStyles from "@/app/dashboard/dashboard.module.css";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";

export default function DashboardBlogsPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [blogs, setBlogs] = useState<(BlogPost & { id: string })[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BlogPost>({
    title: "",
    content: "",
    author: "",
    branch: "",
    date: new Date().toISOString().split("T")[0],
    category: "General",
    imageUrl: "",
    featured: false,
  });

  const loadBranches = useCallback(async () => {
    setLoadingBranches(true);
    try {
      const fsConfig = await import("@/app/lib/firebase/config");
      const db = fsConfig.db;
      if (!db) {
        setBranches([]);
        return;
      }

      const { collection, getDocs } = await import("firebase/firestore");
      const snapshot = await getDocs(collection(db, "users"));
      const nextBranches = Array.from(
        new Set(
          snapshot.docs
            .map((document) => String(document.data()?.branchLocation || "").trim())
            .filter(Boolean),
        ),
      ).sort();
      setBranches(nextBranches);
    } catch (error) {
      console.error("Error loading branch list:", error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  }, []);

  const fetchBlogs = useCallback(async () => {
    setLoadingBlogs(true);
    try {
      const fetchedBlogs = await getAllBlogs();
      setBlogs(fetchedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoadingBlogs(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && user) {
      void loadBranches();
      void fetchBlogs();
    }
  }, [loading, user, fetchBlogs, loadBranches]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (editingId) {
        await updateBlog(editingId, formData);
      } else {
        await createBlog(formData);
      }

      await fetchBlogs();
      resetForm();
      alert(editingId ? "Blog updated successfully." : "Blog created successfully.");
    } catch (error) {
      console.error("Error saving blog:", error);
      alert(error instanceof Error ? error.message : "Unable to save the blog.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      await deleteBlog(id);
      await fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleEdit = (blog: BlogPost & { id: string }) => {
    setFormData({
      ...blog,
      branch: blog.branch || "",
      imageUrl: blog.imageUrl || "",
      featured: Boolean(blog.featured),
    });
    setEditingId(blog.id);
    setShowForm(true);
  };

  const handleSelectImage = useCallback((image: { url: string } | null) => {
    setFormData((current) => {
      const nextImageUrl = image?.url || "";
      return current.imageUrl === nextImageUrl ? current : { ...current, imageUrl: nextImageUrl };
    });
  }, []);

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      author: "",
      branch: "",
      date: new Date().toISOString().split("T")[0],
      category: "General",
      imageUrl: "",
      featured: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleLogout = async () => {
    try {
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (e) {
      console.error("Logout error:", e);
    }
    router.push("/");
  };

  if (loading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={dashStyles.page}>
      <div className={dashStyles.dashboard}>
        <DashboardSidebar onLogout={handleLogout} />

        <main className={dashStyles.main}>
          <div className={styles.container}>
            <div className={styles.header}>
              <div>
                <p className={styles.kicker}>Dashboard / Blogs</p>
                <h1>📝 Manage Blogs</h1>
                <p className={styles.description}>Create, edit, and organize blog posts from the dashboard.</p>
              </div>
              <button className={styles.addBtn} onClick={() => setShowForm((current) => !current)}>
                {showForm ? "Cancel" : "+ Add Blog"}
              </button>
            </div>

            {showForm && (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={8}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Author *</label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Branch / Leadership Link</label>
                    <select
                      value={formData.branch || ""}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      required
                    >
                      <option value="">Select related branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                    <div className={styles.hint}>
                      Select the branch associated with this blog from existing leadership branches.
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Image URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Select an uploaded image or paste an image URL"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Choose from uploaded images</label>
                  <ImageUpload onSelectImage={handleSelectImage} initialSelectedUrl={formData.imageUrl || undefined} />
                </div>

                {formData.imageUrl ? (
                  <div className={styles.previewWrap}>
                    <span className={styles.previewLabel}>Current image preview</span>
                    <div className={styles.previewImage}>
                      <Image src={formData.imageUrl} alt={formData.title || "Selected blog image"} fill sizes="100vw" />
                    </div>
                  </div>
                ) : null}

                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    Featured Post
                  </label>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  {editingId ? "Update Blog" : "Create Blog"}
                </button>
              </form>
            )}

            <div className={styles.blogsList}>
              {loadingBlogs ? (
                <p className={styles.empty}>Loading blogs...</p>
              ) : blogs.length === 0 ? (
                <p className={styles.empty}>No blogs yet. Create your first blog!</p>
              ) : (
                blogs.map((blog) => (
                  <div key={blog.id} className={styles.blogCard}>
                    <div className={styles.blogInfo}>
                      <h3>{blog.title}</h3>
                      <p>{blog.content.substring(0, 140)}{blog.content.length > 140 ? "..." : ""}</p>
                      <div className={styles.blogMeta}>
                        <span>By {blog.author}</span>
                        <span>{blog.category}</span>
                        <span>{blog.date}</span>
                        {blog.featured && <span className={styles.featured}>⭐ Featured</span>}
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <button type="button" className={styles.editBtn} onClick={() => handleEdit(blog)}>
                        Edit
                      </button>
                      <button type="button" className={styles.deleteBtn} onClick={() => handleDelete(blog.id!)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
