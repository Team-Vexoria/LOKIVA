import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FloatingPlaceCard } from './FloatingPlaceCard';
import { api } from '../../lib/api';
import { Experience } from '../../types';
import { ZoomIn, ZoomOut, Home } from 'lucide-react';

let L: any = null;

const loadLeaflet = async () => {
  if (typeof window === 'undefined') return null;
  return import('leaflet').then((leaflet) => {
    delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
    return leaflet;
  });
};

function getCategoryEmoji(category: string = '') {
  const cat = category.toLowerCase();
  if (cat.includes('food') || cat.includes('culinary') || cat.includes('dining')) return '🍜';
  if (cat.includes('art') || cat.includes('craft') || cat.includes('workshop') || cat.includes('pottery')) return '🎨';
  if (cat.includes('heritage') || cat.includes('history') || cat.includes('fort') || cat.includes('palace')) return '🏛️';
  if (cat.includes('adventure') || cat.includes('trek') || cat.includes('canyon')) return '🏔️';
  if (cat.includes('nature') || cat.includes('wildlife') || cat.includes('beach')) return '🌿';
  if (cat.includes('music') || cat.includes('dance')) return '🎭';
  if (cat.includes('spiritual') || cat.includes('wellness') || cat.includes('yoga')) return '✨';
  return '📍';
}

export interface IndiaDiscoveryMapProps {
  initialView?: 'all' | 'state' | 'city';
  onPlaceSelect?: (place: Experience) => void;
  enableZoom?: boolean;
  showControls?: boolean;
}

