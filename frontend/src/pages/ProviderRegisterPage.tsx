import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { Compass, Briefcase, ShieldCheck } from 'lucide-react';

export function ProviderRegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !email) return;
    setLoading(true);
    setError(null);
    try {
      await register(email, businessName, password, 'provider');
      navigate('/provider');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-paper-400 p-8 space-y-6 shadow-xl text-ink">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-teal flex items-center justify-center shadow-md">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-ink">Host Registration</span>
          </Link>
          <h1 className="text-xl font-bold font-display text-ink">List Your Cultural Experience</h1>
          <p className="text-xs text-dusk-600 font-sans">Join verified local artisans, storytellers, and culinary hosts</p>
        </div>

        <GoogleSignInButton role="provider" text="Sign up with Google" defaultName={businessName} />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-paper-300" />
          <span className="text-[10px] font-mono font-bold text-dusk uppercase tracking-wider">
            Or Host Profile
          </span>
          <div className="flex-1 h-px bg-paper-300" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-dusk uppercase block font-bold">Studio / Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Sanganer Blue Pottery Studio"
              className="w-full bg-paper-100 border border-paper-300 rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-teal font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-dusk uppercase block font-bold">Contact Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="host@artisanstudio.in"
              className="w-full bg-paper-100 border border-paper-300 rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-teal font-sans"
            />
          </div>

          <div className="space-y-1">
            <label className="text-dusk uppercase block font-bold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-paper-100 border border-paper-300 rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-teal font-sans"
            />
          </div>

          {error && (
            <p className="text-xs text-clay bg-clay-50 p-2.5 rounded-xl border border-clay-200 text-center font-sans">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal hover:bg-teal-700 text-paper font-bold rounded-xl text-xs transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Creating Host Account...' : 'Register as Host →'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-dusk-600 font-sans">
          Already registered?{' '}
          <Link to="/login/provider" className="text-teal font-bold hover:underline">
            Host Login
          </Link>
        </div>
      </div>
    </div>
  );
}
