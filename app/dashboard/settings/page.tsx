"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLoading } from "../loading";
import { applyTheme, getStoredTheme, type Theme } from "@/app/lib/theme";
import { DEFAULT_DONATION_NUMBER, getDonationNumber, setDonationNumber as saveDonationNumber } from "@/app/lib/firebase/firestore";
import styles from "../dashboard.module.css";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");
  const [donationNumber, setDonationNumber] = useState(DEFAULT_DONATION_NUMBER);
  const [savedDonationNumber, setSavedDonationNumber] = useState(DEFAULT_DONATION_NUMBER);

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        await import("@/app/lib/firebase/config");
        const firebaseAuth = await import("firebase/auth");
        const auth = firebaseAuth.getAuth();
        unsub = firebaseAuth.onAuthStateChanged(auth, (user) => {
          if (user) {
            setUser(user);
          } else {
            router.push("/login");
          }
          setLoading(false);
        });
      } catch (e) {
        console.error("Settings auth init error:", e);
        setLoading(false);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [router]);

  useEffect(() => {
    const savedTheme = getStoredTheme();
    setTheme(savedTheme);
    applyTheme(savedTheme);
    (async () => {
      const currentDonationNumber = await getDonationNumber();
      setDonationNumber(currentDonationNumber);
      setSavedDonationNumber(currentDonationNumber);
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await import("@/app/lib/firebase/config");
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (e) {
      console.error("Settings logout error:", e);
    }
    router.push("/");
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleDonationSave = () => {
    (async () => {
      const nextNumber = await saveDonationNumber(donationNumber);
      setDonationNumber(nextNumber);
      setSavedDonationNumber(nextNumber);
      window.dispatchEvent(new CustomEvent("donationnumberchange", { detail: nextNumber }));
    })();
  };

  if (loading) return <DashboardLoading />;
  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.dashboard}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <Image
              src="/logo.jpeg"
              alt="Light to Life Logo"
              width={160}
              height={76}
              className={styles.logo}
              priority
            />
          </div>
          <nav className={styles.sidebarNav}>
            <ul>
              <li><a href="/dashboard/profile" className={styles.navLink}>👤 Profile</a></li>
              <li><a href="/admin/blogs" className={styles.navLink}>📝 Manage Blogs</a></li>
              <li><a href="/admin/events" className={styles.navLink}>📅 Manage Events</a></li>
              <li><a href="/admin/projects" className={styles.navLink}>🏗️ Manage Projects</a></li>
            </ul>
          </nav>
          <div className={styles.sidebarFooter}>
            <ul>
              <li><a href="/dashboard/settings" className={styles.navLink}>⚙️ Settings</a></li>
              <li>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  🚪 Logout
                </button>
              </li>
            </ul>
          </div>
        </aside>
        <main className={styles.main}>
          <header className={styles.header}>
            <div>
              <h1>⚙️ Settings</h1>
              <p>Manage your dashboard preferences</p>
            </div>
          </header>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Theme Preferences</h2>
              <p className={styles.sectionSubtitle}>Choose your preferred color scheme</p>
            </div>
            <div className={styles.settingsContent}>
              <div className={styles.settingItem}>
                <div>
                  <h4>Light Mode</h4>
                  <p>Easy on the eyes during daytime</p>
                </div>
                <button
                  className={`${styles.themeBtn} ${theme === "light" ? styles.active : ""}`}
                  onClick={() => handleThemeChange("light")}
                >
                  {theme === "light" ? "✓ Active" : "Select"}
                </button>
              </div>
              <div className={styles.settingItem}>
                <div>
                  <h4>Dark Mode</h4>
                  <p>Reduces eye strain in low light environments</p>
                </div>
                <button
                  className={`${styles.themeBtn} ${theme === "dark" ? styles.active : ""}`}
                  onClick={() => handleThemeChange("dark")}
                >
                  {theme === "dark" ? "✓ Active" : "Select"}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Account</h2>
              <p className={styles.sectionSubtitle}>Account management options</p>
            </div>
            <div className={styles.settingsContent}>
              <div className={styles.settingItem}>
                <div>
                  <h4>Logged in as</h4>
                  <p>{user.email}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Donations</h2>
              <p className={styles.sectionSubtitle}>Update the trial M-Pesa number shown on the donation page</p>
            </div>
            <div className={styles.settingsContent}>
              <div className={styles.settingItem} style={{ alignItems: "flex-start" }}>
                <div style={{ width: "100%" }}>
                  <h4>M-Pesa Number</h4>
                  <p>Current saved number: {savedDonationNumber}</p>
                  <input
                    type="text"
                    value={donationNumber}
                    onChange={(e) => setDonationNumber(e.target.value)}
                    placeholder={DEFAULT_DONATION_NUMBER}
                    style={{
                      marginTop: 12,
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: "1px solid var(--surface-border)",
                      background: "var(--surface)",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
                <button type="button" className={`${styles.themeBtn} ${styles.active}`} onClick={handleDonationSave}>
                  Save Number
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
