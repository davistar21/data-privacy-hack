import Galaxy from "../components/Galaxy";
import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Nova" },
    { name: "description", content: "Privacy Assistant" },
  ];
}

export default function Home() {
  return (
    <div className="w-full h-screen relative">
      <div className="absolute inset-0">
        <Galaxy
          mouseRepulsion={true}
          mouseInteraction={true}
          density={0.3}
          glowIntensity={0.05}
          saturation={0.2}
          hueShift={20}
        />
      </div>
      <Header />
      <TopSection />
    </div>
  );
}

import { ArrowRight, LayoutDashboard, Menu, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ReactTyped } from "react-typed";

const TopSection = () => {
  const taglines = [
    "Empowering individuals with control over their data rights.",
    "Simplifying NDPR compliance for organizations.",
    "AI-powered tools to help you stay compliant with Nigerian data laws.",
    "Transparent, secure, and trustworthy data management solutions.",
    "Your data, your rights. Nova helps you take control.",
  ];

  return (
    <div className="hero py-12 bg-transparent relative">
      {/* Badge */}
      <span className="text-sm md:text-lg font-medium px-3 py-1 md:px-5 md:py-2 rounded-full mb-4 flex items-center gap-1 bg-gradient-dark w-fit ">
        <div className="w-[10px] h-[10px] rounded-full bg-gradient-to-r from-teal-400 to-teal-600 animate-pulse"></div>
        <p className="text-gradient-dark">AI-Powered Data Protection</p>
      </span>

      {/* Main Heading */}
      <h1 className="max-w-6xl">
        Empowering Data Rights. Simplifying Compliance.
      </h1>

      {/* Subheading */}
      <h2 className="max-w-6xl">
        Nova connects individuals and organizations under the NDPR framework —
        ensuring transparency, control, and trust in data handling.
      </h2>

      {/* Typed Tagline (optional for animation) */}
      {/* <p className="text-2xl md:text-3xl font-semibold text-[var(--sea-dark-700)] mb-4 lg:w-[60%]">
        <ReactTyped
          strings={taglines}
          typeSpeed={100}
          loop
          smartBackspace
          shuffle
          cursorChar="|"
        />
      </p> */}

      {/* CTAs */}
      <div className="flex gap-4 md:gap-12 items-center justify-evenly md:justify-center my-16 w-full">
        <Link
          to="#"
          target="_blank"
          className="cta-button text-teal-900 bg-gradient-dark border-[var(--sea-dark-700)]  transition duration-500 group flex items-center gap-2 scale-100 hover:scale-105"
        >
          <Play className="w-4 h-4" />
          Watch Demo
        </Link>
        <Link
          to="/dashboard"
          className="transition duration-500 cta-button bg-[var(--sea-dark-700)] border border-border text-white hover:bg-sea-dark-400 scale-100 hover:scale-105 flex items-center gap-2"
        >
          Get Started
          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>

      {/* Trust Indicators (Optional) */}
      <div className="flex w-full md:flex-row flex-col gap-10 justify-evenly items-center my-12">
        <div className="flex flex-col gap-2 justify-center md:justify-evenly items-center">
          <span className="text-5xl text-[var(--sea-dark-700)] font-bold">
            500+
          </span>
          <span className="text-xl text-[var(--sea-dark-500)] font-semibold">
            Organizations Compliant
          </span>
        </div>
        <div className="flex flex-col gap-2 justify-center md:justify-evenly items-center">
          <span className="text-5xl text-[var(--sea-dark-700)] font-bold">
            99.9%
          </span>
          <span className="text-xl text-[var(--sea-dark-500)] font-semibold">
            Compliance Accuracy
          </span>
        </div>
        <div className="flex flex-col gap-2 justify-center md:justify-evenly items-center">
          <span className="text-5xl text-[var(--sea-dark-700)] font-bold">
            24/7
          </span>
          <span className="text-xl text-[var(--sea-dark-500)] font-semibold">
            Customer Support
          </span>
        </div>
      </div>
    </div>
  );
};
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-white/70 border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-lg text-[var(--sea-dark-700)]"
        >
          <img src="Nova-logo.png" alt="" className="md:hidden block w-8" />
          <img
            src="Nova-horizontal.png"
            alt=""
            className="hidden md:block h-8"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--sea-dark-600)]">
          <Link to="#features" className="hover:text-teal-600 transition">
            Features
          </Link>
          <Link to="#pricing" className="hover:text-teal-600 transition">
            Pricing
          </Link>
          <Link to="#about" className="hover:text-teal-600 transition">
            About
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-md bg-teal-600 text-white hover:bg-teal-700 transition flex items-center gap-1"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-md hover:bg-teal-100 transition"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-teal-600" />
          ) : (
            <Menu className="w-5 h-5 text-teal-600" />
          )}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-md border-t border-border px-4 py-4 space-y-3 text-[var(--sea-dark-700)] font-medium">
          <Link
            to="#features"
            className="block hover:text-teal-600 transition"
            onClick={() => setIsOpen(false)}
          >
            Features
          </Link>
          <Link
            to="#pricing"
            className="block hover:text-teal-600 transition"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </Link>
          <Link
            to="#about"
            className="block hover:text-teal-600 transition"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link
            to="/dashboard"
            className="block bg-teal-600 text-white text-center py-2 rounded-md hover:bg-teal-700 transition"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
        </div>
      )}
    </header>
  );
};
