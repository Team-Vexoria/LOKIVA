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
  Radio,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export function ProviderDashboardPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [analytics, setAnalytics] = useState<ProviderAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservedAlertId, setReservedAlertId] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

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
    }, 900);
  };

  const handlePublishListing = () => {
    if (!generatedListing) return;
    setIsPublishing(true);
    setTimeout(() => {
      const newExp: Experience = {
        id: Date.now(),
        title: generatedListing.title,
        description: generatedListing.description,
        category: generatedListing.category,
        price: generatedListing.price,
        city: 'Mumbai',
        state: 'Maharashtra',
        area_name: 'Bandra West',
        duration_mins: 75,
        wheelchair_accessible: true,
        accessibility_wheelchair: true,
        is_indoor: true,
        is_rain_safe: true,
        is_family_friendly: true,
        rating: 5.0,
        review_count: 1,
        images: [],
      };
      setExperiences((prev) => [newExp, ...prev]);
      setIsPublishing(false);
      setPublishedSuccess(true);
      setTimeout(() => setPublishedSuccess(false), 4000);
    }, 600);
  };

  const handleBroadcastSlot = (alertId: number) => {
    setReservedAlertId(alertId);
  };

  return (
    <div className="min-h-screen bg-paper text-ink py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
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
            <span className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-teal" /> KYC Verified Partner
            </span>
          </div>
        </div>

        {/* Live Demand-Alert Banner (Differentiator #8) */}
        <div className="bg-white rounded-3xl border border-paper-400 p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-marigold-700">
              <Radio className="w-4 h-4 text-marigold animate-pulse" />
              <span>Live Demand-Aware Push Alerts (Geo-Radius Match)</span>
            </div>
            <span className="text-[11px] font-mono text-dusk">Live Socket Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alert 1 */}
            <div className="p-4 bg-paper-50 hover:bg-white rounded-2xl border border-paper-300 space-y-2 transition shadow-sm">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-ink">3 Families Near Bandra West</span>
                <span className="text-teal font-extrabold">₹500 / pax ceiling</span>
              </div>
              <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                Searching for <strong>artisan craft & food workshops</strong> within a 2-hour afternoon window.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-paper-300 text-xs font-mono">
                <span className="text-dusk text-[10px]">12 min travel radius</span>
                {reservedAlertId === 1 ? (
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg font-bold text-[10px] border border-teal-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-teal" /> Broadcasted to 3 Families
                  </span>
                ) : (
                  <button
                    onClick={() => handleBroadcastSlot(1)}
                    className="px-3 py-1 bg-ink hover:bg-ink-800 text-paper rounded-lg font-bold text-[10px] transition shadow-sm"
                  >
                    Broadcast 3:30 PM Slot
                  </button>
                )}
              </div>
            </div>

            {/* Alert 2: Sharma Family Persona */}
            <div className="p-4 bg-paper-50 hover:bg-white rounded-2xl border border-paper-300 space-y-2 transition shadow-sm">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="font-bold text-ink">Sharma Family (4 pax · Wheelchair)</span>
                <span className="text-teal font-extrabold">₹1,500 budget</span>
              </div>
              <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                Looking for <strong>step-free seated experiences</strong> near Pali Hill starting at 4:30 PM.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-paper-300 text-xs font-mono">
                <span className="text-teal font-semibold text-[10px]">✓ Ramp Access Matches</span>
                {reservedAlertId === 2 ? (
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg font-bold text-[10px] border border-teal-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-teal" /> Matched to Sharma Itinerary
                  </span>
                ) : (
                  <button
                    onClick={() => handleBroadcastSlot(2)}
                    className="px-3 py-1 bg-marigold hover:bg-marigold-600 text-ink rounded-lg font-bold text-[10px] transition shadow-sm"
                  >
                    Accept & Push to Sharma Plan
                  </button>
                )}
              </div>
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
              <span>Verified Bookings</span>
              <Users className="w-4 h-4 text-marigold" />
            </div>
            <div className="text-2xl font-extrabold text-ink">{analytics?.bookings || 342}</div>
            <span className="text-[10px] text-dusk">Avg party: 3.2 pax</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Audience Reach (7d)</span>
              <Eye className="w-4 h-4 text-ink" />
            </div>
            <div className="text-2xl font-extrabold text-ink">{analytics?.views || '4,120'}</div>
            <span className="text-[10px] text-teal font-semibold">68% via solver itinerary packs</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
            <div className="flex items-center justify-between text-xs text-dusk">
              <span>Community Rating</span>
              <Star className="w-4 h-4 text-marigold fill-marigold" />
            </div>
            <div className="text-2xl font-extrabold text-ink">4.92 / 5.0</div>
            <span className="text-[10px] text-dusk">128 verified traveler reviews</span>
          </div>
        </div>

        {/* AI Co-Pilot Listing Generator (Differentiator #6) */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-100 text-teal rounded-full text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-marigold" />
              <span>AI Co-Pilot for Grassroots Artisans</span>
            </div>
            <h3 className="text-xl font-display font-bold text-ink">
              Turn 1 Sentence into a Feasibility-Ready Listing
            </h3>
            <p className="text-xs text-dusk-600 font-sans">
              Local guides don't need marketing skills or SEO budgets — describe your craft in plain language and our co-pilot structures prices, constraints, and categories.
            </p>
          </div>

          <form onSubmit={handleRunAiCopilot} className="space-y-3">
            <div className="relative">
              <textarea
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                rows={3}
                placeholder="Describe your craft or walking route..."
                className="w-full p-4 bg-paper-50 border border-paper-300 rounded-2xl text-xs font-sans text-ink placeholder-dusk focus:outline-none focus:border-marigold resize-none leading-relaxed"
              />
              <button
                type="submit"
                disabled={isGeneratingListing}
                className="absolute right-3 bottom-4 px-4 py-2 bg-ink hover:bg-ink-800 text-paper rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-marigold" />
                <span>{isGeneratingListing ? 'Structuring...' : 'Generate Listing'}</span>
              </button>
            </div>
          </form>

          {/* Generated Structured Card */}
          {generatedListing && (
            <div className="p-6 bg-paper-50 rounded-2xl border border-paper-300 space-y-4 font-mono text-xs animate-fadeIn">
              <div className="flex items-center justify-between border-b border-paper-300 pb-3">
                <span className="text-[10px] uppercase font-bold text-teal">Structured Listing Generated</span>
                <span className="text-dusk text-[10px]">Verified against Bandra Price Bands</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">Experience Title</span>
                    <strong className="text-ink font-display text-sm block">{generatedListing.title}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">Editorial Description</span>
                    <p className="text-xs text-dusk-600 font-sans leading-relaxed">{generatedListing.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-paper-300">
                    <div>
                      <span className="text-[10px] text-dusk block">Suggested Fair Price</span>
                      <strong className="text-base text-ink font-bold">₹{generatedListing.price} / person</strong>
                    </div>
                    <span className="text-[10px] text-teal font-semibold">{generatedListing.suggestedPriceBand}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-dusk uppercase block mb-1">Extracted Hard Constraints</span>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedListing.accessibility.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-[10px] font-bold">
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-paper-300">
                <span className="text-xs text-dusk">Ready for solver packing engine</span>
                <button
                  onClick={handlePublishListing}
                  disabled={isPublishing}
                  className="px-5 py-2 bg-teal hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isPublishing ? 'Publishing...' : publishedSuccess ? 'Published to Catalogue ✓' : 'Save & Publish to Catalogue'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Listings Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-ink">
              Your Active Cultural Offerings ({experiences.length})
            </h3>
            <span className="text-xs font-mono text-dusk">Live in Bandra & Pan-India Catalogue</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="bg-white rounded-2xl border border-paper-400 p-5 space-y-3 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-paper-200 text-ink font-bold uppercase text-[10px]">
                      {exp.category}
                    </span>
                    <span className="font-bold text-teal font-mono">₹{exp.price} / pax</span>
                  </div>

                  <h4 className="text-base font-display font-bold text-ink line-clamp-1">
                    {exp.title}
                  </h4>
                  <p className="text-xs text-dusk-600 font-sans line-clamp-2 leading-relaxed">
                    {exp.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-paper-300 flex items-center justify-between text-xs font-mono">
                  <span className="text-dusk">⏱ {exp.duration_mins || 60} mins</span>
                  <div className="flex items-center gap-2">
                    <span className="text-teal font-semibold">● Active</span>
                    <Link
                      to={`/experience/${exp.id}`}
                      className="p-1 text-dusk hover:text-ink transition"
                      title="View Experience"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
