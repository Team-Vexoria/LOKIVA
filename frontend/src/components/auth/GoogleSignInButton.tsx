import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { AlertCircle } from 'lucide-react';

interface GoogleSignInButtonProps {
  role?: 'traveler' | 'provider' | 'admin';
  text?: string;
  redirectTo?: string;
  className?: string;
  onError?: (error: string) => void;
}

export function GoogleSignInButton({
  role = 'traveler',
  text = 'Continue with Google',
  redirectTo,
  className = '',
  onError,
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await loginWithGoogle(role);
      const target =
        redirectTo ||
        (role === 'provider'
          ? '/provider'
          : '/explore');
      navigate(target);
    } catch (err: any) {
      console.error('Google Sign-In caught in button:', err);

      let msg = 'Google Sign-In failed. Please try again.';
      if (
        err?.code === 'auth/api-key-not-valid' ||
        err?.message?.includes('api-key-not-valid') ||
        err?.message?.includes('API_KEY_INVALID')
      ) {
        msg =
          'Firebase Web API Key is invalid or restricted. In Firebase Console, go to Project Settings (gear icon) > General > Your Apps (Web App) and copy the exact "apiKey" from the firebaseConfig snippet (do not use a Gemini AI key).';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        msg = 'Google popup was closed before completing sign-in.';
      } else if (err?.code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized in Firebase console. Please add localhost to Authorized Domains.';
      } else if (err?.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by your browser. Please allow popups for localhost.';
      } else if (err?.message) {
        msg = err.message;
      }

      setErrorMessage(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-[#FFFDF9] hover:bg-[#FAF6F0] text-[#3B2316] font-heading font-bold text-sm rounded-2xl border border-[#DFCBB2] hover:border-[#B84A27] shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-[#B84A27] border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{isLoading ? 'Connecting with Google...' : text}</span>
      </button>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#FAF4ED] border border-[#E8DEC8] text-[#B84A27] text-xs font-sans flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
