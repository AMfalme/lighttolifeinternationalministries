"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { applyTheme, getStoredTheme, type Theme } from "@/app/lib/theme";
import styles from "./navbar.module.css";

type NavItem = {
  label: string;
  href: string;
  subItems: Array<{
    label: string;
    href: string;
  }>;
};

export default function Navbar() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: "About Us",
        href: "/#about",
        subItems: [
          { label: "Mission", href: "/#features" },
          { label: "About", href: "/#about" },
          { label: "Team", href: "/#leadership" },
        ],
      },
      {
        label: "Events",
        href: "/events",
        subItems: [
          { label: "Calendar", href: "/events#calendar" },
          { label: "Upcoming", href: "/events#upcoming" },
        ],
      },
      {
        label: "Projects",
        href: "/projects",
        subItems: [
          { label: "Ongoing", href: "/projects#ongoing" },
          { label: "Partners", href: "/projects#partners" },
        ],
      },
      {
        label: "News",
        href: "/news",
        subItems: [
          { label: "Blog", href: "/news#blog" },
          { label: "Highlights", href: "/news#highlights" },
          { label: "Gallery", href: "/news#gallery" },
        ],
      },
    ],
    [],
  );

  useEffect(() => {
    let unsub: any = null;
    (async () => {
      try {
        await import("@/app/lib/firebase/config");
        const firebaseAuth = await import("firebase/auth");
        const auth = firebaseAuth.getAuth();
        unsub = firebaseAuth.onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthLoading(false);
        });
      } catch (e) {
        console.error("Navbar auth init error:", e);
        setAuthLoading(false);
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  useEffect(() => {
    const initialTheme = getStoredTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const updateViewportState = () => {
      setIsMobile(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setActiveSubmenu(null);
        setIsOpen(false);
      }
    };

    updateViewportState();
    mediaQuery.addEventListener("change", updateViewportState);

    return () => mediaQuery.removeEventListener("change", updateViewportState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 4);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleThemeChange = (event: Event) => {
      const nextTheme = (event as CustomEvent<Theme>).detail;
      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme(nextTheme);
      }
    };

    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleTopLevelClick = (item: NavItem, event: MouseEvent<HTMLAnchorElement>) => {
    if (!item.subItems.length || !isMobile) {
      setIsOpen(false);
      setActiveSubmenu(null);
      return;
    }

    event.preventDefault();
    setActiveSubmenu((current) => (current === item.label ? null : item.label));
  };

  return (
    <header className={`${styles.navbar} ${isScrolled ? styles.navbarScrolled : ""}`}>
      <Link className={styles.brand} href="/">
        <Image src="/logo.jpeg" alt="LightToLife" width={180} height={86} priority />
      </Link>

      <button
        className={styles.hamburger}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
        <span className={styles.hamburgerLine}></span>
      </button>

      <nav className={`${styles.navLinks} ${isOpen ? styles.navLinksOpen : ""}`} aria-label="Primary navigation">
        {navItems.map((item) => (
          <div key={item.label} className={styles.navItem}>
            <Link className={styles.navLink} href={item.href} onClick={(event) => handleTopLevelClick(item, event)}>
              {item.label}
            </Link>
            <ul className={`${styles.navSub} ${activeSubmenu === item.label ? styles.navSubOpen : ""}`} aria-label={`${item.label} sub-menu`}>
              {item.subItems.map((subItem) => (
                <li key={subItem.href}>
                  <Link href={subItem.href} onClick={() => {
                    setIsOpen(false);
                    setActiveSubmenu(null);
                  }}>
                    {subItem.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className={styles.navMobileActions}>
          {!authLoading && !user ? (
            <>
              <Link className={styles.authLink} href="/login" onClick={() => setIsOpen(false)}>Login</Link>
              <Link className={styles.authLink} href="/register" onClick={() => setIsOpen(false)}>Register</Link>
            </>
          ) : !authLoading && user ? (
            <button
              className={styles.authLink}
              onClick={async () => {
                try {
                  await import("@/app/lib/firebase/config");
                  const firebaseAuth = await import("firebase/auth");
                  const auth = firebaseAuth.getAuth();
                  await firebaseAuth.signOut(auth);
                } catch (e) {
                  console.error("Navbar logout error:", e);
                }
                setIsOpen(false);
                router.push("/");
              }}
            >
              Logout
            </button>
          ) : null}
          <Link className={styles.navButton} href="/donate" onClick={() => setIsOpen(false)}>Support Us</Link>
        </div>
      </nav>

      <div className={styles.navActions}>
        {!authLoading && !user ? (
          <>
            <Link className={styles.authLink} href="/login">Login</Link>
            <Link className={styles.authLink} href="/register">Register</Link>
          </>
        ) : !authLoading && user ? (
          <Link className={styles.authLink} href="/dashboard">Dashboard</Link>
        ) : null}
        <Link className={styles.navButton} href="/donate">Support Us</Link>

        {user && !authLoading && (
          <button
            className={styles.authLink}
            onClick={async () => {
              try {
                await import("@/app/lib/firebase/config");
                const firebaseAuth = await import("firebase/auth");
                const auth = firebaseAuth.getAuth();
                await firebaseAuth.signOut(auth);
              } catch (e) {
                console.error("Navbar logout error:", e);
              }
              router.push("/");
            }}
          >
            Logout
          </button>
        )}
        <label className={styles.switch}>
          <input
            type="checkbox"
            className={styles.switchInput}
            checked={theme === "dark"}
            onChange={() => {
              const nextTheme: Theme = theme === "light" ? "dark" : "light";
              setTheme(nextTheme);
              applyTheme(nextTheme);
            }}
            aria-label={theme === "light" ? "Enable dark theme" : "Enable light theme"}
          />
          <span className={styles.switchSlider}>
            <span className={`${styles.switchIcon} ${styles.sunIcon}`} aria-hidden="true">☀</span>
            <span className={`${styles.switchIcon} ${styles.moonIcon}`} aria-hidden="true">☾</span>
          </span>
        </label>
      </div>
    </header>
  );
}
