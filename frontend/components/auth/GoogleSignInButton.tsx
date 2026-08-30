'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';

interface GoogleSignInButtonProps {
  role?: string;
  redirectTo?: string;
  text?: string;
  className?: string;
}

export function GoogleSignInButton({
  role = 'traveler',
  redirectTo,
  text = 'Continue with Google',
  className = '',
}: GoogleSignInButtonProps) {
  const { loginWithGoogle, isLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [inProgress, setInProgress] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setInProgress(true);
    try {
      await loginWithGoogle(role);
      const destination =
        redirectTo ||
        (role === 'admin' ? '/admin' : role === 'provider' ? '/provider' : '/explore');
      router.push(destination);
    } catch (err: any) {
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setInProgress(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center">
          {error}
        </div>
      )}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading || inProgress}
        className={`w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${className}`}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{inProgress ? 'Connecting to Google...' : text}</span>
      </button>
    </div>
  );
}
