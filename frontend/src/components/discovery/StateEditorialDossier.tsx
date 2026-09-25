import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  CloudSun,
  Utensils,
  Compass,
  ArrowRight,
  Landmark,
  Scissors,
  Sparkles,
  MapPin,
  CheckCircle2,
  PartyPopper,
} from 'lucide-react';
import { StateCulturalDossier } from '../../data/stateDossiersData';

const REGION_CHAPTERS: Record<string, string> = {
  'North India': 'NORTH INDIA CHAPTER · 01',
  'West India': 'WEST INDIA CHAPTER · 02',
  'South India': 'SOUTH INDIA CHAPTER · 03',
  'East & Central': 'EAST & CENTRAL CHAPTER · 04',
  'East India': 'EAST & CENTRAL CHAPTER · 04',
  'Central India': 'EAST & CENTRAL CHAPTER · 04',
  'Northeast': 'NORTHEAST CHAPTER · 05',
};

const STATE_FESTIVALS: Record<string, string> = {
  'Maharashtra': 'Ganesh Chaturthi & Elephanta Heritage Festival',
  'Rajasthan': 'Desert Citadel Festival & Pushkar Sacred Mela',
  'Uttar Pradesh': 'Dev Deepawali River Aarti & Taj Mahotsav',
  'Kerala': 'Onam Serpent Boat Races & Thrissur Pooram',
  'Tamil Nadu': 'Margazhi Classical Music Sabha & Pongal',
  'Karnataka': 'Mysuru Dasara Royal Procession & Hampi Utsav',
  'West Bengal': 'Durga Puja Cultural Carnival & Poush Mela',
  'Gujarat': 'Rann Utsav White Desert & Navratri Garba',
  'Punjab': 'Baisakhi Golden Harvest & Hola Mohalla',
  'Himachal Pradesh': 'Kullu Dussehra & Fagli Himalayan Dances',
  'Ladakh': 'Hemis Tsechu Mask Dance Festival',
  'Jammu and Kashmir': 'Tulip Spring Bloom & Shikara Lake Festival',
  'Goa': 'Shigmo Street Carnival & Feast of St. Francis',
  'Odisha': 'Puri Ratha Yatra & Konark Classical Dance Festival',
  'Assam': 'Rongali Bihu Spring Dance & Majuli Raas Mahotsav',
  'Delhi': 'Qutub Sitar Festival & Jahan-e-Khusrau',
  'Telangana': 'Bonalu Folk Procession & Bathukamma Floral Gathering',
  'Andhra Pradesh': 'Lepakshi Heritage Festival & Tirupati Brahmotsavam',
  'Sikkim': 'Losoong Harvest Ritual & Pang Lhabsol Dance',
  'Meghalaya': 'Wangala Autumn Hundred Drums Dance',
  'Nagaland': 'Hornbill Warrior Cultural Gathering',
  'Manipur': 'Sangai Lake Festival & Classical Raas Lila',
  'Mizoram': 'Chapchar Kut Spring Bamboo Festival',
  'Tripura': 'Kharchi Puja Fourteen God Ritual',
  'Arunachal Pradesh': 'Tawang Torgya Monastic Mask Festival',
  'Uttarakhand': 'Ganga Dussehra Confluence & Nanda Devi Raj Jat',
  'Madhya Pradesh': 'Khajuraho Classical Dance Festival',
  'Chhattisgarh': 'Bastar Dussehra 75-Day Tribal Gathering',
  'Bihar': 'Chhath River Dawn Prayer & Rajgir Dance Festival',
  'Jharkhand': 'Sarhul Spring Sal Blossom Feast',
  'Haryana': 'Surajkund International Crafts Mela',
  'Chandigarh': 'Rose Garden Festival & Capitol Promenade',
  'Puducherry': 'International Yoga & Bastille Heritage Week',
  'Andaman and Nicobar Islands': 'Island Eco-Tourism Winter Festival',
  'Lakshadweep': 'Minicoy Tribal Boat Race Regatta',
  'Dadra and Nagar Haveli and Daman and Diu': 'Diu Coastal Fortress Festival',
};

interface StateEditorialDossierProps {
  dossier: StateCulturalDossier;
}

