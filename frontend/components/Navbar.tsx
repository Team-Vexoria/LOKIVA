'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { LocationSelector } from './LocationSelector';
import {
  Compass,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  User,
  ChevronDown,
  LogOut,
  Zap,
  Bookmark,
  Globe2
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, demoLogin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/destinations', label: 'Destinations', icon: Globe2 },
    { href: '/ai-guide', label: 'AI Local Guide', icon: Sparkles, badge: 'AI' },
    { href: '/itinerary', label: 'Itinerary', icon: Calendar },
    { href: '/provider', label: 'Provider Hub', icon: Layers },
    { href: '/admin', label: 'Admin', icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-orange-500 p-0.5 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-lg tracking-tighter bg-gradient-to-r from-orange-400 via-amber-300 to-rose-400 bg-clip-text text-transparent">
                L
              </span>
            </div>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wider text-slate-100">LOKIVA</span>
              <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-400 border border-orange-500/30">
                INDIA
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Find the place. Feel the local.</p>
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
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/70 p-1 rounded-2xl border border-slate-800">
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
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
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

        {/* User / Demo Role Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {user ? `${user.role.toUpperCase()}: ${user.full_name.split(' ')[0]}` : 'Demo Accounts'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 text-xs text-slate-300"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Switch Demo Persona (1-Click)
                </div>
                <button
                  onClick={async () => {
                    await demoLogin('traveler');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors mt-1"
                >
                  <div>
                    <div className="font-bold text-slate-100">Aarav Sharma (Traveler)</div>
                    <div className="text-[10px] text-slate-400">Mumbai Stay · Family · ₹2,000 budget</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Traveler
                  </span>
                </button>
                <button
                  onClick={async () => {
                    await demoLogin('provider');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-100">India Artisan Guild</div>
                    <div className="text-[10px] text-slate-400">Verified Provider · 284 reviews</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    Provider
                  </span>
                </button>
                <button
                  onClick={async () => {
                    await demoLogin('admin');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-100">Platform Admin</div>
                    <div className="text-[10px] text-slate-400">Pan-India Analytics & Moderation</div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Admin
                  </span>
                </button>
                {user && (
                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            href="/explore"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all hover:scale-105"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Discover</span>
          </Link>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-slate-950/95 border-t border-slate-800 py-2 px-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-md text-[10px] font-medium transition-colors ${
                isActive ? 'text-orange-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
