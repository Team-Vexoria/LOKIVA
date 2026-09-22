import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Landmark,
  Scissors,
  CheckCircle2,
  Compass,
  ArrowRight,
} from 'lucide-react';
import {
  getStateMetadata,
  calculateStateMatchScore,
  UserJourneyPreferences,
  StateMetadata,
} from '../../data/indiaStateMetadata';

const INDIA_TOPO_JSON = '/data/india.topo.json';

interface InteractiveIndiaMapProps {
  userPreferences: UserJourneyPreferences;
  selectedState: string;
  onSelectState: (stateName: string) => void;
  className?: string;
}

interface HoveredStateInfo extends StateMetadata {
  matchScore: number;
  matchReason: string;
}

export function InteractiveIndiaMap({
  userPreferences,
  selectedState,
  onSelectState,
  className = '',
}: InteractiveIndiaMapProps) {
  const [hoveredState, setHoveredState] = useState<HoveredStateInfo | null>(null);
  const [zoomPosition, setZoomPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [82.8, 22.0],
    zoom: 1,
  });

  const handleZoomIn = () => {
    setZoomPosition((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.3, 4),
    }));
  };

  const handleZoomOut = () => {
    setZoomPosition((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.3, 1),
    }));
  };

  const handleResetZoom = () => {
    setZoomPosition({
      coordinates: [82.8, 22.0],
      zoom: 1,
    });
  };

  return (
    <div className={`relative w-full h-[540px] sm:h-[640px] lg:h-[700px] bg-[#FAF7F2] rounded-3xl p-3 sm:p-6 border border-[#E5DFD5] flex items-center justify-center overflow-hidden select-none ${className}`}>
      {/* Subtle radial warmth backdrop */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#D99B43]/5 via-[#FAF7F2] to-transparent blur-3xl -z-10"
        aria-hidden="true"
      />

      {/* Floating State Preview Glassmorphic Card */}
      <AnimatePresence>
        {hoveredState && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 bg-white/95 backdrop-blur-md border border-[#E5DFD5] p-4 sm:p-5 rounded-2xl shadow-lg max-w-xs sm:max-w-sm pointer-events-none"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                {hoveredState.region}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20">
                {hoveredState.matchScore}% Match
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-heading font-bold text-[#12213B] tracking-tight">
              {hoveredState.name}
            </h3>

            <p className="text-xs text-dusk-600 font-sans mt-1 line-clamp-2 leading-relaxed">
              {hoveredState.teaser}
            </p>

            <div className="mt-3 pt-3 border-t border-[#E5DFD5] flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1 text-[#12213B] font-bold">
                <Landmark className="w-3.5 h-3.5 text-[#D99B43]" />
                <span>{hoveredState.sitesCount} Curated Sites</span>
              </span>
              <span className="text-[#D5CAB8]">•</span>
              <span className="flex items-center gap-1 text-[#12213B] font-bold">
                <Scissors className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{hoveredState.guildsCount} Guilds</span>
              </span>
            </div>

            <div className="mt-2 text-[10px] font-sans text-[#2D4A3E] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E5DFD5]">
              {hoveredState.matchReason}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Zoom & Map Controls */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#E5DFD5] shadow-sm">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#12213B] border border-[#E5DFD5] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#12213B] border border-[#E5DFD5] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          title="Reset Map View"
          className="w-8 h-8 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#12213B] border border-[#E5DFD5] flex items-center justify-center transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 hidden sm:flex items-center gap-4 px-3.5 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5DFD5] text-[11px] font-mono text-[#12213B] shadow-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#C85A32]" />
          <span>Active State</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#E5B582]" />
          <span>Top Match</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#EFE8DC] border border-[#D5CAB8]" />
          <span>All States</span>
        </div>
      </div>

      {/* Composable Vector Map */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1020,
          center: [82.8, 22.0],
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <ZoomableGroup
          center={zoomPosition.coordinates}
          zoom={zoomPosition.zoom}
          onMoveEnd={(pos) => {
            if (pos && pos.coordinates && typeof pos.zoom === 'number') {
              setZoomPosition({ coordinates: pos.coordinates, zoom: pos.zoom });
            }
          }}
          maxZoom={4}
          minZoom={1}
        >
          <Geographies geography={INDIA_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.st_nm || geo.properties.ST_NM || geo.properties.name || 'India';
                const isSelected = selectedState.toLowerCase() === stateName.toLowerCase();
                const matchData = calculateStateMatchScore(stateName, userPreferences);
                const isTopMatch = matchData.score >= 88;

                // Color calculation
                let defaultFill = '#EFE8DC';
                if (isSelected) {
                  defaultFill = '#C85A32';
                } else if (isTopMatch) {
                  defaultFill = '#F3DEC9'; // Warm glowing terracotta-tinted ivory
                }

                let hoverFill = '#DBCBB2';
                if (isSelected) {
                  hoverFill = '#B34E28';
                } else if (isTopMatch) {
                  hoverFill = '#E8C5A5';
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      const meta = getStateMetadata(stateName);
                      setHoveredState({
                        ...meta,
                        matchScore: matchData.score,
                        matchReason: matchData.reason,
                      });
                    }}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => onSelectState(stateName)}
                    style={{
                      default: {
                        fill: defaultFill,
                        stroke: isSelected ? '#8C2E15' : '#D5CAB8',
                        strokeWidth: isSelected ? 1.5 : 0.75,
                        outline: 'none',
                        transition: 'fill 200ms ease, stroke 200ms ease',
                      },
                      hover: {
                        fill: hoverFill,
                        stroke: isSelected ? '#70220D' : '#8C7A6B',
                        strokeWidth: 1.4,
                        cursor: 'pointer',
                        outline: 'none',
                        filter: 'drop-shadow(0 2px 6px rgba(200, 90, 50, 0.15))',
                      },
                      pressed: {
                        fill: '#9E3F1E',
                        outline: 'none',
                      },
                    } as any}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}

export default InteractiveIndiaMap;