export function StateEditorialDossier({ dossier }: StateEditorialDossierProps) {
  const navigate = useNavigate();

  const handleLaunchItinerary = (circuitDays: number = 4) => {
    navigate(
      `/itinerary?city=${encodeURIComponent(dossier.name)}&days=${circuitDays}&pace=balanced`
    );
  };

  const chapterLabel = REGION_CHAPTERS[dossier.region] || `${dossier.region.toUpperCase()} CHAPTER`;
  const keyFestival = STATE_FESTIVALS[dossier.name] || 'Regional Harvest & Temple Gathering';

  return (
    <motion.section
      key={dossier.stateId}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
      aria-label={`${dossier.name} Cultural Dossier`}
    >
      {/* ── Editorial Header Banner ───────────────────────────────────── */}
      <div className="border-b border-[#E5DFD5] pb-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold tracking-widest text-[#C85A32] uppercase">
            {chapterLabel}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D5CAB8]" />
          <span className="text-xs font-mono text-dusk-600">
            Curated Dossier ID: LOK-{dossier.stateId.toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-[#12213B] tracking-tight">
              {dossier.name}
            </h2>
            <p className="text-base sm:text-lg font-sans text-dusk-600 mt-1 max-w-3xl italic">
              "{dossier.tagline}"
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs text-xs font-mono font-bold text-[#12213B] flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#C85A32]" />
              <span>{dossier.siteCount} Curated Sites</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs text-xs font-mono font-bold text-[#12213B] flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#D99B43]" />
              <span>{dossier.guildCount} Living Guilds</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero Panorama with Scrim Overlay ──────────────────────────── */}
      <div className="relative rounded-3xl h-64 sm:h-80 lg:h-96 overflow-hidden border border-[#E5DFD5] shadow-lg group">
        <img
          src={dossier.heroImage}
          alt={dossier.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FFC067] bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 inline-block">
              Regional Anchor Highlights
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {dossier.popularPlaces.map((place, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-xs font-heading font-bold text-white shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#FFC067]" />
                  <span>{place}</span>
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleLaunchItinerary(4)}
            className="px-5 py-3 rounded-2xl bg-[#C85A32] hover:bg-[#B34E28] active:scale-[0.99] text-white text-xs sm:text-sm font-heading font-bold shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Itinerary Engine</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Three-Column Editorial Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: 🗓️ The Living Calendar */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD5]">
              <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#C85A32] border border-[#E5DFD5]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-extrabold uppercase tracking-wider text-[#12213B]">
                  The Living Calendar
                </h3>
                <span className="text-[11px] font-mono text-dusk-600">
                  Seasonality &amp; Atmosphere
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600 block">
                  Best Travel Window
                </span>
                <p className="font-heading font-bold text-[#12213B] text-sm leading-snug">
                  {dossier.bestMonths}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600 block">
                  Climate &amp; Weather Profile
                </span>
                <div className="flex items-center gap-2 font-heading font-semibold text-[#12213B] text-xs">
                  <CloudSun className="w-4 h-4 text-[#D99B43] shrink-0" />
                  <span>{dossier.currentWeather}</span>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#E5DFD5]">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600 block">
                  Signature Cultural Festival
                </span>
                <div className="flex items-start gap-2 font-heading font-bold text-[#C85A32] text-xs leading-snug">
                  <PartyPopper className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                  <span>{keyFestival}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] text-[11px] font-sans text-dusk-600 leading-relaxed">
            Optimal timing accounts for artisanal loom cycles, temple dawn rites, and desert heat shifts.
          </div>
        </div>

        {/* Column 2: 🍲 Gastronomic Essence */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD5]">
              <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#D99B43] border border-[#E5DFD5]">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-extrabold uppercase tracking-wider text-[#12213B]">
                  Gastronomic Essence
                </h3>
                <span className="text-[11px] font-mono text-dusk-600">
                  Flavors of Soil &amp; Heritage
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              {dossier.iconicFlavors.map((flavor, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] hover:border-[#FFC067] transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading font-bold text-xs text-[#12213B]">
                      {flavor.name}
                    </h4>
                    <span className="text-[9px] font-mono font-bold text-[#C85A32] bg-white border border-[#E5DFD5] px-2 py-0.5 rounded-full shrink-0">
                      {flavor.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-sans text-dusk-600 leading-relaxed">
                    {flavor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono text-dusk-600 pt-2 border-t border-[#E5DFD5]">
            Verified street kitchens and generational family haveli recipes.
          </div>
        </div>

        {/* Column 3: 🏛️ Signature Circuits */}
        <div className="bg-white p-6 rounded-3xl border border-[#E5DFD5] shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E5DFD5]">
              <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#C85A32] border border-[#E5DFD5]">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-heading font-extrabold uppercase tracking-wider text-[#12213B]">
                  Signature Circuits
                </h3>
                <span className="text-[11px] font-mono text-dusk-600">
                  Curated Spatiotemporal Routes
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {dossier.curatedCircuits.map((circuit, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLaunchItinerary(parseInt(circuit.duration, 10) || 3)}
                  className="p-4 rounded-2xl bg-[#FAF7F2] hover:bg-white border border-[#E5DFD5] hover:border-[#C85A32] transition-all duration-200 cursor-pointer group space-y-2 shadow-2xs"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLaunchItinerary(parseInt(circuit.duration, 10) || 3);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#C85A32] bg-white border border-[#E5DFD5] px-2 py-0.5 rounded-full">
                      {circuit.duration}
                    </span>
                    <span className="text-[10px] font-mono text-dusk-600 font-semibold">
                      {circuit.pace}
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[#12213B] group-hover:text-[#C85A32] transition-colors leading-snug">
                    {circuit.title}
                  </h4>

                  {circuit.highlights && circuit.highlights.length > 0 && (
                    <p className="text-[11px] font-sans text-dusk-600 line-clamp-2 leading-relaxed">
                      {circuit.highlights.join(' • ')}
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs font-heading font-bold text-[#C85A32] group-hover:translate-x-0.5 transition-transform">
                    <span>Pre-populate Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] font-mono text-dusk-600 pt-2 border-t border-[#E5DFD5]">
            Click any circuit card to launch custom route synthesis.
          </div>
        </div>
      </div>

      {/* ── Full-Width Primary Conversion CTA ──────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E5DFD5] shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
            Ready to Explore {dossier.name}?
          </span>
          <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-[#12213B]">
            Launch Verified {dossier.name} Spatiotemporal Itinerary Engine
          </h3>
          <p className="text-xs sm:text-sm font-sans text-dusk-600">
            Synthesizes opening hours, master craftsman availability, and sunset viewpoints.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleLaunchItinerary(4)}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#C85A32] hover:bg-[#B34E28] active:scale-[0.99] text-white font-heading font-bold text-sm sm:text-base shadow-lg shadow-[#C85A32]/25 transition-all flex items-center justify-center gap-3 shrink-0 cursor-pointer group"
        >
          <Sparkles className="w-5 h-5 text-[#FFC067]" />
          <span>Launch {dossier.name} Engine</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.section>
  );
}

export default StateEditorialDossier;
