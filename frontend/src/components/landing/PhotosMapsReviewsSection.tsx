import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Play,
  Star,
  ThumbsUp,
  ThumbsDown,
  Navigation,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ExternalLink,
  Info,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface KeralaSlide {
  url: string;
  title: string;
  tag: string;
}

interface MapPOI {
  id: string;
  top: string;
  left: string;
  icon: string;
  title: string;
  category: string;
  rating: string;
  description: string;
  price: string;
  city: string;
}

export function PhotosMapsReviewsSection() {
  const navigate = useNavigate();

  // State management for interactivity
  const [tajLiked, setTajLiked] = useState(false);
  const [tajLikesCount, setTajLikesCount] = useState(2430);
  const [keralaLiked, setKeralaLiked] = useState(false);
  const [keralaVisited, setKeralaVisited] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activePin, setActivePin] = useState<MapPOI | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState<'all' | 'pros' | 'cons'>('all');

  // Trigger floating toast feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Verified high-definition Unsplash photography
  const images = {
    mapBg: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    tajMahal: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    // Actual Varanasi Ganga Aarti at Dashashwamedh Ghat
    varanasiAarti: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=80',
  };

  // Kerala carousel slides
  const keralaSlides: KeralaSlide[] = [
    {
      url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      title: 'Alleppey Backwaters',
      tag: 'Houseboat Cruise',
    },
    {
      url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      title: 'Munnar Tea Hills',
      tag: 'Cloud Forest Trail',
    },
    {
      url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
      title: 'Varkala Beach Cliffs',
      tag: 'Sunset Arabian Coast',
    },
    {
      url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
      title: 'Fort Kochi Heritage',
      tag: 'Chinese Fishing Nets',
    },
  ];

  // Map POI Pins
  const mapPins: MapPOI[] = [
    {
      id: 'food',
      top: '26%',
      left: '42%',
      icon: '🍴',
      title: "Peshawri & Joney's Place",
      category: 'Mughlai Dining & Masala Chai',
      rating: '4.9 ★',
      description: 'Slow-cooked Dal Bukhara & authentic Bedai breakfast 600m from Taj Eastern Gate.',
      price: '₹400 / person',
      city: 'Agra',
    },
    {
      id: 'stay',
      top: '40%',
      left: '48%',
      icon: '🛏️',
      title: 'The Oberoi Amarvilas',
      category: 'Heritage Luxury Stay',
      rating: '4.9 ★',
      description: 'Every terrace enjoys direct, unobstructed vistas of the Taj Mahal dome.',
      price: 'Curated Stay',
      city: 'Agra',
    },
    {
      id: 'transit',
      top: '50%',
      left: '58%',
      icon: '🚗',
      title: 'Yamuna Heritage Corridor',
      category: 'Express Access Highway',
      rating: '4.8 ★',
      description: 'Direct high-speed scenic corridor linking New Delhi to Agra in 2.5 hours.',
      price: 'Fast-track Toll',
      city: 'Agra',
    },
    {
      id: 'monument',
      top: '64%',
      left: '52%',
      icon: '📍',
      title: 'Taj Mahal Eastern Gate',
      category: 'UNESCO World Heritage',
      rating: '4.9 ★',
      description: 'Quietest morning entry point with designated electric battery shuttles.',
      price: '₹50 Entry',
      city: 'Agra',
    },
  ];

  const handleTajLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tajLiked) {
      setTajLiked(true);
      setTajLikesCount((prev) => prev + 1);
      showToast('Saved Taj Mahal to your Agra Wishlist! ❤️');
    } else {
      setTajLiked(false);
      setTajLikesCount((prev) => prev - 1);
      showToast('Removed from Wishlist');
    }
  };

  const handleKeralaLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKeralaLiked((prev) => {
      const next = !prev;
      showToast(next ? 'Saved Kerala Backwaters to Wishlist! ❤️' : 'Removed from Wishlist');
      return next;
    });
  };

  const handleKeralaVisited = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKeralaVisited((prev) => {
      const next = !prev;
      showToast(next ? 'Marked Kerala as Visited! 🌴' : 'Unmarked Visited status');
      return next;
    });
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? keralaSlides.length - 1 : prev - 1));
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === keralaSlides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12213B] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-white/10 text-xs sm:text-sm font-medium flex items-center gap-2 animate-bounce-short">
          <Sparkles className="w-4 h-4 text-[#FFC067]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Outer Section Title */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 space-y-3">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-[#12213B] tracking-tight leading-tight">
          Everything you need for your next adventure
        </h2>
        <p className="text-sm sm:text-base text-[#5B6B8C] font-sans font-medium max-w-xl mx-auto">
          Explore authentic living traditions through high-resolution visual archives, street-level walking cartography, and verified community reviews.
        </p>
      </div>

      {/* Main Card Container */}
      <div className="bg-white rounded-[32px] sm:rounded-[44px] border-2 border-[#E5DFD5] p-6 sm:p-10 lg:p-14 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: Clean, Confident Typography */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <h3 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black text-[#12213B] tracking-tight leading-[1.08]">
              Photos, maps + reviews
            </h3>
            <p className="text-base sm:text-lg text-[#5B6B8C] font-sans leading-relaxed font-normal">
              Don't just read about a place; experience it. With vibrant photos, interactive maps and reviews, you'll feel like you're already there.
            </p>

            {/* Quick Interactive Highlights */}
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#12213B]">
              <button
                type="button"
                onClick={() => setIsItineraryOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#F5F1EA] hover:bg-[#EAE4D9] transition-colors border border-[#DDD7CC] flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-[#B45309]" />
                <span>1-Day Agra Itinerary</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#FFF8EE] hover:bg-[#FFEECB] transition-colors border border-[#FFC067]/40 text-[#B45309] flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-[#B45309]" />
                <span>Watch Ganga Aarti</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#EBF7F2] hover:bg-[#D7EFE5] transition-colors border border-emerald-200 text-emerald-800 flex items-center gap-1.5 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>2,172 Reviews</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Layered Visual Composition (Map + 3D Heart Photo + Video + Reviews) */}
          <div className="lg:col-span-7 relative">
            <div className="relative w-full h-[470px] sm:h-[530px] rounded-[28px] overflow-hidden border border-[#DDD7CC] shadow-[inset_0_2px_12px_rgba(0,0,0,0.06)] bg-[#EAE4D9]">
              {/* 1. Photorealistic Terrain Map Image in Background */}
              <img
                src={images.mapBg}
                alt="Regional Topographical Map"
                className="w-full h-full object-cover opacity-85 filter contrast-105"
              />

              {/* Map Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

              {/* Dotted Route Line connecting pins */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 195 135 Q 225 185 220 220 T 240 310"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                  className="opacity-90 drop-shadow"
                />
              </svg>

              {/* Map Circular POI Pin Badges (Interactive) */}
              {mapPins.map((pin) => {
                const isActive = activePin?.id === pin.id;
                return (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => setActivePin(isActive ? null : pin)}
                    style={{ top: pin.top, left: pin.left }}
                    className={`absolute z-15 w-8 h-8 rounded-full bg-white shadow-lg border flex items-center justify-center text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'scale-125 ring-4 ring-[#FFC067]/60 border-[#FFC067] z-30'
                        : 'border-[#DDD7CC] hover:scale-115 hover:shadow-xl'
                    }`}
                    title={pin.title}
                  >
                    <span>{pin.icon}</span>
                  </button>
                );
              })}

              {/* Floating Map Pin Detail Popover */}
              {activePin && (
                <div
                  className="absolute z-35 w-64 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#DDD7CC] shadow-2xl animate-fade-in"
                  style={{
                    top: `calc(${activePin.top} - 110px)`,
                    left: `clamp(16px, calc(${activePin.left} - 80px), calc(100% - 270px))`,
                  }}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{activePin.icon}</span>
                      <h4 className="font-heading font-bold text-xs text-[#12213B] leading-tight truncate">
                        {activePin.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActivePin(null)}
                      className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-[#5B6B8C] font-sans line-clamp-2 leading-relaxed mb-2">
                    {activePin.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px]">
                    <span className="font-mono font-bold text-teal-800">{activePin.price}</span>
                    <button
                      type="button"
                      onClick={() => navigate(`/explore?city=${activePin.city}`)}
                      className="px-2 py-0.5 rounded-md bg-[#FFF8EE] hover:bg-[#FFEECB] text-[#B45309] font-heading font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* 2. OVERLAY CARD 1: Main Photo Card with 3D Heart (Left-Center) */}
              <div className="absolute left-3 sm:left-6 top-8 sm:top-12 z-20 w-52 sm:w-60 bg-white rounded-2xl p-2 sm:p-2.5 border border-[#E0D7CB] shadow-[0_16px_36px_rgba(0,0,0,0.14)] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                {/* 3D Floating Heart Badge (Functional Bookmark / Favorite Button) */}
                <button
                  type="button"
                  onClick={handleTajLike}
                  title={tajLiked ? 'Saved to Favorites' : 'Add to Favorites'}
                  className={`absolute -top-3.5 -right-3.5 w-10 h-10 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer z-30 group hover:scale-110 active:scale-95 ${
                    tajLiked
                      ? 'bg-gradient-to-tr from-rose-500 to-red-600 ring-4 ring-rose-200 text-white'
                      : 'bg-gradient-to-tr from-[#FFC067] to-[#FF9800] text-white hover:shadow-orange-300/50'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 transition-transform duration-200 ${
                      tajLiked ? 'fill-white scale-110' : 'fill-white group-hover:scale-115'
                    }`}
                  />
                </button>

                <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-[#EBE4D8] group">
                  <img
                    src={images.tajMahal}
                    alt="Taj Mahal Monument"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[9px] font-heading font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-[#FFC067]" />
                    <span>Agra · Uttar Pradesh</span>
                  </div>
                </div>

                <div className="pt-2 px-1 space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-heading font-extrabold text-[#12213B] truncate">Taj Mahal Heritage</span>
                    <span className="font-mono text-teal-700 font-bold text-[11px]">₹50</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsItineraryOpen(true)}
                    className="w-full py-1.5 rounded-lg bg-[#FFF8EE] hover:bg-[#FFEECB] text-[#B45309] text-[11px] font-heading font-bold border border-[#FFC067]/60 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-98 shadow-xs"
                  >
                    <Compass className="w-3 h-3 text-[#B45309]" />
                    <span>See Itinerary</span>
                  </button>
                </div>
              </div>

              {/* 3. OVERLAY CARD 2: Carousel Photo Card (Top-Right) */}
              <div className="absolute right-3 sm:right-6 top-6 sm:top-8 z-10 w-44 sm:w-52 bg-white rounded-2xl p-2 border border-[#E0D7CB] shadow-[0_16px_32px_rgba(0,0,0,0.12)] transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] group">
                  <img
                    src={keralaSlides[currentSlide].url}
                    alt={keralaSlides[currentSlide].title}
                    className="w-full h-full object-cover transition-all duration-500"
                  />

                  {/* Caption Overlay */}
                  <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[8.5px] font-heading font-medium px-1.5 py-0.5 rounded">
                    {keralaSlides[currentSlide].title}
                  </div>

                  {/* Heart & Checkmark Action Badges */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
                    <button
                      type="button"
                      onClick={handleKeralaLike}
                      title={keralaLiked ? 'Saved' : 'Save Kerala'}
                      className={`w-6 h-6 rounded-full backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-110 active:scale-95 ${
                        keralaLiked ? 'bg-rose-500 text-white' : 'bg-white/90 text-[#FFC067] hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${keralaLiked ? 'fill-white' : 'fill-[#FFC067]'}`} />
                    </button>

                    <button
                      type="button"
                      onClick={handleKeralaVisited}
                      title={keralaVisited ? 'Visited!' : 'Mark as Visited'}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-110 active:scale-95 ${
                        keralaVisited ? 'bg-emerald-600 text-white ring-2 ring-emerald-200' : 'bg-white/90 text-gray-400 hover:text-emerald-700'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>

                  {/* Left / Right Arrow Buttons (visible on hover) */}
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                    title="Previous Photo"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                    title="Next Photo"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  {/* Interactive Carousel Pagination Dots */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 z-20">
                    {keralaSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                          currentSlide === idx ? 'w-4 bg-white shadow-sm' : 'w-1.5 bg-white/60 hover:bg-white/90'
                        }`}
                        title={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. OVERLAY CARD 3: Video Preview Card with Play Button (Bottom-Right) */}
              <div className="absolute right-3 sm:right-7 bottom-6 sm:bottom-10 z-15 w-44 sm:w-52 bg-white rounded-2xl p-2 border border-[#E0D7CB] shadow-[0_16px_32px_rgba(0,0,0,0.12)] transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div
                  onClick={() => setIsVideoModalOpen(true)}
                  className="relative rounded-xl overflow-hidden aspect-[3/4] cursor-pointer group"
                >
                  {/* Authentic Varanasi Ganga Aarti Ceremony Photo */}
                  <img
                    src={images.varanasiAarti}
                    alt="Varanasi Dashashwamedh Ghat Evening Ganga Aarti"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Warm Twilight Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:from-black/70 transition-colors" />

                  {/* Frosted Glass Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsVideoModalOpen(true);
                      }}
                      className="w-12 h-12 rounded-full bg-white/55 backdrop-blur-md border border-white/80 text-white flex items-center justify-center shadow-xl group-hover:scale-115 group-hover:bg-white/70 transition-all duration-300 cursor-pointer pl-0.5 ring-4 ring-white/20"
                      title="Play Ganga Aarti Ceremony"
                    >
                      <Play className="w-5 h-5 fill-white text-white drop-shadow" />
                    </button>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-left space-y-0.5">
                    <div className="flex items-center gap-1 text-[9px] font-mono text-[#FFC067] font-semibold uppercase tracking-wider">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Live Ritual Video</span>
                    </div>
                    <span className="text-xs font-heading font-extrabold text-white drop-shadow block leading-tight">
                      Ganga Evening Aarti
                    </span>
                    <span className="text-[9px] text-white/80 font-sans block">
                      Dashashwamedh Ghat · 6:45 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. OVERLAY CARD 4: Floating Reviews Widget (Bottom-Left) */}
              <div
                onClick={() => setIsReviewsModalOpen(true)}
                className="absolute left-3 sm:left-8 bottom-4 sm:bottom-6 z-25 w-60 sm:w-68 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border-2 border-[#E5DFD5] shadow-[0_16px_36px_rgba(0,0,0,0.12)] space-y-2.5 text-left cursor-pointer hover:border-[#FFC067]/70 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                  <div>
                    <span className="text-[10px] font-heading uppercase tracking-wider text-[#5B6B8C] font-bold">
                      Reviews
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-display font-black text-[#12213B]">4.9</span>
                      <span className="text-xs font-heading font-bold text-[#12213B]">Excellent</span>
                      <span className="text-[10px] font-mono text-[#5B6B8C]">★ 2,172 reviews</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsReviewsModalOpen(true);
                    }}
                    className="text-[10px] font-heading font-bold text-[#B45309] hover:underline flex items-center gap-0.5"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Pros & Cons with Horizontal Skeleton Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReviewTab('pros');
                      setIsReviewsModalOpen(true);
                    }}
                    className="space-y-1 hover:bg-emerald-50/60 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-heading font-bold text-[#12213B]">
                      <ThumbsUp className="w-3 h-3 text-emerald-600" />
                      <span>Pros (94%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-emerald-100/80 overflow-hidden">
                      <div className="w-[88%] h-full bg-emerald-600 rounded-full" />
                    </div>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveReviewTab('cons');
                      setIsReviewsModalOpen(true);
                    }}
                    className="space-y-1 hover:bg-amber-50/60 p-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-heading font-bold text-[#12213B]">
                      <ThumbsDown className="w-3 h-3 text-[#FFC067]" />
                      <span>Cons (6%)</span>
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

      {/* ================= MODAL 1: 1-Day Agra Heritage Itinerary ================= */}
      {isItineraryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsItineraryOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E0D7CB] p-6 text-left relative space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#B45309] font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Curated 1-Day Plan</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-black text-[#12213B] mt-0.5">
                  Agra Imperial Heritage Route
                </h3>
                <p className="text-xs text-[#5B6B8C] font-sans">
                  Sunrise at Taj Mahal plinth through sunset reflections at Mehtab Bagh.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsItineraryOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Stops */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex gap-3 items-start">
                <div className="w-16 pt-0.5 font-mono font-bold text-[#B45309] text-[11px]">
                  05:30 AM
                </div>
                <div className="flex-1 bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE4D9]">
                  <div className="font-heading font-extrabold text-[#12213B] flex items-center justify-between">
                    <span>Taj Mahal Sunrise Plinth Access</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded font-mono">
                      ₹50 Entry
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6B8C] mt-1 leading-relaxed">
                    Enter through the quieter Eastern Gate at dawn. Witness the ivory marble transition from soft pink to radiant gold before large groups arrive.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-16 pt-0.5 font-mono font-bold text-[#B45309] text-[11px]">
                  08:45 AM
                </div>
                <div className="flex-1 bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE4D9]">
                  <div className="font-heading font-extrabold text-[#12213B]">
                    Traditional Bedai Breakfast & Masala Chai
                  </div>
                  <p className="text-xs text-[#5B6B8C] mt-1 leading-relaxed">
                    Stroll 500m to Kinari Bazaar for crispy spiced urad dal poori (bedai) served with spicy potato curry and warm saffron jalebis.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-16 pt-0.5 font-mono font-bold text-[#B45309] text-[11px]">
                  11:00 AM
                </div>
                <div className="flex-1 bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE4D9]">
                  <div className="font-heading font-extrabold text-[#12213B]">
                    Agra Fort & Diwan-i-Khas Walkthrough
                  </div>
                  <p className="text-xs text-[#5B6B8C] mt-1 leading-relaxed">
                    Explore the red sandstone ramparts, Jahangir Palace, and Shah Jahan's octagonal marble tower overlooking the Yamuna river.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-16 pt-0.5 font-mono font-bold text-[#B45309] text-[11px]">
                  05:15 PM
                </div>
                <div className="flex-1 bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE4D9]">
                  <div className="font-heading font-extrabold text-[#12213B]">
                    Mehtab Bagh Moonlight River Reflection
                  </div>
                  <p className="text-xs text-[#5B6B8C] mt-1 leading-relaxed">
                    Cross to the northern bank of the Yamuna to catch sunset silhouettes with zero crowd barriers and pure tranquility.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsItineraryOpen(false);
                  navigate('/explore?city=Agra');
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#D97706] hover:brightness-110 text-white font-heading font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Customize in Trip Planner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsItineraryOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#12213B] font-heading font-bold text-xs transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: Varanasi Ganga Evening Aarti Video ================= */}
      {isVideoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="bg-[#12213B] text-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-white/10 relative text-left space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 pb-0 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#FFC067] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sacred Living Tradition</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-display font-black text-white mt-1">
                  Dashashwamedh Ghat Evening Ganga Maha Aarti
                </h3>
                <p className="text-xs text-white/70 font-sans">
                  Varanasi, Uttar Pradesh · Commences daily at 6:45 PM
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video w-full bg-black overflow-hidden border-y border-white/10">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/UffFaUYSPzk?autoplay=1&mute=0&rel=0&modestbranding=1"
                title="Varanasi Evening Ganga Aarti Ceremony"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Details & Trip Action */}
            <div className="p-4 sm:p-5 pt-0 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                  <span className="text-[10px] text-white/60 block">Timing</span>
                  <span className="font-heading font-bold text-white">6:45 – 7:45 PM</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                  <span className="text-[10px] text-white/60 block">Vantage</span>
                  <span className="font-heading font-bold text-white">Wooden Rowboat</span>
                </div>
                <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                  <span className="text-[10px] text-white/60 block">Entry</span>
                  <span className="font-heading font-bold text-emerald-400">Public / Free</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsVideoModalOpen(false);
                    navigate('/explore?city=Varanasi');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FFC067] to-[#FF9800] hover:brightness-110 text-[#12213B] font-heading font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Explore Varanasi Experiences</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: Verified Community Reviews ================= */}
      {isReviewsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setIsReviewsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#E0D7CB] p-6 text-left space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#B45309] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#FFC067] text-[#FFC067]" />
                  <span>Verified Guest Insights</span>
                </div>
                <h3 className="text-xl font-display font-black text-[#12213B] mt-0.5">
                  Taj Mahal Heritage Reviews
                </h3>
                <div className="flex items-center gap-2 text-xs text-[#5B6B8C] mt-0.5">
                  <span className="font-extrabold text-[#12213B] text-base">4.9 / 5.0</span>
                  <span>·</span>
                  <span>2,172 traveler reviews</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 text-xs font-heading font-bold">
              <button
                type="button"
                onClick={() => setActiveReviewTab('all')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeReviewTab === 'all'
                    ? 'bg-[#12213B] text-white'
                    : 'bg-gray-100 text-[#5B6B8C] hover:bg-gray-200'
                }`}
              >
                All (2,172)
              </button>
              <button
                type="button"
                onClick={() => setActiveReviewTab('pros')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeReviewTab === 'pros'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>Pros (94%)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveReviewTab('cons')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  activeReviewTab === 'cons'
                    ? 'bg-[#B45309] text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
                <span>Cons (6%)</span>
              </button>
            </div>

            {/* Review Cards */}
            <div className="space-y-3 text-xs">
              {(activeReviewTab === 'all' || activeReviewTab === 'pros') && (
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4D9] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-extrabold text-[#12213B]">
                      Priya Nair · Bangalore
                    </span>
                    <span className="text-emerald-700 font-bold font-mono">5.0 ★</span>
                  </div>
                  <p className="text-[#5B6B8C] leading-relaxed">
                    "Pre-booking digital tickets and entering via East Gate at 5:45 AM made all the difference. The sunrise reflection in the central reflecting pool was utterly sublime."
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    ✓ Verified Lokiva Booking
                  </span>
                </div>
              )}

              {(activeReviewTab === 'all' || activeReviewTab === 'pros') && (
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE4D9] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-extrabold text-[#12213B]">
                      David & Clara Meyer · Switzerland
                    </span>
                    <span className="text-emerald-700 font-bold font-mono">5.0 ★</span>
                  </div>
                  <p className="text-[#5B6B8C] leading-relaxed">
                    "Our ASI-certified historian explained the pietre dure floral inlays and astronomical alignment. Far superior experience compared to standard tour buses."
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    ✓ Verified Lokiva Booking
                  </span>
                </div>
              )}

              {(activeReviewTab === 'all' || activeReviewTab === 'cons') && (
                <div className="p-3.5 rounded-2xl bg-[#FFF8EE] border border-[#FFC067]/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-extrabold text-[#12213B]">
                      Karan Mehta · Mumbai
                    </span>
                    <span className="text-amber-800 font-bold font-mono">4.5 ★</span>
                  </div>
                  <p className="text-[#5B6B8C] leading-relaxed">
                    "Security screening at Eastern gate can take 20 minutes if you carry large camera bags or power banks. Travel light with just your phone for instant entry."
                  </p>
                  <span className="text-[10px] text-amber-800 font-semibold block">
                    ⚠ Helpful Traveler Tip
                  </span>
                </div>
              )}
            </div>

            {/* Modal Bottom Action */}
            <button
              type="button"
              onClick={() => {
                setIsReviewsModalOpen(false);
                navigate('/explore?city=Agra');
              }}
              className="w-full py-2.5 rounded-xl bg-[#12213B] hover:bg-[#1E345B] text-white font-heading font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Explore Agra Heritage Packages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
