'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { ThemeToggle } from '../ThemeToggle';
import { LocationSelector } from '../LocationSelector';
import {
  Compass,
  Sparkles,
  Globe2,
  Calendar,
  Bookmark,
  User,
  LogOut,
  ChevronDown,
  MapPin
} from 'lucide-react';

export function TravelerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/destinations', label: 'Destinations', icon: Globe2 },
    { href: '/ai-guide', label: 'AI Local Guide', icon: Sparkles, badge: 'AI' },
    { href: '/itinerary', label: 'Itinerary', icon: Calendar },
    { href: '/saved', label: 'Saved', icon: Bookmark }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Traveler Brand Logo */}
        <Link href="/explore" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-orange-500 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-lg tracking-tighter bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 bg-clip-text text-transparent">
                L
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wider text-slate-900 dark:text-slate-100">LOKIVA</span>
              <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                TRAVELER
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Discover India, your way.</p>
          </div>
        </Link>

        {/* Global Location Selector Bar */}
        <div className="hidden lg:block shrink-0">
          <LocationSelector
            onSelectLocation={(loc) => {
              if (loc.city) {
                router.push(`/explore?city=${encodeURIComponent(loc.city)}`);
              } else if (loc.latitude && loc.longitude) {
                router.push(`/explore?lat=${loc.latitude}&lng=${loc.longitude}&radius=${loc.radius_km || 10}`);
              }
            }}
          />
        </div>

        {/* Traveler Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/70 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 animate-pulse">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Profile Dropdown */}
          <div className="relative">
            {user ? (
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-orange-500/40 transition-colors shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white text-[10px] font-bold">
                  {user.full_name ? user.full_name[0].toUpperCase() : 'T'}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.full_name.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            ) : (
              <Link
                href="/login/traveler"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
              >
                Sign In
              </Link>
            )}

            {profileOpen && user && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 text-xs text-slate-700 dark:text-slate-300"
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{user.full_name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Traveler Profile & Preferences</span>
                  </Link>
                  <Link
                    href="/saved"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                    <span>Saved Experiences</span>
                  </Link>
                  <Link
                    href="/itinerary"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Day Itinerary</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      logout('traveler');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out (Traveler)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar for Travelers */}
      <div className="md:hidden flex items-center justify-around bg-white/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800 py-2 px-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-orange-500 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
            pathname === '/profile'
              ? 'text-orange-500 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </Link>
      </div>
    </header>
  );
}
