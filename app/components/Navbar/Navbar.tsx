"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: "Leadership",
        href: "/#about",
        subItems: [
          { label: "Main Branch", href: "/team/mosocho" },
          { label: "Nyanchwa Branch", href: "/team/nyanchwa" },
          { label: "Omogwa Branch", href: "/team/omogwa" },
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

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current) return;
      if (!(event.target instanceof Node)) return;
      if (!profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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
            <>
              <Link className={styles.authLink} href="/dashboard" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
              <Link className={styles.authLink} href="/dashboard/profile" onClick={() => setIsOpen(false)}>
                Profile
              </Link>
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
            </>
          ) : null}
          <Link className={styles.navButton} href="/donate" onClick={() => setIsOpen(false)}>Support Us</Link>
        </div>
      </nav>

      <div className={styles.navActions} ref={profileMenuRef}>
        {!authLoading && !user ? (
          <>
            <Link className={styles.authLink} href="/login">Login</Link>
            <Link className={styles.authLink} href="/register">Register</Link>
            <Link className={styles.navButton} href="/donate">Support Us</Link>
          </>
        ) : !authLoading && user ? (
          <>
            <button
              type="button"
              className={styles.profileTrigger}
              aria-expanded={profileMenuOpen}
              aria-label="Open account menu"
              onClick={() => setProfileMenuOpen((open) => !open)}
            >
              <span className={styles.profileTriggerAvatar} aria-hidden>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" />
                ) : (
                  <span>{(user?.displayName || user?.email || "M").slice(0, 1).toUpperCase()}</span>
                )}
              </span>
            </button>

            {profileMenuOpen ? (
              <div className={styles.profileMenu} role="menu" aria-label="Account menu">
                <div className={styles.profileMenuSection}>
                  <span className={styles.profileMenuLabel}>Theme</span>
                  <div className={styles.themeToggleGroup} role="radiogroup" aria-label="Theme">
                    {(["light", "dark"] as Theme[]).map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`${styles.themeBtn} ${theme === option ? styles.active : ""}`}
                        onClick={() => {
                          setTheme(option);
                          applyTheme(option);
                          setProfileMenuOpen(false);
                        }}
                      >
                        {option === "light" ? "☀️ Light" : "🌙 Dark"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.profileMenuSection}>
                  <span className={styles.profileMenuLabel}>Account</span>
                  <Link className={styles.profileMenuLink} href="/dashboard" onClick={() => setProfileMenuOpen(false)}>Dashboard</Link>
                  <Link className={styles.profileMenuLink} href="/dashboard/profile" onClick={() => setProfileMenuOpen(false)}>Profile</Link>
                  <button
                    type="button"
                    className={styles.profileMenuDanger}
                    onClick={async () => {
                      try {
                        await import("@/app/lib/firebase/config");
                        const firebaseAuth = await import("firebase/auth");
                        const auth = firebaseAuth.getAuth();
                        await firebaseAuth.signOut(auth);
                      } catch (e) {
                        console.error("Navbar logout error:", e);
                      }
                      setProfileMenuOpen(false);
                      router.push("/");
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </header>
  );
}
