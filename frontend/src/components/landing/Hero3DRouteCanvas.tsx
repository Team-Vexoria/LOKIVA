import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  MapPin,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Coins,
  ChevronRight,
  Compass,
  Zap,
} from 'lucide-react';

interface RouteHop {
  id: string;
  stepNumber: number;
  timeSlot: string;
  name: string;
  neighborhood: string;
  category: string;
  durationMins: number;
  priceINR: number;
  crowdIndexPercent: number;
  crowdStatus: 'Quiet' | 'Moderate' | 'Peak';
  openingStatus: string;
  stepFreeVerified: boolean;
  transitToNext: {
    transitMins: number;
    distanceKm: number;
    mode: 'Walking' | 'Auto / Taxi' | 'E-Boat';
    slackBufferMins: number;
    slackReason: string;
  } | null;
  canvasCoord: { x: number; y: number }; // Relative coordinates on canvas [0..1]
}

interface CorridorCircuit {
  id: string;
  name: string;
  shortLabel: string;
  city: string;
  state: string;
  budgetCeiling: number;
  availableHours: number;
  hops: [RouteHop, RouteHop, RouteHop];
}

const CIRCUITS: CorridorCircuit[] = [
  {
    id: 'mumbai-heritage',
    name: 'Mumbai Heritage & Maritime Corridor',
    shortLabel: 'Mumbai Heritage',
    city: 'Mumbai',
    state: 'Maharashtra',
    budgetCeiling: 1500,
    availableHours: 4.5,
    hops: [
      {
        id: 'mum-hop-1',
        stepNumber: 1,
        timeSlot: '08:30 AM',
        name: 'Gateway of India & Royal Yacht Sea Wall',
        neighborhood: 'Apollo Bunder, Colaba',
        category: 'Maritime Monument',
        durationMins: 50,
        priceINR: 0,
        crowdIndexPercent: 22,
        crowdStatus: 'Quiet',
        openingStatus: 'Open 24/7 · Optimal early sun window',
        stepFreeVerified: true,
        transitToNext: {
          transitMins: 14,
          distanceKm: 0.8,
          mode: 'Walking',
          slackBufferMins: 10,
          slackReason: '+10m pedestrian buffer via Colaba Causeway',
        },
        canvasCoord: { x: 0.18, y: 0.72 },
      },
      {
        id: 'mum-hop-2',
        stepNumber: 2,
        timeSlot: '11:15 AM',
        name: 'Kala Ghoda Art Deco Walk & Heritage Cafe',
        neighborhood: 'Kala Ghoda Arts Precinct',
        category: 'Colonial Architecture & Irani Chai',
        durationMins: 60,
        priceINR: 320,
        crowdIndexPercent: 48,
        crowdStatus: 'Moderate',
        openingStatus: '08:00 AM – 11:30 PM · Verified table slot',
        stepFreeVerified: true,
        transitToNext: {
          transitMins: 18,
          distanceKm: 2.4,
          mode: 'Auto / Taxi',
          slackBufferMins: 18,
          slackReason: '+18m local taxi traffic slack added',
        },
        canvasCoord: { x: 0.52, y: 0.42 },
      },
      {
        id: 'mum-hop-3',
        stepNumber: 3,
        timeSlot: '02:00 PM',
        name: 'Sassoon Docks Fisherman Guild & Koli Wharf',
        neighborhood: 'Old Colaba Wharf',
        category: 'Living Coastal Culture',
        durationMins: 55,
        priceINR: 150,
        crowdIndexPercent: 31,
        crowdStatus: 'Quiet',
        openingStatus: '05:00 AM – 04:00 PM · Verified before tide closure',
        stepFreeVerified: true,
        transitToNext: null,
        canvasCoord: { x: 0.84, y: 0.65 },
      },
    ],
  },
  {
    id: 'jaipur-craft',
    name: 'Jaipur Walled City & Craft Circuit',
    shortLabel: 'Jaipur Craft',
    city: 'Jaipur',
    state: 'Rajasthan',
    budgetCeiling: 1600,
    availableHours: 5.0,
    hops: [
      {
        id: 'jpr-hop-1',
        stepNumber: 1,
        timeSlot: '09:00 AM',
        name: 'Sireh Deori Havelis & Century-Old Lassi',
        neighborhood: 'Sireh Deori Bazar',
        category: 'Heritage Colonnade & Tasting',
        durationMins: 45,
        priceINR: 120,
        crowdIndexPercent: 18,
        crowdStatus: 'Quiet',
        openingStatus: '07:30 AM – 10:30 PM · Fresh batch slot',
        stepFreeVerified: true,
        transitToNext: {
          transitMins: 12,
          distanceKm: 1.1,
          mode: 'Auto / Taxi',
          slackBufferMins: 8,
          slackReason: '+8m e-rickshaw bazaar buffer added',
        },
        canvasCoord: { x: 0.16, y: 0.68 },
      },
      {
        id: 'jpr-hop-2',
        stepNumber: 2,
        timeSlot: '11:45 AM',
        name: 'Bagru Natural Dye & Hand-Block Print Atelier',
        neighborhood: 'Old Walled City Ateliers',
        category: 'Master Artisan Studio',
        durationMins: 65,
        priceINR: 450,
        crowdIndexPercent: 35,
        crowdStatus: 'Moderate',
        openingStatus: '10:00 AM – 06:00 PM · Reserved master artisan loom',
        stepFreeVerified: true,
        transitToNext: {
          transitMins: 20,
          distanceKm: 2.8,
          mode: 'Auto / Taxi',
          slackBufferMins: 15,
          slackReason: '+15m Ajmeri Gate bottleneck buffer',
        },
        canvasCoord: { x: 0.50, y: 0.35 },
      },
      {
        id: 'jpr-hop-3',
        stepNumber: 3,
        timeSlot: '02:30 PM',
        name: 'Chandpol Marble Carvers Guild Courtyard',
        neighborhood: 'Chandpol Bazar',
        category: 'Stone Sculpting Traditions',
        durationMins: 50,
        priceINR: 0,
        crowdIndexPercent: 24,
        crowdStatus: 'Quiet',
        openingStatus: '09:00 AM – 07:00 PM · Active working courtyard',
        stepFreeVerified: true,
        transitToNext: null,
        canvasCoord: { x: 0.86, y: 0.58 },
      },
    ],
  },
  {
    id: 'varanasi-river',
    name: 'Varanasi River & Silk Weavers Arc',
    shortLabel: 'Varanasi River Arc',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    budgetCeiling: 1200,
    availableHours: 4.0,
    hops: [
      {
        id: 'vns-hop-1',
        stepNumber: 1,
        timeSlot: '06:30 AM',
        name: 'Dashashwamedh Ghat Sunrise E-Boat & Heritage Malaiyo',
        neighborhood: 'Dashashwamedh Ghat',
        category: 'River Tradition & Tasting',
        durationMins: 55,
        priceINR: 350,
        crowdIndexPercent: 30,
        crowdStatus: 'Quiet',
        openingStatus: '05:30 AM – 10:00 AM · Morning fog clearance slot',
        stepFreeVerified: true,
        transitToNext: {
          transitMins: 16,
          distanceKm: 1.6,
          mode: 'E-Boat',
          slackBufferMins: 12,
          slackReason: '+12m river current & docking buffer',
        },
        canvasCoord: { x: 0.16, y: 0.76 },
      },
      {
        id: 'vns-hop-2',
        stepNumber: 2,
        timeSlot: '09:30 AM',
        name: 'Madpura Handloom Pit-Looms & Zari Karkhana',
        neighborhood: 'Madpura Weavers Colony',
        category: 'Living Textile Guild',
        durationMins: 60,
        priceINR: 300,
        crowdIndexPercent: 25,
        crowdStatus: 'Quiet',
        openingStatus: '08:30 AM – 06:00 PM · Direct-from-weaver access',
        stepFreeVerified: true,
        transitToNext: {
          transitMins: 18,
          distanceKm: 2.1,
          mode: 'Auto / Taxi',
          slackBufferMins: 14,
          slackReason: '+14m narrow lane e-rickshaw slack',
        },
        canvasCoord: { x: 0.54, y: 0.40 },
      },
      {
        id: 'vns-hop-3',
        stepNumber: 3,
        timeSlot: '01:00 PM',
        name: 'Nepali Temple Pagoda & Ancient Woodcarving',
        neighborhood: 'Lalita Ghat Overlook',
        category: 'Carved Wooden Architecture',
        durationMins: 45,
        priceINR: 50,
        crowdIndexPercent: 19,
        crowdStatus: 'Quiet',
        openingStatus: '06:00 AM – 07:00 PM · Paved river terrace approach',
        stepFreeVerified: true,
        transitToNext: null,
        canvasCoord: { x: 0.84, y: 0.62 },
      },
    ],
  },
];

