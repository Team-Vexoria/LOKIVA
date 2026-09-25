import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Landmark,
  CloudSun,
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

/**
 * State to Region Lookup Mapping
 */
export const STATE_REGION_MAP: Record<string, RegionType> = {
  // North India
  'Jammu and Kashmir': 'North India',
  'Jammu & Kashmir': 'North India',
  'Ladakh': 'North India',
  'Himachal Pradesh': 'North India',
  'Punjab': 'North India',
  'Uttarakhand': 'North India',
  'Haryana': 'North India',
  'Delhi': 'North India',
  'Uttar Pradesh': 'North India',
  'Chandigarh': 'North India',

  // West India
  'Rajasthan': 'West India',
  'Gujarat': 'West India',
  'Maharashtra': 'West India',
  'Goa': 'West India',
  'Dadra and Nagar Haveli and Daman and Diu': 'West India',

  // South India
  'Karnataka': 'South India',
  'Kerala': 'South India',
  'Tamil Nadu': 'South India',
  'Andhra Pradesh': 'South India',
  'Telangana': 'South India',
  'Puducherry': 'South India',
  'Lakshadweep': 'South India',

  // East & Central India
  'Madhya Pradesh': 'East & Central',
  'Chhattisgarh': 'East & Central',
  'Bihar': 'East & Central',
  'Jharkhand': 'East & Central',
  'West Bengal': 'East & Central',
  'Odisha': 'East & Central',
  'Andaman and Nicobar Islands': 'East & Central',

  // Northeast
  'Assam': 'Northeast',
  'Sikkim': 'Northeast',
  'Meghalaya': 'Northeast',
  'Arunachal Pradesh': 'Northeast',
  'Nagaland': 'Northeast',
  'Manipur': 'Northeast',
  'Mizoram': 'Northeast',
  'Tripura': 'Northeast',
};

/**
 * Vibrant regional base colors:
 * North India: Royal Amber Sandstone (#E89A3C)
 * West India: Warm Terracotta Desert Ochre (#D96B43)
 * South India: Lush Emerald Heritage Sage (#3D7A5A)
 * East & Central India: Antique Bronze Rust (#B26E45)
 * Northeast India: Deep Jade Forest Mineral (#2C5E55)
 */
export function getRegionBaseColor(region: string): string {
  switch (region) {
    case 'North India':
      return '#E89A3C';
    case 'West India':
      return '#D96B43';
    case 'South India':
      return '#3D7A5A';
    case 'East & Central':
      return '#B26E45';
    case 'Northeast':
      return '#2C5E55';
    default:
      return '#B26E45';
  }
}

/**
 * Hardware accelerated camera bounds and zoom factors
 */
export const REGION_BOUNDS: Record<RegionType, { center: [number, number]; zoom: number }> = {
  'All India': { center: [82.9, 22.5], zoom: 1 },
  'North India': { center: [77.5, 31.0], zoom: 2.3 },
  'South India': { center: [78.5, 14.0], zoom: 2.2 },
  'West India': { center: [73.5, 21.0], zoom: 2.2 },
  'East & Central': { center: [84.5, 23.0], zoom: 2.0 },
  'Northeast': { center: [92.8, 25.8], zoom: 2.4 },
};

export interface IndiaVectorMapProps {
  selectedState: string | null;
  onSelectState: (stateName: string) => void;
  activeRegion: RegionType;
  className?: string;
}

interface HoveredStateTooltip {
  name: string;
  siteCount: number;
  weather: string;
  region: string;
}

