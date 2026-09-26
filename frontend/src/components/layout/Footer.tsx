import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export function Footer() {
  const location = useLocation();

  // Hide footer on AI Concierge page where the dedicated chat interface and fixed bottom bar are active
  if (location.pathname.startsWith('/ai-guide')) {
    return null;
  }

  return (
    <footer className="relative bg-[#FAF8F5] text-[#12213B] border-t border-[#E5DFD5] pt-14 sm:pt-16 pb-10">
      {/* Decorative top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-gradient-to-r from-transparent via-[#FFC067]/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand and Mission */}
          <div className="md:col-span-6 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-white border border-[#E5DFD5] flex items-center justify-center shadow-xs p-1.5 group-hover:border-[#FFC067] transition-colors">
                <img
                  src="/logo.png"
                  alt="LOKIVA Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-display font-extrabold text-[#12213B] tracking-tight">
                LOKIVA
              </span>
            </Link>

            <p className="text-sm font-sans font-normal text-[#5B6B8C] leading-relaxed max-w-md">
              The cultural discovery engine and live feasibility solver for authentic India. We curate master artisans, generational kitchens, and living heritage around your real transit hours.
            </p>

            {/* Clean Professional Micro-Labels */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-heading font-bold">
              <div className="inline-flex items-center gap-1.5 text-[#0F766E]">
                <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                <span>Verified Master Artisans</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[#C1443B]">
                <MapPin className="w-4 h-4 text-[#C1443B]" />
                <span>Pan-India Micro-Circuits</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[#B45309]">
                <Sparkles className="w-4 h-4 text-[#B45309]" />
                <span>Live Constraint Solver</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
              Discover
            </p>
            <ul className="space-y-3 text-sm font-sans font-medium text-[#5B6B8C]">
              <li>
                <Link to="/explore" className="hover:text-[#12213B] transition-colors">
                  Explore Experiences
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-[#12213B] transition-colors">
                  36 States &amp; UTs
                </Link>
              </li>
              <li>
                <Link to="/discovery-map" className="hover:text-[#12213B] transition-colors">
                  Discovery Map
                </Link>
              </li>
              <li>
                <Link to="/itinerary" className="hover:text-[#12213B] transition-colors">
                  Itinerary Planner
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-[#12213B] transition-colors">
                  Saved Places
                </Link>
              </li>
            </ul>
          </div>

          {/* Intelligence Column */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#B45309]">
              Intelligence
            </p>
            <ul className="space-y-3 text-sm font-sans font-medium text-[#5B6B8C]">
              <li>
                <Link to="/ai-guide" className="hover:text-[#12213B] transition-colors inline-flex items-center gap-1.5">
                  <span>AI Concierge</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                </Link>
              </li>
              <li>
                <Link to="/ai-guide" className="hover:text-[#12213B] transition-colors">
                  Voice Guide
                </Link>
              </li>
              <li>
                <Link to="/discovery-map" className="hover:text-[#12213B] transition-colors">
                  Circuit Solver
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#12213B] transition-colors">
                  Traveler Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal and Copyright Bar */}
        <div className="pt-8 border-t border-[#E5DFD5] flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-[#718096] gap-4">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} LOKIVA Technologies. Handcrafted with reverence for India's living cultural traditions.
          </p>

          <div className="flex items-center gap-6 font-medium text-[#5B6B8C]">
            <Link to="/explore" className="hover:text-[#12213B] transition-colors">
              Privacy
            </Link>
            <Link to="/explore" className="hover:text-[#12213B] transition-colors">
              Terms
            </Link>
            <Link to="/explore" className="hover:text-[#12213B] transition-colors">
              Trust &amp; Safety
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
