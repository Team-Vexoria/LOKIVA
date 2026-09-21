import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Coins, Bookmark, CheckCircle2, Footprints, Car, Sparkles } from 'lucide-react';
import { ItineraryDay, ItineraryActivity } from '../../types/itinerary';
import L from 'leaflet';

interface ItineraryMapViewProps {
  days: ItineraryDay[];
  selectedDayNumber?: number;
  activeStopId?: number | null;
  hoveredStopId?: number | null;
  onSelectStop?: (stopId: number) => void;
}

export function ItineraryMapView({
  days,
  selectedDayNumber,
  activeStopId,
  hoveredStopId,
  onSelectStop,
}: ItineraryMapViewProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | 'all'>(
    selectedDayNumber !== undefined ? selectedDayNumber - 1 : 0
  );
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (selectedDayNumber !== undefined) {
      setSelectedDayIndex(selectedDayNumber - 1);
    }
  }, [selectedDayNumber]);

  const displayedDays =
    selectedDayIndex === 'all'
      ? days
      : days[selectedDayIndex as number]
      ? [days[selectedDayIndex as number]]
      : days;

  const allDisplayedActivities = displayedDays.flatMap((d) =>
    d.activities.map((act) => ({ ...act, dayNum: d.dayNumber }))
  );

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create Leaflet map instance
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([20.5937, 78.9629], 5);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers & polylines
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const validCoordStops = allDisplayedActivities.filter(
      (a) => a.lat !== undefined && a.lng !== undefined && !isNaN(a.lat) && !isNaN(a.lng)
    );

    if (validCoordStops.length > 0) {
      const latLngs: [number, number][] = [];

      validCoordStops.forEach((stop, idx) => {
        const lat = stop.lat!;
        const lng = stop.lng!;
        latLngs.push([lat, lng]);

        const isActive = activeStopId === stop.id || hoveredStopId === stop.id;

        // Custom numbered terracotta/ink pin
        const pinHtml = `
          <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
            isActive ? 'scale-125 z-50' : 'hover:scale-110'
          }">
            <div class="w-8 h-8 rounded-full ${
              isActive ? 'bg-[#C1443B] ring-4 ring-[#FFC067]' : 'bg-[#12213B]'
            } text-[#FAF7F2] font-mono font-bold text-xs flex items-center justify-center shadow-lg border border-white">
              ${idx + 1}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: pinHtml,
          className: 'custom-itinerary-pin',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2 font-sans space-y-1 text-ink min-w-[180px]">
              <span class="text-[10px] font-mono text-[#C1443B] font-bold uppercase block">Stop ${idx + 1} · ${stop.timeRange}</span>
              <strong class="text-xs font-heading font-bold block">${stop.title}</strong>
              <p class="text-[11px] text-dusk">${stop.location}</p>
              <div class="text-[10px] font-mono text-ink pt-1 border-t border-[#E5DFD5]">
                ${stop.costPerPerson === 0 ? 'Free Open Heritage' : '₹' + stop.costPerPerson + ' / person'}
              </div>
            </div>
          `);

        marker.on('click', () => {
          onSelectStop?.(stop.id);
          const el = document.getElementById(`itinerary-stop-${stop.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        markersRef.current[stop.id] = marker;
      });

      // Draw connecting route polyline
      if (latLngs.length > 1) {
        polylineRef.current = L.polyline(latLngs, {
          color: '#C1443B',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map);
      }

      map.fitBounds(L.latLngBounds(latLngs), { padding: [40, 40], maxZoom: 15 });
    }

    return () => {
      // Map cleanup if component unmounts
    };
  }, [allDisplayedActivities.length, selectedDayIndex, activeStopId, hoveredStopId]);

  // Center on active stop when changed
  useEffect(() => {
    if (activeStopId && markersRef.current[activeStopId] && mapInstanceRef.current) {
      const marker = markersRef.current[activeStopId];
      mapInstanceRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.5 });
      marker.openPopup();
    }
  }, [activeStopId]);

  return (
    <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-5 sm:p-6 space-y-5 shadow-sm">
      {/* Map Header & Day Filter Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5DFD5]">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">
            Interactive Route & Geographic Map
          </h2>
          <p className="text-xs text-dusk font-sans">
            Live numbered route polyline synchronized with your daily timeline stops.
          </p>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedDayIndex('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              selectedDayIndex === 'all'
                ? 'bg-[#12213B] text-white shadow-2xs'
                : 'bg-white text-ink hover:bg-[#FAF8F5] border border-[#E5DFD5]'
            }`}
          >
            All Days
          </button>
          {days.map((day, idx) => (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                selectedDayIndex === idx
                  ? 'bg-[#12213B] text-white shadow-2xs'
                  : 'bg-white text-ink hover:bg-[#FAF8F5] border border-[#E5DFD5]'
              }`}
            >
              Day {day.dayNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-80 sm:h-[400px] rounded-2xl border border-[#E5DFD5] overflow-hidden shadow-inner z-10"
      />

      {/* Route Quick Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-dusk bg-white p-3 rounded-xl border border-[#E5DFD5]">
        <div className="flex items-center gap-2">
          <Navigation className="w-3.5 h-3.5 text-[#C1443B]" />
          <span>{allDisplayedActivities.length} Sequential Stops</span>
        </div>
        <span className="text-[11px] text-ink">
          💡 Click any numbered marker on the map to jump directly to its timeline card.
        </span>
      </div>
    </div>
  );
}
