import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Menu, X, ArrowRight, User } from 'lucide-react';
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
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/explore', label: 'Explore' },
    { to: '/destinations', label: 'Destinations' },
    { to: '/ai-guide', label: 'AI Concierge' },
    { to: '/itinerary', label: 'Itinerary' },
    { to: '/saved', label: 'Saved' },
  ];

  const currentPersona = PERSONAS[(user?.role as keyof typeof PERSONAS) || 'traveler'];

  return (
    <header className="fixed top-2 sm:top-3 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div
        className={`mx-auto transition-all duration-300 ease-out ${
          isScrolled ? 'max-w-4xl' : 'max-w-5xl'
        }`}
      >
        {/* Floating capsule nav */}
        <nav
          className={`pointer-events-auto transition-all duration-300 ease-out rounded-full border shadow-sm ${
            isScrolled
              ? 'bg-white/95 backdrop-blur-lg border-paper-400 py-1 px-3.5 sm:px-4 shadow-ink/8'
              : 'bg-[#EEF1EE]/95 backdrop-blur-md border-[#D0D7CF] py-1.5 sm:py-2 px-4 sm:px-5 shadow-ink/5'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            {/* Left: Brand Logo & Wordmark */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <img
                src="/logo.png"
                alt="LOKIVA"
                className={`w-auto object-contain transition-all duration-300 ${
                  isScrolled ? 'h-6' : 'h-6 sm:h-7'
                }`}
              />
              <span className="text-lg sm:text-xl font-bold font-display text-ink tracking-tight leading-none">
                LOKIVA
              </span>
            </Link>

            {/* Center: Links (desktop) in one single line without wrapping */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-2.5 py-1 text-xs lg:text-[13px] font-medium whitespace-nowrap transition-colors ${
                    isActive(to)
                      ? 'text-ink font-bold'
                      : 'text-dusk hover:text-ink'
                  }`}
                >
                  {label}
                  {isActive(to) && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-0.5 left-2.5 right-2.5 h-0.5 bg-marigold rounded-full"
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Persona switcher */}
              <div className="relative">
                <button
                  onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                  className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 bg-white/90 hover:bg-white border border-paper-400 rounded-full text-xs text-ink shadow-sm transition whitespace-nowrap"
                >
                  <span className="w-4 h-4 rounded-full bg-paper-200 flex items-center justify-center text-[9px] font-bold text-ink">
                    {currentPersona.label.charAt(0)}
                  </span>
                  <span className="font-medium text-[11px]">{currentPersona.label}</span>
                  <ChevronDown className="w-3 h-3 text-dusk" />
                </button>

                <AnimatePresence>
                  {personaDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-paper-400 rounded-2xl shadow-xl p-1.5 z-50 font-mono text-xs"
                    >
                      <p className="px-2.5 pt-1.5 pb-1 text-[10px] text-dusk uppercase tracking-wider">
                        Switch Workspace
                      </p>
                      <button
                        onClick={() => {
                          demoLogin('traveler');
                          setPersonaDropdownOpen(false);
                          navigate('/explore');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-paper-100 transition flex items-center justify-between"
                      >
                        <span className="font-semibold text-ink">Traveler Flow</span>
                        <span className="text-[10px] text-teal">Consumer</span>
                      </button>
                      <button
                        onClick={() => {
                          demoLogin('provider');
                          setPersonaDropdownOpen(false);
                          navigate('/provider/dashboard');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-paper-100 transition flex items-center justify-between"
                      >
                        <span className="font-semibold text-ink">Provider Console</span>
                        <span className="text-[10px] text-marigold-700">Artisan Host</span>
                      </button>
                      <button
                        onClick={() => {
                          demoLogin('admin');
                          setPersonaDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-paper-100 transition flex items-center justify-between"
                      >
                        <span className="font-semibold text-ink">Admin Dashboard</span>
                        <span className="text-[10px] text-dusk">Moderation</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User profile or login */}
              {user ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-ink font-semibold max-w-[90px] truncate text-[11px]">
                    {user.full_name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={() => logout()}
                    className="p-1 text-dusk hover:text-ink transition"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3 py-1 bg-ink hover:bg-ink-800 text-paper rounded-full text-xs font-semibold transition shadow-sm whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}

              <Link
                to="/itinerary"
                className="px-3 py-1 bg-marigold hover:bg-marigold-600 text-ink rounded-full text-xs font-bold transition shadow-sm flex items-center gap-1 whitespace-nowrap"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-ink hover:bg-paper-200 rounded-full transition"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile slide-down menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pt-3 pb-2 border-t border-paper-300 mt-2 space-y-2 text-xs"
              >
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-xl transition ${
                      isActive(to)
                        ? 'bg-paper-200 text-ink font-bold'
                        : 'text-dusk hover:text-ink hover:bg-paper-100'
                    }`}
                  >
                    {label}
                  </Link>
                ))}

                <div className="pt-2 border-t border-paper-300 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        demoLogin('traveler');
                        setMobileMenuOpen(false);
                      }}
                      className="px-2.5 py-1 bg-paper-100 rounded-lg text-[10px] font-mono font-bold text-ink"
                    >
                      Traveler
                    </button>
                    <button
                      onClick={() => {
                        demoLogin('provider');
                        setMobileMenuOpen(false);
                        navigate('/provider/dashboard');
                      }}
                      className="px-2.5 py-1 bg-paper-100 rounded-lg text-[10px] font-mono font-bold text-ink"
                    >
                      Provider
                    </button>
                  </div>
                  {user ? (
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-clay font-medium"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-bold text-ink"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  );
}