export function IndiaVectorMap({
  selectedState,
  onSelectState,
  activeRegion,
  className = '',
}: IndiaVectorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Hardware accelerated zoom state
  const [center, setCenter] = useState<[number, number]>(
    REGION_BOUNDS[activeRegion]?.center || REGION_BOUNDS['All India'].center
  );
  const [zoom, setZoom] = useState<number>(
    REGION_BOUNDS[activeRegion]?.zoom || 1
  );

  // Memoize coordinates to prevent scroll-triggered recalibration
  const memoizedCenter = useMemo<[number, number]>(() => {
    return [center[0], center[1]];
  }, [center[0], center[1]]);

  // Sync camera position when activeRegion prop changes
  useEffect(() => {
    const target = REGION_BOUNDS[activeRegion] || REGION_BOUNDS['All India'];
    setCenter(target.center);
    setZoom(target.zoom);
  }, [activeRegion]);

  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null);
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

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.35, 4));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.35, 1));
  };

  const handleResetZoom = () => {
    const target = REGION_BOUNDS[activeRegion] || REGION_BOUNDS['All India'];
    setCenter(target.center);
    setZoom(target.zoom);
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
      {/* Floating Cursor Tooltip */}
      <AnimatePresence>
        {hoveredState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.12 }}
            style={{
              left: tooltipPos.x + 16,
              top: tooltipPos.y - 12,
              transform:
                tooltipPos.x > (containerRef.current?.clientWidth || 700) - 230
                  ? 'translate(-115%, 0)'
                  : 'none',
            }}
            className="absolute z-30 pointer-events-none bg-white/95 backdrop-blur-md border border-[#E5DFD5] px-3.5 py-2 rounded-2xl shadow-xl min-w-[180px] flex flex-col gap-0.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C85A32]">
                {hoveredState.region}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
            </div>
            <h4 className="text-sm font-heading font-extrabold text-[#12213B] leading-tight">
              {hoveredState.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-dusk-600">
              <span className="flex items-center gap-1 font-semibold text-[#12213B]">
                <Landmark className="w-3 h-3 text-[#C85A32]" />
                <span>{hoveredState.siteCount} Sites</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-[#2D4A3E]">
                <CloudSun className="w-3 h-3 text-[#D99B43]" />
                <span>{hoveredState.weather.split(':')[0].trim()}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Zoom Controls (Top Right) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E5DFD5] shadow-sm">
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

      {/* Regional Palette Legend (Bottom Left) */}
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
          <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32] border border-white" />
          <span>Selected</span>
        </div>
      </div>

      {/* Vector Map Stage with GPU accelerated ZoomableGroup */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1050,
          center: [82.9, 22.5],
        }}
        className="w-full h-full select-none"
      >
        <ZoomableGroup
          center={memoizedCenter}
          zoom={zoom}
          minZoom={1}
          maxZoom={4}
          filterZoomEvent={() => false}
        >
          <Geographies geography={INDIA_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName =
                  geo.properties?.st_nm ||
                  geo.properties?.ST_NM ||
                  geo.properties?.name ||
                  'India';

                const stateRegion = STATE_REGION_MAP[stateName] || 'East & Central';

                // Determine if state belongs to currently active region filter
                const isRegionActive =
                  activeRegion === 'All India' || stateRegion === activeRegion;

                const isStateSelected =
                  Boolean(selectedState) &&
                  selectedState?.toLowerCase() === stateName.toLowerCase();

                const isHovered =
                  Boolean(hoveredStateName) &&
                  hoveredStateName?.toLowerCase() === stateName.toLowerCase();

                // Dynamic styling matrix
                const baseFill = isStateSelected
                  ? '#C85A32'
                  : isHovered
                  ? isRegionActive
                    ? '#FF6E40'
                    : '#C4B5A0'
                  : getRegionBaseColor(stateRegion);

                const opacityValue = isStateSelected
                  ? 1.0
                  : isHovered
                  ? isRegionActive
                    ? 1.0
                    : 0.45
                  : isRegionActive
                  ? 1.0
                  : 0.12;

                const strokeColor =
                  isStateSelected || isHovered
                    ? '#FFFFFF'
                    : isRegionActive
                    ? '#FFFFFF'
                    : '#D0C5B4';

                const strokeWidthValue = isStateSelected
                  ? 2.2
                  : isHovered
                  ? 1.8
                  : isRegionActive
                  ? 0.9
                  : 0.4;

                const filterValue = isStateSelected
                  ? 'drop-shadow(0 4px 14px rgba(200, 90, 50, 0.6))'
                  : isHovered
                  ? 'drop-shadow(0 3px 10px rgba(0, 0, 0, 0.18))'
                  : isRegionActive
                  ? 'none'
                  : 'grayscale(100%)';

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={baseFill}
                    stroke={strokeColor}
                    strokeWidth={strokeWidthValue}
                    opacity={opacityValue}
                    onMouseEnter={() => {
                      setHoveredStateName(stateName);
                      const dossier = getStateDossier(stateName);
                      setHoveredState({
                        name: dossier.name,
                        siteCount: dossier.siteCount,
                        weather: dossier.currentWeather,
                        region: stateRegion,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredStateName(null);
                      setHoveredState(null);
                    }}
                    onClick={() => onSelectState(stateName)}
                    style={{
                      fill: baseFill,
                      opacity: opacityValue,
                      stroke: strokeColor,
                      strokeWidth: strokeWidthValue,
                      filter: filterValue,
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'fill 300ms ease, opacity 300ms ease, stroke 300ms ease',
                    }}
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
