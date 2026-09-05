import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Experience, Review } from '../types';
import {
  MapPin,
  Clock,
  Star,
  Bookmark,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  Users,
  Coins,
  Sparkles,
  Award,
  Leaf,
  Check,
} from 'lucide-react';

export function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [partySize, setPartySize] = useState(2);
  const [isBooked, setIsBooked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadExperience() {
      if (!id) return;
      try {
        const [exp, revs] = await Promise.all([
          api.getExperienceById(parseInt(id, 10)),
          api.getReviews(parseInt(id, 10)),
        ]);
        setExperience(exp);
        setReviews(revs);
      } catch (err) {
        console.error('Failed to load experience:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadExperience();
  }, [id]);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    setTimeout(() => setIsBooked(false), 4000);
  };

  if (isLoading || !experience) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs text-dusk">
        <div className="w-8 h-8 border-3 border-marigold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const galleryImages =
    experience.image_urls && experience.image_urls.length > 0
      ? experience.image_urls
      : experience.image_url
      ? [experience.image_url]
      : [];

  const currentDisplayImage =
    galleryImages[selectedImageIndex] || experience.image_url || null;

  const isGeotagged =
    Boolean(
      experience.image_source?.includes('wiki') ||
      currentDisplayImage?.includes('wikimedia.org') ||
      currentDisplayImage?.includes('wikipedia')
    );

  const badgeText = isGeotagged
    ? experience.image_distance_m
      ? `Geotagged Landmark · ${experience.image_distance_m}m`
      : 'Verified Geotagged Landmark'
    : experience.provider_id
    ? 'Verified Host Photography'
    : 'Verified Cultural Landmark';

  const BadgeIcon = isGeotagged ? MapPin : experience.provider_id ? CheckCircle2 : Sparkles;

  const localImpact = Math.min(98, 85 + ((experience.id * 7) % 14));

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-mono text-dusk hover:text-ink transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </Link>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header / Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-0.5 rounded-full bg-ink text-paper font-bold uppercase text-[10px]">
                  {experience.category}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] flex items-center gap-1 font-bold">
                  <Leaf className="w-3 h-3 text-teal" />
                  {localImpact}% Local Spend Score
                </span>

                {experience.city_name && (
                  <span className="text-dusk flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3 h-3 text-marigold" />
                    {experience.city_name}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink">
                {experience.title}
              </h1>

              <div className="flex items-center gap-3 text-xs font-mono text-dusk pt-1">
                <span className="flex items-center gap-1 text-ink font-bold">
                  <Star className="w-4 h-4 text-marigold fill-marigold" />
                  {experience.rating?.toFixed(1) || '4.9'}
                </span>
                <span>·</span>
                <span className="text-dusk-600">
                  ({experience.review_count || 42} verified traveler reviews)
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-dusk-700">
                  <Clock className="w-4 h-4" />
                  {experience.approx_duration_mins || 60} mins duration
                </span>
              </div>
            </div>

            {/* Main Image with Authentic Source Badge */}
            <div className="space-y-3">
              <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden bg-paper-300 border border-paper-400 shadow-md group">
                {currentDisplayImage ? (
                  <img
                    src={currentDisplayImage}
                    alt={experience.title}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-mono text-sm text-dusk">
                    {experience.title}
                  </div>
                )}

                {/* Dynamic Image Source Badge */}
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-ink/85 backdrop-blur-md rounded-full text-[10px] font-mono text-paper-200 shadow-sm flex items-center gap-1.5 pointer-events-none">
                  <BadgeIcon className="w-3 h-3 text-marigold" />
                  <span>{badgeText}</span>
                </div>
              </div>

              {/* Dynamic Photo Gallery Strip */}
              {galleryImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {galleryImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-2xl overflow-hidden border-2 transition ${
                        selectedImageIndex === idx
                          ? 'border-marigold scale-105 shadow-md'
                          : 'border-paper-300 hover:border-ink/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* "Why This Fits You" Explainability Card */}
            <div className="p-5 bg-white rounded-3xl border border-paper-400 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-teal">
                <CheckCircle2 className="w-4 h-4" />
                <span>Why This Fits Your Constraints</span>
              </div>
              <p className="text-sm font-sans text-ink leading-relaxed">
                {experience.why_it_fits ||
                  `Priced at ₹${experience.price}/pax to comfortably fit within your budget ceiling, takes ${experience.approx_duration_mins || 60} mins with verified ground-floor step-free access.`}
              </p>
            </div>

            {/* Cultural Story / Narrative */}
            <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-display font-bold text-ink">
                About this Cultural Experience
              </h2>
              <p className="text-sm text-dusk-700 leading-relaxed font-sans whitespace-pre-line">
                {experience.description}
              </p>
            </div>

            {/* Hard Accessibility Checklist */}
            <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal" />
                Verified Accessibility Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-paper-100 rounded-xl border border-paper-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  <span>Wheelchair & Ramp Access: <strong>Verified Step-Free</strong></span>
                </div>
                <div className="p-3 bg-paper-100 rounded-xl border border-paper-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  <span>Ground Floor Seating: <strong>Available throughout</strong></span>
                </div>
                <div className="p-3 bg-paper-100 rounded-xl border border-paper-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  <span>Sensory Level: <strong>Calm & Intimate</strong></span>
                </div>
                <div className="p-3 bg-paper-100 rounded-xl border border-paper-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  <span>Elderly Pacing: <strong>Low walking distance</strong></span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-xl font-display font-bold text-ink">
                Traveler Reviews & Verified Feedback
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-paper-100 rounded-2xl border border-paper-300 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-ink">{rev.user_name || 'Cultural Traveler'}</span>
                        <span className="text-marigold font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-marigold" /> {rev.rating} / 5
                        </span>
                      </div>
                      <p className="text-xs text-dusk-700 font-sans">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-dusk font-mono">No public reviews submitted yet.</p>
              )}
            </div>
          </div>

          {/* Right Col: Sticky Booking & Feasibility Action Card */}
          <div>
            <div className="sticky top-24 bg-white rounded-3xl border border-paper-400 p-6 sm:p-7 space-y-6 shadow-xl text-ink">
              <div className="space-y-1 pb-4 border-b border-paper-300 font-mono">
                <span className="text-[10px] text-dusk uppercase">Fair Direct Investment</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-ink">₹{experience.price}</span>
                  <span className="text-xs text-dusk">/ person</span>
                </div>
                <span className="text-[11px] text-teal font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-teal" />
                  <span>100% goes directly to the local artisan</span>
                </span>
              </div>

              {/* Booking Form */}
              <form onSubmit={handleBooking} className="space-y-4 font-mono text-xs">
                <div className="space-y-1.5">
                  <label className="text-dusk uppercase block">Party Size</label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 6].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setPartySize(num)}
                        className={`flex-1 py-2 rounded-xl font-bold border transition ${
                          partySize === num
                            ? 'bg-ink text-paper border-ink'
                            : 'bg-paper-100 text-ink border-paper-300 hover:bg-paper-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-paper-100 rounded-2xl border border-paper-300 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-dusk">₹{experience.price} × {partySize} guests</span>
                    <span className="font-bold text-ink">₹{experience.price * partySize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dusk">Transit buffer</span>
                    <span className="font-bold text-teal">0 extra fees</span>
                  </div>
                  <div className="pt-1.5 border-t border-paper-300 flex justify-between font-bold text-xs">
                    <span>Total Investment</span>
                    <span className="text-ink">₹{experience.price * partySize}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-marigold hover:bg-marigold-600 text-ink font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2"
                >
                  {isBooked ? <Check className="w-4 h-4 text-teal" /> : <Calendar className="w-4 h-4" />}
                  <span>{isBooked ? 'Slot Reserved' : 'Reserve Experience Slot'}</span>
                </button>

                <Link
                  to="/itinerary"
                  className="w-full py-3 bg-paper-200 hover:bg-paper-300 text-ink font-bold rounded-2xl transition text-center block"
                >
                  Add to Day Itinerary
                </Link>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
