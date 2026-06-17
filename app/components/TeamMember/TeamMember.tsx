import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { type MouseEventHandler } from "react";

type TeamMemberCardProps = {
  imageSrc?: string;
  imageAlt?: string;
  name?: string;
  role?: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
  onCtaClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export default function TeamMemberCard({
  imageSrc,
  imageAlt,
  name,
  role,
  description,
  href,
  ctaLabel = "See More",
  onCtaClick,
  className = "",
}: TeamMemberCardProps) {
  const cardContent = (
    <div className={`max-w-sm overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${className}`}>
      <div className="relative h-72 w-full">
        <Image
          src="/team/member.jpg"
          alt="Team Member"
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900">
          Pastor Nicholas Nyarongo
        </h3>

        <p className="mt-1 text-sm font-medium text-amber-600">
          Branch Coordinator
        </p>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Dedicated to advancing the Gospel, empowering believers, and
          strengthening communities through faith, discipleship, and servant
          leadership.
        </p>

        <button className="mt-5 flex items-center gap-2 font-medium text-amber-600 transition hover:text-amber-700">
          See More
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}