export function Hero3DRouteCanvas() {
  const [selectedCircuitId, setSelectedCircuitId] = useState('mumbai-heritage');
  const [activeHopIndex, setActiveHopIndex] = useState(1); // Default to Step 2
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const circuit = CIRCUITS.find((c) => c.id === selectedCircuitId) || CIRCUITS[0];
  const activeHop = circuit.hops[activeHopIndex] || circuit.hops[0];

  // Mathematical telemetry calculations
  const totalCost = circuit.hops.reduce((acc, h) => acc + h.priceINR, 0);
  const budgetBurnPercent = Math.round((totalCost / circuit.budgetCeiling) * 100);
  const totalTransitSlack = circuit.hops.reduce(
    (acc, h) => acc + (h.transitToNext ? h.transitToNext.slackBufferMins : 0),
    0
  );
  const allHopsStepFree = circuit.hops.every((h) => h.stepFreeVerified);

  // Micro-Visualizer Canvas (Renders interactive coordinate splines & pulsing transit nodes)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let progress = 0;

    const render = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // 1. Subtle Architectural Geo-Grid
      ctx.strokeStyle = 'rgba(210, 218, 229, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 28;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Convert hop normalized coords to pixels
      const points = circuit.hops.map((hop) => ({
        x: hop.canvasCoord.x * w,
        y: hop.canvasCoord.y * h,
      }));

      // 2. Connecting Bezier Splines between Hops
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX = (p0.x + p1.x) / 2;
        const cpY = Math.min(p0.y, p1.y) - 34; // Arched curve
        ctx.quadraticCurveTo(cpX, cpY, p1.x, p1.y);
      }
      ctx.strokeStyle = '#F0A63B';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // 3. Photon Packet Traversing Spline (Simulating real-time solver signal)
      progress = (progress + 0.007) % 1;
      let trailX = 0;
      let trailY = 0;
      if (progress < 0.5) {
        const t = progress / 0.5;
        const cpX = (points[0].x + points[1].x) / 2;
        const cpY = Math.min(points[0].y, points[1].y) - 34;
        trailX = (1 - t) * (1 - t) * points[0].x + 2 * (1 - t) * t * cpX + t * t * points[1].x;
        trailY = (1 - t) * (1 - t) * points[0].y + 2 * (1 - t) * t * cpY + t * t * points[1].y;
      } else {
        const t = (progress - 0.5) / 0.5;
        const cpX = (points[1].x + points[2].x) / 2;
        const cpY = Math.min(points[1].y, points[2].y) - 34;
        trailX = (1 - t) * (1 - t) * points[1].x + 2 * (1 - t) * t * cpX + t * t * points[2].x;
        trailY = (1 - t) * (1 - t) * points[1].y + 2 * (1 - t) * t * cpY + t * t * points[2].y;
      }

      // Draw glowing traveling photon
      const glowGrad = ctx.createRadialGradient(trailX, trailY, 1, trailX, trailY, 9);
      glowGrad.addColorStop(0, '#F0A63B');
      glowGrad.addColorStop(1, 'rgba(240, 166, 59, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(trailX, trailY, 9, 0, Math.PI * 2);
      ctx.fill();

      // 4. Render Transit Hop Nodes & Ripple Rings
      points.forEach((pt, idx) => {
        const isSelected = idx === activeHopIndex;

        if (isSelected) {
          // Animated Concentric Pulse Ring
          const pulseRadius = 14 + Math.sin(Date.now() * 0.006) * 4;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(31, 122, 108, 0.45)';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node Outer Ring
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 9 : 6.5, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#12213B' : '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#F0A63B' : '#1F7A6C';
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.stroke();

        // Inner Dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#F0A63B' : '#1F7A6C';
        ctx.fill();

        // Node Step Label
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = isSelected ? '#12213B' : '#5B6B8C';
        ctx.textAlign = 'center';
        ctx.fillText(`HOP 0${idx + 1}`, pt.x, pt.y + 19);
      });

      // 5. Render Transit Buffers Badges on connecting segments
      if (points.length >= 2) {
        const mid1X = (points[0].x + points[1].x) / 2;
        const mid1Y = Math.min(points[0].y, points[1].y) - 18;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.strokeStyle = '#D0D7CF';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(mid1X - 38, mid1Y - 9, 76, 18, 9);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = '#1F7A6C';
        ctx.textAlign = 'center';
        ctx.fillText(`${circuit.hops[0].transitToNext?.transitMins}m transit`, mid1X, mid1Y + 3.5);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [circuit, activeHopIndex]);

  // Handle direct click on canvas to select hops
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    circuit.hops.forEach((hop, idx) => {
      const hx = hop.canvasCoord.x * rect.width;
      const hy = hop.canvasCoord.y * rect.height;
      const dist = Math.hypot(clickX - hx, clickY - hy);
      if (dist < 26) {
        setActiveHopIndex(idx);
      }
    });
  };

  return (
    <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#FAFBF9] via-white to-paper-100 border border-paper-400 p-4 sm:p-6 shadow-xl overflow-hidden flex flex-col justify-between space-y-4 text-ink">
      {/* 1. TOP TELEMETRY HUD: Circuit Switcher & Live Engine Status */}
      <div className="space-y-3 pb-3 border-b border-paper-300">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Live Engine Pulse Tag */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-wider text-teal-800 uppercase">
                Constraint Engine HUD
              </span>
            </div>
            <span className="text-[10px] font-mono text-dusk font-bold">
              Solve Latency: <span className="text-ink">240ms</span>
            </span>
          </div>

          {/* Probability Indicator */}
          <div className="text-[10px] font-mono text-teal font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal" />
            <span>100% P95 Reachability</span>
          </div>
        </div>

        {/* Live Corridor Circuit Tabs (Dark Slate Active Toggle) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CIRCUITS.map((c) => {
            const isSelected = selectedCircuitId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCircuitId(c.id);
                  setActiveHopIndex(1); // Reset to middle hop on corridor switch
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-ink text-white shadow-sm border border-ink scale-102'
                    : 'bg-paper-100 hover:bg-paper-200 text-dusk-800 border border-paper-300'
                }`}
              >
                <span>{c.shortLabel}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-marigold animate-ping" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. INTERACTIVE CANVAS ELEMENT: WebGL/Canvas 2D Coordinate Spline & Pulsing Nodes */}
      <div className="relative w-full h-[145px] sm:h-[160px] rounded-2xl bg-paper-50/70 border border-paper-300 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-pointer"
        />

        {/* Floating Canvas Badges */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none flex items-center gap-1.5 text-[10px] font-mono text-dusk">
          <Compass className="w-3 h-3 text-teal" />
          <span className="uppercase tracking-wider font-semibold">
            {circuit.city} · Live Spline
          </span>
        </div>

        <div className="absolute bottom-2 right-2.5 pointer-events-none text-[9.5px] font-mono text-dusk-600 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md border border-paper-300">
          Click nodes to inspect hop
        </div>
      </div>

      {/* 3. STEPPER CONTROLS: Active Route Slider / Stepper (Step 1 -> Step 2 -> Step 3) */}
      <div className="grid grid-cols-3 gap-2">
        {circuit.hops.map((hop, idx) => {
          const isSelected = idx === activeHopIndex;
          return (
            <button
              key={hop.id}
              type="button"
              onClick={() => setActiveHopIndex(idx)}
              className={`p-2 rounded-xl text-left transition-all duration-200 border flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-marigold/70 shadow-md ring-1 ring-marigold/30'
                  : 'bg-paper-50/80 hover:bg-white border-paper-300 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between w-full text-[10px] font-mono">
                <span className={`font-bold ${isSelected ? 'text-marigold-800' : 'text-dusk'}`}>
                  HOP 0{hop.stepNumber}
                </span>
                <span className="font-bold text-ink">{hop.timeSlot}</span>
              </div>
              <p className="text-[11px] font-display font-bold text-ink leading-tight line-clamp-1 mt-1">
                {hop.name.split('&')[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* 4. ACTIVE STEP TELEMETRY INSPECTOR (Zero Dummy Values) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeHop.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22 }}
          className="bg-white rounded-2xl border border-paper-300 p-4 shadow-sm space-y-3"
        >
          {/* Hop Header with Category & Step-Free Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal" />
                  <span>{activeHop.neighborhood}</span>
                </span>
                <span className="text-[10px] text-dusk-400 font-mono">•</span>
                <span className="text-[10px] font-mono text-dusk font-bold">
                  {activeHop.category}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-display font-bold text-ink leading-snug">
                {activeHop.name}
              </h4>
            </div>

            {/* Price Pill */}
            <span className="px-2.5 py-1 rounded-full bg-paper-100 text-ink text-[11px] font-mono font-bold shrink-0 border border-paper-300">
              {activeHop.priceINR === 0 ? 'Free Entry' : `₹${activeHop.priceINR} / pax`}
            </span>
          </div>

          {/* Real Algorithmic Constraints Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-paper-200 text-xs font-mono">
            {/* Opening Window Status */}
            <div className="space-y-0.5">
              <span className="text-[9.5px] uppercase tracking-wider text-dusk font-semibold block">
                Live Opening Slot
              </span>
              <span className="text-[10.5px] text-ink font-bold block truncate">
                {activeHop.openingStatus.split('·')[0]}
              </span>
            </div>

            {/* Crowd Index */}
            <div className="space-y-0.5">
              <span className="text-[9.5px] uppercase tracking-wider text-dusk font-semibold block">
                Crowd Density Index
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] font-bold text-teal">
                  {activeHop.crowdIndexPercent}% ({activeHop.crowdStatus})
                </span>
                <div className="w-12 h-1.5 bg-paper-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal rounded-full"
                    style={{ width: `${activeHop.crowdIndexPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mobility Verification */}
            <div className="space-y-0.5 col-span-2 sm:col-span-1">
              <span className="text-[9.5px] uppercase tracking-wider text-dusk font-semibold block">
                Mobility Tag
              </span>
              <span className="text-[10.5px] text-teal-800 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal" />
                <span>100% Step-Free Access</span>
              </span>
            </div>
          </div>

          {/* Time-To-Next-Hop Buffer (If hop has successor) */}
          {activeHop.transitToNext ? (
            <div className="p-2.5 rounded-xl bg-paper-50 border border-paper-300 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-ink font-bold">
                <Clock className="w-3.5 h-3.5 text-marigold" />
                <span>Next Hop: {activeHop.transitToNext.transitMins} mins ({activeHop.transitToNext.distanceKm} km via {activeHop.transitToNext.mode})</span>
              </div>
              <span className="text-teal font-extrabold text-[10px] bg-white px-2 py-0.5 rounded-md border border-paper-200">
                {activeHop.transitToNext.slackReason.split(' ')[0]} slack added
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-teal-900 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                <span>Final Corridor Destination Completed</span>
              </div>
              <span className="text-teal font-bold text-[10px]">
                Total Duration: {circuit.availableHours}h
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 5. BOTTOM TELEMETRY BAR: Budget Burn & Dynamic Slack Metrics */}
      <div className="pt-2 border-t border-paper-300 flex items-center justify-between text-[10px] font-mono text-dusk">
        <div className="flex items-center gap-1">
          <Coins className="w-3 h-3 text-teal" />
          <span>
            Budget Burn: <strong className="text-ink">₹{totalCost}</strong> / ₹{circuit.budgetCeiling} ({budgetBurnPercent}%)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-marigold" />
          <span>
            Transit Buffer: <strong className="text-marigold-800">+{totalTransitSlack}m slack</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Hero3DRouteCanvas;
