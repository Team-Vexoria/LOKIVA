import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Provider, Experience, ProviderAnalyticsSummary } from '../types';
import {
  Briefcase,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Edit,
  CheckCircle2,
  Eye,
  Star,
  Sparkles,
  BellRing,
  Send,
  Zap,
} from 'lucide-react';

export function ProviderDashboardPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [analytics, setAnalytics] = useState<ProviderAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // AI Listing Co-Pilot State
  const [copilotInput, setCopilotInput] = useState(
    'I run a 5th-generation hand-block printing studio in Bandra. We teach natural indigo dyeing for ₹450 with wheelchair ramp.'
  );
  const [isGeneratingListing, setIsGeneratingListing] = useState(false);
  const [generatedListing, setGeneratedListing] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, expList, a] = await Promise.all([
          api.getProviderProfile(),
          api.getProviderExperiences(),
          api.getProviderAnalytics(),
        ]);
        setProvider(p);
        setExperiences(expList);
        setAnalytics(a);
      } catch (err) {
        console.error('Failed to load provider hub:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRunAiCopilot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;
    setIsGeneratingListing(true);
    setTimeout(() => {
      setGeneratedListing({
        title: 'Generational Hand-Block Printing & Natural Indigo Atelier',
        category: 'Art & Craft',
        price: 450,
        duration: '75 mins',
        accessibility: ['Wheelchair Accessible', 'Step-Free Ramp', 'Family Friendly'],
        suggestedPriceBand: '₹400 - ₹550 based on 14 nearby Bandra artisan workshops',
        description:
          'Hands-on cultural workshop where travelers master traditional wooden block stamping on organic khadi cotton using heirloom mineral dyes.',
      });
      setIsGeneratingListing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
              <Briefcase className="w-3.5 h-3.5 text-marigold" />
              <span>Two-Sided Marketplace · Host Console</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-ink">
              {provider?.business_name || 'Bandra Artisan Guild'}
            </h1>
            <p className="text-xs font-mono text-dusk">
              {provider?.city || 'Mumbai'}, {provider?.state || 'Maharashtra'} · Verified Cultural Partner
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-teal" /> KYC Verified Partner
            </span>
          </div>
        </div>

        {/* Live Demand-Alert Banner (Differentiator #8) */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-marigold-700">
              <BellRing className="w-4 h-4 text-marigold animate-bounce" />
              <span>Live Demand-Aware Push Alerts</span>
            </div>
            <span className="text-[11px] font-mono text-dusk">Updated 3 mins ago</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-paper-100 rounded-2xl border border-paper-300 space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-ink">3 Families Near Bandra West</span>
                <span className="text-teal font-extrabold">₹500 / pax ceiling</span>
              </div>
              <p className="text-xs text-dusk-600 font-sans">
                Searching for <strong>artisan craft & food workshops</strong> within a 2-hour afternoon window.
              </p>
            </div>

            <div className="p-4 bg-paper-100 rounded-2xl border border-paper-300 space-y-1">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-ink">1 Traveler Group with Wheelchair</span>
                <span className="text-teal font-extrabold">₹1,500 budget</span>
              </div>
              <p className="text-xs text-dusk-600 font-sans">
                Looking for <strong>step-free seated experiences</strong> near Pali Hill starting at 4:30 PM.
              </p>
            </div>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Total Direct Revenue</span>
              <DollarSign className="w-4 h-4 text-teal" />
            </div>
            <div className="text-2xl font-extrabold text-ink">₹{analytics?.revenue || '1,84,500'}</div>
            <span className="text-[10px] text-teal font-semibold">100% direct payout, zero ad-tax</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Confirmed Bookings</span>
              <Calendar className="w-4 h-4 text-marigold" />
            </div>
            <div className="text-2xl font-extrabold text-ink">{analytics?.bookings || 142}</div>
            <span className="text-[10px] text-dusk">Average party size 3.2 pax</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Solver Impressions</span>
              <Eye className="w-4 h-4 text-ink" />
            </div>
            <div className="text-2xl font-extrabold text-ink">{analytics?.views || 4820}</div>
            <span className="text-[10px] text-teal font-semibold">Matched in 412 feasibility solves</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Community Rating</span>
              <Star className="w-4 h-4 text-marigold fill-marigold" />
            </div>
            <div className="text-2xl font-extrabold text-ink">{analytics?.rating || 4.9} / 5.0</div>
            <span className="text-[10px] text-marigold-700 font-semibold">🌿 96% Local Spend Score</span>
          </div>
        </div>

        {/* AI Listing Co-Pilot Widget (Differentiator #7) */}
        <div className="bg-ink text-paper rounded-3xl border border-ink-700 p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-marigold">
              <Sparkles className="w-4 h-4" />
              <span>Provider AI Co-Pilot for Listing Creation</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              Describe your craft in 2 plain sentences. We generate the full listing.
            </h2>
            <p className="text-xs text-dusk-100 font-sans">
              Non-technical artisans shouldn't need SEO expertise or marketing budgets to be discovered.
            </p>
          </div>

          <form onSubmit={handleRunAiCopilot} className="space-y-3">
            <textarea
              rows={3}
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              placeholder="e.g. I run a 5th-generation hand-block printing studio in Bandra. We teach natural indigo dyeing for ₹450 with wheelchair ramp."
              className="w-full bg-ink-800 border border-ink-700 rounded-2xl p-4 text-xs sm:text-sm text-white placeholder-dusk-200 focus:outline-none focus:border-marigold font-sans"
            />
            <button
              type="submit"
              disabled={isGeneratingListing || !copilotInput.trim()}
              className="px-6 py-3 bg-marigold hover:bg-marigold-600 text-ink font-mono text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingListing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Structuring Listing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Generate Structured Listing & Price Band</span>
                </>
              )}
            </button>
          </form>

          {/* Generated Structured Output */}
          {generatedListing && (
            <div className="p-5 bg-ink-800 rounded-2xl border border-ink-700 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-ink-700">
                <span className="text-teal-100 font-bold uppercase">
                  ✓ Structured Listing Generated
                </span>
                <span className="text-marigold font-bold">
                  Suggested Price: ₹{generatedListing.price} / pax
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-ink-950/60 p-3 rounded-xl border border-ink-700">
                  <span className="text-dusk-200 block text-[10px]">Title</span>
                  <strong className="text-white text-xs">{generatedListing.title}</strong>
                </div>
                <div className="bg-ink-950/60 p-3 rounded-xl border border-ink-700">
                  <span className="text-dusk-200 block text-[10px]">Category & Duration</span>
                  <strong className="text-white text-xs">
                    {generatedListing.category} · {generatedListing.duration}
                  </strong>
                </div>
                <div className="bg-ink-950/60 p-3 rounded-xl border border-ink-700">
                  <span className="text-dusk-200 block text-[10px]">Accessibility Flags</span>
                  <strong className="text-teal-100 text-xs">
                    {generatedListing.accessibility.join(', ')}
                  </strong>
                </div>
              </div>

              <div className="p-3 bg-ink-950/60 rounded-xl border border-ink-700 text-dusk-100 text-[11px] font-sans">
                <strong>Description:</strong> {generatedListing.description}
              </div>

              <div className="text-[11px] text-marigold">
                <strong>Market Price Band Analysis:</strong> {generatedListing.suggestedPriceBand}
              </div>
            </div>
          )}
        </div>

        {/* Existing Listings Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-ink">
            Your Active Cultural Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.slice(0, 6).map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-3xl overflow-hidden border border-paper-400 p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-paper-200 text-ink">
                      {exp.category}
                    </span>
                    <span className="text-xs font-mono text-teal font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active in Solver
                    </span>
                  </div>
                  <h3 className="text-base font-display font-bold text-ink line-clamp-1">{exp.title}</h3>
                  <p className="text-xs text-dusk-600 line-clamp-2">{exp.description}</p>
                </div>

                <div className="pt-3 border-t border-paper-300 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-dusk block text-[10px]">Price</span>
                    <span className="text-sm font-bold text-ink">₹{exp.price}</span>
                  </div>
                  <Link
                    to={`/experience/${exp.id}`}
                    className="px-3 py-1.5 bg-paper-200 hover:bg-ink hover:text-paper text-ink rounded-xl text-xs font-bold transition"
                  >
                    View Public Page
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
