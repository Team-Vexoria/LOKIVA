import React, { useState, useRef, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Landmark,
  Scissors,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { getStateDossier } from '../../data/stateDossiersData';

// Official TopoJSON containing strictly 36 State / UT geometries (no district clutter)
const INDIA_TOPO_JSON = '/data/india-states.topo.json';

const REGIONS = [
  'All India',
  'North India',
  'South India',
  'West India',
  'East India',
  'Northeast',
] as const;

type RegionType = (typeof REGIONS)[number];

const REGION_STATES: Record<RegionType, string[]> = {
  'All India': [],
  'North India': [
    'Jammu and Kashmir',
    'Ladakh',
    'Himachal Pradesh',
    'Punjab',
    'Uttarakhand',
    'Haryana',
    'Delhi',
    'Chandigarh',
    'Uttar Pradesh',
    'Rajasthan',
  ],
  'South India': [
    'Andhra Pradesh',
    'Karnataka',
    'Kerala',
    'Tamil Nadu',
    'Telangana',
    'Puducherry',
    'Lakshadweep',
  ],
  'West India': [
    'Gujarat',
    'Maharashtra',
    'Goa',
    'Dadra and Nagar Haveli and Daman and Diu',
  ],
  'East India': [
    'Bihar',
    'Jharkhand',
    'Odisha',
    'West Bengal',
    'Andaman and Nicobar Islands',
  ],
  'Northeast': [
    'Arunachal Pradesh',
    'Assam',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Sikkim',
    'Tripura',
  ],
};

const REGION_VIEWPORTS: Record<RegionType, { coordinates: [number, number]; zoom: number }> = {
  'All India': { coordinates: [82.8, 22.0], zoom: 1 },
  'North India': { coordinates: [77.2, 29.2], zoom: 2.1 },
  'South India': { coordinates: [77.8, 13.5], zoom: 2.3 },
  'West India': { coordinates: [72.8, 21.0], zoom: 2.3 },
  'East India': { coordinates: [85.8, 22.8], zoom: 2.3 },
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

  // Fast set lookup for region cluster highlights
  const highlightedRegionStates = useMemo(() => {
    if (activeRegion === 'All India') return new Set<string>();
    return new Set(REGION_STATES[activeRegion].map((s) => s.toLowerCase()));
  }, [activeRegion]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full bg-[#F5EFE6] overflow-hidden select-none flex flex-col items-center justify-center ${className}`}
      style={{
        backgroundImage: `radial-gradient(#D5CAB8 0.75px, transparent 0.75px)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* ── Top Bar: Quick Region Filter Pills ─────────────────────────── */}
      <div className="absolute top-4 inset-x-4 sm:top-5 z-20 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5DFD5] shadow-sm overflow-x-auto max-w-full pointer-events-auto scrollbar-none">
          {REGIONS.map((region) => {
            const isActive = activeRegion === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => handleRegionSelect(region)}
                className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
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
                tooltipPos.x > (containerRef.current?.clientWidth || 600) - 220
                  ? 'translate(-115%, 0)'
                  : 'none',
            }}
            className="absolute z-30 pointer-events-none bg-white/95 backdrop-blur-md border border-[#E5DFD5] px-3.5 py-2.5 rounded-xl shadow-lg min-w-[170px]"
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
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#E5DFD5] shadow-sm">
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

      {/* ── Floating Map Legend ────────────────────────────────────────── */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 hidden md:flex items-center gap-3.5 px-3.5 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E5DFD5] text-[11px] font-mono text-[#12213B] shadow-2xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#C85A32]" />
          <span className="font-semibold">Selected State</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#F3DEC9] border border-[#E5B582]" />
          <span>Region Cluster</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#FAF5EE] border border-[#D5CAB8]" />
          <span>All States</span>
        </div>
      </div>

      {/* ── Vector Map Stage ───────────────────────────────────────────── */}
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1040,
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
          maxZoom={5}
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
                const isInRegionCluster = highlightedRegionStates.has(stateName.toLowerCase());

                // Palette specification:
                // Base state fill: #FAF5EE (warm linen parchment)
                // Border: #D5CAB8 (1px stroke)
                // Region cluster highlight: #F3DEC9
                // Selected state: #C85A32 (vibrant terracotta)
                let fill = '#FAF5EE';
                if (isSelected) {
                  fill = '#C85A32';
                } else if (isInRegionCluster) {
                  fill = '#F3DEC9';
                }

                let hoverFill = '#EFE3D0';
                if (isSelected) {
                  hoverFill = '#B34E28';
                } else if (isInRegionCluster) {
                  hoverFill = '#E8C5A5';
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      const dossier = getStateDossier(stateName);
                      setHoveredState({
                        name: dossier.name,
                        siteCount: dossier.siteCount,
                        guildCount: dossier.guildCount,
                        region: dossier.region,
                      });
                    }}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => onSelectState(stateName)}
                    style={{
                      default: {
                        fill,
                        stroke: isSelected ? '#8C2E15' : '#D5CAB8',
                        strokeWidth: isSelected ? 1.5 : 1.0,
                        outline: 'none',
                        transition: 'fill 200ms ease, stroke 200ms ease',
                        filter: isSelected
                          ? 'drop-shadow(0 4px 10px rgba(200, 90, 50, 0.35))'
                          : 'none',
                      },
                      hover: {
                        fill: hoverFill,
                        stroke: '#C85A32',
                        strokeWidth: 1.5,
                        cursor: 'pointer',
                        outline: 'none',
                        filter: 'drop-shadow(0 2px 8px rgba(200, 90, 50, 0.25))',
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

export default IndiaVectorMap;
