import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { Compass, User, Briefcase, Shield, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/explore';
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(redirectTo);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl border border-[#DFCBB2] p-8 space-y-6 shadow-xl text-[#3B2316]">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-[#3B2316] flex items-center justify-center shadow-md">
              <Compass className="w-6 h-6 text-[#D47A39]" />
            </div>
            <span className="text-2xl font-bold font-display text-[#3B2316] tracking-tight">LOKIVA</span>
          </Link>
          <h1 className="text-2xl font-black font-display text-[#3B2316]">Welcome Back</h1>
          <p className="text-xs sm:text-sm text-[#7A5C49] font-meta">
            Sign in to access verified cultural circuits, group travel hubs, and AI recommendations
          </p>
        </div>

        {/* Real Google OAuth Popup Sign In */}
        <GoogleSignInButton role="traveler" redirectTo={redirectTo} />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E2D5BE]" />
          <span className="text-[11px] font-meta font-extrabold text-[#7A5C49] uppercase tracking-wider">
            Or with Email
          </span>
          <div className="flex-1 h-px bg-[#E2D5BE]" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-meta text-xs">
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
              autoComplete="current-password"
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

          {/* Approved Warm Spiced Terracotta Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#B84A27] to-[#D47A39] hover:from-[#9E3C1D] hover:to-[#B84A27] text-[#FFFDF9] font-heading font-extrabold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Instant Demo Section */}
        <div className="pt-4 border-t border-paper-300 space-y-2">
          <span className="text-[10px] font-mono font-bold text-dusk uppercase tracking-wider block text-center">
            Instant 1-Click Demo Personas
          </span>
          <div className="grid grid-cols-2 gap-2 font-mono">
            <button
              onClick={() => {
                demoLogin('traveler', 'Piyush Kumar', 'piyush@lokiva.com');
                navigate(redirectTo);
              }}
              className="p-2 bg-paper-100 hover:bg-paper-200 rounded-xl text-[11px] font-bold text-ink border border-paper-300 flex flex-col items-center gap-1 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-teal" />
              <span>Piyush Kumar</span>
            </button>
            <button
              onClick={() => {
                demoLogin('provider');
                navigate('/provider');
              }}
              className="p-2 bg-paper-100 hover:bg-paper-200 rounded-xl text-[11px] font-bold text-ink border border-paper-300 flex flex-col items-center gap-1 transition cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5 text-marigold-600" />
              <span>Artisan Host</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-dusk-600 font-sans">
          New explorer?{' '}
          <Link to="/register/traveler" className="text-[#B84A27] font-bold hover:underline underline-offset-4">
            Create Traveler Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
