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

const PERSONAS = {
  traveler: { label: 'Traveler' },
  provider: { label: 'Provider' },
  admin: { label: 'Admin' },
} as const;

export function Navbar() {
  const { user, logout, demoLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/explore', label: 'Explore' },
    { to: '/destinations', label: 'Destinations' },
    { to: '/ai-guide', label: 'AI Concierge', icon: Sparkles },
    { to: '/itinerary', label: 'Itinerary' },
    { to: '/saved', label: 'Saved', icon: Bookmark },
  ];

  const currentPersona = PERSONAS[(user?.role as keyof typeof PERSONAS) || 'traveler'];

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto">
        {/* Floating capsule nav */}
        <nav
          className={`pointer-events-auto transition-all duration-300 ease-out rounded-full border shadow-md ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-lg border-paper-400 py-2 px-4 sm:px-5 shadow-ink/8'
              : 'bg-[#EEF1EE]/92 backdrop-blur-md border-[#D0D7CF] py-2 sm:py-3 px-4 sm:px-5 shadow-ink/5'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Left: Brand Logo & Wordmark */}
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-paper-400 p-0.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src="/logo.png"
                  alt="LOKIVA Platform Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-bold font-display text-ink tracking-tight">
                  LOKIVA
                </span>
                <span className="hidden sm:inline-block text-[9px] uppercase font-mono tracking-wider text-teal font-bold px-1.5 py-0.5 bg-teal-50 rounded-full border border-teal-200">
                  India
                </span>
              </div>
            </Link>

            {/* Center: Links (desktop) */}
            <div className="hidden md:flex items-center gap-0.5 sm:gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-3 py-1.5 text-[13.5px] transition-colors flex items-center gap-1.5 ${
                    isActive(to)
                      ? 'text-ink font-semibold'
                      : 'text-dusk font-medium hover:text-ink'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 text-marigold" />}
                  {label}
                  {isActive(to) && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-0.5 left-3 right-3 h-0.5 bg-marigold rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Persona switcher */}
              <div className="relative">
                <button
                  onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                  className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 bg-white/80 hover:bg-white border border-paper-400 rounded-full text-xs text-ink shadow-sm transition"
                >
                  <span className="w-5 h-5 rounded-full bg-paper-200 flex items-center justify-center text-[10px] font-semibold text-ink">
                    {currentPersona.label.charAt(0)}
                  </span>
                  <span className="font-medium">{currentPersona.label}</span>
                  <ChevronDown className="w-3 h-3 text-dusk" />
                </button>

                <AnimatePresence>
                  {personaDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-paper-400 rounded-2xl shadow-xl p-1.5 z-50"
                    >
                      <p className="px-2.5 pt-1.5 pb-1 text-[11px] text-dusk">
                        View as
                      </p>
                      <button
                        onClick={() => {
                          demoLogin('traveler');
                          setPersonaDropdownOpen(false);
                          navigate('/explore');
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-paper-100 rounded-xl flex items-center gap-2.5 text-ink transition"
                      >
                        <span className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-teal" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">The Sharma Family</span>
                          <span className="block text-xs text-dusk">Traveler, planning a family trip</span>
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          demoLogin('provider');
                          setPersonaDropdownOpen(false);
                          navigate('/provider');
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-paper-100 rounded-xl flex items-center gap-2.5 text-ink transition"
                      >
                        <span className="w-7 h-7 rounded-full bg-marigold-50 flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-3.5 h-3.5 text-marigold-600" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">Artisan Host Guild</span>
                          <span className="block text-xs text-dusk">Provider, hosts a Bandra workshop</span>
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          demoLogin('admin');
                          setPersonaDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full text-left px-2.5 py-2 hover:bg-paper-100 rounded-xl flex items-center gap-2.5 text-ink transition"
                      >
                        <span className="w-7 h-7 rounded-full bg-clay-50 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-3.5 h-3.5 text-clay" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">Platform Admin</span>
                          <span className="block text-xs text-dusk">Handles KYC and moderation</span>
                        </span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile / sign in */}
              {user ? (
                <div className="flex items-center gap-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-paper-200 hover:bg-paper-300 text-ink rounded-full text-xs font-medium transition"
                  >
                    <User className="w-3 h-3" />
                    <span>{user.full_name?.split(' ')[0] || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Log out"
                    className="p-1.5 text-dusk hover:text-clay hover:bg-paper-300 rounded-full transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-2.5 py-1 text-xs font-medium text-ink hover:text-marigold-700 transition"
                >
                  Log in
                </Link>
              )}

              {/* Primary CTA */}
              <Link
                to="/itinerary"
                className="px-4 py-1.5 bg-marigold hover:bg-marigold-600 text-ink text-[13.5px] font-semibold rounded-full transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Start planning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Mobile controls */}
            <div className="md:hidden flex items-center gap-1.5">
              <Link
                to="/itinerary"
                className="px-3 py-1.5 bg-marigold text-ink text-[13px] font-semibold rounded-full shadow-sm"
              >
                Start planning
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-ink hover:bg-paper-300 rounded-full transition"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto mt-2 bg-white/95 backdrop-blur-lg border border-paper-400 rounded-3xl p-4 shadow-2xl space-y-3 text-sm text-ink md:hidden"
            >
              <div className="space-y-0.5">
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-2xl hover:bg-paper-100 font-medium"
                >
                  Explore experiences
                </Link>
                <Link
                  to="/destinations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-2xl hover:bg-paper-100 font-medium"
                >
                  Destinations
                </Link>
                <Link
                  to="/ai-guide"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-2xl hover:bg-paper-100 font-medium text-teal flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Concierge
                </Link>
                <Link
                  to="/itinerary"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-2xl hover:bg-paper-100 font-medium"
                >
                  Itinerary
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-2xl hover:bg-paper-100 font-medium"
                >
                  Saved
                </Link>
              </div>

              <div className="pt-3 border-t border-paper-300 flex flex-col gap-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-paper-100 text-ink rounded-full font-medium border border-paper-300"
                >
                  Preferences &amp; constraints
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-ink text-paper rounded-full font-medium"
                >
                  Sign in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}