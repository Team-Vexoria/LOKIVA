import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AdminStats, Provider } from '../types';
import {
  Shield,
  Users,
  CheckCircle2,
  AlertTriangle,
  Compass,
  DollarSign,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [s, p] = await Promise.all([
          api.getAdminStats(),
          api.getAdminProviders(),
        ]);
        setStats(s);
        setProviders(p);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleVerify = async (id: number) => {
    try {
      await api.verifyProvider(id, true);
      setProviders(providers.map((p) => (p.id === id ? { ...p, is_verified: true } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-clay rounded-full text-xs font-mono font-bold shadow-sm">
            <Shield className="w-3.5 h-3.5" />
            <span>Platform Moderation & Trust Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink">
            Admin Overview & KYC Queue
          </h1>
          <p className="text-xs font-mono text-dusk">
            Real-time pan-India metrics, artisan KYC verifications, and quality control.
          </p>
        </div>

        {/* Top KPI Cards (Mono) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Verified Experiences</span>
              <Compass className="w-4 h-4 text-marigold" />
            </div>
            <div className="text-2xl font-extrabold text-ink">{stats?.total_experiences || 229}</div>
            <span className="text-[10px] text-teal font-semibold">Across 15 Indian States</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Artisan Providers</span>
              <Users className="w-4 h-4 text-ink" />
            </div>
            <div className="text-2xl font-extrabold text-ink">{stats?.total_providers || 18}</div>
            <span className="text-[10px] text-dusk">Local guilds & home ateliers</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Active Travelers</span>
              <Users className="w-4 h-4 text-teal" />
            </div>
            <div className="text-2xl font-extrabold text-ink">{stats?.total_users || 1240}</div>
            <span className="text-[10px] text-teal font-semibold">894 feasible plans solved</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Direct Community Payout</span>
              <DollarSign className="w-4 h-4 text-teal" />
            </div>
            <div className="text-2xl font-extrabold text-ink">₹{stats?.total_revenue || '12,48,000'}</div>
            <span className="text-[10px] text-teal font-semibold">100% fair artisan rate</span>
          </div>
        </div>

        {/* Provider Verification Queue Table */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-xl font-display font-bold text-ink">
                Artisan Verification & KYC Queue
              </h2>
              <p className="text-xs text-dusk font-sans">
                Local hosts applying for verified badges and tourist insurance.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-paper-100 text-dusk uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Business / Studio</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-300">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-paper-50 transition">
                    <td className="p-3.5 font-bold text-ink">{p.business_name}</td>
                    <td className="p-3.5 text-dusk-700">{p.city}, {p.state}</td>
                    <td className="p-3.5 text-dusk">{p.contact_email || 'contact@host.in'}</td>
                    <td className="p-3.5">
                      {p.is_verified ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-marigold-50 text-marigold-700 border border-marigold-200">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {!p.is_verified ? (
                        <button
                          onClick={() => handleVerify(p.id)}
                          className="px-3 py-1.5 bg-teal hover:bg-teal-700 text-paper rounded-xl text-xs font-bold transition shadow-sm"
                        >
                          Approve KYC
                        </button>
                      ) : (
                        <span className="text-dusk font-medium">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
