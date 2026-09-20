import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Play,
  Star,
  ThumbsUp,
  ThumbsDown,
  Navigation,
  Check,
} from 'lucide-react';

export function PhotosMapsReviewsSection() {
  const navigate = useNavigate();

  // Rock-solid, verified Unsplash image URLs (all tested and returning HTTP 200)
  const images = {
    // Photorealistic Map Topography Base
    mapBg: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    // Main Photo Card: Taj Mahal at Sunrise
    tajMahal: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    // Carousel Card: Kerala Tropical Backwaters
    kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    // Video Card: Varanasi Sacred Ghats at Twilight
    varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
  };

  return (
    <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      {/* Outer Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-[#12213B] tracking-tight leading-tight">
          Everything you need for your next adventure
        </h2>
        <p className="text-sm sm:text-base text-[#5B6B8C] font-sans font-medium max-w-xl mx-auto">
          Explore authentic living traditions through high-resolution visual archives, street-level walking cartography, and verified community reviews.
        </p>
      </div>

      {/* Main Card Container (Matching Mindtrip Layout) */}
      <div className="bg-white rounded-[32px] sm:rounded-[44px] border-2 border-[#E5DFD5] p-6 sm:p-10 lg:p-14 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: Clean, Confident Typography */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#12213B] tracking-tight leading-[1.08]">
              Photos, maps + reviews
            </h3>
            <p className="text-base sm:text-lg text-[#5B6B8C] font-sans leading-relaxed font-normal pt-2">
              Don't just read about a place; experience it. With vibrant photos, interactive maps and reviews, you'll feel like you're already there.
            </p>
          </div>

          {/* RIGHT COLUMN: Layered Visual Composition (Map + 3D Heart Photo + Video + Reviews) */}
          <div className="lg:col-span-7 relative">
            <div className="relative w-full h-[460px] sm:h-[520px] rounded-[28px] overflow-hidden border border-[#DDD7CC] shadow-inner bg-[#EAE4D9]">
              {/* 1. Photorealistic Terrain Map Image in Background */}
              <img
                src={images.mapBg}
                alt="Regional Topographical Map"
                className="w-full h-full object-cover opacity-85 filter contrast-105"
              />

              {/* Map Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5 pointer-events-none" />

              {/* Map Circular POI Pin Badges (Matching Mindtrip Map Pins) */}
              <div
                className="absolute top-28 left-48 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-[#DDD7CC] flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                title="Local Culinary Spot"
              >
                🍴
              </div>

              <div
                className="absolute top-44 left-52 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-[#DDD7CC] flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                title="Heritage Haveli"
              >
                🛏️
              </div>

              <div
                className="absolute top-52 left-60 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-[#DDD7CC] flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform"
                title="Transit Corridor"
              >
                🚗
              </div>

              <div
                className="absolute top-68 left-56 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-[#FFC067] text-[#FFC067] flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform ring-2 ring-[#FFC067]/30"
                title="Curated Monument"
              >
                📍
              </div>

              {/* Dotted Route Line connecting pins */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 200 130 Q 230 180 220 220 T 240 280"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                  className="opacity-90 drop-shadow"
                />
              </svg>

              {/* 2. OVERLAY CARD 1: Main Photo Card with 3D Heart (Left-Center) */}
              <div className="absolute left-3 sm:left-6 top-10 sm:top-14 z-20 w-52 sm:w-60 bg-white rounded-2xl p-2 sm:p-2.5 border border-[#E0D7CB] shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                {/* 3D Floating Heart Badge (Mindtrip Signature) */}
                <div
                  className="absolute -top-3.5 -right-3.5 w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFC067] to-[#FF9800] shadow-lg flex items-center justify-center text-white animate-bounce pointer-events-none"
                  style={{ animationDuration: '2.8s' }}
                >
                  <Heart className="w-5 h-5 fill-white" />
                </div>

                <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-[#EBE4D8]">
                  <img
                    src={images.tajMahal}
                    alt="Taj Mahal Monument"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-heading font-bold px-2 py-0.5 rounded-md">
                    Agra · Uttar Pradesh
                  </div>
                </div>

                <div className="pt-2 px-1 space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-extrabold text-ink truncate">Taj Mahal Heritage</span>
                    <span className="font-mono text-teal-700 font-bold text-[11px]">₹50</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/explore?city=Agra')}
                    className="w-full py-1 rounded-lg bg-[#FFF8EE] hover:bg-[#FFEECB] text-[#B45309] text-[10px] font-heading font-bold border border-[#FFC067]/60 transition cursor-pointer"
                  >
                    See Itinerary
                  </button>
                </div>
              </div>

              {/* 3. OVERLAY CARD 2: Carousel Photo Card (Top-Right) */}
              <div className="absolute right-3 sm:right-6 top-6 sm:top-8 z-10 w-40 sm:w-48 bg-white rounded-2xl p-2 border border-[#E0D7CB] shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                  <img
                    src={images.kerala}
                    alt="Kerala Backwaters"
                    className="w-full h-full object-cover"
                  />
                  {/* Heart & Checkmark Badge */}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-5 h-5 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[10px] text-[#FFC067]">
                      <Heart className="w-3 h-3 fill-[#FFC067]" />
                    </span>
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  </div>

                  {/* Carousel Pagination Dots */}
                  <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-xs" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-xs" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60 shadow-xs" />
                  </div>
                </div>
              </div>

              {/* 4. OVERLAY CARD 3: Video Preview Card with Play Button (Bottom-Right) */}
              <div className="absolute right-4 sm:right-8 bottom-8 sm:bottom-12 z-15 w-44 sm:w-52 bg-white rounded-2xl p-2 border border-[#E0D7CB] shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="relative rounded-xl overflow-hidden aspect-[3/4]">
                  <img
                    src={images.varanasi}
                    alt="Varanasi Evening Ghats"
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle Dark Vignette */}
                  <div className="absolute inset-0 bg-black/25" />

                  {/* Frosted Glass Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-md border border-white/60 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer pl-0.5">
                      <Play className="w-5 h-5 fill-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <span className="text-[10px] font-heading font-bold text-white drop-shadow">
                      Ganga Evening Aarti
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. OVERLAY CARD 4: Floating Reviews Widget (Bottom-Center/Left) */}
              <div className="absolute left-3 sm:left-8 bottom-4 sm:bottom-6 z-30 w-60 sm:w-68 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border-2 border-[#E5DFD5] shadow-2xl space-y-2.5 text-left">
                <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                  <div>
                    <span className="text-[10px] font-heading uppercase tracking-wider text-dusk-500 font-bold">
                      Reviews
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-display font-black text-ink">4.9</span>
                      <span className="text-xs font-heading font-bold text-ink">Excellent</span>
                      <span className="text-[10px] font-mono text-dusk-500">★ 2,172 reviews</span>
                    </div>
                  </div>
                </div>

                {/* Pros & Cons with Horizontal Skeleton Pills (Matching Screenshot) */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-heading font-bold text-ink">
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      <span>Pros</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-emerald-100/80 overflow-hidden">
                      <div className="w-[88%] h-full bg-emerald-600 rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-heading font-bold text-ink">
                      <ThumbsDown className="w-3 h-3 text-[#FFC067]" />
                      <span>Cons</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#FFF4E5] overflow-hidden">
                      <div className="w-[18%] h-full bg-[#FFC067] rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
