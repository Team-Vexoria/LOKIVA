import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ArrowRight, Camera, Sparkles, Copy, Check, X, Share2 } from 'lucide-react';

interface TravelMoment {
  id: string;
  title: string;
  location: string;
  creator: string;
  image: string;
  tag: string;
}

export function TagUsSection() {
  // Existing four travel moments/content preserved exactly
  const communityTripMoments: TravelMoment[] = [
    {
      id: 'moment-1',
      title: 'Varanasi Morning Ganga Ghats',
      location: 'Raja Ghat, Varanasi',
      creator: '@aarav.wanders',
      image:
        'https://kashiyatra.in/wp-content/uploads/2023/10/assi-ghat-ganga-aarti.jpeg',
      tag: 'Sacred Lineage',
    },
    {
      id: 'moment-2',
      title: 'Vintage Road Trip Through Rajasthan',
      location: 'Old City Outskirts, Jaipur',
      creator: '@priya_circuits',
      image:
        'https://wishtogo.in/wp-content/uploads/2026/06/Luxury-Rajasthan-Trip-Cost-for-5-Days.webp',
      tag: 'Heritage Roads',
    },
    {
      id: 'moment-3',
      title: 'Architectural Shadows of Chand Baori',
      location: 'Abhaneri Stepwell, Rajasthan',
      creator: '@kabir_explores',
      image:
        'https://curriculture.in/wp-content/uploads/2025/06/667x445_chand-baori-stepwell-abhaneri-2.jpg',
      tag: 'Vernacular Stone',
    },
    {
      id: 'moment-4',
      title: 'Emerald Backwater Canopy',
      location: 'Alleppey Lagoon, Kerala',
      creator: '@neha_voyages',
      image:
        'https://backwoodsemerald.com/assets/images/img-3255-2000x1334.jpg',
      tag: 'Living Waters',
    },
  ];

  // Subtle save/like interaction per card
  const [likedMoments, setLikedMoments] = useState<Record<string, boolean>>({});
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedMoments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText('#lokivaindia #lokivamoments #traveldifferently #livingtraditions');
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2500);
  };

  return (
    <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 select-none pt-4">
      {/* 1. NEW SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        {/* Subtle travel/social eyebrow */}
        <p className="text-[11px] sm:text-xs font-mono font-bold tracking-[0.22em] text-[#B45309] uppercase">
          TRAVEL WITH LOKIVA
        </p>

        {/* Visually strong, premium heading */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-[#12213B] tracking-tight leading-tight">
          Tag us on your next trip.
        </h2>

        {/* Supporting text */}
        <p className="text-sm sm:text-base text-[#5B6B8C] font-sans font-medium leading-relaxed max-w-xl mx-auto">
          Share the places, stories, and moments that make your journey unforgettable.
        </p>
      </div>

      {/* 2 & 3. EDITORIAL CARD ARRANGEMENT */}

      {/* MOBILE: Horizontal Swipeable Carousel (Visible only on < sm screens) */}
      <div className="flex sm:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-3 -mx-4 px-4 overscroll-x-contain scrollbar-none">
        {communityTripMoments.map((moment, idx) => {
          const isLiked = !!likedMoments[moment.id];
          return (
            <div
              key={moment.id}
              className="min-w-[85vw] max-w-[88vw] flex-shrink-0 snap-start aspect-[4/5] rounded-[20px] overflow-hidden bg-white border border-[#E5DFD5] shadow-md relative group transition-all duration-300"
            >
              <img
                src={moment.image}
                alt={moment.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />

              {/* Dark subtle gradient over lower portion */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

              {/* Top Bar: Category Pill & Save Action */}
              <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                  {moment.tag}
                </span>

                <button
                  type="button"
                  onClick={(e) => toggleLike(e, moment.id)}
                  className={`w-8 h-8 rounded-full backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm ${isLiked
                      ? 'bg-rose-500 text-white border-rose-400'
                      : 'bg-black/35 text-white/90 hover:bg-white hover:text-rose-600'
                    }`}
                  title={isLiked ? 'Saved to Favorites' : 'Save Moment'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Bottom Caption Information */}
              <div className="absolute bottom-0 inset-x-0 p-4 text-white space-y-1.5 z-10 text-left">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#F0A63B] font-bold">
                  <MapPin className="w-3 h-3 text-[#F0A63B]" />
                  <span className="truncate">{moment.location}</span>
                </div>
                <h3 className="font-display font-bold text-base text-white leading-snug">
                  {moment.title}
                </h3>
                <p className="text-[11px] font-mono text-neutral-300">
                  {moment.creator}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP & TABLET: Premium Asymmetric Editorial Grid (sm and above) */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* Large Featured Card (moment-1: Varanasi Morning Ganga Ghats) */}
        {(() => {
          const featured = communityTripMoments[0];
          const isLiked = !!likedMoments[featured.id];
          return (
            <div className="sm:col-span-2 lg:col-span-5 h-[480px] lg:h-[530px] rounded-[20px] overflow-hidden bg-white border border-[#E5DFD5] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group cursor-pointer">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />

              {/* Dark subtle gradient over lower portion */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

              {/* Top Bar: Category Pill & Save Action */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white bg-black/45 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xs">
                  {featured.tag}
                </span>

                <button
                  type="button"
                  onClick={(e) => toggleLike(e, featured.id)}
                  className={`w-8 h-8 rounded-full backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm ${isLiked
                      ? 'bg-rose-500 text-white border-rose-400 opacity-100'
                      : 'bg-black/35 text-white/90 hover:bg-white hover:text-rose-600 opacity-0 group-hover:opacity-100'
                    }`}
                  title={isLiked ? 'Saved' : 'Save Moment'}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                </button>
              </div>

              {/* Bottom Caption Information */}
              <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-2 z-10 text-left">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#F0A63B] font-bold tracking-wide">
                  <MapPin className="w-3.5 h-3.5 text-[#F0A63B]" />
                  <span>{featured.location}</span>
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-white leading-tight">
                  {featured.title}
                </h3>
                <p className="text-xs font-mono text-neutral-300">
                  {featured.creator}
                </p>
              </div>
            </div>
          );
        })()}

        {/* Right Editorial Stack: 3 Cards (Cards 2 & 3 top row, Card 4 wide bottom row) */}
        <div className="sm:col-span-2 lg:col-span-7 flex flex-col gap-5">
          {/* Top Row: Cards 2 & 3 side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 h-auto lg:h-[255px]">
            {/* Card 2: Vintage Road Trip Through Rajasthan */}
            {(() => {
              const card = communityTripMoments[1];
              const isLiked = !!likedMoments[card.id];
              return (
                <div className="h-[255px] rounded-[20px] overflow-hidden bg-white border border-[#E5DFD5] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group cursor-pointer">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                      {card.tag}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleLike(e, card.id)}
                      className={`w-7 h-7 rounded-full backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm ${isLiked
                          ? 'bg-rose-500 text-white border-rose-400 opacity-100'
                          : 'bg-black/35 text-white/90 hover:bg-white hover:text-rose-600 opacity-0 group-hover:opacity-100'
                        }`}
                      title={isLiked ? 'Saved' : 'Save Moment'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-4 text-white space-y-1 z-10 text-left">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#F0A63B] font-bold">
                      <MapPin className="w-3 h-3 text-[#F0A63B]" />
                      <span className="truncate">{card.location}</span>
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white leading-snug line-clamp-1">
                      {card.title}
                    </h3>
                    <p className="text-[10px] font-mono text-neutral-300">
                      {card.creator}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Card 3: Architectural Shadows of Chand Baori */}
            {(() => {
              const card = communityTripMoments[2];
              const isLiked = !!likedMoments[card.id];
              return (
                <div className="h-[255px] rounded-[20px] overflow-hidden bg-white border border-[#E5DFD5] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group cursor-pointer">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                  <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-10">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                      {card.tag}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => toggleLike(e, card.id)}
                      className={`w-7 h-7 rounded-full backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm ${isLiked
                          ? 'bg-rose-500 text-white border-rose-400 opacity-100'
                          : 'bg-black/35 text-white/90 hover:bg-white hover:text-rose-600 opacity-0 group-hover:opacity-100'
                        }`}
                      title={isLiked ? 'Saved' : 'Save Moment'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                    </button>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-4 text-white space-y-1 z-10 text-left">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#F0A63B] font-bold">
                      <MapPin className="w-3 h-3 text-[#F0A63B]" />
                      <span className="truncate">{card.location}</span>
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-white leading-snug line-clamp-1">
                      {card.title}
                    </h3>
                    <p className="text-[10px] font-mono text-neutral-300">
                      {card.creator}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bottom Row: Card 4 (Emerald Backwater Canopy - Wide Cinematic Landscape Banner) */}
          {(() => {
            const card = communityTripMoments[3];
            const isLiked = !!likedMoments[card.id];
            return (
              <div className="h-[255px] rounded-[20px] overflow-hidden bg-white border border-[#E5DFD5] shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group cursor-pointer">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                <div className="absolute top-3.5 inset-x-4 flex items-center justify-between z-10">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-white bg-black/45 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-xs">
                    {card.tag}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleLike(e, card.id)}
                    className={`w-7 h-7 rounded-full backdrop-blur-md border border-white/25 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm ${isLiked
                        ? 'bg-rose-500 text-white border-rose-400 opacity-100'
                        : 'bg-black/35 text-white/90 hover:bg-white hover:text-rose-600 opacity-0 group-hover:opacity-100'
                      }`}
                    title={isLiked ? 'Saved' : 'Save Moment'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-white' : ''}`} />
                  </button>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-5 text-white space-y-1 z-10 text-left flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#F0A63B] font-bold">
                      <MapPin className="w-3.5 h-3.5 text-[#F0A63B]" />
                      <span>{card.location}</span>
                    </div>
                    <h3 className="font-display font-bold text-base sm:text-lg text-white leading-snug">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-neutral-300 sm:text-right">
                    {card.creator}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 6. SOCIAL DISCOVERY ELEMENT & CALL TO ACTION */}
      <div className="bg-white/80 backdrop-blur-xs rounded-[20px] border border-[#E5DFD5] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Camera className="w-4 h-4 text-[#B45309]" />
            <h4 className="font-heading font-extrabold text-sm sm:text-base text-[#12213B]">
              Share your LOKIVA moment
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-[#5B6B8C] font-sans">
            Tag @lokiva.india on your travels or use our community hashtags to be featured in our curated journal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsShareModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#12213B] hover:bg-[#1E345B] text-white text-xs sm:text-sm font-heading font-bold shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 cursor-pointer flex-shrink-0 group"
        >
          <span>Share your journey</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* LOKIVA Platform Logo & Social Links */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-1">
        {/* LOKIVA Platform Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="LOKIVA Logo"
            className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
          />
          <span className="text-xl sm:text-2xl font-display font-black text-[#12213B] tracking-tight">
            LOKIVA
          </span>
        </Link>

        {/* Social Icons (Instagram, TikTok / YouTube, X) */}
        <div className="flex items-center gap-3.5">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow LOKIVA on Instagram"
            className="w-9 h-9 rounded-full bg-white border border-[#DDD7CC] hover:border-[#FFC067] text-[#12213B] hover:text-[#FFC067] shadow-2xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow LOKIVA on TikTok"
            className="w-9 h-9 rounded-full bg-white border border-[#DDD7CC] hover:border-[#FFC067] text-[#12213B] hover:text-[#FFC067] shadow-2xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          </a>

          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow LOKIVA on X"
            className="w-9 h-9 rounded-full bg-white border border-[#DDD7CC] hover:border-[#FFC067] text-[#12213B] hover:text-[#FFC067] shadow-2xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        {/* LOKIVA Community Hashtags */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs font-mono font-bold text-[#12213B] tracking-wide">
          <span className="hover:text-[#FFC067] transition-colors cursor-pointer">#traveldifferently</span>
          <span className="text-[#FFC067]">·</span>
          <span className="hover:text-[#FFC067] transition-colors cursor-pointer">#lokivaindia</span>
          <span className="text-[#FFC067]">·</span>
          <span className="hover:text-[#FFC067] transition-colors cursor-pointer">#livingtraditions</span>
          <span className="text-[#FFC067]">·</span>
          <span className="hover:text-[#FFC067] transition-colors cursor-pointer">#artisanguilds</span>
          <span className="text-[#FFC067]">·</span>
          <span className="hover:text-[#FFC067] transition-colors cursor-pointer">#lokivamoments</span>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {isShareModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E0D7CB] p-6 text-left space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#B45309] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Travel Community</span>
                </div>
                <h3 className="text-xl font-display font-black text-[#12213B] mt-0.5">
                  Share Your LOKIVA Journey
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#5B6B8C] font-sans leading-relaxed">
              Tag <strong className="text-[#12213B]">@lokiva.india</strong> on your Instagram Stories, Reels, or travel posts with the official community hashtags to be featured in our seasonal travel anthology.
            </p>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#EAE4D9] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B6B8C] font-bold block">
                Official Community Hashtags
              </span>
              <p className="font-mono text-xs text-[#12213B] font-semibold break-words">
                #lokivaindia #lokivamoments #traveldifferently #livingtraditions
              </p>
              <button
                type="button"
                onClick={handleCopyHashtags}
                className="w-full py-2 rounded-lg bg-white border border-[#DDD7CC] hover:border-[#B45309] text-xs font-heading font-bold text-[#12213B] flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedHashtags ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#5B6B8C]" />
                    <span>Copy Hashtags</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#D97706] hover:brightness-110 text-white font-heading font-bold text-xs text-center shadow-md transition"
              >
                Open Instagram (@lokiva.india)
              </a>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#12213B] font-heading font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
