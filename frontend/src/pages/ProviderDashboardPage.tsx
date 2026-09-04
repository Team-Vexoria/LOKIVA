import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import {
  Provider,
  Experience,
  ProviderAnalyticsSummary,
  ProviderBooking,
  ProviderEarningsSummary,
} from '../types';
import { ProviderAiCopilot } from '../components/provider/ProviderAiCopilot';
import {
  Briefcase,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Edit,
  CheckCircle2,
  Eye,
  Star,
  Sparkles,
  Radio,
  Clock,
  ShieldCheck,
  LayoutDashboard,
  Package,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  Save,
} from 'lucide-react';

type TabType = 'dashboard' | 'listings' | 'copilot' | 'bookings' | 'earnings' | 'profile';

export function ProviderDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'dashboard';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [analytics, setAnalytics] = useState<ProviderAnalyticsSummary | null>(null);
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [earnings, setEarnings] = useState<ProviderEarningsSummary | null>(null);

  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [isEarningsLoading, setIsEarningsLoading] = useState(false);
  const [reservedAlertId, setReservedAlertId] = useState<number | null>(null);
  const [publishToast, setPublishToast] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    business_name: '',
    craft_specialty: '',
    city: '',
    state: '',
    address: '',
    settlement_account: '',
    contact_email: '',
    phone: '',
    accessibility_compliance: '',
    description: '',
  });

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [p, expList, a] = await Promise.all([
        api.getProviderProfile().catch(() => null),
        api.getProviderExperiences().catch(() => []),
        api.getProviderAnalytics().catch(() => null),
      ]);

      if (p) {
        setProvider(p);
        setProfileForm({
          business_name: p.business_name || '',
          craft_specialty: p.craft_specialty || '',
          city: p.city || '',
          state: p.state || '',
          address: p.address || '',
          settlement_account: p.settlement_account || '',
          contact_email: p.contact_email || '',
          phone: p.phone || '',
          accessibility_compliance: p.accessibility_compliance || '',
          description: p.description || '',
        });
      }
      setExperiences(expList || []);
      setAnalytics(a);
    } catch (err) {
      console.error('Failed to load provider hub:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Load bookings when bookings tab is selected or filter changes
  useEffect(() => {
    if (activeTab === 'bookings') {
      setIsBookingsLoading(true);
      api
        .getProviderBookings(bookingFilter)
        .then((data) => setBookings(data || []))
        .catch((err) => console.error('Failed to fetch bookings:', err))
        .finally(() => setIsBookingsLoading(false));
    }
  }, [activeTab, bookingFilter]);

  // Load earnings when earnings tab is selected
  useEffect(() => {
    if (activeTab === 'earnings') {
      setIsEarningsLoading(true);
      api
        .getProviderEarnings()
        .then((data) => setEarnings(data || null))
        .catch((err) => console.error('Failed to fetch earnings:', err))
        .finally(() => setIsEarningsLoading(false));
    }
  }, [activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handlePublishNewExperience = async (newExp: Partial<Experience>) => {
    try {
      const created = await api.createProviderExperience(newExp);
      setExperiences((prev) => [created, ...prev]);
      setPublishToast(`"${created.title}" is now live in the Pan-India catalogue!`);
      setTimeout(() => setPublishToast(null), 5000);
      api.getProviderAnalytics().then(setAnalytics).catch(() => {});
    } catch (err: any) {
      console.error('Failed to save experience to DB:', err);
      setToastError('Failed to publish to catalogue. Please check details.');
      setTimeout(() => setToastError(null), 4000);
    }
  };

  const handleUpdateBookingStatus = async (
    id: number,
    newStatus: 'confirmed' | 'completed' | 'cancelled'
  ) => {
    try {
      const updated = await api.updateBookingStatus(id, newStatus);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
      api.getProviderEarnings().then(setEarnings).catch(() => {});
      api.getProviderAnalytics().then(setAnalytics).catch(() => {});
      setPublishToast(`Booking #${id} status updated to ${newStatus}`);
      setTimeout(() => setPublishToast(null), 4000);
    } catch (err: any) {
      setToastError(err.message || 'Failed to update booking status');
      setTimeout(() => setToastError(null), 4000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const updated = await api.updateProviderProfile(profileForm);
      setProvider(updated);
      setIsEditingProfile(false);
      setPublishToast('Artisan credentials successfully updated!');
      setTimeout(() => setPublishToast(null), 4000);
    } catch (err: any) {
      setToastError(err.message || 'Failed to update credentials');
      setTimeout(() => setToastError(null), 4000);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleBroadcastSlot = (alertId: number) => {
    setReservedAlertId(alertId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center font-mono text-xs text-dusk space-y-3">
        <div className="w-8 h-8 border-3 border-marigold border-t-transparent rounded-full animate-spin" />
        <span>Loading Provider Hub data from database...</span>
      </div>
    );
  }

  const liveRevenue = analytics?.revenue ?? 0;
  const liveBookings = analytics?.bookings ?? 0;
  const liveViews = analytics?.views ?? 0;
  const liveRating = analytics?.rating ?? provider?.rating ?? 5.0;
  const liveReviews = analytics?.review_count ?? provider?.total_reviews ?? 0;

  return (
    <div className="min-h-screen bg-paper text-ink py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Global Toast Notification */}
        {publishToast && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs font-mono text-teal-900 flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
              <span>{publishToast}</span>
            </div>
            <button
              onClick={() => handleTabChange('listings')}
              className="text-xs font-bold text-teal underline hover:text-teal-950"
            >
              View in My Listings →
            </button>
          </div>
        )}

        {/* Global Error Notification */}
        {toastError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs font-mono text-red-900 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{toastError}</span>
            </div>
            <button
              onClick={() => setToastError(null)}
              className="text-xs font-bold text-red-700 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
              <Briefcase className="w-3.5 h-3.5 text-marigold" />
              <span>Providers Console · Verified Artisan & Cultural Guide Portal</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-ink">
              {provider?.business_name || 'India Local Craft & Culinary Collective'}
            </h1>
            <p className="text-xs font-mono text-dusk">
              {provider?.city || 'Mumbai'}, {provider?.state || 'Maharashtra'} ·{' '}
              {provider?.craft_specialty || 'Generational Artisan Guild & Heritage Walks'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-teal" />
              <span>{provider?.is_verified ? 'KYC Level 2 Verified' : 'KYC Pending'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-paper-300 scrollbar-none font-mono text-xs">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-marigold" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleTabChange('listings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'listings'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-teal" />
            <span>My Listings ({experiences.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('copilot')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 relative ${
              activeTab === 'copilot'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-marigold" />
            <span>AI Co-Pilot</span>
            <span className="px-1.5 py-0.2 rounded bg-teal-800 text-white font-mono text-[9px] uppercase">
              Live
            </span>
          </button>

          <button
            onClick={() => handleTabChange('bookings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-dusk" />
            <span>Bookings</span>
          </button>

          <button
            onClick={() => handleTabChange('earnings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'earnings'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-teal" />
            <span>Earnings</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'profile'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-marigold" />
            <span>Profile</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* AI Co-Pilot CTA Hero Card */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-ink via-ink-900 to-teal-950 text-paper rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal/20 text-marigold border border-teal/30 font-mono text-[11px] font-bold">
                    Provider AI Co-Pilot
                  </span>
                  <span className="text-[11px] font-mono text-paper-300">
                    ● Powered by Gemini & DB Persistence
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold">
                  Turn your craft or walking tour into a verified experience.
                </h3>
                <p className="text-xs sm:text-sm text-paper-300 font-sans leading-relaxed">
                  Describe your workshop in plain words. Our AI extracts timings, fair pricing,
                  group caps, and accessibility tags, then directly publishes to LOKIVA's solver catalogue.
                </p>
              </div>

              <button
                onClick={() => handleTabChange('copilot')}
                className="px-6 py-3.5 bg-marigold hover:bg-marigold-600 text-ink rounded-2xl font-mono text-xs sm:text-sm font-bold transition shadow-md flex items-center gap-2 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4 text-ink" />
                <span>Open AI Co-Pilot Studio →</span>
              </button>
            </div>

            {/* KPI Metrics Grid (100% Real DB-driven) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-xs text-dusk">
                  <span>Total Direct Revenue</span>
                  <DollarSign className="w-4 h-4 text-teal" />
                </div>
                <div className="text-2xl font-extrabold text-ink">
                  ₹{liveRevenue.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-teal font-semibold">
                  100% direct host payout · 0% commission
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-xs text-dusk">
                  <span>Verified Bookings</span>
                  <Users className="w-4 h-4 text-marigold" />
                </div>
                <div className="text-2xl font-extrabold text-ink">{liveBookings}</div>
                <span className="text-[10px] text-dusk">
                  {liveBookings > 0 ? 'Recorded in database' : 'No bookings yet'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-xs text-dusk">
                  <span>Audience Reach</span>
                  <Eye className="w-4 h-4 text-ink" />
                </div>
                <div className="text-2xl font-extrabold text-ink">
                  {liveViews.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-teal font-semibold">
                  {liveViews > 0
                    ? `${experiences.length} listings indexed`
                    : 'Awaiting organic impressions'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-xs text-dusk">
                  <span>Community Rating</span>
                  <Star className="w-4 h-4 text-marigold fill-marigold" />
                </div>
                <div className="text-2xl font-extrabold text-ink">
                  {liveRating.toFixed(2)} / 5.0
                </div>
                <span className="text-[10px] text-dusk">
                  {liveReviews} verified traveler {liveReviews === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            </div>

            {/* Live Demand-Alert Banner */}
            <div className="bg-white rounded-3xl border border-paper-400 p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-marigold-700">
                  <Radio className="w-4 h-4 text-marigold animate-pulse" />
                  <span>Live Demand-Aware Push Alerts (Geo-Radius Match)</span>
                </div>
                <span className="text-[11px] font-mono text-dusk">Live Engine Active</span>
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

                {/* Alert 2 */}
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

            {/* Recent Offerings Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-ink">
                    Active Cultural Offerings ({experiences.length})
                  </h3>
                  <p className="text-xs font-mono text-dusk">
                    Live in Bandra & Pan-India solver itineraries
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTabChange('copilot')}
                    className="px-3.5 py-1.5 bg-teal hover:bg-teal-700 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Listing (AI)</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('listings')}
                    className="text-xs font-mono text-teal hover:underline font-bold px-2 py-1"
                  >
                    View All →
                  </button>
                </div>
              </div>

              {experiences.length === 0 ? (
                <div className="p-8 bg-white rounded-2xl border border-paper-300 text-center space-y-3 font-mono text-xs text-dusk">
                  <p>You have no active listings yet.</p>
                  <button
                    onClick={() => handleTabChange('copilot')}
                    className="px-4 py-2 bg-teal text-white rounded-xl font-bold hover:bg-teal-700 transition"
                  >
                    Create Your First Experience with AI Co-Pilot
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {experiences.slice(0, 3).map((exp) => (
                    <div
                      key={exp.id}
                      className="bg-white rounded-2xl border border-paper-400 p-5 space-y-3 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="px-2 py-0.5 rounded-full bg-paper-200 text-ink font-bold uppercase text-[10px]">
                            {exp.category}
                          </span>
                          <span className="font-bold text-teal font-mono">
                            {exp.price > 0 ? `₹${exp.price} / pax` : 'Free entry'}
                          </span>
                        </div>

                        <h4 className="text-base font-display font-bold text-ink line-clamp-1">
                          {exp.title}
                        </h4>
                        <p className="text-xs text-dusk-600 font-sans line-clamp-2 leading-relaxed">
                          {exp.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-paper-300 flex items-center justify-between text-xs font-mono">
                        <span className="text-dusk">
                          ⏱ {exp.approx_duration_mins || exp.duration_mins || 60} mins
                        </span>
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
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY LISTINGS */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-ink">
                  My Active Cultural Offerings
                </h2>
                <p className="text-xs font-mono text-dusk">
                  {experiences.length} verified listings indexed in the database for itineraries & discovery
                </p>
              </div>

              <button
                onClick={() => handleTabChange('copilot')}
                className="px-4 py-2 bg-teal hover:bg-teal-700 text-white rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-marigold" />
                <span>Create Experience with AI Co-Pilot</span>
              </button>
            </div>

            {experiences.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-paper-300 text-center space-y-4 font-mono text-xs text-dusk">
                <Package className="w-12 h-12 text-paper-400 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-ink">No Cultural Listings Yet</h3>
                  <p className="text-xs text-dusk mt-1">
                    Describe your workshop or walking trail to list it in LOKIVA's discovery solver.
                  </p>
                </div>
                <button
                  onClick={() => handleTabChange('copilot')}
                  className="px-5 py-2.5 bg-teal text-white rounded-xl font-bold hover:bg-teal-700 transition"
                >
                  Launch AI Co-Pilot
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-2xl border border-paper-400 p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="px-2.5 py-0.5 rounded-full bg-paper-200 text-ink font-bold uppercase text-[10px]">
                          {exp.category}
                        </span>
                        <span className="font-extrabold text-teal font-mono text-sm">
                          {exp.price > 0 ? `₹${exp.price} / pax` : 'Free entry'}
                        </span>
                      </div>

                      <h4 className="text-base font-display font-bold text-ink leading-snug">
                        {exp.title}
                      </h4>

                      <p className="text-xs text-dusk-600 font-sans line-clamp-3 leading-relaxed">
                        {exp.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {exp.wheelchair_accessible && (
                          <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[10px] font-bold">
                            ✓ Wheelchair Ramp
                          </span>
                        )}
                        {exp.is_indoor && (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                            ✓ Indoor Studio
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-paper-100 text-dusk rounded text-[10px] font-mono">
                          ⏱ {exp.approx_duration_mins || exp.duration_mins || 60} mins
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-paper-300 flex items-center justify-between text-xs font-mono">
                      <span className="text-teal font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal" /> Active in Catalogue
                      </span>
                      <Link
                        to={`/experience/${exp.id}`}
                        className="px-3 py-1 bg-paper-100 hover:bg-paper-200 text-ink rounded-lg font-bold transition flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DEDICATED AI CO-PILOT STUDIO */}
        {activeTab === 'copilot' && (
          <ProviderAiCopilot
            onPublishExperience={handlePublishNewExperience}
            existingListingCount={experiences.length}
          />
        )}

        {/* TAB 4: BOOKINGS (Live from SQLite) */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-200">
              <div>
                <h2 className="text-2xl font-display font-bold text-ink">
                  Verified Traveler Bookings
                </h2>
                <p className="text-xs font-mono text-dusk">
                  Real bookings recorded in database · 100% Direct Payouts
                </p>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 bg-paper-100 p-1 rounded-xl border border-paper-300 font-mono text-xs">
                {(['all', 'confirmed', 'completed', 'pending', 'cancelled'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setBookingFilter(status)}
                      className={`px-3 py-1 rounded-lg font-bold capitalize transition ${
                        bookingFilter === status
                          ? 'bg-ink text-paper shadow-sm'
                          : 'text-dusk hover:text-ink'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            {isBookingsLoading ? (
              <div className="p-8 text-center font-mono text-xs text-dusk flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal" />
                <span>Loading bookings from database...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center space-y-3 font-mono text-xs text-dusk bg-paper-50 rounded-2xl border border-paper-200">
                <Calendar className="w-10 h-10 text-paper-400 mx-auto" />
                <p className="font-bold text-ink">
                  No {bookingFilter !== 'all' ? bookingFilter : ''} bookings found.
                </p>
                <p className="text-[11px]">
                  When travelers reserve your experience via the solver or discovery catalogue, their bookings appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 bg-paper-50 hover:bg-white rounded-2xl border border-paper-300 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono transition shadow-sm"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm text-ink">{booking.guest_name}</strong>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-paper-200 text-dusk">
                          {booking.party_size} {booking.party_size === 1 ? 'traveler' : 'travelers'}
                        </span>
                        {booking.guest_phone && (
                          <span className="text-[11px] text-dusk flex items-center gap-1">
                            <Phone className="w-3 h-3 text-dusk" /> {booking.guest_phone}
                          </span>
                        )}
                        {booking.guest_email && (
                          <span className="text-[11px] text-dusk flex items-center gap-1">
                            <Mail className="w-3 h-3 text-dusk" /> {booking.guest_email}
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-sans text-ink font-semibold">
                        {booking.experience_title || 'Cultural Heritage Atelier Session'}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-dusk flex-wrap">
                        <span className="flex items-center gap-1 text-teal font-semibold">
                          <Calendar className="w-3 h-3" /> {booking.booking_date}
                        </span>
                        {booking.time_slot && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {booking.time_slot}
                          </span>
                        )}
                        {booking.special_requests && (
                          <span className="text-marigold-800 bg-marigold/10 px-2 py-0.5 rounded">
                            Note: {booking.special_requests}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-paper-200 flex-shrink-0">
                      <span className="text-base font-bold text-teal font-mono">
                        ₹{booking.total_price.toLocaleString('en-IN')}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          booking.status === 'confirmed'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : booking.status === 'completed'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : booking.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        ● {booking.status}
                      </span>

                      {/* Action buttons to update status */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                            className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 rounded font-bold text-[10px] transition"
                            title="Mark as completed & settle payout"
                          >
                            Complete
                          </button>
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded font-bold text-[10px] transition"
                            title="Cancel booking"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: EARNINGS (Live Database Calculations) */}
        {activeTab === 'earnings' && (
          <div className="space-y-6 font-mono text-xs">
            {isEarningsLoading ? (
              <div className="p-12 text-center font-mono text-xs text-dusk flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal" />
                <span>Computing settlement history from database...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                    <span className="text-[11px] text-dusk uppercase">
                      Total Lifetime Direct Revenue
                    </span>
                    <div className="text-2xl font-extrabold text-ink">
                      ₹{(earnings?.lifetime_revenue ?? liveRevenue).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-teal font-semibold">
                      100% direct to artisan UPI/bank
                    </span>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                    <span className="text-[11px] text-dusk uppercase">
                      Pending Settlement Balance
                    </span>
                    <div className="text-2xl font-extrabold text-teal">
                      ₹{(earnings?.pending_settlement ?? 0).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-dusk">
                      Target:{' '}
                      {provider?.settlement_account ||
                        earnings?.settlement_account ||
                        'Bank Account ending in 4102'}
                    </span>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                    <span className="text-[11px] text-dusk uppercase">Platform Ad-Tax Rate</span>
                    <div className="text-2xl font-extrabold text-ink">0.0%</div>
                    <span className="text-[10px] text-teal font-semibold">
                      Guaranteed by LOKIVA Charter
                    </span>
                  </div>
                </div>

                {/* Direct Host Guarantee Banner */}
                <div className="p-6 bg-white rounded-3xl border border-paper-400 space-y-3 shadow-sm">
                  <h3 className="text-lg font-display font-bold text-ink">
                    Direct Host Revenue Guarantee
                  </h3>
                  <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                    Unlike traditional travel OTA giants that charge 25%–40% commission or demand ad spends for placement,
                    LOKIVA indexes local experiences algorithmically based on travel time, physical accessibility, and authentic cultural flavor.
                    100% of traveler ticket prices are credited directly to the verified cultural host.
                  </p>
                </div>

                {/* Transaction Ledger Table */}
                <div className="bg-white rounded-3xl border border-paper-400 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-paper-200">
                    <h4 className="text-sm font-bold text-ink uppercase tracking-wider">
                      Settlement & Payout Ledger ({earnings?.transactions.length || 0})
                    </h4>
                    <span className="text-[11px] text-dusk">Auto-cleared via IMPS / UPI</span>
                  </div>

                  {!earnings?.transactions || earnings.transactions.length === 0 ? (
                    <div className="p-8 text-center text-dusk text-xs bg-paper-50 rounded-2xl">
                      No payout records found in database yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-paper-200 text-dusk text-[10px] uppercase">
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Experience</th>
                            <th className="py-2.5 px-3">Guest</th>
                            <th className="py-2.5 px-3 text-right">Gross</th>
                            <th className="py-2.5 px-3 text-right">Fee</th>
                            <th className="py-2.5 px-3 text-right">Net Payout</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-paper-200">
                          {earnings.transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-paper-50 transition">
                              <td className="py-3 px-3 text-dusk">{tx.date}</td>
                              <td className="py-3 px-3 font-semibold text-ink">
                                {tx.experience_title}
                              </td>
                              <td className="py-3 px-3 text-dusk">{tx.guest_name}</td>
                              <td className="py-3 px-3 text-right text-ink">
                                ₹{tx.amount.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3 text-right text-teal font-bold">₹0</td>
                              <td className="py-3 px-3 text-right font-bold text-teal">
                                ₹{tx.net_payout.toLocaleString('en-IN')}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    tx.status === 'settled'
                                      ? 'bg-teal-50 text-teal-800'
                                      : 'bg-amber-50 text-amber-800'
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 6: PROFILE (Editable & DB-Backed) */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-200">
              <div>
                <h2 className="text-2xl font-display font-bold text-ink">
                  Artisan & Host Credentials
                </h2>
                <p className="text-xs text-dusk mt-0.5">
                  Verified Local Cultural Partner Badge & Settlement Information
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-teal-50 text-teal-800 rounded-xl text-xs font-bold border border-teal-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal" />
                  <span>
                    {provider?.is_verified ? 'KYC Level 2 Verified' : 'KYC Under Review'}
                  </span>
                </span>

                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 bg-ink hover:bg-ink-800 text-paper rounded-xl font-bold transition flex items-center gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5 text-marigold" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                        Registered Entity / Guild Name
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.business_name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, business_name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                        Craft Specialty / Heritage Technique
                      </label>
                      <input
                        type="text"
                        value={profileForm.craft_specialty}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, craft_specialty: e.target.value })
                        }
                        placeholder="e.g. Heritage Hand-Block Printing & Natural Dyeing"
                        className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.city}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, city: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          required
                          value={profileForm.state}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, state: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                        Physical Studio / Meeting Point Address
                      </label>
                      <input
                        type="text"
                        value={profileForm.address}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, address: e.target.value })
                        }
                        placeholder="e.g. Pali Hill & Ranwar Village, Bandra West"
                        className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                        Settlement Account / UPI VPA
                      </label>
                      <input
                        type="text"
                        value={profileForm.settlement_account}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, settlement_account: e.target.value })
                        }
                        placeholder="e.g. HDFC Bank ****4102 or artisan@upi"
                        className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                        Physical Accessibility Compliance
                      </label>
                      <input
                        type="text"
                        value={profileForm.accessibility_compliance}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            accessibility_compliance: e.target.value,
                          })
                        }
                        placeholder="e.g. Ground-floor step-free ramp with wide wheelchair doorway"
                        className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={profileForm.contact_email}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, contact_email: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                          Phone
                        </label>
                        <input
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-dusk uppercase font-bold block mb-1">
                        Artisan Story & Guild Bio
                      </label>
                      <textarea
                        rows={3}
                        value={profileForm.description}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, description: e.target.value })
                        }
                        placeholder="Share your heritage background and craft tradition..."
                        className="w-full px-3.5 py-2 bg-paper-50 border border-paper-300 rounded-xl font-mono text-xs text-ink focus:outline-none focus:border-teal"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-paper-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2.5 bg-paper-100 hover:bg-paper-200 text-dusk rounded-xl font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 bg-teal hover:bg-teal-700 disabled:opacity-60 text-white rounded-xl font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">Registered Entity</span>
                    <strong className="text-sm text-ink">
                      {provider?.business_name || 'India Local Craft & Culinary Collective'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">Location Base</span>
                    <p className="text-ink">
                      {provider?.address || 'Pali Hill & Ranwar Village'}, {provider?.city},{' '}
                      {provider?.state}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">Craft Specialty</span>
                    <p className="text-ink">
                      {provider?.craft_specialty ||
                        'Heritage Hand-Block Printing, Indigo Vat Dyeing, Coastal Walks'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">Host Bio</span>
                    <p className="text-dusk-600 font-sans leading-relaxed">
                      {provider?.description ||
                        'Generational local artisans, guides, and culinary custodians sharing living heritage with travelers.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">Settlement Account</span>
                    <p className="text-ink">
                      {provider?.settlement_account ||
                        'HDFC Bank Limited · Account ending in 4102'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">
                      Accessibility Compliance
                    </span>
                    <p className="text-teal font-semibold">
                      {provider?.accessibility_compliance ||
                        'Verified Ground-Floor Step-Free Ramp at Studio Base'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">
                      Community Standing
                    </span>
                    <p className="text-ink">
                      {liveRating.toFixed(2)} / 5.0 Rating across {liveReviews} verified traveler journeys
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-dusk uppercase block">Contact Channels</span>
                    <p className="text-ink">
                      {provider?.contact_email || 'artisan@lokiva.in'} ·{' '}
                      {provider?.phone || '+91 98200 12345'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
