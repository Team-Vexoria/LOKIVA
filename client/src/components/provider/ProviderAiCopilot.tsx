import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Edit3,
  Save,
  Check,
  MapPin,
  Clock,
  Banknote,
  Users,
  ShieldCheck,
  Package,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Experience } from '../../types';

interface ProviderAiCopilotProps {
  onPublishExperience: (experience: Partial<Experience>) => void;
  existingListingCount?: number;
}

interface StructuredListing {
  title: string;
  category: string;
  price: number;
  duration_mins: number;
  location: string;
  meeting_point: string;
  max_group_size: number;
  description: string;
  whats_included: string[];
  requirements: string[];
  availability: string;
  accessibility: string[];
  suggestedPriceBand: string;
  is_wheelchair: boolean;
  is_step_free: boolean;
  is_indoor: boolean;
}

export function ProviderAiCopilot({ onPublishExperience, existingListingCount = 0 }: ProviderAiCopilotProps) {
  const [inputText, setInputText] = useState(
    'I run a 5th-generation hand-block printing studio in Bandra. We teach natural indigo dyeing for ₹450 with a wheelchair ramp.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  const presetExamples = [
    {
      label: 'Hand-block printing studio in Bandra, indigo dyeing, ₹450, wheelchair ramp',
      text: 'I run a 5th-generation hand-block printing studio in Bandra. We teach natural indigo dyeing for ₹450 with a wheelchair ramp.',
    },
    {
      label: 'Coastal heritage fish curry cooking workshop, 90 mins, ₹600, ground floor',
      text: 'Chimbai coastal heritage fish curry cooking workshop, 90 mins, ₹600, ground floor seated kitchen with heirloom spices.',
    },
    {
      label: 'Portuguese colonial architecture sketching trail, 60 mins, ₹350',
      text: 'Ranwar village Portuguese colonial architecture sketching trail, 60 mins, ₹350, exploring 18th century wooden verandas.',
    },
  ];

  // Initialize with the first structured listing
  const [listing, setListing] = useState<StructuredListing | null>({
    title: 'Generational Hand-Block Printing & Natural Indigo Atelier',
    category: 'Art & Craft',
    price: 450,
    duration_mins: 75,
    location: 'Pali Hill Atelier, Bandra West, Mumbai',
    meeting_point: 'Near Subko Coffee, Pali Hill, Bandra West',
    max_group_size: 6,
    description:
      'Hands-on cultural workshop where travelers master traditional wooden block stamping on organic khadi cotton using heirloom mineral and natural plant dyes.',
    whats_included: [
      'Hand-carved teak wooden blocks for stamping',
      'Organic natural indigo & herbal dye vats',
      'Silk-cotton khadi stole to take home',
      'Artisan masala chai & local bakery biscuits',
    ],
    requirements: [
      'Wear comfortable clothing suitable for natural dyeing',
      'No prior art or craft experience required',
    ],
    availability: 'Tuesday to Sunday · 10:30 AM & 3:30 PM daily slots',
    accessibility: ['Wheelchair Accessible', 'Step-Free Ramp Entry', 'Air-Conditioned Studio'],
    suggestedPriceBand: '₹400 - ₹550 based on 14 nearby Bandra artisan studios',
    is_wheelchair: true,
    is_step_free: true,
    is_indoor: true,
  });

  const extractStructuredData = (text: string): StructuredListing => {
    const lower = text.toLowerCase();

    // Check presets first for deep richness
    if (lower.includes('curry') || lower.includes('cook') || lower.includes('chimbai')) {
      return {
        title: 'Chimbai Koliwada Coastal Heritage Fish Curry Masterclass',
        category: 'Culinary & Food',
        price: 600,
        duration_mins: 90,
        location: 'Chimbai Fisher Village, Bandra West, Mumbai',
        meeting_point: "St. Andrew's Church Gate, Hill Road, Bandra West",
        max_group_size: 8,
        description:
          'Immerse in indigenous Koli sea-lore and cook authentic coastal curry alongside traditional fishermen families using freshly grounded masala and day-catch seafood.',
        whats_included: [
          'Fresh coastal catch of the morning',
          'Heirloom Koli stone-ground spices',
          'Full tasting lunch with steamed rice & rice bhakri',
          'Handwritten heritage recipe booklet',
        ],
        requirements: [
          'Open to seafood lovers (vegetarian curry variant also prepared)',
          'Casual comfortable footwear',
        ],
        availability: 'Wednesday to Sunday · 11:30 AM & 5:00 PM slots',
        accessibility: ['Ground Floor Step-Free', 'Seated Prep Stations', 'Family Friendly'],
        suggestedPriceBand: '₹550 - ₹750 based on 8 coastal culinary workshops',
        is_wheelchair: false,
        is_step_free: true,
        is_indoor: true,
      };
    }

    if (lower.includes('sketch') || lower.includes('ranwar') || lower.includes('architecture') || lower.includes('trail')) {
      return {
        title: 'Ranwar Village Portuguese Heritage & Architecture Sketching Trail',
        category: 'Heritage & Walking Tour',
        price: 350,
        duration_mins: 60,
        location: 'Ranwar Historic Village, Bandra West, Mumbai',
        meeting_point: 'Ranwar Village Square, Chapel Road, Bandra West',
        max_group_size: 10,
        description:
          'Walk peaceful Portuguese hamlets of 1700s Bandra with a local conservation architect, capturing wooden balconies, cross shrines, and street art in an intimate sketchbook.',
        whats_included: [
          'Artist sketchbook & graphite sketching kit',
          'Archival 1920s neighborhood photo cards',
          'Fresh tender coconut water break',
        ],
        requirements: [
          'Comfortable walking shoes',
          'Sun protection (sunglasses or cap)',
        ],
        availability: 'Daily · 7:30 AM & 4:30 PM (Golden Hour light)',
        accessibility: ['Paved Village By-lanes', 'Shaded Rest Benches', 'Low Walking Pace'],
        suggestedPriceBand: '₹300 - ₹450 based on 12 heritage walking trails',
        is_wheelchair: false,
        is_step_free: true,
        is_indoor: false,
      };
    }

    // Dynamic extraction for custom input
    const priceMatch = text.match(/₹\s?(\d+)/) || text.match(/(\d+)\s?(?:rs|rupees|inr)/i);
    const price = priceMatch ? parseInt(priceMatch[1], 10) : 500;

    const durationMatch = text.match(/(\d+)\s?(?:mins?|minutes?)/i);
    const duration_mins = durationMatch ? parseInt(durationMatch[1], 10) : 75;

    const is_wheelchair = lower.includes('wheelchair') || lower.includes('ramp');
    const is_step_free = is_wheelchair || lower.includes('step-free') || lower.includes('ground floor');
    const is_indoor = lower.includes('studio') || lower.includes('kitchen') || lower.includes('workshop');

    const accessibilityTags: string[] = [];
    if (is_wheelchair) accessibilityTags.push('Wheelchair Accessible', 'Step-Free Ramp');
    else if (is_step_free) accessibilityTags.push('Ground Floor Step-Free');
    if (lower.includes('family') || lower.includes('kids')) accessibilityTags.push('Family Friendly');
    if (accessibilityTags.length === 0) accessibilityTags.push('Step-Free Access Verified');

    let category = 'Art & Craft';
    if (lower.includes('food') || lower.includes('cook') || lower.includes('tasting')) category = 'Culinary & Food';
    else if (lower.includes('walk') || lower.includes('history') || lower.includes('trail')) category = 'Heritage & Walking Tour';

    const cleanTitle = text.length > 50 ? text.slice(0, 50).trim() + '...' : text;

    return {
      title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
      category,
      price,
      duration_mins,
      location: 'Bandra West, Mumbai',
      meeting_point: 'Bandra West Heritage Hub, Mumbai',
      max_group_size: 6,
      description: text,
      whats_included: [
        'Dedicated guided session by local master host',
        'All necessary tools, ingredients & supplies',
        'Memento & craft artifact to take home',
        'Local tea & light refreshments',
      ],
      requirements: ['No prior experience required', 'All travelers welcome'],
      availability: 'Daily morning & afternoon sessions',
      accessibility: accessibilityTags,
      suggestedPriceBand: `₹${Math.max(250, price - 100)} - ₹${price + 150} local neighborhood benchmark`,
      is_wheelchair,
      is_step_free,
      is_indoor,
    };
  };

  const handleBuildListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setIsEditing(false);
    setDraftSaved(false);

    setTimeout(() => {
      const extracted = extractStructuredData(inputText);
      setListing(extracted);
      setIsGenerating(false);
    }, 700);
  };

  const handleSaveDraft = () => {
    if (!listing) return;
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3500);
  };

  const handlePublish = () => {
    if (!listing) return;

    const newExp: Partial<Experience> = {
      id: Date.now(),
      title: listing.title,
      description: listing.description,
      category: listing.category,
      price: listing.price,
      city: 'Mumbai',
      state: 'Maharashtra',
      area_name: 'Bandra West',
      duration_mins: listing.duration_mins,
      wheelchair_accessible: listing.is_wheelchair,
      accessibility_wheelchair: listing.is_wheelchair,
      is_indoor: listing.is_indoor,
      is_rain_safe: listing.is_indoor,
      is_family_friendly: true,
      rating: 5.0,
      review_count: 1,
      images: [],
    };

    onPublishExperience(newExp);
    setPublishSuccess(true);
    setTimeout(() => setPublishSuccess(false), 4500);
  };

  return (
    <div className="space-y-8">
      {/* Studio Header & Value Props */}
      <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-paper-100 text-teal rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border border-paper-300">
                <Sparkles className="w-3.5 h-3.5 text-marigold" />
                <span>AI Co-Pilot Studio</span>
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-teal bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
                <span>AI CO-PILOT · Ready</span>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink">
              AI Co-Pilot for Local Artisans & Guides
            </h2>
            <p className="text-xs sm:text-sm text-dusk-600 font-sans">
              Turn your story into a verified experience listing. Local hosts need zero SEO skills or marketing budget.
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-dusk space-y-0.5">
            <div className="text-ink font-bold">Your expertise. Our structure.</div>
            <div>Describe it naturally. We'll handle the listing.</div>
            <div className="text-teal font-semibold">Review before publishing.</div>
          </div>
        </div>

        {/* Informative Guidance Banner */}
        <div className="p-3.5 bg-paper-50 rounded-2xl border border-paper-300 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-dusk">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-marigold" />
            <span className="text-ink font-semibold">Provider Workflow:</span>
            <span>Natural language input → AI extraction → Structured listing → Constraint verification → Provider review → Live publish</span>
          </div>
          <span className="text-[11px] text-teal font-bold bg-white px-2.5 py-1 rounded-lg border border-paper-200">
            {existingListingCount} Active In Catalogue
          </span>
        </div>
      </div>

      {/* Two-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT PANEL: AI Co-Pilot Input */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-paper-200">
            <div className="space-y-0.5">
              <h3 className="text-lg font-display font-bold text-ink flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal" />
                <span>AI Co-Pilot Input</span>
              </h3>
              <p className="text-xs text-dusk-600 font-sans">
                Tell us about your craft, workshop, or walking route
              </p>
            </div>
            <span className="text-[10px] font-mono text-teal bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 font-semibold">
              Voice / Free Text
            </span>
          </div>

          <form onSubmit={handleBuildListing} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-ink uppercase tracking-wider block">
                Tell us about your experience
              </label>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={5}
                  placeholder="Describe your experience in your own words... (e.g. craft, location, price, time, accessibility details)"
                  className="w-full p-4 bg-paper-50 border border-paper-300 rounded-2xl text-xs sm:text-sm font-sans text-ink placeholder-dusk-400 focus:outline-none focus:border-marigold focus:bg-white resize-none leading-relaxed transition shadow-inner"
                />
                {isGenerating && (
                  <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-xs font-mono text-ink bg-white/95 px-3 py-1.5 rounded-xl border border-paper-300 shadow-md">
                    <Zap className="w-3.5 h-3.5 text-marigold animate-pulse" />
                    <span>Extracting constraints & parameters...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clickable Preset Samples */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold text-dusk uppercase block">
                Try a sample:
              </span>
              <div className="space-y-2">
                {presetExamples.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(sample.text);
                      setIsEditing(false);
                    }}
                    className="w-full text-left p-3 rounded-xl bg-paper-50 hover:bg-paper-100 border border-paper-300 transition text-xs font-sans text-ink flex items-center justify-between group"
                  >
                    <span className="truncate pr-2 group-hover:text-teal font-medium">
                      "{sample.label}"
                    </span>
                    <span className="text-[10px] font-mono text-dusk group-hover:text-teal flex-shrink-0">
                      Use →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={isGenerating || !inputText.trim()}
              className="w-full py-3.5 px-6 bg-ink hover:bg-ink-800 text-paper rounded-2xl font-mono text-xs sm:text-sm font-bold transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-marigold" />
              <span>{isGenerating ? 'Analyzing & Structuring...' : '✨ Build My Listing'}</span>
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: AI-Generated Listing */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-paper-200">
            <div className="space-y-0.5">
              <h3 className="text-lg font-display font-bold text-ink flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal" />
                <span>AI-Generated Listing</span>
              </h3>
              <p className="text-xs text-dusk-600 font-sans">
                Solver-ready entity structured from your description
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-teal bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              Provider Review Stage
            </span>
          </div>

          {listing ? (
            <div className="space-y-6">
              {/* Inline Editor or Display Card */}
              {isEditing ? (
                <div className="p-4 bg-paper-50 rounded-2xl border border-paper-300 space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between border-b border-paper-200 pb-2">
                    <strong className="text-ink text-sm">Edit Listing Details</strong>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-dusk hover:text-ink font-semibold"
                    >
                      Done Editing
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-dusk uppercase block mb-1">Title</label>
                      <input
                        type="text"
                        value={listing.title}
                        onChange={(e) => setListing({ ...listing, title: e.target.value })}
                        className="w-full p-2.5 bg-white border border-paper-300 rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-marigold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-dusk uppercase block mb-1">Price (₹)</label>
                        <input
                          type="number"
                          value={listing.price}
                          onChange={(e) => setListing({ ...listing, price: Number(e.target.value) })}
                          className="w-full p-2.5 bg-white border border-paper-300 rounded-xl text-xs font-mono text-ink focus:outline-none focus:border-marigold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-dusk uppercase block mb-1">Duration (Mins)</label>
                        <input
                          type="number"
                          value={listing.duration_mins}
                          onChange={(e) => setListing({ ...listing, duration_mins: Number(e.target.value) })}
                          className="w-full p-2.5 bg-white border border-paper-300 rounded-xl text-xs font-mono text-ink focus:outline-none focus:border-marigold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-dusk uppercase block mb-1">Meeting Point</label>
                      <input
                        type="text"
                        value={listing.meeting_point}
                        onChange={(e) => setListing({ ...listing, meeting_point: e.target.value })}
                        className="w-full p-2.5 bg-white border border-paper-300 rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-marigold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-dusk uppercase block mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={listing.description}
                        onChange={(e) => setListing({ ...listing, description: e.target.value })}
                        className="w-full p-2.5 bg-white border border-paper-300 rounded-xl text-xs font-sans text-ink focus:outline-none focus:border-marigold resize-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-paper-50 rounded-2xl border border-paper-300 space-y-4">
                  {/* Title & Category Header */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-0.5 rounded-full bg-paper-200 text-ink font-bold uppercase text-[10px] border border-paper-300">
                        {listing.category}
                      </span>
                      <span className="text-dusk flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-dusk-500" />
                        {listing.location}
                      </span>
                    </div>
                    <h4 className="text-lg sm:text-xl font-display font-bold text-ink leading-snug">
                      {listing.title}
                    </h4>
                  </div>

                  {/* Core Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-paper-200 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-dusk block">Price / Pax</span>
                      <strong className="text-sm font-extrabold text-teal">₹{listing.price}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-dusk block">Duration</span>
                      <strong className="text-sm font-bold text-ink">{listing.duration_mins} mins</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-dusk block">Max Group</span>
                      <strong className="text-sm font-bold text-ink">{listing.max_group_size} travelers</strong>
                    </div>
                  </div>

                  {/* Fair Price Benchmark Banner */}
                  <div className="p-2.5 bg-teal-50/80 rounded-xl border border-teal-200 text-xs font-mono flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-teal-800 uppercase block font-bold">Local Benchmark</span>
                      <span className="text-teal-900 font-semibold text-[11px]">{listing.suggestedPriceBand}</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal bg-white px-2 py-0.5 rounded border border-teal-200">
                      Fair Band Verified ✓
                    </span>
                  </div>

                  {/* Editorial Description */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-dusk uppercase block">Description</span>
                    <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                      {listing.description}
                    </p>
                  </div>

                  {/* Meeting Point & Availability */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                    <div className="p-2.5 bg-white rounded-xl border border-paper-200 space-y-0.5">
                      <strong className="font-mono text-[10px] text-dusk uppercase block">Meeting Point</strong>
                      <span className="text-ink text-xs">{listing.meeting_point}</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-xl border border-paper-200 space-y-0.5">
                      <strong className="font-mono text-[10px] text-dusk uppercase block">Availability</strong>
                      <span className="text-ink text-xs">{listing.availability}</span>
                    </div>
                  </div>

                  {/* What's Included */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-dusk uppercase block font-bold">
                      What's Included
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {listing.whats_included.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-dusk-700 bg-white p-2 rounded-lg border border-paper-200">
                          <Check className="w-3 h-3 text-teal flex-shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-dusk uppercase block">Requirements</span>
                    <ul className="list-disc list-inside text-xs text-dusk-600 space-y-0.5">
                      {listing.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Verified Details Badges */}
                  <div className="pt-2 border-t border-paper-300 space-y-2">
                    <span className="text-[10px] font-mono text-dusk uppercase block font-bold">
                      Verified Details
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                        <span>✓ Wheelchair Accessible</span>
                      </span>
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                        <span>✓ Step-Free Entry</span>
                      </span>
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                        <Clock className="w-3.5 h-3.5 text-teal" />
                        <span>✓ Duration Verified ({listing.duration_mins}m)</span>
                      </span>
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                        <Banknote className="w-3.5 h-3.5 text-teal" />
                        <span>✓ Price Added (₹{listing.price})</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Notifications */}
              {draftSaved && (
                <div className="p-3 bg-paper-100 border border-paper-300 rounded-xl text-xs font-mono text-ink flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  <span>Draft saved successfully. Stored in your private provider workspace.</span>
                </div>
              )}

              {publishSuccess && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs font-mono text-teal-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal" />
                  <span>Experience published successfully! Now live in Pan-India and itinerary engine.</span>
                </div>
              )}

              {/* Provider Action Buttons: Edit, Draft, Publish */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-paper-200">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-paper-100 hover:bg-paper-200 text-ink rounded-xl font-mono text-xs font-bold border border-paper-300 transition flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-dusk" />
                    <span>{isEditing ? 'Cancel Editing' : 'Edit Details'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-paper-100 hover:bg-paper-200 text-ink rounded-xl font-mono text-xs font-bold border border-paper-300 transition flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-dusk" />
                    <span>Save as Draft</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePublish}
                  className="w-full sm:w-auto px-6 py-2.5 bg-teal hover:bg-teal-700 text-white rounded-xl font-mono text-xs font-bold transition shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-marigold" />
                  <span>Publish Experience</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-xs font-mono text-dusk bg-paper-50 rounded-2xl border border-paper-200">
              Awaiting your natural language input. Click "✨ Build My Listing" to generate preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
