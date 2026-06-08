"use client";

import Image from "next/image";
import Link from "next/link";

interface SpotlightFounder {
  uid: string;
  displayName?: string;
  pastorTitle?: string;
  branchLocation?: string;
  branchDescription?: string;
  pastorDescription?: string;
  pastorImageURL?: string;
  phoneNumber?: string;
  email?: string;
  branchKey?: string;
}

interface SpotlightProps {
  founder: SpotlightFounder;
  gallery: {
    src: string;
    alt: string;
  }[];
}

export default function Spotlight({
  founder,
  gallery,
}: SpotlightProps) {
  const founderTitleContext = founder.branchLocation
    ? ` (${founder.branchLocation})`
    : "";

  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* IMAGE */}
          <div className="relative flex justify-center">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber-400/30 to-blue-500/30 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm">

              {founder.pastorImageURL ? (
                <Image
                  src={founder.pastorImageURL}
                  alt={founder.displayName || "Founder"}
                  width={600}
                  height={700}
                  className="h-[600px] w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-[600px] w-[450px] items-center justify-center bg-slate-800 text-8xl font-bold text-white">
                  {(founder.displayName || "B")[0]}
                </div>
              )}

              <div className="absolute left-6 top-6 rounded-full border border-amber-400/30 bg-slate-900/80 px-5 py-2 backdrop-blur">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                  Founder
                </span>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-amber-400">
              Spotlight
            </p>

            <h2 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
              {founder.displayName}
            </h2>

            <p className="mt-4 text-xl text-amber-300">
              {founder.pastorTitle}
              {founderTitleContext}
            </p>

            <div className="mt-6 h-1 w-24 rounded-full bg-gradient-to-r from-amber-400 to-blue-500" />

            <p className="mt-8 text-lg leading-8 text-slate-300">
              {founder.branchDescription ||
                founder.pastorDescription ||
                "Serving with a heart for people and a commitment to spiritual growth."}
            </p>

            {/* CONTACT */}
            <div className="mt-8 flex flex-wrap gap-4">
              {founder.phoneNumber && (
                <a
                  href={`tel:${founder.phoneNumber}`}
                  className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-slate-950"
                >
                  Call
                </a>
              )}

              {founder.email && (
                <a
                  href={`mailto:${founder.email}`}
                  className="rounded-full border border-white/20 px-6 py-3 text-white"
                >
                  Email
                </a>
              )}

              <Link
                href={`/team/${founder.branchKey || founder.uid}`}
                className="rounded-full border border-blue-500 px-6 py-3 text-blue-300"
              >
                Full Profile
              </Link>
            </div>

            {/* GALLERY */}
            {gallery.length > 0 && (
              <>
                <div className="mt-12 mb-4 flex justify-between">
                  <h4 className="text-white font-semibold">
                    Featured Moments
                  </h4>

                  <span className="text-slate-400 text-sm">
                    {gallery.length} Photos
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {gallery.slice(0, 5).map((photo) => (
                    <div
                      key={photo.src}
                      className="relative aspect-square overflow-hidden rounded-xl"
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        unoptimized
                        className="object-cover transition hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}