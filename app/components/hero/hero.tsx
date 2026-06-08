"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  HeartHandshake,
  Users,
  Play,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/app/components/Navbar/Navbar";
import LocationCarousel from "@/app/components/LocationCarousel/LocationCarousel";

const slides = [
  {
    image: "/hero.png",
    title: (
      <>
        Bringing <span style={{ color: "var(--gold)" }}>Light.</span>
        <br />
        Changing <span style={{ color: "var(--gold)" }}>Lives.</span>
      </>
    ),
    description: "Taking the love and hope of Jesus Christ to the nations and transforming communities through the power of the Gospel.",
    primaryCta: "Our Mission",
    primaryLink: "/#features",
  },
  {
    image: "/profile hero.png",
    title: (
      <>
        Spreading <span style={{ color: "var(--gold)" }}>Hope.</span>
        <br />
        Building <span style={{ color: "var(--gold)" }}>Faith.</span>
      </>
    ),
    description: "Empowering believers to grow in their walk with Christ and share the message of salvation with a world in need.",
    primaryCta: "Join Us",
    primaryLink: "/#about",
  },
  {
    image: "/congregation.jpg",
    title: (
      <>
        Loving <span style={{ color: "var(--gold)" }}>God.</span>
        <br />
        Serving <span style={{ color: "var(--gold)" }}>People.</span>
      </>
    ),
    description: "A Christ-centered ministry committed to sharing God's grace through compassionate service and outreach.",
    primaryCta: "Support Us",
    primaryLink: "/donate",
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 scale-105" : "opacity-0 scale-100"
          }`}
          style={{
            backgroundImage: `url('${slide.image}')`,
            backgroundAttachment: "fixed",
            backgroundPosition: "center",
            transitionProperty: "opacity, transform",
          }}
        />
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/30" />

      {/* Location Carousel */}
      <div className="absolute top-0 left-0 right-0 z-30">
        <LocationCarousel />
      </div>

      {/* Navigation - Using Navbar Component */}
      <div className="absolute top-16 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-screen items-center pt-40 md:pt-48">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <h1 className="leading-none font-cormorant transition-all duration-700 delay-300">
              <div className="block whitespace-nowrap text-6xl font-light text-white md:text-8xl">
                {slides[currentSlide].title}
              </div>
            </h1>

            <p className="font-inter mt-8 max-w-2xl text-xl leading-9 text-gray-200 transition-all duration-700 delay-500">
              {slides[currentSlide].description}
            </p>

            {/* Buttons */}
            <div className="mt-10 flex flex-wrap gap-5">
              <a 
                href={slides[currentSlide].primaryLink} 
                className="flex items-center gap-2 rounded-lg px-8 py-4 font-semibold text-black transition" style={{ backgroundColor: "var(--gold)", background: "var(--nav-cta-bg)" }}>
                {slides[currentSlide].primaryCta}
                <ArrowRight size={18} />
              </a>

              <a href="/news" className="flex items-center gap-3 rounded-lg border-2 px-8 py-4 font-semibold transition hover:text-black" style={{ borderColor: "var(--gold)", color: "var(--gold)", backgroundColor: "transparent" }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--gold)"; e.currentTarget.style.color = "#000"; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--gold)"; }}>
                <Play size={18} />
                Our Stories
              </a>
            </div>

            {/* Feature Cards */}
            <div className="mt-20 grid gap-8 border-t border-white/20 pt-10 md:grid-cols-3">
              <div className="space-y-4">
                <Globe
                  style={{ color: "var(--gold)" }}
                  size={42}
                  strokeWidth={1.5}
                />
                <h3 className="text-xl font-semibold text-white">
                  Global Reach
                </h3>
                <p className="text-gray-300">
                  Reaching nations with the Gospel and planting churches
                  worldwide.
                </p>
              </div>

              <div className="space-y-4">
                <HeartHandshake
                  style={{ color: "var(--gold)" }}
                  size={42}
                  strokeWidth={1.5}
                />
                <h3 className="text-xl font-semibold text-white">
                  Transforming Lives
                </h3>
                <p className="text-gray-300">
                  Bringing healing, hope and restoration through Christ.
                </p>
              </div>

              <div className="space-y-4">
                <Users
                  style={{ color: "var(--gold)" }}
                  size={42}
                  strokeWidth={1.5}
                />
                <h3 className="text-xl font-semibold text-white">
                  Make a Difference
                </h3>
                <p className="text-gray-300">
                  Join us in spreading the light of God across the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute inset-y-0 left-4 z-40 flex items-center">
        <button onClick={prevSlide} className="p-2 rounded-full bg-black/20 text-white hover:bg-gold hover:text-black transition">
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className="absolute inset-y-0 right-4 z-40 flex items-center">
        <button onClick={nextSlide} className="p-2 rounded-full bg-black/20 text-white hover:bg-gold hover:text-black transition">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 left-1/2 z-40 flex -translate-x-1/2 gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              idx === currentSlide ? "w-8 bg-gold" : "w-2 bg-white/40 hover:bg-white"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}