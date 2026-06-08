"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar/Navbar";
import { getAllBlogs, BlogPost } from "../lib/firebase/firestore";
import styles from "./blog.module.css";

// Placeholder blogs for initial display
const PLACEHOLDER_BLOGS: (BlogPost & { id: string })[] = [
  {
    id: "1",
    title: "How We're Making a Difference in Education",
    content: "Exploring our latest initiatives in student sponsorship and educational outreach across multiple nations.",
    author: "Bishop Francis Akaki",
    date: "May 10, 2026",
    category: "Education",
    featured: true,
  },
  {
    id: "2",
    title: "Monthly Volunteer Spotlight",
    content: "Celebrating the amazing work our volunteers are doing in their local communities.",
    author: "Pastor Charles Maisiba",
    date: "May 5, 2026",
    category: "Community",
    featured: true,
  },
  {
    id: "3",
    title: "New Mission Project Launched",
    content: "We're excited to announce the launch of our new healthcare initiative in East Africa.",
    author: "Pastor Nicholas Nyarongo",
    date: "April 28, 2026",
    category: "Missions",
  },
];

export default function BlogPage() {
  const [blogs, setBlogs] = useState<(BlogPost & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const fetchedBlogs = await getAllBlogs();
        if (fetchedBlogs.length > 0) {
          setBlogs([...fetchedBlogs, ...PLACEHOLDER_BLOGS]);
        } else {
          setBlogs(PLACEHOLDER_BLOGS as (BlogPost & { id: string })[]);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogs(PLACEHOLDER_BLOGS as (BlogPost & { id: string })[]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const categories = ["All", ...new Set(blogs.map((b) => b.category))];
  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs.filter((b) => b.category === selectedCategory);
  const featuredBlogs = blogs.filter((b) => b.featured);

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>OUR STORIES</span>
            <h1>Light to Life Blog</h1>
            <p>Updates, insights, and stories from our ministry around the world</p>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredBlogs.length > 0 && (
          <section className={styles.featured}>
            <div className={styles.container}>
              <h2>Featured Stories</h2>
              <div className={styles.featuredGrid}>
                {featuredBlogs.map((blog) => (
                  <article key={blog.id} className={styles.featuredCard}>
                    <div className={styles.featuredImage}>
                      <div className={styles.imagePlaceholder}>📰</div>
                    </div>
                    <div className={styles.featuredContent}>
                      <span className={styles.category}>{blog.category}</span>
                      <h3>{blog.title}</h3>
                      <p>{blog.content}</p>
                      <div className={styles.meta}>
                        <span>{blog.author}</span>
                        <span>{blog.date}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Filter & Posts */}
        <section className={styles.posts}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h2>All Articles</h2>
              <div className={styles.filters}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`${styles.filterBtn} ${selectedCategory === cat ? styles.active : ""}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.postsGrid}>
              {filteredBlogs.map((blog) => (
                <article key={blog.id} className={styles.postCard}>
                  <div className={styles.postImage}>
                    <div className={styles.imagePlaceholder}>📝</div>
                  </div>
                  <div className={styles.postContent}>
                    <span className={styles.category}>{blog.category}</span>
                    <h3>{blog.title}</h3>
                    <p>{blog.content}</p>
                    <div className={styles.postMeta}>
                      <span className={styles.author}>{blog.author}</span>
                      <span className={styles.date}>{blog.date}</span>
                    </div>
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
