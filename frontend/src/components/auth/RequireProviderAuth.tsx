import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';

interface RequireProviderAuthProps {
  children: React.ReactNode;
}

export function RequireProviderAuth({ children }: RequireProviderAuthProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-3 border-[#C85A32] border-t-transparent animate-spin" />
          <p className="font-sans text-xs font-bold text-[#556275] uppercase tracking-widest">
            Authenticating Artisan & Host Portal...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in at all -> redirect to provider auth
  if (!isAuthenticated || !user) {
    const target = `${location.pathname}${location.search}`;
    return <Navigate to={`/provider/auth?redirect=${encodeURIComponent(target)}`} replace />;
  }

  // Logged in as traveler -> must register/login as provider
  if (user.role !== 'provider' && user.role !== 'admin') {
    const target = `${location.pathname}${location.search}`;
    return <Navigate to={`/provider/auth?upgrade=true&redirect=${encodeURIComponent(target)}`} replace />;
  }

  return <>{children}</>;
}

export default RequireProviderAuth;
