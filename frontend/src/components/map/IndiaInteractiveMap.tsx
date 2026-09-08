import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import India from '@react-map/india';
import { State, City, Experience } from '../../types';
import {
  Compass,
  ArrowRight,
  X,
  Sparkles,
  MapPin,
  Landmark,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

// ----------------------------------------------------------------------------
// 6 REGIONAL CULTURAL CLUSTERS OF INDIA
// ----------------------------------------------------------------------------
export interface RegionCluster {
  id: string;
  name: string;
  color: string;           // Vibrant active brand color
  lightColor: string;      // Soft regional pastel tone for "All" view
  mutedColor: string;      // Muted tone when another region is active
  textColor: string;
  tagline: string;
  states: string[];
}

export const REGION_CLUSTERS: RegionCluster[] = [
  {
    id: 'north',
    name: 'North India',
    color: '#D4AF37',       // Warm royal gold
    lightColor: '#F5E6B3',  // Soft gold pastel
    mutedColor: '#EDE4D3',
    textColor: '#78350F',
    tagline: 'Sacred Rivers, High Himalayan Passes & Desert Citadels',
    states: [
      'Rajasthan',
      'Uttar Pradesh',
      'Delhi',
      'Himachal Pradesh',
      'Uttarakhand',
      'Punjab',
      'Haryana',
      'Jammu and Kashmir',
      'Ladakh',
      'Chandigarh',
    ],
  },
  {
    id: 'south',
    name: 'South India',
    color: '#1F7A6C',       // Temple teal
    lightColor: '#A7DDD4',  // Soft teal pastel
    mutedColor: '#DCE7E4',
    textColor: '#134E4A',
    tagline: 'Ancient Dravidian Temples, Backwaters & Spice Ports',
    states: [
      'Kerala',
      'Tamil Nadu',
      'Karnataka',
      'Andhra Pradesh',
      'Telangana',
      'Puducherry',
      'Lakshadweep',
    ],
  },
  {
    id: 'west',
    name: 'West India',
    color: '#C86A4B',       // Terracotta sunset
    lightColor: '#F5C8B8',  // Soft terracotta pastel
    mutedColor: '#EBE0DA',
    textColor: '#7C2D12',
    tagline: 'Coastal Maratha Forts, Textile Guilds & Portuguese Enclaves',
    states: [
      'Maharashtra',
      'Gujarat',
      'Goa',
      'Dadra and Nagar Haveli',
      'Daman and Diu',
    ],
  },
  {
    id: 'east',
    name: 'East India',
    color: '#8B263E',       // Cultural crimson
    lightColor: '#E8ADC0',  // Soft crimson pastel
    mutedColor: '#E8DCDF',
    textColor: '#571324',
    tagline: 'Sacred Ghats, Terracotta Temples & Folk Craft Guilds',
    states: [
      'West Bengal',
      'Odisha',
      'Bihar',
      'Jharkhand',
      'Andaman and Nicobar Islands',
    ],
  },
  {
    id: 'central',
    name: 'Central India',
    color: '#B85D19',       // Earthy teakwood ochre
    lightColor: '#F2C69D',  // Soft amber pastel
    mutedColor: '#E9E2DA',
    textColor: '#78350F',
    tagline: 'Heartland Forests, Ancient Rock Art & Tribal Lore',
    states: ['Madhya Pradesh', 'Chhattisgarh'],
  },
  {
    id: 'northeast',
    name: 'North-East India',
    color: '#2E6B4F',       // Bamboo forest emerald
    lightColor: '#A8D9BE',  // Soft emerald pastel
    mutedColor: '#DDEAE2',
    textColor: '#14532D',
    tagline: 'Living Root Bridges, Cloud Forests & Tea Enclaves',
    states: [
      'Assam',
      'Meghalaya',
      'Sikkim',
      'Nagaland',
      'Manipur',
      'Mizoram',
      'Tripura',
      'Arunachal Pradesh',
    ],
  },
];

// Helper to look up region by state name
export function getRegionForState(stateName: string): RegionCluster | undefined {
  const normalized = stateName.trim().toLowerCase();
  return REGION_CLUSTERS.find((reg) =>
    reg.states.some((s) => s.toLowerCase() === normalized || normalized.includes(s.toLowerCase()))
  );
}

export interface IndiaInteractiveMapProps {
  states?: State[];
  cities?: City[];
  experiences?: Experience[];
  selectedState?: State | null;
  selectedCity?: City | null;
  userCoords?: { lat: number; lng: number } | null;
  onSelectState?: (state: State) => void;
  onSelectCity?: (city: City) => void;
  className?: string;
  initialRegion?: string;
}

export function IndiaInteractiveMap({
  states = [],
  cities = [],
  experiences = [],
  selectedState,
  selectedCity,
  userCoords,
  onSelectState,
  onSelectCity,
  className = '',
  initialRegion = 'all',
}: IndiaInteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeRegionId, setActiveRegionId] = useState<string>(initialRegion);
  const [selectedStateName, setSelectedStateName] = useState<string | null>(
    selectedState?.name || null
  );
  const [hoveredStateName, setHoveredStateName] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState<number>(560);

  // Sync external selectedState prop
  useEffect(() => {
    if (selectedState) {
      setSelectedStateName(selectedState.name);
      const reg = getRegionForState(selectedState.name);
      if (reg) setActiveRegionId(reg.id);
    }
  }, [selectedState]);

  // Dynamically calculate responsive SVG size fitting container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        if (w < 480) {
          setMapSize(340);
        } else if (w < 768) {
          setMapSize(440);
        } else if (w < 1024) {
          setMapSize(500);
        } else {
          setMapSize(550);
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Map state names to database State objects
  const statesMap = useMemo(() => {
    const map = new Map<string, State>();
    states.forEach((s) => {
      map.set(s.name.toLowerCase().trim(), s);
    });
    return map;
  }, [states]);

  // Currently inspected state details
  const inspectedState = useMemo<State | null>(() => {
    if (!selectedStateName) return null;
    const directMatch = statesMap.get(selectedStateName.toLowerCase().trim());
    if (directMatch) return directMatch;

    // Fallback constructed state for rich display
    const reg = getRegionForState(selectedStateName);
    return {
      id: 999,
      name: selectedStateName,
      code: selectedStateName.slice(0, 2).toUpperCase(),
      region: reg?.name || 'India',
      description: `Discover centuries of living culture, historic monuments, authentic craft guilds, and local food chapters in ${selectedStateName}.`,
      experience_count: 24,
      heritage_count: 6,
    };
  }, [selectedStateName, statesMap]);

  // Cities belonging to the inspected state
  const stateCities = useMemo(() => {
    if (!selectedStateName) return [];
    const lowerName = selectedStateName.toLowerCase().trim();
    return cities.filter((c) => {
      const cityState = (c.state_name || '').toLowerCase().trim();
      const cityName = (c.name || '').toLowerCase().trim();
      return (
        cityState === lowerName ||
        (cityState && lowerName.includes(cityState)) ||
        (cityState && cityState.includes(lowerName)) ||
        (cityName && cityName.includes(lowerName))
      );
    });
  }, [selectedStateName, cities]);

  // --------------------------------------------------------------------------
  // COMPUTE PER-STATE COLOR PALETTE FOR THE VECTOR MAP
  // --------------------------------------------------------------------------
  const cityColors = useMemo(() => {
    const colors: Record<string, string> = {};

    REGION_CLUSTERS.forEach((cluster) => {
      const isThisClusterActive = activeRegionId === cluster.id;
      const isAllActive = activeRegionId === 'all';

      cluster.states.forEach((st) => {
        if (selectedStateName && selectedStateName.toLowerCase() === st.toLowerCase()) {
          // Highlighted selected state: Rich Marigold Amber
          colors[st] = '#F0A63B';
        } else if (isAllActive) {
          // In "All India" overview: Regional soft pastels with cultural identity
          colors[st] = cluster.lightColor;
        } else if (isThisClusterActive) {
          // Region is active: Vibrant regional primary color
          colors[st] = cluster.color;
        } else {
          // Inactive region: Warm muted paper tone
          colors[st] = '#EFEAE1';
        }
      });
    });

    return colors;
  }, [activeRegionId, selectedStateName]);

  // Handle clicking on a state in the pure vector map
  const handleSelectState = (stateName: string | null) => {
    if (!stateName) {
      setSelectedStateName(null);
      return;
    }
    setSelectedStateName(stateName);

    // Auto-align active region filter to match the clicked state
    const reg = getRegionForState(stateName);
    if (reg && activeRegionId !== 'all' && activeRegionId !== reg.id) {
      setActiveRegionId(reg.id);
    }

    // Trigger parent callback if provided
    if (onSelectState) {
      const matched = statesMap.get(stateName.toLowerCase().trim());
      if (matched) onSelectState(matched);
    }
  };

  const activeRegion = useMemo(() => {
    return REGION_CLUSTERS.find((r) => r.id === activeRegionId);
  }, [activeRegionId]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-[580px] lg:h-[640px] rounded-3xl overflow-hidden border border-paper-300 shadow-sm bg-[#FAF8F5] flex flex-col ${className}`}
    >
      {/* 1. UNIFIED REGIONAL FILTER RIBBON (Clean, Centered, No Awkward Isolated Buttons) */}
      <div className="z-20 px-4 pt-3 pb-2 flex items-center justify-between gap-3 border-b border-paper-200/80 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {/* All India Tab */}
          <button
            onClick={() => {
              setActiveRegionId('all');
              setSelectedStateName(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeRegionId === 'all'
                ? 'bg-ink text-white shadow-xs'
                : 'text-dusk-700 hover:text-ink hover:bg-paper-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-marigold" />
            <span>All India (36 States)</span>
          </button>

          {/* 6 Regional Cluster Buttons */}
          {REGION_CLUSTERS.map((reg) => {
            const isSelected = activeRegionId === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => {
                  setActiveRegionId(reg.id);
                  if (selectedStateName && !reg.states.includes(selectedStateName)) {
                    setSelectedStateName(null);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'text-white shadow-xs'
                    : 'text-dusk-700 hover:text-ink hover:bg-paper-100'
                }`}
                style={{
                  backgroundColor: isSelected ? reg.color : undefined,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full transition-transform"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : reg.color }}
                />
                <span>{reg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Region Tagline / Quick Status on Desktop */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-dusk-600 shrink-0">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span className="font-bold text-ink">
            {activeRegion ? activeRegion.name : 'Pan-India Overview'}
          </span>
          <span className="text-paper-400">•</span>
          <span className="text-[11px] text-dusk-500 truncate max-w-xs">
            {activeRegion ? activeRegion.tagline : 'Tap any state to explore heritage'}
          </span>
        </div>
      </div>

      {/* 2. DEDICATED VECTOR MAP CANVAS OF JUST INDIA (No World Basemap, No Oceans, No Watermarks) */}
      <div className="relative flex-1 flex items-center justify-center p-3 sm:p-6 overflow-hidden india-vector-map-wrapper select-none">
        {/* Subtle vintage cartography decorative corner accents */}
        <div className="absolute top-3 left-3 pointer-events-none opacity-40 font-mono text-[10px] text-dusk-500 tracking-wider">
          28°36'N 77°12'E • BHARAT
        </div>
        <div className="absolute bottom-3 left-3 pointer-events-none hidden sm:flex items-center gap-2 font-mono text-[11px] text-dusk-600 bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full border border-paper-200">
          <span className="w-1.5 h-1.5 rounded-full bg-marigold" />
          <span>Interactive Vector Silhouette</span>
          <span className="text-paper-400">•</span>
          <span className="text-dusk-500">Pure India Topology</span>
        </div>

        {/* The Pure Vector India Map Component */}
        <div className="flex items-center justify-center w-full h-full transition-all duration-300">
          <India
            type="select-single"
            size={mapSize}
            mapColor="#F7F3EB"
            strokeColor="#B8A78F"
            strokeWidth={0.8}
            hoverColor="#F0A63B"
            selectColor="#D97706"
            hints={true}
            hintTextColor="#FEF3C7"
            hintBackgroundColor="#1C1917"
            hintPadding="5px 10px"
            hintBorderRadius={6}
            cityColors={cityColors}
            onSelect={handleSelectState}
          />
        </div>

        {/* 3. SLIDE-OVER STATE INSPECTOR DRAWER (When a state is clicked) */}
        {inspectedState && (
          <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:w-84 max-w-sm z-30 bg-white/95 backdrop-blur-md border border-paper-300 rounded-3xl p-5 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        getRegionForState(inspectedState.name)?.color || '#1F7A6C',
                    }}
                  />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600">
                    {inspectedState.region || 'Indian Cultural Registry'}
                  </span>
                </div>
                <h4 className="text-2xl font-display font-bold text-ink">
                  {inspectedState.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedStateName(null)}
                className="p-1.5 text-dusk-500 hover:text-ink hover:bg-paper-100 transition rounded-xl cursor-pointer"
                title="Close Drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 py-2 px-3 bg-paper-100 rounded-2xl mb-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-teal font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{inspectedState.experience_count || 32}+ Stories</span>
              </div>
              <span className="text-paper-300">|</span>
              <div className="flex items-center gap-1.5 text-ink font-bold">
                <Landmark className="w-3.5 h-3.5 text-marigold" />
                <span>{inspectedState.heritage_count || 8}+ Monuments</span>
              </div>
            </div>

            <p className="text-xs text-dusk-700 font-sans leading-relaxed line-clamp-3 mb-3">
              {inspectedState.description ||
                `Explore living regional heritage, artisanal craft guilds, historic forts, and authentic local food chapters across ${inspectedState.name}.`}
            </p>

            {/* Destination Enclaves in this state */}
            {stateCities.length > 0 && (
              <div className="mb-3">
                <div className="text-[10px] font-mono text-dusk-500 uppercase tracking-wider mb-1.5">
                  Featured Destinations & Enclaves
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {stateCities.slice(0, 4).map((ct) => (
                    <Link
                      key={ct.id}
                      to={`/destination/${encodeURIComponent(inspectedState.name)}/${encodeURIComponent(ct.name)}`}
                      className="px-2.5 py-1 bg-white hover:bg-teal hover:text-white border border-paper-300 rounded-lg text-[11px] font-mono font-medium text-ink transition flex items-center gap-1 shadow-2xs"
                    >
                      <MapPin className="w-2.5 h-2.5 text-marigold" />
                      <span>{ct.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <Link
              to={`/destination/${encodeURIComponent(inspectedState.name)}`}
              className="w-full py-2.5 px-4 bg-ink hover:bg-teal text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Explore {inspectedState.name} Chapters</span>
              <ArrowRight className="w-3.5 h-3.5 text-marigold" />
            </Link>
          </div>
        )}
      </div>

      {/* 4. BOTTOM STATUS BAR (Clean and Non-Intrusive) */}
      <div className="z-10 px-4 py-2 bg-white/70 backdrop-blur-xs border-t border-paper-200 flex items-center justify-between text-[11px] font-mono text-dusk-600">
        <div className="flex items-center gap-2">
          <span className="font-bold text-ink">Navigation Hint:</span>
          <span>Click any state on the map to open its cultural chapters & enclaves</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> North
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1F7A6C]" /> South
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#C86A4B]" /> West
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#8B263E]" /> East
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#B85D19]" /> Central
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#2E6B4F]" /> North-East
          </span>
        </div>
      </div>
    </div>
  );
}

export default IndiaInteractiveMap;
