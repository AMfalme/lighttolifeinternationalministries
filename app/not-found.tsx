import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.illustration}>
          <span className={styles.emoji} role="img" aria-label="searching">
            🔍
          </span>
        </div>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page Not Found</h2>
        <p className={styles.description}>
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.homeButton}>
            ← Go Back Home
          </Link>
          <Link href="/dashboard" className={styles.dashboardButton}>
            Visit Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
