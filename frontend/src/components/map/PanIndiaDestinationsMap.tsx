import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { City } from '../../types';
import { MapPin, Navigation, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PanIndiaDestinationsMapProps {
  cities: City[];
  selectedCity?: City | null;
  userCoords?: { lat: number; lng: number } | null;
  onSelectCity?: (city: City) => void;
}

export function PanIndiaDestinationsMap({
  cities,
  selectedCity,
  userCoords,
  onSelectCity,
}: PanIndiaDestinationsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.3511, 78.6677],
        zoom: 5,
        minZoom: 4,
        maxZoom: 12,
        zoomControl: true,
      });

      // Warm CartoDB Voyager tile layer for luxury travel aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | LOKIVA Pan-India',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add User location pin if available
    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div style="
            width: 28px;
            height: 28px;
            background: #FF9F1C;
            border: 3px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 16px rgba(255,159,28,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          ">
            <div style="width: 8px; height: 8px; background: #1C2321; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const userMarker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <div style="font-weight: bold; color: #1C2321; font-size: 13px;">📍 Your Current Location</div>
            <div style="font-size: 11px; color: #5E6572; margin-top: 2px;">Searching nearby cultural hubs</div>
          </div>
        `);
      markersRef.current.push(userMarker);
    }

    // Add City Markers
    cities.forEach((city) => {
      if (!city.latitude || !city.longitude) return;

      const isSelected = selectedCity?.id === city.id;
      const isPopular = city.is_popular;
      const isHeritage = city.is_heritage_hub;

      const markerColor = isSelected ? '#FF9F1C' : isPopular ? '#09814A' : '#1C2321';
      const markerSize = isSelected ? 34 : isPopular ? 28 : 24;

      const customIcon = L.divIcon({
        className: `city-map-pin-${city.id}`,
        html: `
          <div style="
            width: ${markerSize}px;
            height: ${markerSize}px;
            background: ${markerColor};
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            color: #FFFFFF;
            font-size: ${markerSize > 26 ? 13 : 11}px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${isHeritage ? '🏛️' : isPopular ? '✨' : '📍'}
          </div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const popupHtml = `
        <div style="min-width: 200px; padding: 6px; font-family: sans-serif;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #09814A; letter-spacing: 0.5px;">
            ${city.state_name || 'India'}
          </div>
          <h4 style="margin: 2px 0 4px 0; font-size: 16px; font-weight: 800; color: #1C2321;">
            ${city.name}
          </h4>
          <p style="margin: 0 0 8px 0; font-size: 11px; color: #5E6572; line-height: 1.4;">
            ${city.tagline || city.description?.slice(0, 75) || ''}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; font-family: monospace; border-top: 1px solid #EAEAEA; padding-top: 6px;">
            <span style="color: #1C2321; font-weight: bold;">${city.experience_count || 12} Experiences</span>
            <a href="/destination/${encodeURIComponent(city.state_name || '')}/${encodeURIComponent(city.name)}" 
               style="color: #FF9F1C; font-weight: bold; text-decoration: none;">
              Explore →
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([city.latitude, city.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectCity) onSelectCity(city);
      });

      markersRef.current.push(marker);
    });

    // Fly to selected city if updated
    if (selectedCity && selectedCity.latitude && selectedCity.longitude) {
      map.flyTo([selectedCity.latitude, selectedCity.longitude], 8, { duration: 1.2 });
    }
  }, [cities, selectedCity, userCoords, onSelectCity]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-paper-400 shadow-xl bg-paper-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-paper-400 shadow-md text-xs font-mono">
        <div className="flex items-center gap-2 text-ink font-bold">
          <Sparkles className="w-3.5 h-3.5 text-marigold" />
          <span>Pan-India Live Enclaves</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-dusk-600">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-teal inline-block"></span> Popular</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-ink inline-block"></span> Heritage</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-marigold inline-block"></span> You</span>
        </div>
      </div>
    </div>
  );
}
