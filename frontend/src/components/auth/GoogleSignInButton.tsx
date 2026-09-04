import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { X, Sparkles } from 'lucide-react';

interface GoogleSignInButtonProps {
  role?: 'traveler' | 'provider' | 'admin';
  text?: string;
  redirectTo?: string;
  className?: string;
  defaultName?: string;
}

export function GoogleSignInButton({
  role = 'traveler',
  text = 'Continue with Google',
  redirectTo,
  className = '',
  defaultName = '',
}: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState(defaultName);

  useEffect(() => {
    if (defaultName) {
      setNameInput(defaultName);
    }
  }, [defaultName]);

  const executeSignIn = async (chosenName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const finalName = chosenName?.trim() || nameInput.trim() || undefined;
      await loginWithGoogle(role, finalName);
      setIsNameModalOpen(false);
      const target =
        redirectTo ||
        (role === 'admin'
          ? '/admin'
          : role === 'provider'
          ? '/provider'
          : '/explore');
      navigate(target);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      setError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    // If a non-empty name was already supplied (e.g. typed into registration form), use it directly
    if (defaultName && defaultName.trim().length > 0) {
      executeSignIn(defaultName.trim());
      return;
    }
    // Otherwise, prompt the user for their name so their account never defaults to Aarav
    setIsNameModalOpen(true);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    executeSignIn(nameInput.trim());
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-xl border border-gray-200 shadow-sm transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
        <span>{text}</span>
      </button>

      {error && !isNameModalOpen && (
        <p className="mt-2 text-xs text-rose-400 text-center bg-rose-950/40 p-2 rounded-lg border border-rose-800/40">
          {error}
        </p>
      )}

      {/* Name Input Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-paper-400 shadow-2xl p-6 sm:p-7 max-w-sm w-full font-sans text-ink space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-paper-100 border border-paper-300 flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-ink leading-tight">
                    Google Sign-In
                  </h3>
                  <p className="text-[11px] text-dusk font-mono">Personalize your journey</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNameModalOpen(false)}
                className="p-1.5 text-dusk hover:text-ink hover:bg-paper-100 rounded-full transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subtitle / context */}
            <p className="text-xs text-dusk-700 leading-relaxed">
              What should we call you? Your name will be featured on your cultural routes, itineraries, and profile.
            </p>

            {/* Name Input Form */}
            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-dusk uppercase tracking-wider block">
                  Your Full Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Piyush"
                  className="w-full bg-paper-100 border border-paper-300 rounded-xl p-3 text-sm text-ink font-semibold focus:outline-none focus:border-marigold focus:ring-2 focus:ring-marigold/20 font-sans transition"
                />
              </div>

              {error && (
                <p className="text-xs text-clay bg-clay-50 p-2.5 rounded-xl border border-clay-200 text-center font-sans">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNameModalOpen(false)}
                  className="flex-1 py-2.5 bg-paper-100 hover:bg-paper-200 text-dusk-800 font-bold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!nameInput.trim() || isLoading}
                  className="flex-1 py-2.5 bg-ink hover:bg-ink-800 text-paper font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-marigold border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Continue →</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
