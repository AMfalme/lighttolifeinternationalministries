"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../../components/Navbar/Navbar";
import { getBlogById, BlogPost } from "../../lib/firebase/firestore";
import styles from "../news.module.css";

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  const [blog, setBlog] = useState<(BlogPost & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      const fetchedBlog = await getBlogById(params.id);
      setBlog(fetchedBlog);
      setLoading(false);
    };

    if (params.id) {
      void loadBlog();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.container}>Loading blog...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <section className={styles.sectionContainer}>
            <div className={styles.blogDetail}>
              <h1 className={styles.blogTitle}>Blog not found</h1>
              <p className={styles.blogExcerpt}>
                The requested blog could not be found. It may have been deleted or the link is incorrect.
              </p>
              <Link href="/news" className={styles.readMore}>
                Back to news
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.sectionContainer}>
          <div className={styles.blogDetail}>
            <Link href="/news" className={styles.readMore}>
              ← Back to news
            </Link>
            <div className={styles.detailImage}>
              {blog.imageUrl ? (
                <Image
                  src={blog.imageUrl}
                  alt={blog.title}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className={styles.imagePlaceholder}>Featured Image</div>
              )}
            </div>
            <div className={styles.detailHeader}>
              <span className={styles.blogDate}>{blog.date}</span>
              <h1 className={styles.blogTitle}>{blog.title}</h1>
              <div className={styles.blogMeta}>
                <span>{blog.author}</span>
                <span>{blog.category}</span>
                {blog.branch ? <span>{blog.branch}</span> : null}
              </div>
            </div>
            <div className={styles.detailContent}>
              <p>{blog.content}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
