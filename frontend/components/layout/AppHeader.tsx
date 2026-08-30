'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { TravelerHeader } from './TravelerHeader';
import { ProviderHeader } from './ProviderHeader';
import { AdminHeader } from './AdminHeader';
import { PublicHeader } from './PublicHeader';

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Auth entry pages have dedicated standalone cards
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  // Admin routes -> Admin Header
  if (pathname.startsWith('/admin')) {
    return <AdminHeader />;
  }

  // Provider routes -> Provider Header
  if (pathname.startsWith('/provider')) {
    return <ProviderHeader />;
  }

  // If logged in as Admin on other pages
  if (user?.role === 'admin') {
    return <AdminHeader />;
  }

  // If logged in as Provider on other pages
  if (user?.role === 'provider') {
    return <ProviderHeader />;
  }

  // If logged in as Traveler on other pages
  if (user?.role === 'traveler') {
    return <TravelerHeader />;
  }

  // Specific Traveler-oriented routes
  if (
    pathname.startsWith('/explore') ||
    pathname.startsWith('/ai-guide') ||
    pathname.startsWith('/itinerary') ||
    pathname.startsWith('/saved') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/destinations') ||
    pathname.startsWith('/destination') ||
    pathname.startsWith('/experience')
  ) {
    return <TravelerHeader />;
  }

  // Public Landing Page `/`
  return <PublicHeader />;
}
