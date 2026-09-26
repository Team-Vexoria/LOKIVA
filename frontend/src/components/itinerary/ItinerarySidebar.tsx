import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Navigation,
  Footprints,
  Zap,
  Maximize2,
  Share2,
  Printer,
  Heart,
  Ticket,
  Utensils,
  Car,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import L from 'leaflet';
import {
  ItineraryDay,
  ItineraryTripDetails,
  ItineraryPracticalInfo,
} from '../../types/itinerary';
import { generateCurvedFlightArc } from './ItineraryMapRoute';

const HARDCODED_CARTO_API_KEY = 'cb1_2x3k_2_130ef72eae12cbf223f5381d';

interface ItinerarySidebarProps {
  day: ItineraryDay;
  tripDetails: ItineraryTripDetails;
  days: ItineraryDay[];
  activeStopId: number | null;
  hoveredStopId?: number | null;
  grandTotal?: number;
  categoryBreakdown?: {
    tickets: number;
    food: number;
    transit: number;
  };
  onSelectStop: (id: number) => void;
  onExpandFullScreenMap: () => void;
  onShare: () => void;
  onPrint: () => void;
}

export function ItinerarySidebar({
  day,
  tripDetails,
  days,
  activeStopId,
  hoveredStopId,
  grandTotal,
  categoryBreakdown,
  onSelectStop,
  onExpandFullScreenMap,
  onShare,
  onPrint,
}: ItinerarySidebarProps) {
  const activities = day.activities || [];
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const polylineGlowRef = useRef<L.Polyline | null>(null);
  const polylinePulseRef = useRef<L.Polyline | null>(null);

  // Financial calculations
  const travelers = Math.max(1, tripDetails.travelers || 2);
  const allActivities = days.flatMap((d) => d.activities);

  const fallbackTicketsCost = allActivities.reduce((sum, act) => sum + (act.costPerPerson || 0) * travelers, 0);
  const fallbackTransitCost = allActivities.reduce((sum, act) => sum + (act.transitCost || 0), 0);
  const fallbackMealsCost = days.length * 800 * travelers;

  const totalTicketsCost = categoryBreakdown ? categoryBreakdown.tickets : fallbackTicketsCost;
  const totalTransitCost = categoryBreakdown ? categoryBreakdown.transit : fallbackTransitCost;
  const totalMealsCost = categoryBreakdown ? categoryBreakdown.food : fallbackMealsCost;

  const finalGrandTotal =
    grandTotal !== undefined ? grandTotal : totalTicketsCost + totalTransitCost + totalMealsCost;
  const perPersonTotal = Math.round(finalGrandTotal / travelers);

  // Spatial Cadence & Energy Telemetry
  const totalTransitMins = activities.reduce((sum, a) => sum + (a.transitToNextMinutes || 15), 0);
  const totalExploreMins = activities.reduce((sum, a) => sum + (a.visitDurationMinutes || 60), 0);
  const totalKm = activities.reduce((sum, a) => sum + (a.transitDistanceKm || 1.8), 0);
  const estSteps = Math.round(totalKm * 1320 + activities.length * 280);

  const feasibilityScore = day.metrics?.paceScore
    ? Math.round(day.metrics.paceScore)
    : Math.min(98, Math.max(82, Math.round(100 - (totalTransitMins / (totalExploreMins + 1)) * 30)));

  // Valid stops for map
  const validStops = activities
    .map((act) => {
      const lat = act.lat ?? act.coordinates?.[0];
      const lng = act.lng ?? act.coordinates?.[1];
      return { ...act, resolvedLat: lat, resolvedLng: lng };
    })
    .filter(
      (act): act is typeof act & { resolvedLat: number; resolvedLng: number } =>
        typeof act.resolvedLat === 'number' &&
        typeof act.resolvedLng === 'number' &&
        !isNaN(act.resolvedLat) &&
        !isNaN(act.resolvedLng)
    );

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
      }).setView([20.5937, 78.9629], 12);

      const cartoApiKey = (
        HARDCODED_CARTO_API_KEY ||
        (import.meta.env.VITE_CARTO_API_KEY as string | undefined) ||
        ''
      )
        .trim()
        .replace(/^["']|["']$/g, '');

      const tileUrl = cartoApiKey
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${encodeURIComponent(cartoApiKey)}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers and polylines
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    if (polylineGlowRef.current) {
      polylineGlowRef.current.remove();
      polylineGlowRef.current = null;
    }
    if (polylinePulseRef.current) {
      polylinePulseRef.current.remove();
      polylinePulseRef.current = null;
    }

    if (validStops.length > 0) {
      const latLngs: [number, number][] = validStops.map((s) => [s.resolvedLat, s.resolvedLng]);

      // Render smooth curved flight arc between sequential stops
      if (validStops.length > 1) {
        const curvedLatLngs = generateCurvedFlightArc(
          validStops.map((s) => ({ lat: s.resolvedLat, lng: s.resolvedLng }))
        );

        // 1. Base Track Layer
        polylineGlowRef.current = L.polyline(curvedLatLngs, {
          color: '#E8DEC8',
          weight: 4,
          opacity: 0.75,
          lineCap: 'round',
          lineJoin: 'round',
          className: 'corridor-base-track',
        }).addTo(map);

        // 2. Active Illuminated Flight Pulse
        polylinePulseRef.current = L.polyline(curvedLatLngs, {
          color: '#C85A32',
          weight: 3.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
          className: 'animated-corridor-flow',
        }).addTo(map);
      }

      // 3. Tactile Compass Stop Beacons
      validStops.forEach((stop, idx) => {
        const isStart = idx === 0;
        const isSelected = activeStopId === stop.id || hoveredStopId === stop.id;

        const beaconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
            isSelected ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            ${
              isStart
                ? '<div class="absolute -inset-2.5 rounded-full bg-[#C85A32]/25 start-beacon-ripple pointer-events-none"></div>'
                : ''
            }
            <div class="absolute -inset-1 rounded-full bg-amber-400/35 beacon-pulse-ring pointer-events-none"></div>
            <div class="relative w-7 h-7 rounded-full ${
              isSelected
                ? 'bg-[#C85A32] ring-4 ring-[#FFC067]/80 shadow-xl'
                : 'bg-[#C85A32] shadow-md border-[2.5px] border-[#FAF7F2]'
            } text-white font-heading font-extrabold text-[11px] flex items-center justify-center">
              ${idx + 1}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: beaconHtml,
          className: 'custom-compass-beacon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([stop.resolvedLat, stop.resolvedLng], { icon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2 font-sans space-y-1 text-neutral-900 min-w-[170px]">
              <span class="text-[10px] font-mono text-[#C85A32] font-bold uppercase block">
                Stop ${idx + 1} · ${stop.timeRange || stop.startTime || ''}
              </span>
              <strong class="text-xs font-heading font-bold block text-neutral-900">${stop.title}</strong>
              <p class="text-[11px] text-neutral-600 line-clamp-1">${stop.location || ''}</p>
            </div>
          `);

        marker.on('click', () => {
          onSelectStop(stop.id);
          const el = document.getElementById(`itinerary-stop-${stop.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        markersRef.current[stop.id] = marker;
      });

      map.fitBounds(L.latLngBounds(latLngs), { padding: [35, 35], maxZoom: 15 });
    }
  }, [day.dayNumber, validStops.length]);

  // Center smoothly on active stop when selected or hovered
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const targetId = activeStopId ?? hoveredStopId;
    if (targetId && markersRef.current[targetId]) {
      const marker = markersRef.current[targetId];
      mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
      marker.openPopup();
    }
  }, [activeStopId, hoveredStopId]);

  const handleFitBounds = () => {
    if (!mapInstanceRef.current || validStops.length === 0) return;
    const latLngs: [number, number][] = validStops.map((s) => [s.resolvedLat, s.resolvedLng]);
    mapInstanceRef.current.fitBounds(L.latLngBounds(latLngs), {
      padding: [35, 35],
      maxZoom: 15,
      animate: true,
    });
  };

  return (
    <aside className="space-y-6 sticky top-24">
      {/* ── 1. INTERACTIVE DIRECTIONAL TRANSIT MAP & STOP SCRUBBER ── */}
      <div className="relative rounded-3xl overflow-hidden border border-[#E2D5BE] bg-white shadow-sm">
        {/* Top Floating Glass Header */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto bg-[#FAF7F2]/95 backdrop-blur-md border border-[#E2D5BE] px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C85A32]" />
            </span>
            <span className="text-[11px] font-meta font-bold uppercase tracking-wider text-neutral-800">
              Day {day.dayNumber} Flight Arc
            </span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={handleFitBounds}
              className="p-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2D5BE] hover:border-[#C85A32] text-neutral-700 shadow-xs transition cursor-pointer"
              title="Fit Corridor Bounds"
            >
              <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
            </button>
            <button
              type="button"
              onClick={onExpandFullScreenMap}
              className="p-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2D5BE] hover:border-[#C85A32] text-neutral-700 shadow-xs transition cursor-pointer"
              title="Expand Full Screen Map"
            >
              <Maximize2 className="w-3.5 h-3.5 text-neutral-700" />
            </button>
          </div>
        </div>

        {/* Embedded Leaflet Map Canvas */}
        <div className="w-full h-[280px] relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />
        </div>

        {/* Bottom Stop Scrubber Pill Strip */}
        <div className="p-2.5 bg-[#FAF7F2] border-t border-[#E2D5BE] flex items-center gap-1.5 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {activities.map((act, idx) => {
            const isSelected = (activeStopId ?? hoveredStopId) === act.id;
            return (
              <button
                key={act.id}
                type="button"
                onClick={() => {
                  onSelectStop(act.id);
                  const el = document.getElementById(`itinerary-stop-${act.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-meta font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#C85A32] text-white shadow-2xs font-bold'
                    : 'bg-white hover:bg-neutral-50 text-neutral-700 border border-[#E2D5BE]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                    isSelected ? 'bg-white text-[#C85A32]' : 'bg-[#FAF4ED] text-[#C85A32]'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate max-w-[85px]">{act.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. SPATIAL CADENCE & ENERGY BAROMETER ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-[#E2D5BE] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#C85A32]" />
            <span className="text-xs font-heading font-bold text-neutral-900 uppercase tracking-wide">
              Spatial Cadence & Energy
            </span>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
            {feasibilityScore}% Optimal
          </span>
        </div>

        {/* Time Distribution Ratio Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-meta text-neutral-500">
            <span>Sightseeing ({Math.round(totalExploreMins / 60)}h {totalExploreMins % 60}m)</span>
            <span>Transit ({totalTransitMins}m)</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#FAF7F2] border border-[#E2D5BE] overflow-hidden flex">
            <div
              className="h-full bg-[#C85A32] transition-all duration-500"
              style={{
                width: `${(totalExploreMins / (totalExploreMins + totalTransitMins || 1)) * 100}%`,
              }}
            />
            <div
              className="h-full bg-[#D99B43] transition-all duration-500"
              style={{
                width: `${(totalTransitMins / (totalExploreMins + totalTransitMins || 1)) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Physical Metric Badges */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8] flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-[#FAF4ED] text-[#C85A32]">
              <Navigation className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-meta text-[10px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
                Distance
              </span>
              <span className="font-mono text-xs font-bold text-neutral-800">
                {totalKm.toFixed(1)} km Total
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8] flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Footprints className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-meta text-[10px] font-bold uppercase tracking-wider text-neutral-400 block leading-none">
                Footsteps
              </span>
              <span className="font-mono text-xs font-bold text-neutral-800">
                ~{estSteps.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. LUXURY RECEIPT LEDGER FINANCIAL DOCK ── */}
      <div className="relative bg-white rounded-3xl border border-[#E2D5BE] p-5 sm:p-6 shadow-md overflow-hidden before:content-[''] before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:w-6 before:h-6 before:bg-[#FAF7F2] before:rounded-full before:border-r before:border-[#E2D5BE] after:content-[''] after:absolute after:-right-3 after:top-1/2 after:-translate-y-1/2 after:w-6 after:h-6 after:bg-[#FAF7F2] after:rounded-full after:border-l after:border-[#E2D5BE] space-y-4">
        {/* Receipt Header */}
        <div className="space-y-1 pb-3 border-b border-[#E8DEC8]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32] block">
              Trip Financial Ledger
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Synchronized
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl sm:text-3xl font-display font-black text-neutral-900 tracking-tight">
              ₹{finalGrandTotal.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-meta text-[#C85A32] font-bold">
              {days.length} Days · {Math.max(1, days.length - 1)} Nights
            </span>
          </div>

          <span className="text-xs font-meta text-neutral-500 block">
            ₹{perPersonTotal.toLocaleString('en-IN')} per person for {travelers} {travelers === 1 ? 'traveler' : 'travelers'}
          </span>
        </div>

        {/* Itemized Category Breakdown with Dotted Leaders */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs font-meta text-neutral-700">
            <span className="flex items-center gap-1.5 shrink-0">
              <Ticket className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Entry &amp; Masterclasses</span>
            </span>
            <span className="flex-1 border-b border-dotted border-[#E8DEC8] mx-2 h-0" />
            <span className="font-mono font-bold text-neutral-900 shrink-0">
              ₹{totalTicketsCost.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-meta text-neutral-700">
            <span className="flex items-center gap-1.5 shrink-0">
              <Utensils className="w-3.5 h-3.5 text-[#D99B43]" />
              <span>Regional Culinary Trails</span>
            </span>
            <span className="flex-1 border-b border-dotted border-[#E8DEC8] mx-2 h-0" />
            <span className="font-mono font-bold text-neutral-900 shrink-0">
              ₹{totalMealsCost.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-meta text-neutral-700">
            <span className="flex items-center gap-1.5 shrink-0">
              <Car className="w-3.5 h-3.5 text-[#1A1D20]" />
              <span>Dedicated Transit Buffer</span>
            </span>
            <span className="flex-1 border-b border-dotted border-[#E8DEC8] mx-2 h-0" />
            <span className="font-mono font-bold text-neutral-900 shrink-0">
              ₹{totalTransitCost.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Verified Community Direct Badge */}
        <div className="p-3 rounded-2xl bg-[#FAF4ED] border border-[#E8DEC8] flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <p className="text-[11px] font-meta text-neutral-700 leading-snug">
            <strong className="text-neutral-900 font-bold">100% Direct:</strong> Zero hidden aggregator margins. Paid directly to cultural custodians.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 border-t border-[#E8DEC8]">
          <button
            type="button"
            onClick={onShare}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#C85A32] to-[#D99B43] hover:opacity-95 text-white rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="w-full py-2 px-4 bg-[#FAF7F2] hover:bg-[#F3EAD8] border border-[#E2D5BE] text-neutral-800 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export Field PDF</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default ItinerarySidebar;