export function IndiaDiscoveryMap({
  initialView = 'all',
  onPlaceSelect,
  enableZoom = true,
  showControls = true,
}: IndiaDiscoveryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Experience | null>(null);
  const [showPlaceCard, setShowPlaceCard] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    api.getExperiences({ limit: 500 })
      .then(data => {
        setExperiences(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load experiences:', err);
        setError('Unable to connect to the server. Make sure the backend is running on http://localhost:8000');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const initMap = async () => {
      L = await loadLeaflet();
      if (!mapContainerRef.current || !L) return;

      // Prevent re-initializing map on same container
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629],
        zoom: 5,
        scrollWheelZoom: enableZoom,
        zoomControl: false,
        minZoom: 4,
        maxZoom: 16,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      mapRef.current = map;
      setIsMapLoaded(true);
    };

    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || experiences.length === 0) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const styleId = 'lokiva-map-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .lk-wrap { background: transparent !important; border: none !important; overflow: visible !important; }
        .lk-pin { position: relative; width: 36px; height: 44px; cursor: pointer; filter: drop-shadow(0 3px 8px rgba(0,0,0,0.22)); transition: filter 0.2s ease; }
        .lk-pin:hover { filter: drop-shadow(0 6px 16px rgba(0,0,0,0.35)); z-index: 9999 !important; }
        .lk-bubble { position: absolute; top: 0; left: 2px; width: 32px; height: 32px; border-radius: 50% 50% 50% 4px; transform: rotate(-45deg); border: 2.5px solid rgba(255,255,255,0.95); display: flex; align-items: center; justify-content: center; transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1); box-shadow: inset 0 1px 3px rgba(255,255,255,0.3); }
        .lk-pin:hover .lk-bubble { transform: rotate(-45deg) scale(1.25) translateY(-2px); }
        .lk-icon { transform: rotate(45deg); font-size: 14px; line-height: 1; }
        .lk-pulse { position: absolute; top: 0; left: 2px; width: 32px; height: 32px; border-radius: 50%; opacity: 0; animation: lk-pulse-anim 2.5s ease-out infinite; }
        @keyframes lk-pulse-anim { 0% { transform: scale(0.9); opacity: 0.6; } 80% { transform: scale(2.4); opacity: 0; } 100% { transform: scale(2.4); opacity: 0; } }
        .lk-gem { position: absolute; top: -6px; right: -4px; font-size: 11px; animation: lk-gem-anim 1.8s ease-in-out infinite; z-index: 1; }
        @keyframes lk-gem-anim { 0%, 100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.35) rotate(20deg); } }
        .lk-tooltip { position: absolute; bottom: 46px; left: 50%; transform: translateX(-50%) translateY(6px) scale(0.95); background: rgba(15,15,15,0.93); backdrop-filter: blur(10px); color: #fff; border-radius: 16px; padding: 11px 14px 10px; white-space: normal; pointer-events: none; opacity: 0; transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.34,1.56,0.64,1); z-index: 99999; box-shadow: 0 12px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2); min-width: 190px; max-width: 230px; border: 1px solid rgba(255,255,255,0.08); }
        .lk-tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 7px solid transparent; border-top-color: rgba(15,15,15,0.93); }
        .lk-pin:hover .lk-tooltip { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        .lk-tt-title { font-weight: 700; font-size: 12.5px; line-height: 1.35; margin-bottom: 6px; color: #fff; font-family: Georgia, serif; }
        .lk-tt-row { display: flex; align-items: center; gap: 5px; font-size: 10.5px; font-family: ui-monospace, monospace; color: rgba(255,255,255,0.7); margin-top: 3px; }
        .lk-tt-chip { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 20px; font-weight: 700; font-size: 10.5px; font-family: ui-monospace, monospace; letter-spacing: 0.02em; }
      `;
      document.head.appendChild(style);
    }

    const markers: any[] = [];
    experiences.forEach(exp => {
      if (!exp.latitude || !exp.longitude) return;

      const isFree = exp.price === 0;
      const isHidden = (exp as any).is_hidden_gem;
      const dotColor = isFree ? '#1F7A6C' : '#E8860F';
      const pulseColor = isFree ? 'rgba(31,122,108,0.45)' : 'rgba(232,134,15,0.45)';
      const priceLabel = isFree ? 'Free Entry' : `₹${exp.price}`;
      const chipBg = isFree ? 'rgba(31,122,108,0.3)' : 'rgba(232,134,15,0.25)';
      const chipColor = isFree ? '#4ecdc4' : '#f0a63b';
      const emoji = getCategoryEmoji(exp.category);
      const title = (exp.title || '').slice(0, 55) + ((exp.title || '').length > 55 ? '…' : '');
      const city = exp.city || '';
      const cat = exp.category || '';

      const html = `
        <div class="lk-pin">
          <div class="lk-pulse" style="background:${pulseColor};"></div>
          <div class="lk-bubble" style="background:${dotColor};">
            <span class="lk-icon">${emoji}</span>
          </div>
          ${isHidden ? '<span class="lk-gem">✨</span>' : ''}
          <div class="lk-tooltip">
            <div class="lk-tt-title">${title}</div>
            <div class="lk-tt-row">
              <span class="lk-tt-chip" style="background:${chipBg};color:${chipColor};">${priceLabel}</span>
            </div>
            ${city ? `<div class="lk-tt-row">📍 ${city}</div>` : ''}
            ${cat ? `<div class="lk-tt-row">🏷️ ${cat}</div>` : ''}
            ${isHidden ? '<div class="lk-tt-row" style="color:#f0a63b;">✨ Hidden Gem</div>' : ''}
          </div>
        </div>`;

      const icon = L.divIcon({
        html,
        className: 'lk-wrap',
        iconSize: [36, 44],
        iconAnchor: [18, 44],
      });

      const marker = L.marker([exp.latitude, exp.longitude], { icon })
        .addTo(mapRef.current)
        .on('click', (e: any) => {
          const cx = e.originalEvent?.clientX ?? window.innerWidth / 2;
          const cy = e.originalEvent?.clientY ?? window.innerHeight / 2;
          setSelectedPlace(exp);
          setCardPosition({ x: cx, y: cy });
          setShowPlaceCard(true);
          onPlaceSelect?.(exp);
        });

      markers.push(marker);
      markersRef.current.push(marker);
    });

    if (markers.length > 0) {
      try {
        const group = new L.FeatureGroup(markers);
        mapRef.current.fitBounds(group.getBounds().pad(0.08));
      } catch {}
    }
  }, [experiences, isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-sm z-[1000] rounded-2xl">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-mono font-bold text-gray-900">Loading cultural places…</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/85 backdrop-blur-sm z-[1000] rounded-2xl">
          <div className="text-center space-y-4 max-w-md px-6">
            <div className="text-5xl">⚠️</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Server Connection Failed</h3>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-1.5">
          <button onClick={() => mapRef.current?.zoomIn()} className="w-9 h-9 bg-white/95 backdrop-blur-sm hover:bg-white rounded-xl shadow-md flex items-center justify-center transition-all border border-gray-200">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => mapRef.current?.zoomOut()} className="w-9 h-9 bg-white/95 backdrop-blur-sm hover:bg-white rounded-xl shadow-md flex items-center justify-center transition-all border border-gray-200">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={() => mapRef.current?.setView([22.5937, 78.9629], 5)} className="w-9 h-9 bg-white/95 backdrop-blur-sm hover:bg-white rounded-xl shadow-md flex items-center justify-center transition-all border border-gray-200">
            <Home className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isLoading && experiences.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000]">
          <div className="bg-white/95 backdrop-blur-md rounded-full border border-gray-200 shadow-md px-3.5 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse inline-block" />
            <span className="text-[11px] font-mono font-bold text-gray-900">{experiences.length} places</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedPlace && showPlaceCard && (
          <FloatingPlaceCard
            place={selectedPlace}
            isOpen={showPlaceCard}
            onClose={() => setShowPlaceCard(false)}
            position={cardPosition}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function DiscoveryMapWithOnboarding() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('has_onboarded_lokiva')) {
      setShowModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    localStorage.setItem('has_onboarded_lokiva', 'true');
  };

  return (
    <div className="relative w-full h-screen">
      <IndiaDiscoveryMap />
      {showModal && (
        <div className="absolute inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Explore India</h2>
            <p className="text-sm text-gray-600 mb-6">
              Verified cultural places across India. Hover over pins to preview, click to explore details.
            </p>
            <button
              onClick={handleCloseModal}
              className="w-full py-3 bg-black text-white rounded-xl text-sm font-bold"
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
