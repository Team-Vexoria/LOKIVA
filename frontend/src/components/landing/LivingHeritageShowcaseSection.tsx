import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function LivingHeritageShowcaseSection() {
  const navigate = useNavigate();

  // Curated, verified Unsplash photos (all tested HTTP 200)
  const showcaseCards = [
    {
      id: 'showcase-1',
      title: 'Kot Jewar Master Potter',
      location: 'Jaipur District, Rajasthan',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      className: 'w-48 sm:w-56 aspect-[3/4] z-20 shadow-2xl transform sm:-translate-y-4 hover:scale-102 transition-transform duration-500',
    },
    {
      id: 'showcase-2',
      title: 'Hawa Mahal Honeycomb',
      location: 'Old City, Jaipur',
      image: 'https://images.unsplash.com/photo-1650530777057-3a7dbc24bf6c?auto=format&fit=crop&w=800&q=80',
      className: 'w-40 sm:w-48 aspect-[3/4] z-10 shadow-xl transform sm:-translate-x-6 sm:-translate-y-16 hover:scale-102 transition-transform duration-500',
    },
    {
      id: 'showcase-3',
      title: 'Chand Baori Geometry',
      location: 'Abhaneri, Rajasthan',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
      className: 'w-44 sm:w-52 aspect-[3/4] z-15 shadow-2xl transform sm:translate-y-12 hover:scale-102 transition-transform duration-500',
    },
  ];

  return (
    <section className="reveal-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 select-none">
      <div className="relative rounded-[36px] sm:rounded-[44px] overflow-hidden bg-gradient-to-br from-[#FFF5E6] via-[#FFF9F2] to-[#FFF1DE] border-2 border-[#FFC067]/50 p-8 sm:p-12 lg:p-16 shadow-sm">
        {/* Soft Background Cloud & Step Silhouettes */}
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-white/60 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-96 h-40 bg-gradient-to-t from-white/50 to-transparent blur-2xl pointer-events-none" />

        {/* 3D Stepped Pedestal Illustration in background */}
        <div className="absolute left-12 sm:left-24 bottom-0 pointer-events-none opacity-40 hidden sm:block">
          <div className="w-32 h-6 bg-[#FFC067]/40 rounded-t-sm" />
          <div className="w-44 h-6 bg-[#FFC067]/70 rounded-t-sm -ml-6" />
          <div className="w-56 h-6 bg-[#FFC067] rounded-t-sm -ml-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          {/* LEFT COLUMN: Bold Narrative & Pill Action (Matching Image 2) */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-[#12213B] tracking-tight leading-[1.06]">
              Discover.
              <br />
              Experience.
              <br />
              Preserve.
            </h2>

            <p className="text-sm sm:text-base text-[#3D3325] font-sans font-medium leading-relaxed max-w-md pt-1">
              Love traveling and experiencing authentic living culture? Explore centuries-old artisan guilds, sacred stepwells, and unscripted heritage circuits.
            </p>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => navigate('/explore')}
                className="px-8 py-4 rounded-full bg-[#12213B] hover:bg-[#FFC067] hover:text-[#12213B] text-white font-heading font-extrabold text-sm tracking-wide transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 cursor-pointer active:scale-98 group"
              >
                <span>Explore Living Catalog</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Layered Floating Cards (Matching Image 2) */}
          <div className="lg:col-span-6 flex items-center justify-center lg:justify-end gap-3 sm:gap-4 flex-wrap sm:flex-nowrap pt-6 lg:pt-0">
            {showcaseCards.map((card) => (
              <div
                key={card.id}
                className={`${card.className} rounded-[24px] sm:rounded-[30px] overflow-hidden border-2 border-white/70 bg-white relative group`}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-3 inset-x-3 text-left text-white space-y-0.5">
                  <span className="text-[9px] font-mono text-[#FFC067] font-bold block truncate">
                    {card.location}
                  </span>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-white leading-tight line-clamp-1">
                    {card.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
