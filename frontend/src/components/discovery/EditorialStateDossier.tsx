import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Sparkles,
  Sun,
  MapPin,
  Calendar,
  Compass,
  Utensils,
} from 'lucide-react';
import { StateCulturalDossier } from '../../data/stateDossiersData';
import { StateRegionalBento } from './StateRegionalBento';
import { resolveRegionalIntelligence } from '../../lib/itinerarySolver';

export const REGION_CHAPTERS: Record<string, string> = {
  'North India': 'NORTH INDIA CHAPTER · 01',
  'West India': 'WEST INDIA CHAPTER · 02',
  'South India': 'SOUTH INDIA CHAPTER · 03',
  'East & Central': 'EAST & CENTRAL CHAPTER · 04',
  'East India': 'EAST & CENTRAL CHAPTER · 04',
  'Central India': 'EAST & CENTRAL CHAPTER · 04',
  'Northeast': 'NORTHEAST CHAPTER · 05',
};

export const STATE_FESTIVALS: Record<string, string> = {
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

export interface EditorialStateData {
  name: string;
  region: string;
  tagline: string;
  bestSeason: string;
  climate: string;
  festival: string;
  flavors: Array<{ name: string; tag: string; description: string }>;
  circuits: Array<{ days: string; title: string; subtitle: string; tag: string }>;
  anchors: string[];
  heroImage?: string;
}

export interface EditorialStateDossierProps {
  stateData?: EditorialStateData;
  dossier?: StateCulturalDossier;
  onLaunchCircuit?: (title: string) => void;
}

export function EditorialStateDossier({
  stateData,
  dossier,
  onLaunchCircuit,
}: EditorialStateDossierProps) {
  const navigate = useNavigate();

  // Unified adapter supporting both raw stateData and StateCulturalDossier model
  const effectiveData: EditorialStateData = stateData || {
    name: dossier?.name || 'India',
    region: dossier?.region || 'National',
    tagline: dossier?.tagline || 'Land of Living Heritage and Cultural Traditions',
    bestSeason:
      dossier?.bestMonths?.split('(')[0]?.trim() ||
      dossier?.bestMonths ||
      'October to March',
    climate: dossier?.currentWeather?.replace(':', '·') || '24°C · Pleasant',
    festival:
      (dossier?.name ? STATE_FESTIVALS[dossier.name] : null) ||
      'Signature Regional Harvest and Sacred Gathering',
    flavors:
      dossier?.iconicFlavors.map((f) => ({
        name: f.name,
        tag: f.badge,
        description: f.description,
      })) || [],
    circuits:
      dossier?.curatedCircuits.map((c) => ({
        days: c.duration,
        title: c.title,
        subtitle:
          c.highlights && c.highlights.length > 0
            ? c.highlights.join(' • ')
            : c.pace,
        tag: c.pace,
      })) || [],
    anchors: dossier?.popularPlaces || [],
    heroImage: dossier?.heroImage,
  };

  const handleLaunch = (circuitTitleOrState: string) => {
    if (onLaunchCircuit) {
      onLaunchCircuit(circuitTitleOrState);
      return;
    }
    const match = circuitTitleOrDays(circuitTitleOrState);
    navigate(
      `/itinerary?city=${encodeURIComponent(effectiveData.name)}&days=${match}&pace=balanced`
    );
  };

  const circuitTitleOrDays = (str: string): number => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 4;
  };

  const chapterLabel =
    REGION_CHAPTERS[effectiveData.region] ||
    `${effectiveData.region.toUpperCase()} CHAPTER`;

  const primaryCity = effectiveData.anchors?.[0] || effectiveData.name;
  const regionalIntelligence = resolveRegionalIntelligence(primaryCity, effectiveData.name);

  return (
    <motion.section
      key={effectiveData.name}
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
      aria-label={`${effectiveData.name} Cultural Bento Dossier`}
    >
      {/* 1. Header Bar: Identity & CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E8DEC8]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#C85A32] bg-[#C85A32]/10 border border-[#C85A32]/20 px-2.5 py-0.5 rounded-full font-bold">
              {chapterLabel}
            </span>
            <span className="text-neutral-400 text-xs">•</span>
            <span className="text-[#2D4A3E] text-xs flex items-center gap-1 font-mono font-bold">
              <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Verified Territory</span>
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#1E2022] tracking-tight">
            {effectiveData.name}
          </h2>

          <p className="text-[#1E2022]/75 text-sm sm:text-base max-w-2xl font-sans italic leading-relaxed">
            "{effectiveData.tagline}"
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => handleLaunch(effectiveData.name)}
          className="group relative inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-[#C85A32] text-white font-heading font-bold text-sm shadow-md hover:bg-[#B34E28] hover:shadow-xl active:scale-[0.99] transition-all duration-300 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <span>Launch {effectiveData.name} Engine</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. Anchor Highlights Ticker */}
      {effectiveData.anchors && effectiveData.anchors.length > 0 && (
        <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-none border-b border-[#E8DEC8]/60 text-xs">
          <span className="text-[#1E2022]/60 font-mono uppercase text-[10px] tracking-wider shrink-0 font-bold">
            Key Anchors:
          </span>
          {effectiveData.anchors.map((anchor, i) => (
            <span
              key={i}
              className="shrink-0 px-3 py-1 rounded-xl bg-[#EFE8DC]/60 border border-[#E2D5C3] text-[#1E2022] font-heading font-semibold hover:border-[#C85A32] hover:text-[#C85A32] transition-colors cursor-default shadow-2xs"
            >
              {anchor}
            </span>
          ))}
        </div>
      )}

      {/* 3. Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8">
        {/* Bento 1: Living Calendar & Climate (7 cols, ~58% width) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-7 rounded-3xl bg-white/80 backdrop-blur-md border border-[#E8DEC8] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-[#D99B43] transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#1E2022]/60 font-bold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Seasonality and Rhythms</span>
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D4A3E]/10 border border-[#2D4A3E]/20 text-[#2D4A3E] text-xs font-mono font-bold">
              <Sun className="w-3.5 h-3.5 text-[#D99B43]" />
              <span>{effectiveData.climate}</span>
            </div>
          </div>

          <div className="my-8 space-y-1">
            <span className="text-xs uppercase tracking-wider text-[#C85A32] font-heading font-extrabold block">
              Prime Exploration Window
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1E2022] leading-snug">
              {effectiveData.bestSeason}
            </h3>
          </div>

          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DEC8]/80 flex items-center gap-4 shadow-2xs">
            <div className="p-3 bg-[#D99B43]/15 text-[#C85A32] rounded-xl shrink-0">
              <Sparkles className="w-5 h-5 text-[#D99B43]" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#1E2022]/60 font-bold block">
                Signature Cultural Celebration
              </span>
              <p className="text-sm font-heading font-extrabold text-[#1E2022] leading-snug">
                {effectiveData.festival}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Bento 2: Signature Circuits Preview (5 cols, ~42% width) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-5 rounded-3xl bg-white/80 backdrop-blur-md border border-[#E8DEC8] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-[#C85A32] transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#1E2022]/60 font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Curated Circuits</span>
              </span>
              <span className="text-[11px] text-[#C85A32] font-mono font-bold bg-[#C85A32]/10 border border-[#C85A32]/20 px-2.5 py-0.5 rounded-full">
                Spatiotemporal Solved
              </span>
            </div>

            <div className="space-y-3">
              {effectiveData.circuits.map((circuit, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleLaunch(circuit.title)}
                  className="group/circuit p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8]/80 hover:border-[#C85A32] hover:bg-white cursor-pointer transition-all duration-200 shadow-2xs space-y-1.5"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLaunch(circuit.title);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-[#C85A32] bg-white border border-[#E8DEC8] px-2 py-0.5 rounded-md shadow-2xs">
                      {circuit.days}
                    </span>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider bg-white border border-[#E8DEC8] px-2 py-0.5 rounded text-[#2D4A3E]">
                      {circuit.tag}
                    </span>
                  </div>

                  <h4 className="font-heading text-sm sm:text-base text-[#1E2022] font-extrabold group-hover/circuit:text-[#C85A32] transition-colors leading-snug">
                    {circuit.title}
                  </h4>

                  <p className="text-xs font-sans text-[#1E2022]/70 line-clamp-1">
                    {circuit.subtitle}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-xs font-heading font-bold text-[#C85A32] group-hover/circuit:translate-x-0.5 transition-transform">
                    <span>Inject Route to Engine</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[#1E2022]/60 mt-4 font-mono font-semibold">
            *Routes dynamically balance crowd pacing and transit windows.
          </p>
        </motion.div>

        {/* Bento 3: Flavors of Soil and Sea (12 cols, Full Width) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-12 rounded-3xl bg-white/80 backdrop-blur-md border border-[#E8DEC8] p-6 sm:p-8 shadow-sm hover:shadow-xl hover:border-[#D99B43] transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#1E2022]/60 font-bold block flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#D99B43]" />
                <span>Culinary Topology</span>
              </span>
              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1E2022] mt-0.5">
                Flavors of the Soil and Sea
              </h4>
            </div>
            <span className="text-xs font-mono text-[#1E2022]/60 font-semibold hidden sm:inline">
              Generational street hearths &amp; local haveli recipes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {effectiveData.flavors.map((dish, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8]/80 hover:border-[#D99B43] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between group/dish shadow-2xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-sm font-heading font-extrabold text-[#1E2022] group-hover/dish:text-[#C85A32] transition-colors leading-snug">
                      {dish.name}
                    </h5>
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#D99B43] bg-[#D99B43]/15 border border-[#D99B43]/30 px-2 py-0.5 rounded-full shrink-0">
                      {dish.tag}
                    </span>
                  </div>
                  <p className="text-xs font-sans text-[#1E2022]/75 leading-relaxed">
                    {dish.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 4. Complete Dynamic 4-Pillar Regional Intelligence Bento Dossier */}
      <div className="mt-8 pt-8 border-t border-[#E8DEC8]">
        <StateRegionalBento
          data={regionalIntelligence}
          stateName={effectiveData.name}
        />
      </div>
    </motion.section>
  );
}

export default EditorialStateDossier;
