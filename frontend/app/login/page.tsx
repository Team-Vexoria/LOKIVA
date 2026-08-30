'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  Zap,
  Sparkles,
  ShieldCheck,
  Layers,
  User,
  ArrowRight,
  Lock,
  Mail
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, demoLogin, isLoading } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('traveler');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        await register(email, fullName, password, role);
      }
      router.push('/explore');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleDemo = async (demoRole: 'traveler' | 'provider' | 'admin') => {
    setError(null);
    try {
      await demoLogin(demoRole);
      if (demoRole === 'provider') router.push('/provider');
      else if (demoRole === 'admin') router.push('/admin');
      else router.push('/explore');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 p-0.5 shadow-xl shadow-orange-500/20 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-extrabold text-2xl bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                L
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-100">Welcome to LOKIVA</h2>
          <p className="text-xs text-slate-400 mt-1">Find the place. Feel the local.</p>
        </div>

        {/* 1-Click Demo Login Personas Box */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Instant Demo Personas (1-Click)</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleDemo('traveler')}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all text-left flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  Aarav Sharma (Traveler)
                </div>
                <div className="text-[10px] text-slate-400">Family · 4 pax · ₹2,000 budget · Low walking</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Log In →
              </span>
            </button>

            <button
              onClick={() => handleDemo('provider')}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-950/20 transition-all text-left flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                  Jaipur Artisan Guild (Provider)
                </div>
                <div className="text-[10px] text-slate-400">Verified Host · Analytics & Listing Hub</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Log In →
              </span>
            </button>

            <button
              onClick={() => handleDemo('admin')}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/20 transition-all text-left flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-slate-100 group-hover:text-purple-400 transition-colors">
                  Platform Admin (Superuser)
                </div>
                <div className="text-[10px] text-slate-400">Provider Verification & Moderation</div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Log In →
              </span>
            </button>
          </div>
        </div>

        {/* Regular Login / Register Form */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex border-b border-slate-800 pb-2">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition-all ${
                tab === 'login'
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Account Login
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-1.5 text-xs font-bold text-center border-b-2 transition-all ${
                tab === 'register'
                  ? 'border-orange-500 text-orange-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {tab === 'register' && (
              <div>
                <label className="font-bold text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="font-bold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@lokiva.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="font-bold text-slate-300 block mb-1">I want to join as</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                >
                  <option value="traveler">Traveler (Discover & Plan Itineraries)</option>
                  <option value="provider">Experience Provider (Host Workshops & Tours)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-xs shadow-lg shadow-orange-500/20 hover:opacity-95 transition-opacity disabled:opacity-50 mt-2"
            >
              {isLoading ? 'Authenticating...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
