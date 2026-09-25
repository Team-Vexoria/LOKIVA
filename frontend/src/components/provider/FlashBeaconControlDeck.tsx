import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Zap,
  Clock,
  MapPin,
  Users,
  Sparkles,
  CheckCircle2,
  X,
  TrendingUp,
  AlertCircle,
  Bell,
  Send,
  Flame,
} from 'lucide-react';
import { useProviderStore } from '../../store/useProviderStore';
import { WorkshopSlot } from '../../types/provider';

interface FlashBeaconControlDeckProps {
  onOpenSlotManager?: () => void;
}

export function FlashBeaconControlDeck({ onOpenSlotManager }: FlashBeaconControlDeckProps) {
  const slots = useProviderStore((s) => s.slots);
  const profile = useProviderStore((s) => s.profile);
  const activateFlashBeacon = useProviderStore((s) => s.activateFlashBeacon);
  const cancelFlashBeacon = useProviderStore((s) => s.cancelFlashBeacon);
  const simulateIncomingClaim = useProviderStore((s) => s.simulateIncomingClaim);

  // Find slot with active beacon or slot with unfilled capacity
  const activeBeaconSlot = slots.find((s) => s.flashBeacon?.isActive);
  const unfilledSlots = slots.filter((s) => s.bookedSeats < s.totalCapacity);

  // Form state for activating beacon
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    unfilledSlots[0]?.slotId || slots[0]?.slotId || ''
  );
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [isActivating, setIsActivating] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Live countdown state for active beacon
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);

  useEffect(() => {
    if (!activeBeaconSlot?.flashBeacon?.expiresAt) {
      setTimeLeftSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((activeBeaconSlot.flashBeacon!.expiresAt - now) / 1000));
      setTimeLeftSeconds(diff);
      if (diff <= 0) {
        cancelFlashBeacon(activeBeaconSlot.slotId);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeBeaconSlot, cancelFlashBeacon]);

  const targetSlot = slots.find((s) => s.slotId === selectedSlotId) || unfilledSlots[0] || slots[0];
  const emptySeats = targetSlot ? Math.max(0, targetSlot.totalCapacity - targetSlot.bookedSeats) : 0;
  const discountedPrice = targetSlot
    ? Math.round(targetSlot.basePricePerPerson * (1 - discountPercent / 100))
    : 0;
  const estimatedReach = Math.min(36, Math.round(radiusKm * 4.4 + 6));
  const potentialYield = discountedPrice * emptySeats;

  const handleActivate = () => {
    if (!targetSlot || emptySeats <= 0) return;
    setIsActivating(true);
    setTimeout(() => {
      activateFlashBeacon(targetSlot.slotId, discountPercent, durationMinutes, radiusKm);
      setIsActivating(false);
    }, 400);
  };

  const handleManualClaimSimulation = () => {
    if (!activeBeaconSlot) return;
    const names = [
      'Pooja & Rohan Varma (2 pax)',
      'Anandita Sen (1 pax)',
      'David & Sarah Miller (2 pax)',
      'Tanvi Kulkarni (1 pax)',
    ];
    const pickedName = names[Math.floor(Math.random() * names.length)];
    simulateIncomingClaim(activeBeaconSlot.slotId, pickedName, 1);
    setClaimToast(`🎉 Instant Claim: ${pickedName} booked 1 spot at flash rate ₹${activeBeaconSlot.flashBeacon?.discountedPrice}!`);
    setTimeout(() => setClaimToast(null), 4000);
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm space-y-6 relative overflow-hidden">
      {/* Subtle Warm Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#C85A32]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Claim Toast Notification */}
      <AnimatePresence>
        {claimToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl text-xs font-heading font-bold text-[#065F46] flex items-center justify-between shadow-md"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#065F46]" />
              <span>{claimToast}</span>
            </div>
            <button onClick={() => setClaimToast(null)} className="text-[#065F46] hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER: Title & Beacon Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4ED] text-[#C85A32] border border-[#E8DEC8] font-heading text-[11px] font-extrabold uppercase tracking-wider">
              Signature Yield Engine
            </span>
            <span className="text-[11px] font-mono text-[#556275]">
              Real-Time Unfilled Seat Optimizer
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#12213B] flex items-center gap-2">
            <span>Flash Beacon Live Yield Deck</span>
            {activeBeaconSlot && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF4ED] border border-[#C85A32] text-[#C85A32] text-xs font-mono font-bold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                Broadcasting Live
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {unfilledSlots.length > 0 && !activeBeaconSlot && (
            <span className="text-xs font-mono font-bold text-[#C85A32] bg-[#FAF4ED] px-3 py-1.5 rounded-xl border border-[#E8DEC8]">
              ⚡ {unfilledSlots.length} Slots with open capacity
            </span>
          )}
        </div>
      </div>

      {/* STATE A: ACTIVE FLASH BEACON DECK */}
      {activeBeaconSlot && activeBeaconSlot.flashBeacon ? (
        <div className="bg-[#FAF8F5] border-2 border-[#C85A32] rounded-2xl p-5 sm:p-6 space-y-6 relative overflow-hidden shadow-sm">
          {/* Radial Pulse Radar Rings Background */}
          <div className="absolute right-6 top-6 w-32 h-32 pointer-events-none hidden md:block">
            <div className="absolute inset-0 rounded-full border border-[#C85A32]/30 animate-ping" />
            <div className="absolute inset-4 rounded-full border border-[#C85A32]/40 animate-ping" style={{ animationDelay: '0.4s' }} />
            <div className="absolute inset-8 rounded-full bg-[#C85A32]/10 flex items-center justify-center">
              <Radio className="w-6 h-6 text-[#C85A32] animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Countdown Clock & Status */}
            <div className="md:col-span-4 flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#E8DEC8]">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#E5DFD5]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#C85A32]"
                    strokeDasharray={`${Math.max(0, (timeLeftSeconds / (activeBeaconSlot.flashBeacon.durationMinutes * 60)) * 100)}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <Clock className="w-5 h-5 text-[#C85A32] absolute" />
              </div>

              <div>
                <div className="text-[10px] font-mono text-[#556275] uppercase tracking-wider font-bold">
                  Beacon Expires In
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#12213B] tracking-tight">
                  {formatCountdown(timeLeftSeconds)}
                </div>
                <div className="text-[10px] text-[#065F46] font-mono font-semibold">
                  Live Ticking Ticker Active
                </div>
              </div>
            </div>

            {/* Active Beacon Details */}
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FAF4ED] text-[#C85A32] border border-[#E8DEC8]">
                  {activeBeaconSlot.flashBeacon.discountPercent}% OFF Flash Rate
                </span>
                <span className="text-xs font-mono font-bold text-[#12213B]">
                  ₹{activeBeaconSlot.flashBeacon.discountedPrice} / pax
                </span>
                <span className="text-xs text-[#556275] line-through font-mono">
                  ₹{activeBeaconSlot.basePricePerPerson}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-heading font-bold text-[#12213B] leading-snug">
                {activeBeaconSlot.listingTitle}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#556275]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{activeBeaconSlot.timeLabel}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{activeBeaconSlot.flashBeacon.broadcastRadiusKm} km Geo-Fence</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#065F46]" />
                  <span>{activeBeaconSlot.flashBeacon.notifiedTravelersCount} Travelers Pinged</span>
                </span>
              </div>
            </div>
          </div>

          {/* Seat Claim Progress Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E8DEC8] space-y-3">
            <div className="flex items-center justify-between text-xs font-heading">
              <span className="font-bold text-[#12213B]">
                Claimed Capacity During Flash:
              </span>
              <span className="font-mono font-bold text-[#C85A32]">
                {activeBeaconSlot.flashBeacon.claimedSpotsDuringFlash} Claimed ·{' '}
                {Math.max(0, activeBeaconSlot.totalCapacity - activeBeaconSlot.bookedSeats)} Spots Still Open
              </span>
            </div>

            <div className="w-full h-3 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5DFD5] flex">
              <div
                className="bg-[#12213B] h-full transition-all duration-500"
                style={{
                  width: `${((activeBeaconSlot.bookedSeats - activeBeaconSlot.flashBeacon.claimedSpotsDuringFlash) / activeBeaconSlot.totalCapacity) * 100}%`,
                }}
                title="Standard Bookings"
              />
              <div
                className="bg-[#C85A32] h-full transition-all duration-500 animate-pulse"
                style={{
                  width: `${(activeBeaconSlot.flashBeacon.claimedSpotsDuringFlash / activeBeaconSlot.totalCapacity) * 100}%`,
                }}
                title="Claimed via Flash Beacon"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#556275]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#12213B]" /> Standard Seats
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" /> Flash Claimed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E5DFD5]" /> Open
                </span>
              </div>

              <button
                type="button"
                onClick={handleManualClaimSimulation}
                className="text-[#C85A32] hover:text-[#B34322] font-heading font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                title="Simulate incoming traveler claim"
              >
                <Sparkles className="w-3 h-3" />
                <span>Simulate Instant Traveler Claim</span>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#556275] font-sans">
              Broadcasting across active LOKIVA traveler search sessions in {profile.city}.
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => cancelFlashBeacon(activeBeaconSlot.slotId)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#556275] hover:text-[#C85A32] border border-[#E5DFD5] rounded-xl text-xs font-heading font-bold transition shadow-2xs"
              >
                Stand Down Beacon
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* STATE B: BEACON CONFIGURATION & ACTIVATION DECK */
        <div className="space-y-6">
          {/* Slot Selector Banner */}
          <div className="space-y-2">
            <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
              1. Select Workshop Slot With Unfilled Capacity
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {slots.map((slot) => {
                const isSelected = slot.slotId === selectedSlotId;
                const slotOpenSeats = Math.max(0, slot.totalCapacity - slot.bookedSeats);
                const isSoldOut = slotOpenSeats === 0;

                return (
                  <button
                    key={slot.slotId}
                    type="button"
                    disabled={isSoldOut}
                    onClick={() => setSelectedSlotId(slot.slotId)}
                    className={`p-3.5 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#FAF4ED] border-[#C85A32] shadow-2xs ring-1 ring-[#C85A32]'
                        : isSoldOut
                        ? 'bg-[#FAF8F5] border-[#E5DFD5] opacity-60 cursor-not-allowed'
                        : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-xs font-mono font-bold text-[#556275] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                        <span>{slot.timeLabel}</span>
                      </span>

                      {isSoldOut ? (
                        <span className="px-2 py-0.5 rounded bg-[#FAF7F2] text-[#556275] border border-[#E5DFD5] text-[10px] font-mono font-bold">
                          Sold Out
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-[#FAF4ED] text-[#C85A32] border border-[#E8DEC8] text-[10px] font-mono font-bold">
                          {slotOpenSeats} open {slotOpenSeats === 1 ? 'spot' : 'spots'}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-heading font-bold text-[#12213B] line-clamp-1 mb-2">
                      {slot.listingTitle}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-[#E5DFD5]">
                      <span className="text-[#556275]">Base Price: ₹{slot.basePricePerPerson}</span>
                      <span className="text-[#12213B] font-bold">
                        {slot.bookedSeats}/{slot.totalCapacity} Booked
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Yield Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Control 1: Flash Discount Presets */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-2.5">
              <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                2. Flash Discount
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {[20, 30, 40].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPercent(pct)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold transition border ${
                      discountPercent === pct
                        ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-2xs'
                        : 'bg-white text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF4ED]'
                    }`}
                  >
                    {pct}% OFF
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-mono text-[#556275] text-center pt-1">
                Flash Price: <strong className="text-[#C85A32] font-bold">₹{discountedPrice}</strong> / pax
              </div>
            </div>

            {/* Control 2: Beacon Duration Window */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-2.5">
              <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                3. Ticking Window
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {[30, 45, 60].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold transition border ${
                      durationMinutes === mins
                        ? 'bg-[#12213B] text-white border-[#12213B] shadow-2xs'
                        : 'bg-white text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF4ED]'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-mono text-[#556275] text-center pt-1">
                Optimal urgency: <strong>{durationMinutes} min countdown</strong>
              </div>
            </div>

            {/* Control 3: Geo-Radius Fence */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E5DFD5] space-y-2.5">
              <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                4. Broadcast Radius
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                {[3, 5, 10].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => setRadiusKm(km)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold transition border ${
                      radiusKm === km
                        ? 'bg-[#D99B43] text-[#12213B] border-[#D99B43] shadow-2xs font-extrabold'
                        : 'bg-white text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF4ED]'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-mono text-[#556275] text-center pt-1">
                Reach: <strong className="text-[#065F46] font-bold">~{estimatedReach} travelers</strong>
              </div>
            </div>
          </div>

          {/* Dynamic Impact Simulation Summary Card */}
          <div className="p-4 bg-gradient-to-r from-[#FAF4ED] to-[#F3EAD8] rounded-2xl border border-[#E8DEC8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#12213B]">
                <TrendingUp className="w-4 h-4 text-[#C85A32]" />
                <span>Yield Impact Calculation</span>
              </div>
              <p className="text-xs text-[#556275]">
                Filling <strong>{emptySeats} empty spots</strong> at <strong>₹{discountedPrice}/pax</strong> unlocks{' '}
                <strong className="text-[#065F46] font-bold font-mono">
                  +₹{potentialYield.toLocaleString('en-IN')} direct payout
                </strong>{' '}
                for today's session.
              </p>
            </div>

            <button
              type="button"
              onClick={handleActivate}
              disabled={isActivating || emptySeats <= 0}
              className="px-6 py-3 bg-[#C85A32] hover:bg-[#B34322] text-white font-heading font-extrabold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>{isActivating ? 'Broadcasting Beacon...' : 'Activate Flash Beacon ⚡'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashBeaconControlDeck;
