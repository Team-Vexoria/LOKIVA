'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '../ThemeToggle';
import { LocationSelector } from '../LocationSelector';
import {
  Compass,
  Sparkles,
  Globe2,
  ChevronDown,
  User,
  Building,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export function PublicHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);

  const navLinks = [
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/destinations', label: 'Destinations', icon: Globe2 },
    { href: '/ai-guide', label: 'AI Local Guide', icon: Sparkles, badge: 'AI' }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
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
              <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-gradient-to-r from-orange-500/10 to-rose-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                INDIA
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">Find the place. Feel the local.</p>
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

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/70 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
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

        {/* Right Controls: Role-Specific Login Dropdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Login Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLoginMenuOpen(!loginMenuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-105"
            >
              <span>Sign In</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {loginMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 text-xs text-slate-700 dark:text-slate-300"
                onMouseLeave={() => setLoginMenuOpen(false)}
              >
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Select Portal
                </div>

                <div className="py-1 space-y-1">
                  <Link
                    href="/login/traveler"
                    onClick={() => setLoginMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-500 transition-colors">
                        Traveler Login
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Discover & plan authentic trips
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/login/provider"
                    onClick={() => setLoginMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
                        Provider Portal
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        List & manage experiences
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/login/admin"
                    onClick={() => setLoginMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-500 transition-colors">
                        Admin Portal
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Platform governance & ops
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
