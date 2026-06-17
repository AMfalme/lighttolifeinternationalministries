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
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt || name || "Team Member"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-4xl font-bold text-slate-900">
            {name ? name.charAt(0).toUpperCase() : "T"}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900">{name || "Team Member"}</h3>
        {role ? <p className="mt-1 text-sm font-medium text-amber-600">{role}</p> : null}

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {description ||
            "Dedicated to advancing the Gospel, empowering believers, and strengthening communities through faith, discipleship, and servant leadership."}
        </p>

        {onCtaClick ? (
          <button
            type="button"
            onClick={onCtaClick}
            className="mt-5 flex items-center gap-2 font-medium text-amber-600 transition hover:text-amber-700"
          >
            {ctaLabel}
            <ArrowRight size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {cardContent}
      </a>
    );
  }

  return cardContent;
}