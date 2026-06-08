"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "@/app/components/Navbar/Navbar";
import LocationCarousel from "@/app/components/LocationCarousel/LocationCarousel";

type BranchFeatureItem = {
  id?: string;
  imageURL?: string;
  name?: string;
  role?: string;
  description?: string;
};

type TeamBranchDetail = {
  uid: string;
  branchKey?: string;
  displayName: string;
  pastorTitle?: string;
  branchLocation: string;
  branchAddress?: string;
  branchMapUrl?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  churchGallery?: string[];
  pastorGallery?: string[];
  videos?: string[];
  phoneNumber?: string;
  email?: string;
  branchHistory?: string;
  pastorBiography?: string;
  churchStory?: string;
  vision?: string;
  futureDirection?: string;
  visionGoals?: string[];
  directors?: BranchFeatureItem[];
  projects?: BranchFeatureItem[];
};

const tabs = [
  "Overview",
  "Leadership",
  "Gallery",
  "Story",
  "Projects",
];

export default function BranchProfile() {
  const params = useParams<{ branchName?: string }>();
  const branchName = Array.isArray(params?.branchName) ? params.branchName[0] : params?.branchName || "east-africa-main-church-headquarters";
  
  const [activeTab, setActiveTab] = useState("Overview");
  const [branchData, setBranchData] = useState<TeamBranchDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBranchData = async () => {
      try {
        // Fetch branch data based on the branchName parameter
        const response = await fetch(`/api/public/team/${encodeURIComponent(branchName)}`);
        const payload = (await response.json()) as { member?: TeamBranchDetail; error?: string };
        
        if (response.ok && payload.member) {
          setBranchData(payload.member);
        } else {
          console.error("Error loading branch data:", payload.error);
          setBranchData(null);
        }
      } catch (error) {
        console.error("Error loading branch data:", error);
        setBranchData(null);
      } finally {
        setLoading(false);
      }
    };

    void loadBranchData();
  }, [branchName]);

  const renderTabContent = () => {
    if (!branchData) return null;

    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-4">
            <p className="text-slate-700">{branchData.branchDescription}</p>
            {branchData.pastorDescription && (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mt-6">About the Pastor</h3>
                <p className="text-slate-700">{branchData.pastorDescription}</p>
              </>
            )}
          </div>
        );
      case "Leadership":
        return (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-6">
                <p className="text-sm text-slate-500 mb-2">{branchData.pastorTitle || "Lead Pastor"}</p>
                <h3 className="text-xl font-bold text-slate-900">{branchData.displayName}</h3>
                {branchData.pastorImageURL && (
                  <div className="mt-4 w-32 h-32 rounded-lg overflow-hidden">
                    <Image
                      src={branchData.pastorImageURL}
                      alt={branchData.displayName}
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>
            {branchData.directors && branchData.directors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Directors & Ministry Team</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {branchData.directors.map((director, idx) => (
                    <div key={director.id || idx} className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                      {director.imageURL && (
                        <div className="mb-3 w-20 h-20 mx-auto rounded-full overflow-hidden">
                          <Image
                            src={director.imageURL}
                            alt={director.name || "Director"}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                            unoptimized
                          />
                        </div>
                      )}
                      <p className="font-semibold text-slate-900">{director.name}</p>
                      <p className="text-sm text-slate-600">{director.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case "Gallery":
        const galleryImages = branchData.churchGallery || branchData.pastorGallery || [];
        return (
          <div className="space-y-4">
            {galleryImages.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {galleryImages.map((image, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 h-48">
                    <Image
                      src={image}
                      alt={`Branch gallery ${idx + 1}`}
                      width={300}
                      height={200}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600">No gallery images available</p>
            )}
          </div>
        );
      case "Story":
        return (
          <div className="space-y-4">
            {branchData.churchStory && (
              <>
                <h3 className="text-lg font-semibold text-slate-900">Church Story</h3>
                <p className="text-slate-700">{branchData.churchStory}</p>
              </>
            )}
            {branchData.branchHistory && (
              <>
                <h3 className="text-lg font-semibold text-slate-900 mt-6">Branch History</h3>
                <p className="text-slate-700">{branchData.branchHistory}</p>
              </>
            )}
          </div>
        );
      case "Projects":
        return (
          <div className="space-y-4">
            {branchData.projects && branchData.projects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {branchData.projects.map((project, idx) => (
                  <div key={project.id || idx} className="rounded-xl bg-slate-50 border border-slate-100 p-6">
                    {project.imageURL && (
                      <div className="mb-4 rounded-lg overflow-hidden h-40">
                        <Image
                          src={project.imageURL}
                          alt={project.name || "Project"}
                          width={300}
                          height={200}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-slate-900">{project.name}</h3>
                    <p className="text-sm text-slate-600 mt-2">{project.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600">No projects available</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Loading branch information...</p>
      </div>
    );
  }

  if (!branchData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-slate-600">Branch information not available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
      {/* Location Carousel */}
      <LocationCarousel />

      {/* Navbar */}
      <Navbar />

      {/* HERO */}
      <div className="relative h-72 sm:h-80 lg:h-96 w-full">
        <img
          src="/profile hero.png"
          alt="Branch hero image"
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

        <div className="absolute bottom-6 left-6 text-white max-w-xl">
          <p className="text-sm tracking-wide opacity-80">
            Light To Life International Ministries
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            {branchData.branchLocation}
          </h2>
        </div>
      </div>

      {/* WRAPPER */}
      <div className="max-w-7xl mx-auto px-6">

        {/* PROFILE CARD */}
        <div className="relative -mt-20 bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-6 md:p-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            {/* LEFT */}
            <div className="flex gap-6 items-end">

              {branchData.pastorImageURL ? (
                <Image
                  src={branchData.pastorImageURL}
                  alt={branchData.displayName}
                  width={160}
                  height={160}
                  className="w-36 h-36 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                  unoptimized
                />
              ) : (
                <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-slate-300 border-4 border-white shadow-xl flex items-center justify-center text-2xl font-bold text-white">
                  {branchData.displayName[0]}
                </div>
              )}

              <div className="pb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  {branchData.branchLocation}
                </h1>

                <p className="text-slate-600 mt-1">
                  {branchData.pastorTitle || "Lead Pastor"}: {branchData.displayName}
                </p>

                <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-600">
                  {branchData.branchAddress && (
                    <span className="px-3 py-1 rounded-full bg-slate-100">
                      📍 {branchData.branchAddress}
                    </span>
                  )}
                  {branchData.phoneNumber && (
                    <span className="px-3 py-1 rounded-full bg-slate-100">
                      📞 {branchData.phoneNumber}
                    </span>
                  )}
                  {branchData.email && (
                    <span className="px-3 py-1 rounded-full bg-slate-100">
                      ✉️ {branchData.email}
                    </span>
                  )}
                </div>
              </div>

            </div>

            {/* ACTIONS */}
            <div className="flex gap-3">
              {branchData.phoneNumber && (
                <a href={`tel:${branchData.phoneNumber}`} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition">
                  Call
                </a>
              )}

              {branchData.email && (
                <a href={`mailto:${branchData.email}`} className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition">
                  Email
                </a>
              )}
            </div>

          </div>
        </div>

        {/* TABS */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">

            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition
                  ${
                    activeTab === tab
                      ? "bg-slate-900 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                {tab}
              </button>
            ))}

          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid lg:grid-cols-3 gap-8 mt-8">

          {/* MAIN */}
          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                {activeTab}
              </h2>

              <div className="text-slate-700">
                {renderTabContent()}
              </div>

            </div>

          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                Branch Information
              </h3>

              <div className="space-y-4 text-sm">

                <div>
                  <p className="text-slate-400">Location</p>
                  <p className="text-slate-700">{branchData.branchLocation}</p>
                </div>

                <div>
                  <p className="text-slate-400">Address</p>
                  <p className="text-slate-700">{branchData.branchAddress || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-slate-400">Pastor</p>
                  <p className="text-slate-700">{branchData.displayName}</p>
                </div>

                <div>
                  <p className="text-slate-400">Phone</p>
                  <p className="text-slate-700">{branchData.phoneNumber || "Not provided"}</p>
                </div>

                <div>
                  <p className="text-slate-400">Email</p>
                  <p className="text-slate-700">{branchData.email || "Not provided"}</p>
                </div>

              </div>
            </div>

            {/* Location Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-sm border border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📍</span>
                <h3 className="font-semibold text-white">
                  Branch Location
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                  <p className="text-slate-300 text-xs mb-1">Region</p>
                  <p style={{ color: "var(--gold)" }} className="font-semibold">
                    {branchData.branchLocation}
                  </p>
                </div>

                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                  <p className="text-slate-300 text-xs mb-1">Full Address</p>
                  <p className="text-white text-sm">
                    {branchData.branchAddress || "Address not available"}
                  </p>
                </div>

                {branchData.branchMapUrl && (
                  <a
                    href={branchData.branchMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-3 rounded-lg transition text-center text-sm font-medium"
                    style={{
                      backgroundColor: "var(--gold)",
                      color: "var(--nav-cta-text)",
                    }}
                  >
                    View on Map →
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                Quick Stats
              </h3>

              <div className="grid grid-cols-2 gap-3">

                {[
                  [(branchData.directors?.length || 0).toString(), "Directors"],
                  [(branchData.projects?.length || 0).toString(), "Projects"],
                  [(branchData.churchGallery?.length || branchData.pastorGallery?.length || 0).toString(), "Photos"],
                  [(branchData.videos?.length || 0).toString(), "Videos"],
                ].map(([num, label]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center"
                  >
                    <p className="text-xl font-bold text-slate-900">
                      {num}
                    </p>
                    <p className="text-xs text-slate-500">
                      {label}
                    </p>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
