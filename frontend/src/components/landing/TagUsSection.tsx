import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Heart, Share2 } from 'lucide-react';

export function TagUsSection() {
  const communityTripMoments = [
    {
      id: 'moment-1',
      title: 'Varanasi Morning Ganga Ghats',
      location: 'Raja Ghat, Varanasi',
      creator: '@aarav.wanders',
      image:
        'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      tag: 'Sacred Lineage',
    },
    {
      id: 'moment-2',
      title: 'Vintage Road Trip Through Rajasthan',
      location: 'Old City Outskirts, Jaipur',
      creator: '@priya_circuits',
      image:
        'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
      tag: 'Heritage Roads',
    },
    {
      id: 'moment-3',
      title: 'Architectural Shadows of Chand Baori',
      location: 'Abhaneri Stepwell, Rajasthan',
      creator: '@kabir_explores',
      image:
        'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      tag: 'Vernacular Stone',
    },
    {
      id: 'moment-4',
      title: 'Emerald Backwater Canopy',
      location: 'Alleppey Lagoon, Kerala',
      creator: '@neha_voyages',
      image:
        'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      tag: 'Living Waters',
    },
  ];

  return (
    <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12 select-none pt-4">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-[#12213B] tracking-tight">
          Tag us on your next trip.
        </h2>
        <p className="text-xs sm:text-sm text-[#5B6B8C] font-sans font-medium">
          Share your unscripted moments across India's living artisan guilds, sacred steps, and oral lore.
        </p>
      </div>

      {/* 4 Large Rounded Photo Cards (Matching Mindtrip Layout with Indian Content) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {communityTripMoments.map((moment) => (
          <div
            key={moment.id}
            className="group relative aspect-[3/4] sm:aspect-[4/5] rounded-[22px] sm:rounded-[32px] overflow-hidden bg-white border-2 border-[#E5DFD5] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1.5"
          >
            {/* High-Resolution Photo */}
            <img
              src={moment.image}
              alt={moment.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />

            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

            {/* Top Tag Pill */}
            <div className="absolute top-3 left-3 z-10">
              <span className="text-[10px] font-mono font-bold text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                {moment.tag}
              </span>
            </div>

            {/* Bottom Caption Info */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white space-y-1 z-10 text-left">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#F0A63B] font-bold">
                <MapPin className="w-3 h-3 text-[#F0A63B]" />
                <span className="truncate">{moment.location}</span>
              </div>
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white leading-tight line-clamp-2">
                {moment.title}
              </h4>
              <p className="text-[10px] font-mono text-neutral-300">
                {moment.creator}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Center: LOKIVA Logo & Social Links */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-2">
        {/* LOKIVA Platform Logo */}
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="LOKIVA Logo"
            className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform"
          />
          <span className="text-2xl sm:text-3xl font-display font-black text-[#12213B] tracking-tight">
            LOKIVA
          </span>
        </Link>

        {/* Social Icons (Instagram, X, TikTok / YouTube) */}
        <div className="flex items-center gap-4 pt-1">
          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow LOKIVA on Instagram"
            className="w-10 h-10 rounded-full bg-white border border-[#DDD7CC] hover:border-[#C1443B] text-[#12213B] hover:text-[#C1443B] shadow-2xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          >
            <svg className="w-5 h-5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* TikTok / Video Community */}
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow LOKIVA on TikTok"
            className="w-10 h-10 rounded-full bg-white border border-[#DDD7CC] hover:border-[#C1443B] text-[#12213B] hover:text-[#C1443B] shadow-2xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          >
            <svg className="w-4.5 h-4.5 fill-currentColor" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
            </svg>
          </a>

          {/* X / Twitter */}
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Follow LOKIVA on X"
            className="w-10 h-10 rounded-full bg-white border border-[#DDD7CC] hover:border-[#C1443B] text-[#12213B] hover:text-[#C1443B] shadow-2xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        {/* LOKIVA Community Hashtags (Directly requested by user) */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-xs sm:text-sm font-mono font-bold text-[#12213B] tracking-wide">
          <span className="hover:text-[#C1443B] transition-colors cursor-pointer">#traveldifferently</span>
          <span className="text-[#C1443B]">·</span>
          <span className="hover:text-[#C1443B] transition-colors cursor-pointer">#lokivaindia</span>
          <span className="text-[#C1443B]">·</span>
          <span className="hover:text-[#C1443B] transition-colors cursor-pointer">#livingtraditions</span>
          <span className="text-[#C1443B]">·</span>
          <span className="hover:text-[#C1443B] transition-colors cursor-pointer">#artisanguilds</span>
          <span className="text-[#C1443B]">·</span>
          <span className="hover:text-[#C1443B] transition-colors cursor-pointer">#traveltogether</span>
          <span className="text-[#C1443B]">·</span>
          <span className="hover:text-[#C1443B] transition-colors cursor-pointer">#lokivamoments</span>
        </div>
      </div>
    </section>
  );
}
