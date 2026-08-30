import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Bookmark,
  User,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Shield,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';

export function Navbar() {
  const { user, logout, demoLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto">
        {/* Sleek Floating Capsule Nav */}
        <nav
          className={`pointer-events-auto transition-all duration-300 ease-out rounded-full border shadow-md ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-lg border-paper-400 py-1.5 sm:py-2 px-3.5 sm:px-5 shadow-ink/8'
              : 'bg-[#EEF1EE]/92 backdrop-blur-md border-[#D0D7CF] py-1.5 sm:py-2.5 px-3.5 sm:px-5 shadow-ink/5'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Left: Brand Logo & Wordmark */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-ink flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                <Compass className="w-3.5 h-3.5 text-marigold" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold font-display text-ink tracking-tight">
                  LOKIVA
                </span>
                <span className="hidden lg:inline-block text-[9px] uppercase font-mono tracking-wider text-teal font-bold px-1.5 py-0.5 bg-teal-50 rounded-full border border-teal-200">
                  India
                </span>
              </div>
            </Link>

            {/* Center: Nav Links (Desktop) */}
            <div className="hidden md:flex items-center gap-0.5 sm:gap-1">
              <Link
                to="/explore"
                className={`relative px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
                  isActive('/explore')
                    ? 'text-ink'
                    : 'text-dusk hover:text-ink'
                }`}
              >
                Explore
                {isActive('/explore') && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-marigold rounded-full"
                  />
                )}
              </Link>

              <Link
                to="/destinations"
                className={`relative px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
                  isActive('/destinations')
                    ? 'text-ink'
                    : 'text-dusk hover:text-ink'
                }`}
              >
                Destinations
                {isActive('/destinations') && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-marigold rounded-full"
                  />
                )}
              </Link>

              <Link
                to="/ai-guide"
                className={`relative px-2.5 py-1 text-xs font-mono font-bold transition-colors flex items-center gap-1 ${
                  isActive('/ai-guide')
                    ? 'text-ink'
                    : 'text-dusk hover:text-ink'
                }`}
              >
                <Sparkles className="w-3 h-3 text-marigold" />
                AI Concierge
                {isActive('/ai-guide') && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-marigold rounded-full"
                  />
                )}
              </Link>

              <Link
                to="/itinerary"
                className={`relative px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
                  isActive('/itinerary')
                    ? 'text-ink'
                    : 'text-dusk hover:text-ink'
                }`}
              >
                Itinerary
                {isActive('/itinerary') && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-marigold rounded-full"
                  />
                )}
              </Link>

              <Link
                to="/saved"
                className={`relative px-2.5 py-1 text-xs font-mono font-bold transition-colors flex items-center gap-1 ${
                  isActive('/saved')
                    ? 'text-ink'
                    : 'text-dusk hover:text-ink'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                Saved
                {isActive('/saved') && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-marigold rounded-full"
                  />
                )}
              </Link>
            </div>

            {/* Right: Actions, Demo Switcher, Profile & CTA */}
            <div className="hidden md:flex items-center gap-2">
              {/* 1-Click Demo Persona Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 hover:bg-white border border-paper-400 rounded-full text-[11px] text-ink font-mono font-medium shadow-sm transition"
                >
                  <span>Persona: <strong className="text-marigold-700 capitalize">{user?.role || 'traveler'}</strong></span>
                  <ChevronDown className="w-3 h-3 text-dusk" />
                </button>

                {personaDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-paper-400 rounded-2xl shadow-2xl p-2 z-50 text-xs font-mono">
                    <p className="text-[9px] font-bold text-dusk px-2 py-1 uppercase tracking-wider">
                      Switch Demo Persona
                    </p>
                    <button
                      onClick={() => {
                        demoLogin('traveler');
                        setPersonaDropdownOpen(false);
                        navigate('/explore');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-paper-100 rounded-xl flex items-center gap-2 text-ink transition"
                    >
                      <User className="w-3.5 h-3.5 text-teal" />
                      <div>
                        <div className="font-bold">The Sharma Family</div>
                        <div className="text-[9px] text-dusk">4 pax · ₹1,500 · Wheelchair</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        demoLogin('provider');
                        setPersonaDropdownOpen(false);
                        navigate('/provider');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-paper-100 rounded-xl flex items-center gap-2 text-ink transition"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-marigold-600" />
                      <div>
                        <div className="font-bold">Artisan Host Guild</div>
                        <div className="text-[9px] text-dusk">Bandra workshop host</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        demoLogin('admin');
                        setPersonaDropdownOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-paper-100 rounded-xl flex items-center gap-2 text-ink transition"
                    >
                      <Shield className="w-3.5 h-3.5 text-clay" />
                      <div>
                        <div className="font-bold">Platform Admin</div>
                        <div className="text-[9px] text-dusk">KYC & Moderation</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* User Logged In / Sign In link */}
              {user ? (
                <div className="flex items-center gap-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1 px-2.5 py-1 bg-paper-200 hover:bg-paper-300 text-ink rounded-full text-xs font-mono font-bold transition"
                  >
                    <User className="w-3 h-3" />
                    <span>{user.full_name?.split(' ')[0] || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-1 text-dusk hover:text-clay hover:bg-paper-300 rounded-full transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-2.5 py-1 text-xs font-mono font-bold text-ink hover:text-marigold-700 transition"
                >
                  Log in
                </Link>
              )}

              {/* Solid Marigold CTA */}
              <Link
                to="/itinerary"
                className="px-3.5 py-1.5 bg-marigold hover:bg-marigold-600 text-ink font-mono text-xs font-bold rounded-full transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Start Plan</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Mobile Controls */}
            <div className="md:hidden flex items-center gap-1.5">
              <Link
                to="/itinerary"
                className="px-2.5 py-1 bg-marigold text-ink font-mono text-xs font-bold rounded-full shadow-sm"
              >
                Start Plan
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 text-ink hover:bg-paper-300 rounded-full transition"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Dropdown Floating Card */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto mt-2 bg-white/95 backdrop-blur-lg border border-paper-400 rounded-3xl p-4 shadow-2xl space-y-2.5 font-mono text-xs text-ink md:hidden"
            >
              <div className="space-y-1">
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-2xl hover:bg-paper-100 font-bold"
                >
                  Explore Experiences
                </Link>
                <Link
                  to="/destinations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-2xl hover:bg-paper-100 font-bold"
                >
                  Destinations (15 States)
                </Link>
                <Link
                  to="/ai-guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-2xl hover:bg-paper-100 font-bold text-teal"
                >
                  ✨ AI Cultural Concierge
                </Link>
                <Link
                  to="/itinerary"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-2xl hover:bg-paper-100 font-bold"
                >
                  Itinerary Feasibility
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-2xl hover:bg-paper-100 font-bold"
                >
                  Saved Experiences
                </Link>
              </div>

              <div className="pt-2.5 border-t border-paper-300 flex flex-col gap-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-paper-100 text-ink rounded-full font-bold border border-paper-300"
                >
                  Preferences & Constraints
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-ink text-paper rounded-full font-bold"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
