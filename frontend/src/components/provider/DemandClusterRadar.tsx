import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Send,
  Sparkles,
  CheckCircle2,
  MapPin,
  DollarSign,
  Tag,
  Accessibility,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { useProviderStore } from '../../store/useProviderStore';
import { NearbyTravelerCluster } from '../../types/provider';

export function DemandClusterRadar() {
  const clusters = useProviderStore((s) => s.clusters);
  const slots = useProviderStore((s) => s.slots);
  const pingNearbyCluster = useProviderStore((s) => s.pingNearbyCluster);

  const activeSlot = slots.find((s) => s.flashBeacon?.isActive) || slots.find((s) => s.bookedSeats < s.totalCapacity) || slots[0];
  const [pingingId, setPingingId] = useState<string | null>(null);

  const handlePing = (cluster: NearbyTravelerCluster) => {
    if (!activeSlot) return;
    setPingingId(cluster.clusterId);
    pingNearbyCluster(cluster.clusterId, activeSlot.slotId);

    setTimeout(() => {
      setPingingId(null);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD5] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32] flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#C85A32] animate-pulse" />
              <span>Live Demand Radar (Geo-Radius Match)</span>
            </span>
          </div>
          <h3 className="text-lg font-display font-bold text-[#12213B]">
            Active Traveler Clusters Searching In Your Precinct
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-full">
            ● Real-Time Geo-Matching
          </span>
        </div>
      </div>

      {/* Clusters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map((cluster) => {
          const isPinging = pingingId === cluster.clusterId;

          return (
            <div
              key={cluster.clusterId}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                cluster.pingedWithBeacon
                  ? 'bg-[#FAF4ED] border-[#C85A32]/60 shadow-2xs'
                  : 'bg-[#FAF8F5] hover:bg-[#FAF4ED]/40 border-[#E5DFD5]'
              }`}
            >
              <div className="space-y-2">
                {/* Cluster Title & Budget */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-heading font-bold text-[#12213B] leading-tight">
                      {cluster.label}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#556275] mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C85A32]" />
                        <span>{cluster.distanceKm} km away</span>
                      </span>
                      <span>·</span>
                      <span>{cluster.partySize} Guests</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-md shrink-0">
                    ₹{cluster.budgetPerPerson} / pax budget
                  </span>
                </div>

                {/* Matched Interests Chips */}
                <div className="flex flex-wrap gap-1 pt-1">
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

              {/* Action Button */}
              <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#556275]">
                  Target: <strong>{activeSlot?.timeLabel.split('·')[1]?.trim() || 'Today 5:00 PM'}</strong>
                </span>

                <button
                  type="button"
                  disabled={isPinging || cluster.pingedWithBeacon}
                  onClick={() => handlePing(cluster)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition flex items-center gap-1.5 shadow-2xs ${
                    cluster.pingedWithBeacon
                      ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]'
                      : 'bg-[#12213B] hover:bg-[#1A2E4C] text-[#FAF7F2]'
                  }`}
                >
                  {cluster.pingedWithBeacon ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" />
                      <span>Beacon Push Delivered</span>
                    </>
                  ) : isPinging ? (
                    <>
                      <Send className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#D99B43]" />
                      <span>Ping with Beacon ⚡</span>
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
