import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, MapPin } from 'lucide-react';

export function Footer() {
  const location = useLocation();

  // Hide footer on AI Concierge page where the dedicated chat interface and fixed bottom bar are active
  if (location.pathname.startsWith('/ai-guide')) {
    return null;
  }

  return (
    <footer className="bg-[#E2D5C3] text-[#1C1814] border-t border-[#CCBCAB] pt-10 sm:pt-14 pb-8 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="LOKIVA Platform Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="text-2xl font-bold font-display text-[#1C1814] tracking-tight">
                LOKIVA
              </span>
            </Link>
            <p className="text-xs text-[#4D443B] leading-relaxed max-w-md">
              The first live constraint solver and feasibility engine for authentic Indian cultural discovery. We don't just rank options, we guarantee they fit your exact time, travel buffer, and budget, and adapt the moment life changes.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFE8DC] border border-[#C5B4A0] text-[#135E52] shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#135E52]" /> 100% Verified Local Artisans
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFE8DC] border border-[#C5B4A0] text-[#9E3E26] shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-[#9E3E26]" /> 36 States & UTs (Pan-India)
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#9E3E26] font-bold">
              Traveller Flow
            </h4>
            <ul className="space-y-2.5 text-xs text-[#3E362E] font-medium">
              <li>
                <Link to="/explore" className="hover:text-[#9E3E26] transition-colors">
                  Browse Pan-India Experiences
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-[#9E3E26] transition-colors">
                  State Heritage Collections
                </Link>
              </li>
              <li>
                <Link to="/ai-guide" className="hover:text-[#9E3E26] transition-colors">
                  AI Cultural Concierge
                </Link>
              </li>
              <li>
                <Link to="/itinerary" className="hover:text-[#9E3E26] transition-colors">
                  Dynamic Itinerary Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Provider & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#135E52] font-bold">
              Artisans & Hosts
            </h4>
            <ul className="space-y-2.5 text-xs text-[#3E362E] font-medium">
              <li>
                <Link to="/provider" className="hover:text-[#135E52] transition-colors">
                  Host Console & Analytics
                </Link>
              </li>
              <li>
                <Link to="/register/provider" className="hover:text-[#135E52] transition-colors">
                  List Your Cultural Workshop
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#135E52] transition-colors">
                  Platform Moderation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#CCBCAB] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#61564B] gap-4">
          <div>
            © {new Date().getFullYear()} LOKIVA. Handcrafted for authentic regional discovery across India.
          </div>
          <div className="flex items-center gap-2">
            <span>Fraunces & JetBrains Mono typography</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
