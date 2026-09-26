import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { Compass, AlertCircle } from 'lucide-react';

export function TravelerRegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/explore';
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await register(email.trim(), fullName.trim(), password, 'traveler');
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl border border-[#DFCBB2] p-8 space-y-6 shadow-xl text-[#3B2316]">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-[#3B2316] flex items-center justify-center shadow-md">
              <Compass className="w-6 h-6 text-[#D47A39]" />
            </div>
            <span className="text-2xl font-bold font-display text-[#3B2316] tracking-tight">LOKIVA</span>
          </Link>
          <h1 className="text-2xl font-black font-display text-[#3B2316]">Join as Cultural Traveler</h1>
          <p className="text-xs sm:text-sm text-[#7A5C49] font-meta">
            Save cultural trails, custom itineraries, and AI recommendations
          </p>
        </div>

        <GoogleSignInButton role="traveler" text="Sign up with Google" redirectTo={redirectTo} />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E2D5BE]" />
          <span className="text-[11px] font-meta font-extrabold text-[#7A5C49] uppercase tracking-wider">
            Or with Email
          </span>
          <div className="flex-1 h-px bg-[#E2D5BE]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-meta text-xs">
          <div className="space-y-1.5">
            <label className="text-[#3B2316] uppercase block font-bold tracking-wider text-xs">
              Full Name
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder=""
              className="w-full bg-[#FAF6F0] border border-[#DFCBB2] focus:border-[#B84A27] rounded-2xl p-3.5 text-sm text-[#3B2316] outline-none font-sans transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#3B2316] uppercase block font-bold tracking-wider text-xs">
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              className="w-full bg-[#FAF6F0] border border-[#DFCBB2] focus:border-[#B84A27] rounded-2xl p-3.5 text-sm text-[#3B2316] outline-none font-sans transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[#3B2316] uppercase block font-bold tracking-wider text-xs">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              className="w-full bg-[#FAF6F0] border border-[#DFCBB2] focus:border-[#B84A27] rounded-2xl p-3.5 text-sm text-[#3B2316] outline-none font-sans transition-all"
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-[#FAF4ED] border border-[#E8DEC8] text-[#B84A27] text-xs font-sans flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#B84A27] to-[#D47A39] hover:from-[#9E3C1D] hover:to-[#B84A27] text-[#FFFDF9] font-heading font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs sm:text-sm text-[#7A5C49] font-sans border-t border-[#E2D5BE]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#B84A27] font-bold hover:underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TravelerRegisterPage;
