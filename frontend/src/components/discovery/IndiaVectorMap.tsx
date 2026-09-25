import React, { useState, useRef, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Landmark,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { getStateDossier } from '../../data/stateDossiersData';

// Official TopoJSON containing strictly 36 State / UT geometries
const INDIA_TOPO_JSON = '/data/india-states.topo.json';

export const REGIONS = [
  'All India',
  'North India',
  'West India',
  'South India',
  'East & Central',
  'Northeast',
] as const;

export type RegionType = (typeof REGIONS)[number];

export interface RegionColorConfig {
  region: string;
  fill: string;
  hover: string;
}

/**
 * Vibrant regional color-coding based on authentic heritage palette:
 * - North India (Himachal, Punjab, Uttarakhand, J&K, Delhi, UP, etc.): Royal Amber / Sandstone (#E89A3C, hover: #D6882A)
 * - West India (Rajasthan, Gujarat, Maharashtra, Goa): Warm Terracotta / Desert Ochre (#D96B43, hover: #C4552D)
 * - South India (Kerala, Tamil Nadu, Karnataka, AP, Telangana): Lush Emerald / Heritage Sage (#3D7A5A, hover: #2E6246)
 * - East & Central India (MP, Chhattisgarh, Bengal, Odisha, Bihar, Jharkhand): Antique Bronze / Rust (#B26E45, hover: #9B5C35)
 * - Northeast India (Assam, Meghalaya, Sikkim, etc.): Deep Jade / Forest Mineral (#2C5E55, hover: #1F4740)
 */
export function getStateRegionAndColors(stateName: string): RegionColorConfig {
  const norm = stateName.toLowerCase();

  // North India
  if (
    norm.includes('himachal') ||
    norm.includes('punjab') ||
    norm.includes('uttarakhand') ||
    norm.includes('jammu') ||
    norm.includes('kashmir') ||
    norm.includes('ladakh') ||
    norm.includes('delhi') ||
    norm.includes('uttar pradesh') ||
    norm.includes('haryana') ||
    norm.includes('chandigarh')
  ) {
    return {
      region: 'North India',
      fill: '#E89A3C',
      hover: '#D6882A',
    };
  }

  // West India
  if (
    norm.includes('rajasthan') ||
    norm.includes('gujarat') ||
    norm.includes('maharashtra') ||
    norm.includes('goa') ||
    norm.includes('dadra') ||
    norm.includes('daman') ||
    norm.includes('diu')
  ) {
    return {
      region: 'West India',
      fill: '#D96B43',
      hover: '#C4552D',
    };
  }

  // South India
  if (
    norm.includes('kerala') ||
    norm.includes('tamil') ||
    norm.includes('karnataka') ||
    norm.includes('andhra') ||
    norm.includes('telangana') ||
    norm.includes('puducherry') ||
    norm.includes('lakshadweep')
  ) {
    return {
      region: 'South India',
      fill: '#3D7A5A',
      hover: '#2E6246',
    };
  }

  // Northeast India
  if (
    norm.includes('assam') ||
    norm.includes('meghalaya') ||
    norm.includes('sikkim') ||
    norm.includes('arunachal') ||
    norm.includes('manipur') ||
    norm.includes('mizoram') ||
    norm.includes('nagaland') ||
    norm.includes('tripura')
  ) {
    return {
      region: 'Northeast',
      fill: '#2C5E55',
      hover: '#1F4740',
    };
  }

  // East & Central India (MP, Chhattisgarh, Bengal, Odisha, Bihar, Jharkhand, Andaman)
  return {
    region: 'East & Central',
    fill: '#B26E45',
    hover: '#9B5C35',
  };
}

const REGION_VIEWPORTS: Record<RegionType, { coordinates: [number, number]; zoom: number }> = {
  'All India': { coordinates: [82.8, 22.0], zoom: 1 },
  'North India': { coordinates: [77.2, 29.5], zoom: 2.1 },
  'West India': { coordinates: [72.8, 21.0], zoom: 2.3 },
  'South India': { coordinates: [77.8, 13.5], zoom: 2.3 },
  'East & Central': { coordinates: [84.8, 22.8], zoom: 2.2 },
  'Northeast': { coordinates: [93.2, 25.8], zoom: 2.7 },
};

interface IndiaVectorMapProps {
  selectedState: string;
  onSelectState: (stateName: string) => void;
  className?: string;
}

interface HoveredStateTooltip {
  name: string;
  siteCount: number;
  guildCount: number;
  region: string;
}

export function IndiaVectorMap({
  selectedState,
  onSelectState,
  className = '',
}: IndiaVectorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeRegion, setActiveRegion] = useState<RegionType>('All India');
  const [zoomPosition, setZoomPosition] = useState<{ coordinates: [number, number]; zoom: number }>({
    coordinates: [82.8, 22.0],
    zoom: 1,
  });

  const [hoveredState, setHoveredState] = useState<HoveredStateTooltip | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleRegionSelect = (region: RegionType) => {
    setActiveRegion(region);
    const targetViewport = REGION_VIEWPORTS[region];
    if (targetViewport) {
      setZoomPosition(targetViewport);
    }
  };

  const handleZoomIn = () => {
    setZoomPosition((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.35, 4.5),
    }));
  };

  const handleZoomOut = () => {
    setZoomPosition((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.35, 1),
    }));
  };

  const handleResetZoom = () => {
    setActiveRegion('All India');
    setZoomPosition(REGION_VIEWPORTS['All India']);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full bg-[#FAF7F2] overflow-hidden select-none flex flex-col items-center justify-center ${className}`}
      style={{
        backgroundImage: `radial-gradient(#E5DFD5 0.8px, transparent 0.8px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* ── Top Bar: Floating Centered Region Filter Pills ─────────────── */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none w-full px-4">
        <div className="flex items-center gap-1.5 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E5DFD5] shadow-md overflow-x-auto max-w-full pointer-events-auto scrollbar-none">
          {REGIONS.map((region) => {
            const isActive = activeRegion === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => handleRegionSelect(region)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : 'bg-transparent text-[#12213B] hover:bg-[#FAF7F2] hover:text-[#C85A32]'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Floating Cursor Glassmorphic Tooltip ───────────────────────── */}
      <AnimatePresence>
        {hoveredState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            style={{
              left: tooltipPos.x + 16,
              top: tooltipPos.y - 12,
              transform:
                tooltipPos.x > (containerRef.current?.clientWidth || 700) - 220
                  ? 'translate(-115%, 0)'
                  : 'none',
            }}
            className="absolute z-30 pointer-events-none bg-white/95 backdrop-blur-md border border-[#E5DFD5] px-3.5 py-2.5 rounded-xl shadow-xl min-w-[170px]"
          >
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C85A32]">
                {hoveredState.region}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
            </div>
            <h4 className="text-sm font-heading font-extrabold text-[#12213B] leading-tight">
              {hoveredState.name}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-dusk-600">
              <span className="flex items-center gap-1 font-semibold text-[#12213B]">
                <Landmark className="w-3 h-3 text-[#C85A32]" />
                <span>{hoveredState.siteCount} Sites</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-[#12213B]">
                <Scissors className="w-3 h-3 text-[#D99B43]" />
                <span>{hoveredState.guildCount} Guilds</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Zoom Controls ─────────────────────────────────────── */}
      <div className="absolute top-20 right-4 sm:top-24 sm:right-6 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E5DFD5] shadow-sm">
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

      {/* ── Regional Palette Legend (Bottom Left) ──────────────────────── */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 hidden md:flex items-center gap-3 px-3.5 py-2 bg-white/95 backdrop-blur-md rounded-2xl border border-[#E5DFD5] text-[10px] font-mono text-[#12213B] shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E89A3C]" />
          <span>North</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D96B43]" />
          <span>West</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3D7A5A]" />
          <span>South</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B26E45]" />
          <span>East &amp; Central</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2C5E55]" />
          <span>Northeast</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-[#E5DFD5] pl-2 font-bold text-[#C85A32]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] border border-white" />
          <span>Selected</span>
        </div>
      </div>

      {/* ── Vector Map Stage ───────────────────────────────────────────── */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1060,
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
          maxZoom={5.5}
          minZoom={1}
        >
          <Geographies geography={INDIA_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName =
                  geo.properties?.st_nm ||
                  geo.properties?.ST_NM ||
                  geo.properties?.name ||
                  'India';

                const isSelected = selectedState.toLowerCase() === stateName.toLowerCase();
                const regionMeta = getStateRegionAndColors(stateName);

                // Set explicit SVG fill attribute and stroke attribute to ensure no black fallback
                const baseFill = isSelected ? '#FF6B35' : regionMeta.fill;
                const baseStroke = isSelected ? '#FFFFFF' : '#FAF7F2';
                const baseStrokeWidth = isSelected ? 2.0 : 0.8;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={baseFill}
                    stroke={baseStroke}
                    strokeWidth={baseStrokeWidth}
                    onMouseEnter={() => {
                      const dossier = getStateDossier(stateName);
                      setHoveredState({
                        name: dossier.name,
                        siteCount: dossier.siteCount,
                        guildCount: dossier.guildCount,
                        region: regionMeta.region,
                      });
                    }}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => onSelectState(stateName)}
                    style={{
                      default: {
                        fill: baseFill,
                        stroke: baseStroke,
                        strokeWidth: baseStrokeWidth,
                        outline: 'none',
                        transition: 'all 250ms cubic-bezier(0.16, 1, 0.3, 1)',
                        filter: isSelected
                          ? 'drop-shadow(0 6px 16px rgba(255, 107, 53, 0.55))'
                          : 'none',
                      },
                      hover: {
                        fill: '#FF6B35',
                        stroke: '#FFFFFF',
                        strokeWidth: 2.0,
                        outline: 'none',
                        cursor: 'pointer',
                        filter: 'drop-shadow(0 4px 12px rgba(217, 107, 67, 0.45))',
                        transform: 'translateY(-2px)',
                        transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
                      },
                      pressed: {
                        fill: '#B84E26',
                        stroke: '#FFFFFF',
                        strokeWidth: 2.0,
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

export default IndiaVectorMap;
