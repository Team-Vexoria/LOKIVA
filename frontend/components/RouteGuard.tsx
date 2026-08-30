'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: ('traveler' | 'provider' | 'admin')[];
  fallbackUrl?: string;
}

export function RouteGuard({ children, allowedRoles, fallbackUrl }: RouteGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not logged in -> redirect to target role's login
        if (fallbackUrl) {
          router.push(fallbackUrl);
        } else if (allowedRoles.includes('admin')) {
          router.push('/login/admin');
        } else if (allowedRoles.includes('provider')) {
          router.push('/login/provider');
        } else {
          router.push('/login/traveler');
        }
      } else if (!allowedRoles.includes(user.role)) {
        // Role mismatch -> redirect to appropriate portal
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'provider') {
          router.push('/provider');
        } else {
          router.push('/explore');
        }
      }
    }
  }, [user, isLoading, allowedRoles, fallbackUrl, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 dark:text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold">Verifying secure access...</span>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
