import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Heart, ShieldCheck, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-ink text-paper-100 border-t border-ink-700/80 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white border border-ink-600 p-1 flex items-center justify-center shadow-md">
                <img
                  src="/assets/logo-icon.png"
                  alt="LOKIVA Platform Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-bold font-display text-white tracking-tight">
                LOKIVA
              </span>
            </Link>
            <p className="text-xs text-dusk-100 leading-relaxed max-w-md">
              The first live constraint-solver & feasibility engine for authentic Indian cultural discovery. We don't just rank options—we guarantee they fit your exact time, travel buffer, and budget, and adapt the moment life changes.
            </p>
            <div className="pt-2 flex items-center gap-4 text-[11px] font-mono text-teal-100">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal" /> 100% Verified Local Artisans
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-marigold" /> 15 Indian States
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-marigold font-semibold">
              Traveller Flow
            </h4>
            <ul className="space-y-2 text-xs text-dusk-100 font-medium">
              <li>
                <Link to="/explore" className="hover:text-white transition">
                  Browse 229 Experiences
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-white transition">
                  State Heritage Collections
                </Link>
              </li>
              <li>
                <Link to="/ai-guide" className="hover:text-white transition">
                  AI Cultural Concierge
                </Link>
              </li>
              <li>
                <Link to="/itinerary" className="hover:text-white transition">
                  Dynamic Itinerary Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Provider & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-teal-100 font-semibold">
              Artisans & Hosts
            </h4>
            <ul className="space-y-2 text-xs text-dusk-100 font-medium">
              <li>
                <Link to="/provider" className="hover:text-white transition">
                  Host Console & Analytics
                </Link>
              </li>
              <li>
                <Link to="/register/provider" className="hover:text-white transition">
                  List Your Cultural Workshop
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">
                  Platform Moderation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-dusk-200 gap-4">
          <div>
            © {new Date().getFullYear()} LOKIVA. Handcrafted for authentic regional discovery across India.
          </div>
          <div className="flex items-center gap-2">
            <span>Built with Fraunces & JetBrains Mono</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
