import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Send,
  Sparkles,
  CheckCircle2,
  MapPin,
  DollarSign,
  Accessibility,
  Flame,
  Users,
  Compass,
} from 'lucide-react';
import { useProviderStore } from '../../store/useProviderStore';
import { NearbyTravelerCluster } from '../../types/provider';

interface DemandClusterRadarProps {
  onBeamOfferSuccess?: (clusterName: string, amount: number) => void;
}

const ENRICHED_DEMAND_CARDS = [
  {
    clusterId: 'cluster-1',
    label: '3 Families from Bandra West (9 Pax)',
    shortName: 'Bandra Families Group',
    partySize: 9,
    distanceKm: 1.8,
    budgetPerPerson: 950,
    matchedInterests: ['Craft Workshop', 'Textiles & Handloom', 'Family Friendly', 'Afternoon Slot'],
    accessibilityNeed: 'Step-Free / Stroller Friendly',
    notes: 'Looking for hands-on artisan masterclass for kids & grandparents.',
  },
  {
    clusterId: 'cluster-2',
    label: 'Sharma Family (4 Pax · Wheelchair Accessible Needed)',
    shortName: 'Sharma Family',
    partySize: 4,
    distanceKm: 2.4,
    budgetPerPerson: 1200,
    matchedInterests: ['Rogan Fabric Painting', 'Heritage Hearth', 'Wheelchair Ramp'],
    accessibilityNeed: 'Step-Free Loom Access',
    notes: 'Searching for wheelchair accessible ground-floor masterclass.',
  },
  {
    clusterId: 'cluster-3',
    label: '2 Solo Cultural Explorers in Khar Precinct',
    shortName: 'Solo Explorers',
    partySize: 2,
    distanceKm: 1.2,
    budgetPerPerson: 1500,
    matchedInterests: ['Generational Guilds', 'Indigo Vat Dyeing', 'Stylus Technique'],
    accessibilityNeed: undefined,
    notes: 'Designers seeking in-depth master artisan demonstration.',
  },
  {
    clusterId: 'cluster-4',
    label: 'French Photography Delegation (3 Pax)',
    shortName: 'French Photo Delegation',
    partySize: 3,
    distanceKm: 3.8,
    budgetPerPerson: 1800,
    matchedInterests: ['Living Heritage', 'Atelier Tour', 'Castor Pigment'],
    accessibilityNeed: 'English / French Translation',
    notes: 'Visiting Mumbai for documentary photography on Indian crafts.',
  },
];

export function DemandClusterRadar({ onBeamOfferSuccess }: DemandClusterRadarProps) {
  const slots = useProviderStore((s) => s.slots);
  const pingNearbyCluster = useProviderStore((s) => s.pingNearbyCluster);
  const simulateIncomingClaim = useProviderStore((s) => s.simulateIncomingClaim);

  const activeBeaconSlot = slots.find((s) => s.flashBeacon?.isActive);
  const sunsetSlot =
    slots.find((s) => s.slotId === 'slot-today-5pm') ||
    slots.find((s) => s.bookedSeats < s.totalCapacity) ||
    slots[0];

  const flashPrice = activeBeaconSlot?.flashBeacon?.discountedPrice || 840;
  const timeText = activeBeaconSlot
    ? activeBeaconSlot.timeLabel.split('·')[1]?.trim()
    : '5:00 PM';

  const [beamedMap, setBeamedMap] = useState<Record<string, boolean>>({});
  const [beamingId, setBeamingId] = useState<string | null>(null);

  const handleBeamOffer = (cluster: typeof ENRICHED_DEMAND_CARDS[0]) => {
    setBeamingId(cluster.clusterId);
    pingNearbyCluster(cluster.clusterId, sunsetSlot.slotId);

    setTimeout(() => {
      setBeamingId(null);
      setBeamedMap((prev) => ({ ...prev, [cluster.clusterId]: true }));

      // Automatically claim 1-2 seats in the store after 1.8 seconds
      setTimeout(() => {
        simulateIncomingClaim(sunsetSlot.slotId, `${cluster.shortName} (2 pax)`, 2);
        if (onBeamOfferSuccess) {
          onBeamOfferSuccess(cluster.shortName, flashPrice * 2);
        }
      }, 1800);
    }, 900);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm space-y-5 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#C85A32] animate-pulse" />
              <span>Live Demand Radar (Geo-Radius Match)</span>
            </span>
            <span className="text-[10px] font-mono text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full font-bold">
              148 Active Travelers Matching Tags
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-display font-bold text-[#12213B]">
            Real-Time Traveler Demand in Your Precinct
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-[#556275] bg-[#FAF8F5] border border-[#E5DFD5] px-3 py-1.5 rounded-xl">
            Live Geo-Fence Radius: 5 km
          </span>
        </div>
      </div>

      {/* Interactive Traveler Demand Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ENRICHED_DEMAND_CARDS.map((cluster) => {
          const isBeamed = beamedMap[cluster.clusterId];
          const isBeaming = beamingId === cluster.clusterId;

          return (
            <div
              key={cluster.clusterId}
              className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3.5 ${
                isBeamed
                  ? 'bg-[#FAF4ED] border-[#C85A32]/60 shadow-2xs'
                  : 'bg-[#FAF8F5] hover:bg-white border-[#E5DFD5]'
              }`}
            >
              <div className="space-y-2.5">
                {/* Traveler Group Title & Distance */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-heading font-bold text-[#12213B] leading-tight">
                      {cluster.label}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#556275] mt-1">
                      <span className="flex items-center gap-1 font-semibold text-[#12213B]">
                        <MapPin className="w-3 h-3 text-[#C85A32]" />
                        <span>{cluster.distanceKm} km away</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#556275]" />
                        <span>{cluster.partySize} Travelers</span>
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-extrabold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-lg shrink-0">
                    ₹{cluster.budgetPerPerson} / pax
                  </span>
                </div>

                {/* Cultural Notes */}
                <p className="text-xs text-[#556275] font-sans leading-relaxed">
                  "{cluster.notes}"
                </p>

                {/* Interest Tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {cluster.matchedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2 py-0.5 rounded-md bg-white border border-[#E5DFD5] text-[10px] font-mono text-[#12213B]"
                    >
                      {interest}
                    </span>
                  ))}
                  {cluster.accessibilityNeed && (
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF4ED] border border-[#E8DEC8] text-[10px] font-mono font-bold text-[#C85A32] flex items-center gap-1">
                      <Accessibility className="w-2.5 h-2.5" />
                      <span>{cluster.accessibilityNeed}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button: Beam Flash Offer */}
              <div className="pt-2.5 border-t border-[#E5DFD5] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#556275]">
                  Target Session: <strong>{timeText}</strong>
                </span>

                <button
                  type="button"
                  disabled={isBeaming || isBeamed}
                  onClick={() => handleBeamOffer(cluster)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-heading font-extrabold transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                    isBeamed
                      ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                      : 'bg-[#12213B] hover:bg-[#1A2E4C] text-[#FAF7F2]'
                  }`}
                >
                  {isBeamed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" />
                      <span>✓ Offer Beamed to Itinerary App</span>
                    </>
                  ) : isBeaming ? (
                    <>
                      <Radio className="w-3.5 h-3.5 animate-spin text-[#D99B43]" />
                      <span>Beaming Offer...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-3.5 h-3.5 text-[#D99B43]" />
                      <span>📡 Beam {timeText} Flash Offer (₹{flashPrice})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DemandClusterRadar;
