import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, MapPin, Sparkles, Clock, ShieldCheck } from 'lucide-react';

interface MapStop {
  id: string | number;
  title: string;
  category?: string;
  lat: number;
  lng: number;
  duration?: string;
  price?: string | number;
  isIndoor?: boolean;
  wheelchair?: boolean;
  whyThis?: string;
  icon?: string;
}

interface ItineraryRouteMapProps {
  stops?: MapStop[];
  hotelLat?: number;
  hotelLng?: number;
  hotelName?: string;
  isRaining?: boolean;
}

export function ItineraryRouteMap({
  stops = [
    {
      id: 'stop-1',
      title: 'Ranwar Village Heritage Stroll',
      category: 'Heritage & Food',
      lat: 19.0558,
      lng: 72.8295,
      duration: '50 mins',
      price: '₹350',
      wheelchair: true,
      whyThis: 'Step-free pavement, 5 min auto from hotel',
      icon: '🏛️',
    },
    {
      id: 'stop-2',
      title: 'Pali Hill Indigo Atelier & Tea Room',
      category: 'Artisan Workshop',
      lat: 19.0620,
      lng: 72.8335,
      duration: '50 mins',
      price: '₹450',
      isIndoor: true,
      wheelchair: true,
      whyThis: '100% sheltered studio, ramp access, zero rain exposure',
      icon: '🎨',
    },
    {
      id: 'stop-3',
      title: 'Chimbai Seated Coastal Tea Room',
      category: 'Culinary Heritage',
      lat: 19.0585,
      lng: 72.8260,
      duration: '40 mins',
      price: '₹300',
      wheelchair: true,
      whyThis: 'Ground floor seating, fits budget ceiling',
      icon: '☕',
    },
  ],
  hotelLat = 19.0522,
  hotelLng = 72.8258,
  hotelName = 'Bandra West (Hotel Base)',
  isRaining = false,
}: ItineraryRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const centerLat = stops.length > 0 ? stops[0].lat : hotelLat;
    const centerLng = stops.length > 0 ? stops[0].lng : hotelLng;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false,
      scrollWheelZoom: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    const hotelIcon = L.divIcon({
      className: 'custom-hotel-pin',
      html: `
        <div style="
          background: #12213B;
          color: #F0A63B;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(18, 33, 59, 0.3);
          font-size: 14px;
        ">
          🏨
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([hotelLat, hotelLng], { icon: hotelIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; color: #12213B;">
          <strong style="font-family: 'Fraunces', serif; font-size: 13px; display: block;">${hotelName}</strong>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5B6B8C;">Start & End Anchor Point</span>
        </div>`
      );

    const routeCoords: [number, number][] = [[hotelLat, hotelLng]];

    stops.forEach((stop, index) => {
      routeCoords.push([stop.lat, stop.lng]);

      const markerColor =
        index === 1 && isRaining
          ? '#C1443B'
          : index === 0
          ? '#12213B'
          : index === 1
          ? '#F0A63B'
          : '#1F7A6C';

      const customIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="
            background: ${markerColor};
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid white;
            box-shadow: 0 4px 14px rgba(18, 33, 59, 0.25);
            font-size: 15px;
            position: relative;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${stop.icon || '📍'}
            <div style="
              position: absolute;
              bottom: -4px;
              right: -4px;
              background: #12213B;
              color: #F0A63B;
              font-family: 'JetBrains Mono', monospace;
              font-size: 8px;
              font-weight: 800;
              width: 14px;
              height: 14px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid white;
            ">
              ${index + 1}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      L.circle([stop.lat, stop.lng], {
        radius: 250,
        color: markerColor,
        weight: 1,
        fillColor: markerColor,
        fillOpacity: 0.06,
        dashArray: '4 4',
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 190px; color: #12213B; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: bold; color: #5B6B8C; text-transform: uppercase;">
              Stop ${index + 1} · ${stop.category || 'Experience'}
            </span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 800; color: #1F7A6C;">
              ${typeof stop.price === 'number' ? `₹${stop.price}` : stop.price || 'Free'}
            </span>
          </div>
          <strong style="font-family: 'Fraunces', serif; font-size: 13px; line-height: 1.2; display: block; color: #12213B; margin-bottom: 4px;">
            ${stop.title}
          </strong>
          <div style="font-size: 10px; color: #5B6B8C; margin-bottom: 6px; font-family: 'JetBrains Mono', monospace;">
            ⏱ ${stop.duration || '45 mins'} · ${stop.wheelchair ? '♿ Step-Free' : '⚠️ Steps'}
          </div>
          ${
            stop.whyThis
              ? `<div style="background: #F5F7F4; border: 1px solid #D0D7CF; border-radius: 8px; padding: 4px 6px; font-size: 9px; color: #1F7A6C; line-height: 1.3;">
                  ✓ ${stop.whyThis}
                </div>`
              : ''
          }
        </div>
      `;

      L.marker([stop.lat, stop.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml);
    });

    routeCoords.push([hotelLat, hotelLng]);

    L.polyline(routeCoords, {
      color: '#F0A63B',
      weight: 3,
      opacity: 0.85,
      dashArray: '6 8',
    }).addTo(map);

    const bounds = L.latLngBounds(routeCoords);
    map.fitBounds(bounds, { padding: [40, 40] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stops, hotelLat, hotelLng, isRaining]);

  return (
    <div className="bg-white rounded-3xl border border-paper-400 p-4 sm:p-6 space-y-4 shadow-md text-ink">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-paper-300">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
              Interactive Route Isochrone
            </span>
            <span className="text-[10px] font-mono text-dusk">
              Auto-rickshaw transit buffers mapped
            </span>
          </div>
          <h4 className="text-lg font-display font-bold text-ink">
            Live Spatial Feasibility & Transit Map
          </h4>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-dusk">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-marigold inline-block" /> Auto Transit
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block" /> 250m Walk Isochrone
          </span>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border border-paper-400 h-80 sm:h-96 z-0 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md rounded-xl p-2.5 border border-paper-400 shadow-lg text-[10px] font-mono space-y-1 z-[1000] pointer-events-none">
          <div className="font-bold text-ink flex items-center gap-1">
            <Navigation className="w-3 h-3 text-marigold" />
            <span>Bandra West Circuit</span>
          </div>
          <div className="text-dusk">
            3 Stops · 1.8 hrs · ₹1,100 total
          </div>
        </div>
      </div>
    </div>
  );
}
