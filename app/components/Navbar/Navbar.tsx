"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { applyTheme, getStoredTheme, type Theme } from "@/app/lib/theme";
import styles from "./navbar.module.css";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

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
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState("5000");
  const [donateEmail, setDonateEmail] = useState("");
  const [donateStatusMessage, setDonateStatusMessage] = useState("");
  const [donateSuccessMessage, setDonateSuccessMessage] = useState("");
  const [isPaystackReady, setIsPaystackReady] = useState(false);
  const [isPaystackProcessing, setIsPaystackProcessing] = useState(false);
  const [donateCurrency, setDonateCurrency] = useState("KES");
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  const navItems = useMemo<NavItem[]>(
    () => [
      {
        label: "Home",
        href: "/",
        subItems: [],
      },
      {
        label: "About Us",
        href: "/#about",
        subItems: [
          { label: "Mission", href: "/#features" },
          { label: "About", href: "/#about" },
          { label: "Team", href: "/team" },
          {
        label: "Projects & Future projections",
        href: "/projects",
        
      },
        ],
      },
      {
        label: "Our Branches",
        href: "/branch/east-africa-main-church-headquarters",
        subItems: [
          { label: "East Africa - Main Church Headquarters", href: "/branch/east-africa-main-church-headquarters" },
          { label: "Kisumu", href: "/branch/kisumu" },
          { label: "Nakuru", href: "/branch/nakuru" },
        ],
      },
      
      {
        label: "Missions",
        href: "/#features",
        subItems: [],
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
    if (isOpen || isDonateModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isDonateModalOpen]);

  useEffect(() => {
    if (user?.email) {
      setDonateEmail(user.email);
    }
  }, [user]);

  // Listen for custom "openDonateModal" event from other components
  useEffect(() => {
    const handler = () => setIsDonateModalOpen(true);
    window.addEventListener("openDonateModal", handler);
    return () => window.removeEventListener("openDonateModal", handler);
  }, []);

  useEffect(() => {
    if (!isDonateModalOpen || !paystackPublicKey || typeof window === "undefined") {
      return;
    }

    if (window.PaystackPop) {
      setIsPaystackReady(true);
      return;
    }

    let cancelled = false;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      if (!cancelled) {
        setIsPaystackReady(true);
      }
    };
    script.onerror = () => {
      if (!cancelled) {
        setDonateStatusMessage("Unable to load the Paystack checkout script. Please check your internet connection or browser settings.");
        setIsPaystackReady(false);
      }
    };
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isDonateModalOpen, paystackPublicKey]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!profileMenuRef.current) return;
      if (!(event.target instanceof Node)) return;
      if (!profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setIsDonateModalOpen(false);
      }
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

  const handleDonateSubmit = async () => {
    setDonateStatusMessage("");
    setDonateSuccessMessage("");

    const donationValue = Number(donateAmount.replace(/[^0-9.]/g, ""));
    if (!donationValue || donationValue <= 0) {
      setDonateStatusMessage("Please enter a valid donation amount.");
      return;
    }

    if (!donateEmail.trim()) {
      setDonateStatusMessage("Please enter your email address.");
      return;
    }

    if (!paystackPublicKey) {
      setDonateStatusMessage("Paystack is not configured. Please add a public key.");
      return;
    }

    if (!window.PaystackPop) {
      setDonateStatusMessage("Paystack checkout is not available yet. Please wait a moment and try again.");
      return;
    }

    setIsPaystackProcessing(true);

    try {
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: donateEmail.trim(),
        amount: Math.round(donationValue * 100),
        currency: donateCurrency,
        channels: ["card", "bank", "ussd"],
        onClose: function () {
          setIsPaystackProcessing(false);
          setDonateStatusMessage("Payment window closed. You can try again anytime.");
        },
        callback: function (response: { reference: string }) {
          void (async () => {
            try {
              const verifyResponse = await fetch(
                `/api/paystack/verify?reference=${encodeURIComponent(response.reference)}`
              );
              const payload = await verifyResponse.json();

              if (!verifyResponse.ok) {
                setDonateStatusMessage(payload?.error || "Payment completed but verification failed.");
                setIsPaystackProcessing(false);
                return;
              }

              setDonateSuccessMessage(`Payment confirmed: ${payload?.data?.status || "successful"}. Reference: ${response.reference}`);
            } catch (error) {
              setDonateStatusMessage("Payment completed but verification request failed.");
            } finally {
              setIsPaystackProcessing(false);
            }
          })();
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error("Navbar donation error:", error);
      setDonateStatusMessage(`Unable to start Paystack checkout. ${error instanceof Error ? error.message : "Please try again later."}`);
      setIsPaystackProcessing(false);
    }
  };

  return (
    <>
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

        {/* Desktop Navigation */}
        <nav className="hidden gap-10 text-sm font-medium lg:flex text-amber-400" aria-label="Primary navigation">
        {navItems.map((item, index) => (
          <div key={item.label} className="group relative">
            <Link 
              href={item.href} 
              onClick={(event) => handleTopLevelClick(item, event)}
              className={`hover:text-amber-400 transition flex items-center gap-1 ${index === 0 ? 'text-amber-400' : ''}`}
            >
              {item.label}
              {item.subItems.length > 0 && <span className="text-xs">▼</span>}
            </Link>
            {item.subItems.length > 0 && (
              <div className="absolute left-0 top-full hidden pt-2 group-hover:block">
                <div className="flex flex-col gap-2 rounded-lg bg-black/90 p-4 min-w-max shadow-lg border border-amber-400/30 text-amber-400">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={() => {
                        setIsOpen(false);
                        setActiveSubmenu(null);
                      }}
                      className="hover:text-amber-400 transition text-sm py-1"
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="lg:hidden absolute top-20 left-0 right-0 bg-black/95 border-b border-amber-400/30 p-4" aria-label="Mobile navigation">
          <div className="flex flex-col gap-4 text-sm font-medium text-amber-400">
            {navItems.map((item, index) => (
              <div key={item.label}>
                <Link 
                  href={item.href} 
                  onClick={(event) => handleTopLevelClick(item, event)}
                  className={`hover:text-amber-400 transition flex items-center gap-1 ${index === 0 ? 'text-amber-400' : ''}`}
                >
                  {item.label}
                  {item.subItems.length > 0 && <span className="text-xs">▼</span>}
                </Link>
                {item.subItems.length > 0 && activeSubmenu === item.label && (
                  <div className="flex flex-col gap-2 mt-2 ml-4 pl-4 border-l border-amber-400/30">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => {
                          setIsOpen(false);
                          setActiveSubmenu(null);
                        }}
                        className="hover:text-amber-400 transition text-xs py-1"
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!authLoading && !user ? (
              <>
                <Link className="hover:text-amber-400 transition" href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                <Link className="hover:text-amber-400 transition" href="/register" onClick={() => setIsOpen(false)}>Register</Link>
                <button
                  type="button"
                  className="hover:text-amber-400 transition text-left"
                  onClick={() => {
                    setIsOpen(false);
                    setIsDonateModalOpen(true);
                  }}
                >
                  Donate
                </button>
              </>
            ) : !authLoading && user ? (
              <>
                <Link className="hover:text-amber-400 transition" href="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <Link className="hover:text-amber-400 transition" href="/dashboard/profile" onClick={() => setIsOpen(false)}>Profile</Link>
                <button
                  className="hover:text-amber-400 transition text-left"
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
                <button
                  type="button"
                  className="hover:text-amber-400 transition text-left"
                  onClick={() => {
                    setIsOpen(false);
                    setIsDonateModalOpen(true);
                  }}
                >
                  Donate
                </button>
              </>
            ) : null}
          </div>
        </nav>
      )}

      <div className={styles.navActions} ref={profileMenuRef}>
        {!authLoading && !user ? (
          <>
            <Link className={`${styles.authLink} text-amber-400`} href="/login">
              Login
            </Link>
            <Link className={`${styles.authLink} text-amber-400`} href="/register">
              Register
            </Link>
            <button type="button" className={styles.navButton} onClick={() => setIsDonateModalOpen(true)}>
              Donate
            </button>
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

      {isDonateModalOpen ? (
        <div
          className={styles.modalBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby="donate-modal-title"
          onClick={() => setIsDonateModalOpen(false)}
        >
          <div className={styles.modalCard} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalEyebrow}>Support Light to Life</p>
                <h2 id="donate-modal-title" className={styles.modalTitle}>Make a donation</h2>
              </div>
              <button
                type="button"
                className={styles.modalCloseButton}
                onClick={() => setIsDonateModalOpen(false)}
                aria-label="Close donation dialog"
              >
                ✕
              </button>
            </div>

            <p className={styles.modalText}>
              Your generosity helps us continue our ministry, outreach, and care for the communities we serve.
            </p>

            <div className={styles.modalForm}>
              <label className={styles.modalLabel} htmlFor="navbar-donate-amount">
                Amount ({donateCurrency})
              </label>
              <input
                id="navbar-donate-amount"
                type="text"
                value={donateAmount}
                onChange={(event) => setDonateAmount(event.target.value)}
                className={styles.modalInput}
                placeholder="Enter amount"
              />

              <label className={styles.modalLabel} htmlFor="navbar-donate-email">
                Email
              </label>
              <input
                id="navbar-donate-email"
                type="email"
                value={donateEmail}
                onChange={(event) => setDonateEmail(event.target.value)}
                className={styles.modalInput}
                placeholder="you@example.com"
              />

              <label className={styles.modalLabel}>Select Currency</label>
              <div className={styles.modalSegmentedControl}>
                <button
                  type="button"
                  className={`${styles.modalSegment} ${donateCurrency === "KES" ? styles.modalSegmentActive : ""}`}
                  onClick={() => setDonateCurrency("KES")}
                >
                  <span className={styles.modalSegmentIcon}>KSh</span>
                  <span className={styles.modalSegmentLabel}>KES</span>
                </button>
                <button
                  type="button"
                  className={`${styles.modalSegment} ${donateCurrency === "USD" ? styles.modalSegmentActive : ""}`}
                  onClick={() => setDonateCurrency("USD")}
                >
                  <span className={styles.modalSegmentIcon}>$</span>
                  <span className={styles.modalSegmentLabel}>USD</span>
                </button>
              </div>

              <button
                type="button"
                className={styles.modalSubmitButton}
                onClick={handleDonateSubmit}
                disabled={!paystackPublicKey || isPaystackProcessing || !isPaystackReady}
              >
                {isPaystackProcessing ? "Processing..." : "Donate with Paystack"}
              </button>

              {!paystackPublicKey ? (
                <p className={styles.modalHint}>
                  Paystack public key is not configured yet. Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to enable this option.
                </p>
              ) : null}

              {donateStatusMessage ? <p className={styles.modalStatus}>{donateStatusMessage}</p> : null}
              {donateSuccessMessage ? <p className={styles.modalSuccess}>{donateSuccessMessage}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}