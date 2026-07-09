"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/app/components/DashboardSidebar/DashboardSidebar";
import { DashboardLoading } from "@/app/dashboard/loading";
import { getAllDonations, type Donation } from "@/app/lib/firebase/firestore";
import styles from "./donations.module.css";
import dashStyles from "@/app/dashboard/dashboard.module.css";
import { useFastAuth } from "@/app/lib/firebase/useFastAuth";
import { db } from "@/app/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardDonationsPage() {
  const router = useRouter();
  const { user, loading } = useFastAuth("/login");
  const [donations, setDonations] = useState<(Donation & { id: string })[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<(Donation & { id: string }) | null>(null);
  const [filterCurrency, setFilterCurrency] = useState<string>("all");

  useEffect(() => {
    if (!loading && user && db) {
      (async () => {
        try {
          const snapshot = await getDoc(doc(db, "users", user.uid));
          setCurrentRole(snapshot.exists() ? snapshot.data().role || null : null);
        } catch (error) {
          console.error("Error loading role:", error);
          setCurrentRole(null);
        }
      })();
      void fetchDonations();
    }
  }, [loading, user]);

  const fetchDonations = async () => {
    setPageLoading(true);
    try {
      const fetchedDonations = await getAllDonations();
      setDonations(fetchedDonations);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const firebaseAuth = await import("firebase/auth");
      const auth = firebaseAuth.getAuth();
      await firebaseAuth.signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
    router.push("/");
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "KES",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: any) => {
    if (!date) return "—";
    if (date.toDate) return date.toDate().toLocaleString();
    if (typeof date === "string") return new Date(date).toLocaleString();
    return new Date(date).toLocaleString();
  };

  const filteredDonations = filterCurrency === "all"
    ? donations
    : donations.filter((d) => d.currency === filterCurrency);

  const currencies = [...new Set(donations.map((d) => d.currency))];
  const totalAmount = filteredDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

  if (loading || pageLoading) return <DashboardLoading />;
  if (!user) return null;
  if (currentRole !== "admin" && currentRole !== "leadership") {
    return (
      <div className={dashStyles.page}>
        <div className={dashStyles.dashboard}>
          <main className={dashStyles.main}>
            <div className={styles.container}>
              <div className={styles.header}>
                <h1>💰 Donations</h1>
              </div>
              <p className={styles.empty}>Only admins or leadership can view donations.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={dashStyles.page}>
      <div className={dashStyles.dashboard}>
        <DashboardSidebar onLogout={handleLogout} />
        <main className={dashStyles.main}>
          <div className={styles.container}>
            <div className={styles.header}>
              <h1>💰 Donations</h1>
              <button className={styles.refreshBtn} onClick={fetchDonations}>🔄 Refresh</button>
            </div>

            {/* Stats Summary */}
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>💰</span>
                <div>
                  <span className={styles.statLabel}>Total Donations</span>
                  <span className={styles.statValue}>{donations.length}</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>💵</span>
                <div>
                  <span className={styles.statLabel}>Total Amount</span>
                  <span className={styles.statValue}>{formatAmount(totalAmount, filterCurrency === "all" ? "KES" : filterCurrency)}</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>🕐</span>
                <div>
                  <span className={styles.statLabel}>Latest</span>
                  <span className={styles.statValue}>
                    {donations.length > 0 ? formatDate(donations[0].createdAt).split(",")[0] : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className={styles.filterRow}>
              <label>Filter by Currency:</label>
              <select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Currencies</option>
                {currencies.map((cur) => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>

            {/* Donations Table */}
            {filteredDonations.length === 0 ? (
              <p className={styles.empty}>No donations yet.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Email</th>
                      <th>Donor Name</th>
                      <th>Amount</th>
                      <th>Currency</th>
                      <th>Reference</th>
                      <th>Channel</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDonations.map((donation) => (
                      <tr key={donation.id}>
                        <td className={styles.dateCell}>{formatDate(donation.createdAt)}</td>
                        <td>{donation.email}</td>
                        <td>{donation.donorName || "—"}</td>
                        <td className={styles.amountCell}>{formatAmount(donation.amount, donation.currency)}</td>
                        <td><span className={styles.currencyBadge}>{donation.currency}</span></td>
                        <td className={styles.referenceCell}>{donation.reference}</td>
                        <td>{donation.channel || "—"}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${donation.status === "success" ? styles.statusSuccess : styles.statusPending}`}>
                            {donation.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={styles.viewBtn}
                            onClick={() => setSelectedDonation(donation)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Donation Detail Modal */}
            {selectedDonation && (
              <div className={styles.modalOverlay} onClick={() => setSelectedDonation(null)}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <h2>Donation Details</h2>
                    <button className={styles.modalClose} onClick={() => setSelectedDonation(null)}>✕</button>
                  </div>
                  <div className={styles.modalBody}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Reference</span>
                      <span className={styles.detailValue}>{selectedDonation.reference}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Donor Email</span>
                      <span className={styles.detailValue}>{selectedDonation.email}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Donor Name</span>
                      <span className={styles.detailValue}>{selectedDonation.donorName || "—"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Phone</span>
                      <span className={styles.detailValue}>{selectedDonation.phone || "—"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Amount</span>
                      <span className={styles.detailValue}>{formatAmount(selectedDonation.amount, selectedDonation.currency)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Currency</span>
                      <span className={styles.detailValue}>{selectedDonation.currency}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Channel</span>
                      <span className={styles.detailValue}>{selectedDonation.channel || "—"}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Status</span>
                      <span className={styles.detailValue}>
                        <span className={`${styles.statusBadge} ${selectedDonation.status === "success" ? styles.statusSuccess : styles.statusPending}`}>
                          {selectedDonation.status}
                        </span>
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Date</span>
                      <span className={styles.detailValue}>{formatDate(selectedDonation.createdAt)}</span>
                    </div>
                    {selectedDonation.message && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Message</span>
                        <span className={styles.detailValue}>{selectedDonation.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}