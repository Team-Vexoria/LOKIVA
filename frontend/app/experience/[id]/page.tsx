'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Experience, Review } from '../../../types';
import { WhyFitsBadge } from '../../../components/WhyFitsBadge';
import {
  Star,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Footprints,
  Accessibility,
  Users,
  Plus,
  Check,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Share2,
  Bookmark,
  MessageSquarePlus,
  Send
} from 'lucide-react';

export default function ExperienceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experienceId = Number(params?.id);

  const [experience, setExperience] = useState<Experience | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isInItinerary, setIsInItinerary] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Review Form State
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (!experienceId) return;
      setIsLoading(true);
      try {
        const [expData, reviewData] = await Promise.all([
          api.getExperienceById(experienceId),
          api.getReviews(experienceId)
        ]);
        setExperience(expData);
        setReviews(reviewData);

        // Check if in itinerary
        const savedItin = localStorage.getItem('lokiva_itinerary_ids');
        if (savedItin) {
          const ids: number[] = JSON.parse(savedItin);
          setIsInItinerary(ids.includes(experienceId));
        }
      } catch (err) {
        console.error('Failed to load experience details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [experienceId]);

  const toggleItinerary = () => {
    try {
      const saved = localStorage.getItem('lokiva_itinerary_ids');
      let ids: number[] = saved ? JSON.parse(saved) : [];
      if (ids.includes(experienceId)) {
        ids = ids.filter((id) => id !== experienceId);
        setIsInItinerary(false);
      } else {
        ids.push(experienceId);
        setIsInItinerary(true);
      }
      localStorage.setItem('lokiva_itinerary_ids', JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      const added = await api.addReview(experienceId, newRating, newComment);
      setReviews([added, ...reviews]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add review:', err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-xl font-bold text-slate-200 mb-2">Experience Not Found</h2>
        <Link href="/explore" className="text-orange-400 hover:underline text-sm">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const whyFitsDefault = [
    `✓ Priced within standard budget limits (₹${Math.round(experience.price)}/person)`,
    `✓ Verified location in historic ${experience.neighborhood}`,
    experience.accessibility_low_walking
      ? '✓ Low walking requirement verified — ideal for relaxed pace'
      : '✓ Immersive exploration experience',
    `✓ Open until ${experience.closing_time}`
  ];

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 pb-20">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isFavorited
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isFavorited ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 rounded-3xl overflow-hidden border border-slate-800">
          <div className="md:col-span-2 h-80 sm:h-96 relative bg-slate-900">
            <img
              src={experience.images[0] || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'}
              alt={experience.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="text-xs uppercase font-bold px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-orange-400 border border-orange-500/30">
                {experience.category.replace('_', ' ')}
              </span>
              {experience.is_hidden_gem && (
                <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-slate-950 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hidden Gem</span>
                </span>
              )}
            </div>
          </div>

          <div className="hidden md:grid grid-rows-2 gap-3">
            <div className="h-[186px] relative bg-slate-900">
              <img
                src={experience.images[1] || experience.images[0] || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-[186px] relative bg-slate-900">
              <img
                src={experience.images[2] || experience.images[0] || 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800'}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Details & Reviews (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  <span>{experience.address}</span>
                </span>
                <span>· {experience.city}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 mb-3">
                {experience.title}
              </h1>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{experience.rating}</span>
                  <span className="text-slate-400 font-normal">({experience.review_count} verified reviews)</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span>{experience.duration_mins} mins duration</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Verified Host</span>
                </div>
              </div>
            </div>

            {/* "Why this fits you" Callout */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
              <WhyFitsBadge bullets={whyFitsDefault} variant="detailed" />
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-slate-200 mb-3">About This Experience</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {experience.description}
              </p>
            </div>

            {/* Accessibility & Atmosphere Audit */}
            <div>
              <h3 className="text-lg font-bold text-slate-200 mb-3">Accessibility & Atmosphere</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <Footprints className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">Pace / Walking</div>
                    <div className="text-[11px] text-slate-400">
                      {experience.accessibility_low_walking ? 'Seated / Low Walking' : 'Moderate Walking'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <Accessibility className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">Wheelchair Access</div>
                    <div className="text-[11px] text-slate-400">
                      {experience.accessibility_wheelchair ? 'Step-Free Ramp' : 'Assistance Needed'}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-slate-200">Group Comfort</div>
                    <div className="text-[11px] text-slate-400">
                      {experience.accessibility_family_friendly ? 'Family & Senior Friendly' : 'All Welcome'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Provider Profile Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center text-white font-bold text-lg">
                  {experience.provider?.business_name?.[0] || 'J'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-slate-200">
                      {experience.provider?.business_name || 'Jaipur Heritage Artisans Guild'}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-xs text-slate-400">
                    {experience.provider?.description || 'Curator of authentic heritage workshops and local culinary arts.'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Verified Local Master
                </span>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="border-t border-slate-800 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">Traveler Reviews</h3>
                  <p className="text-xs text-slate-400">Feedback from real travelers and family groups.</p>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{experience.rating} ({reviews.length} reviews)</span>
                </div>
              </div>

              {/* Add Review Form */}
              <form onSubmit={handleReviewSubmit} className="mb-6 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Share your experience</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="text-amber-400 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-4 h-4 ${newRating >= star ? 'fill-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="How was the pace, accessibility, and local hospitality?"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 mb-2"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newComment.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Review</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">{rev.user_name}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {rev.traveler_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Floating Booking / Itinerary Action Card (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
              <div>
                <div className="text-xs text-slate-400 mb-1">Experience Pricing</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-300">
                    {experience.price === 0 ? 'Free' : `₹${Math.round(experience.price).toLocaleString()}`}
                  </span>
                  <span className="text-xs text-slate-400">/ person</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 border-y border-slate-800 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Operating Hours</span>
                  <span className="font-semibold text-slate-200">
                    {experience.opening_time} – {experience.closing_time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Session Duration</span>
                  <span className="font-semibold text-slate-200">{experience.duration_mins} mins</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Group Capacity</span>
                  <span className="font-semibold text-slate-200">Up to {experience.capacity} pax</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Weather Suitability</span>
                  <span className={`font-semibold ${experience.is_indoor ? 'text-blue-400' : 'text-amber-400'}`}>
                    {experience.is_indoor ? 'Indoor / Rain-Safe' : 'Outdoor'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={toggleItinerary}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-102 ${
                    isInItinerary
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white shadow-orange-500/30'
                  }`}
                >
                  {isInItinerary ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Itinerary (Open Plan)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to My Itinerary</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/ai-guide?prompt=${encodeURIComponent(`Tell me why ${experience.title} is a great choice for my day in Jaipur.`)}`}
                  className="w-full py-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Ask AI Concierge About This</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
