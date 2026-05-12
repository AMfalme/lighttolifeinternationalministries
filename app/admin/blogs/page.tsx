"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLoading } from "@/app/dashboard/loading";
import {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  BlogPost,
} from "@/app/lib/firebase/firestore";
import styles from "./blogs.module.css";

export default function AdminBlogsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [blogs, setBlogs] = useState<(BlogPost & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BlogPost>({
    title: "",
    content: "",
    author: "",
    date: new Date().toISOString().split("T")[0],
    category: "General",
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
        console.error("AdminBlogs auth init error:", e);
        setLoading(false);
      }
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [router]);

  useEffect(() => {
    if (!loading && user) {
      fetchBlogs();
    }
  }, [loading, user]);

  const fetchBlogs = async () => {
    try {
      const fetchedBlogs = await getAllBlogs();
      setBlogs(fetchedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateBlog(editingId, formData);
      } else {
        await createBlog(formData);
      }
      fetchBlogs();
      resetForm();
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      try {
        await deleteBlog(id);
        fetchBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  const handleEdit = (blog: BlogPost & { id: string }) => {
    setFormData(blog);
    setEditingId(blog.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      author: "",
      date: new Date().toISOString().split("T")[0],
      category: "General",
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📝 Manage Blogs</h1>
        <button
          className={styles.addBtn}
          onClick={() => setShowForm(!showForm)}
        >
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
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              required
              rows={6}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Author *</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Category *</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.featured || false}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
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
        {blogs.length === 0 ? (
          <p className={styles.empty}>No blogs yet. Create your first blog!</p>
        ) : (
          blogs.map((blog) => (
            <div key={blog.id} className={styles.blogCard}>
              <div className={styles.blogInfo}>
                <h3>{blog.title}</h3>
                <p>{blog.content.substring(0, 100)}...</p>
                <div className={styles.blogMeta}>
                  <span>By {blog.author}</span>
                  <span>{blog.category}</span>
                  <span>{blog.date}</span>
                  {blog.featured && <span className={styles.featured}>⭐ Featured</span>}
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(blog)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(blog.id!)}
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
