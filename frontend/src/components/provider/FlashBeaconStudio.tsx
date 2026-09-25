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
  ChevronRight,
  Sliders,
  Flame,
  ShieldCheck,
  Plus,
  Minus,
} from 'lucide-react';
import { useProviderStore } from '../../store/useProviderStore';
import { WorkshopSlot } from '../../types/provider';

interface FlashBeaconStudioProps {
  onOpenSlotManager?: () => void;
  onSeatClaimAnimation?: (amount: number) => void;
}

export function FlashBeaconStudio({ onOpenSlotManager, onSeatClaimAnimation }: FlashBeaconStudioProps) {
  const slots = useProviderStore((s) => s.slots);
  const profile = useProviderStore((s) => s.profile);
  const activateFlashBeacon = useProviderStore((s) => s.activateFlashBeacon);
  const cancelFlashBeacon = useProviderStore((s) => s.cancelFlashBeacon);
  const simulateIncomingClaim = useProviderStore((s) => s.simulateIncomingClaim);

  // Active flash beacon slot or find unfilled slots
  const activeBeaconSlot = slots.find((s) => s.flashBeacon?.isActive);
  const sunsetUnfilledSlot =
    slots.find((s) => s.slotId === 'slot-today-5pm') ||
    slots.find((s) => s.bookedSeats < s.totalCapacity) ||
    slots[0];

  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    activeBeaconSlot?.slotId || sunsetUnfilledSlot?.slotId || ''
  );

  // Customizer Mode Toggle
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Configurator Parameters
  const [discountPercent, setDiscountPercent] = useState<number>(30);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [spotsToRelease, setSpotsToRelease] = useState<number>(4);

  // Animation & Feedback
  const [isActivating, setIsActivating] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);
  const [floatingPill, setFloatingPill] = useState<{ id: number; text: string } | null>(null);

  // Live ticking countdown timer
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

  // Keep selected slot in sync if active beacon changes
  useEffect(() => {
    if (activeBeaconSlot) {
      setSelectedSlotId(activeBeaconSlot.slotId);
    }
  }, [activeBeaconSlot]);

  const targetSlot = slots.find((s) => s.slotId === selectedSlotId) || sunsetUnfilledSlot;
  const totalCapacity = targetSlot?.totalCapacity || 8;
  const bookedSeats = targetSlot?.bookedSeats || 4;
  const emptySeats = Math.max(0, totalCapacity - bookedSeats);
  const basePrice = targetSlot?.basePricePerPerson || 1200;

  const discountedPrice = Math.round(basePrice * (1 - discountPercent / 100));
  const recoveredRevenue = discountedPrice * Math.min(spotsToRelease, emptySeats);
  const estimatedTravelers = Math.min(32, Math.round(radiusKm * 3.6 + 6));

  // 1-Tap Quick Launch Handler
  const handleOneTapLaunch = () => {
    if (!targetSlot || emptySeats <= 0) return;
    setIsActivating(true);
    setTimeout(() => {
      activateFlashBeacon(targetSlot.slotId, 30, 45, 5);
      setIsActivating(false);
    }, 350);
  };

  // Custom Launch Handler
  const handleCustomLaunch = () => {
    if (!targetSlot || emptySeats <= 0) return;
    setIsActivating(true);
    setTimeout(() => {
      activateFlashBeacon(targetSlot.slotId, discountPercent, durationMinutes, radiusKm);
      setIsActivating(false);
    }, 350);
  };

  // Demo Pitch Button: Simulate Live Traveler Claim
  const handleSimulateClaim = () => {
    if (!activeBeaconSlot) return;
    const currentFlashPrice = activeBeaconSlot.flashBeacon?.discountedPrice || 840;
    const guestNames = [
      'Pooja & Rohan Varma',
      'Ananya & Vikram Sen',
      'David Miller (Solo Explorer)',
      'Elena Rostova (French Delegation)',
      'Tanvi Kulkarni (Heritage Walk)',
    ];
    const chosenName = guestNames[Math.floor(Math.random() * guestNames.length)];

    simulateIncomingClaim(activeBeaconSlot.slotId, `${chosenName} (1 pax)`, 1);

    // Trigger floating +₹840 visual animation
    setFloatingPill({
      id: Date.now(),
      text: `+₹${currentFlashPrice.toLocaleString('en-IN')}`,
    });
    setTimeout(() => setFloatingPill(null), 2500);

    if (onSeatClaimAnimation) {
      onSeatClaimAnimation(currentFlashPrice);
    }

    setClaimToast(`🎉 Live Claim Confirmed: ${chosenName} booked 1 seat at ₹${currentFlashPrice}!`);
    setTimeout(() => setClaimToast(null), 4500);
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm space-y-6 relative overflow-hidden font-sans">
      {/* Warm Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C85A32]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Revenue Pulse Pill Animation */}
      <AnimatePresence>
        {floatingPill && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -25, scale: 1.15 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed top-24 right-10 z-50 px-4 py-2 bg-[#065F46] text-white font-mono font-extrabold text-sm sm:text-base rounded-2xl shadow-xl flex items-center gap-2 pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-[#A7F3D0]" />
            <span>Direct Payout: {floatingPill.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {claimToast && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            className="p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl text-xs font-heading font-bold text-[#065F46] flex items-center justify-between shadow-md"
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

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32] bg-[#FAF4ED] border border-[#E8DEC8] px-3 py-0.5 rounded-full">
              Signature Yield Engine
            </span>
            <span className="text-[11px] font-mono text-[#556275] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5DFD5]">
              Real-Time Dynamic Yield
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#12213B] flex items-center gap-2">
            <span>Flash Beacon Live Yield Studio</span>
            {activeBeaconSlot && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF4ED] border border-[#C85A32] text-[#C85A32] text-xs font-mono font-bold animate-pulse shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
                Beacon Broadcasting Live
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {emptySeats > 0 && !activeBeaconSlot && (
            <span className="text-xs font-mono font-bold text-[#C85A32] bg-[#FAF4ED] px-3 py-1.5 rounded-xl border border-[#E8DEC8] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{emptySeats} Unfilled Seats at Risk (₹{emptySeats * basePrice})</span>
            </span>
          )}
        </div>
      </div>

      {/* 1. LIVE SLOT OCCUPANCY RAIL (TOP / LEFT) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-heading font-bold text-[#12213B]">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Today's Workshop Sessions & Tactile Seat Matrix</span>
          </span>
          <span className="text-[11px] font-mono text-[#556275]">
            Select a slot to manage capacity
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {slots.slice(0, 3).map((slot) => {
            const isSelected = slot.slotId === selectedSlotId;
            const slotEmpty = Math.max(0, slot.totalCapacity - slot.bookedSeats);
            const isFull = slotEmpty === 0;
            const isSlotActiveBeacon = slot.flashBeacon?.isActive;
            const flashClaimedInSlot = slot.flashBeacon?.claimedSpotsDuringFlash || 0;
            const standardBookedInSlot = slot.bookedSeats - flashClaimedInSlot;

            return (
              <button
                key={slot.slotId}
                type="button"
                onClick={() => setSelectedSlotId(slot.slotId)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 relative flex flex-col justify-between space-y-3 ${
                  isSlotActiveBeacon
                    ? 'bg-[#FAF4ED] border-[#C85A32] ring-2 ring-[#C85A32] shadow-sm'
                    : isSelected
                    ? 'bg-[#FAF8F5] border-[#12213B] shadow-2xs'
                    : 'bg-[#FAF8F5] hover:bg-white border-[#E5DFD5]'
                }`}
              >
                {/* Slot Timing & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-mono font-bold text-[#556275]">
                      {slot.timeLabel}
                    </div>
                    <div className="text-xs sm:text-sm font-heading font-bold text-[#12213B] line-clamp-1 mt-0.5">
                      {slot.listingTitle}
                    </div>
                  </div>

                  {isFull ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-mono text-[10px] font-bold shrink-0">
                      ✓ 8/8 Full
                    </span>
                  ) : isSlotActiveBeacon ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#C85A32] text-white font-mono text-[10px] font-bold shrink-0 animate-pulse">
                      ⚡ Beacon Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-[#FAF4ED] border border-[#E8DEC8] text-[#C85A32] font-mono text-[10px] font-bold shrink-0">
                      {slotEmpty} Empty Spots
                    </span>
                  )}
                </div>

                {/* TACTILE SEAT MATRIX: 8 Visual Seat Pills */}
                <div className="space-y-1.5 pt-1 border-t border-[#E5DFD5]">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#556275]">Live Seat Matrix:</span>
                    <span className="font-bold text-[#12213B]">
                      {slot.bookedSeats} / {slot.totalCapacity} Seats Booked
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {Array.from({ length: slot.totalCapacity }).map((_, index) => {
                      const isStandardBooked = index < standardBookedInSlot;
                      const isFlashBooked =
                        index >= standardBookedInSlot && index < slot.bookedSeats;
                      const isOpen = index >= slot.bookedSeats;

                      if (isStandardBooked) {
                        return (
                          <div
                            key={index}
                            title={`Seat ${index + 1}: Confirmed Traveler`}
                            className="h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] flex flex-col items-center justify-center text-[9px] font-mono font-bold transition-all shadow-2xs"
                          >
                            <span>#{index + 1}</span>
                            <span className="text-[8px] opacity-80">Booked</span>
                          </div>
                        );
                      }

                      if (isFlashBooked) {
                        return (
                          <div
                            key={index}
                            title={`Seat ${index + 1}: Flash Beacon Claimed`}
                            className="h-8 rounded-lg bg-[#FAF4ED] border border-[#C85A32] text-[#C85A32] flex flex-col items-center justify-center text-[9px] font-mono font-bold animate-pulse shadow-2xs"
                          >
                            <span>#{index + 1}</span>
                            <span className="text-[8px] font-extrabold">⚡ Flash</span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={index}
                          title={`Seat ${index + 1}: Empty (₹${slot.basePricePerPerson} at risk)`}
                          className="h-8 rounded-lg bg-white border border-dashed border-[#D99B43] text-[#D99B43] flex flex-col items-center justify-center text-[9px] font-mono font-semibold transition-all hover:bg-[#FAF4ED]"
                        >
                          <span>#{index + 1}</span>
                          <span className="text-[8px] font-bold text-[#C85A32]">Open</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#556275] pt-0.5">
                  <span>Base Rate: ₹{slot.basePricePerPerson}/seat</span>
                  {slotEmpty > 0 && !isSlotActiveBeacon && (
                    <span className="text-[#C85A32] font-bold">
                      Tap to trigger beacon →
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ACTIVE BEACON RADAR OR 1-TAP & CUSTOM CONFIGURATOR */}
      {activeBeaconSlot && activeBeaconSlot.flashBeacon ? (
        /* ACTIVE BEACON RADAR STATE */
        <div className="bg-[#FAF8F5] border-2 border-[#C85A32] rounded-3xl p-5 sm:p-7 space-y-6 relative overflow-hidden shadow-sm">
          {/* Radial Sonar Rings Animation */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-36 h-36 pointer-events-none hidden md:block">
            <div className="absolute inset-0 rounded-full border border-[#C85A32]/30 animate-ping" />
            <div
              className="absolute inset-4 rounded-full border border-[#C85A32]/40 animate-ping"
              style={{ animationDelay: '0.4s' }}
            />
            <div
              className="absolute inset-8 rounded-full border border-[#C85A32]/50 animate-ping"
              style={{ animationDelay: '0.8s' }}
            />
            <div className="absolute inset-12 rounded-full bg-[#FAF4ED] border border-[#C85A32] flex items-center justify-center shadow-md">
              <Radio className="w-5 h-5 text-[#C85A32] animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Live Ticking Countdown Clock */}
            <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-[#E8DEC8] flex items-center gap-4 shadow-2xs">
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
                <div className="text-3xl sm:text-4xl font-display font-extrabold text-[#12213B] tabular-nums tracking-tight">
                  {formatCountdown(timeLeftSeconds)}
                </div>
                <div className="text-[10px] text-[#065F46] font-mono font-semibold">
                  ● Real-Time Broadcast Active
                </div>
              </div>
            </div>

            {/* Live Telemetry */}
            <div className="md:col-span-8 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4ED] border border-[#C85A32] text-[#C85A32] text-xs font-mono font-bold">
                  {activeBeaconSlot.flashBeacon.discountPercent}% OFF Flash Rate
                </span>
                <span className="text-sm font-mono font-extrabold text-[#12213B]">
                  ₹{activeBeaconSlot.flashBeacon.discountedPrice} / seat
                </span>
                <span className="text-xs text-[#556275] line-through font-mono">
                  ₹{activeBeaconSlot.basePricePerPerson}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-heading font-bold text-[#12213B]">
                {activeBeaconSlot.listingTitle}
              </h3>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#556275]">
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>
                    Broadcasting to <strong>{activeBeaconSlot.flashBeacon.notifiedTravelersCount} Travelers</strong> within {activeBeaconSlot.flashBeacon.broadcastRadiusKm} km
                  </span>
                </span>
                <span>·</span>
                <span className="text-[#065F46] font-bold">
                  {activeBeaconSlot.flashBeacon.claimedSpotsDuringFlash} Claimed So Far
                </span>
              </div>
            </div>
          </div>

          {/* Seat Claim Progress & Hackathon Demo Claim Button */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DEC8] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-heading">
              <div className="font-bold text-[#12213B]">
                Seat Claim Telemetry:
              </div>

              <div className="font-mono text-xs text-[#556275]">
                <strong className="text-[#C85A32] font-bold">
                  {activeBeaconSlot.flashBeacon.claimedSpotsDuringFlash} Claimed
                </strong>{' '}
                · {Math.max(0, activeBeaconSlot.totalCapacity - activeBeaconSlot.bookedSeats)} Open Spots Remaining
              </div>
            </div>

            {/* Visual Seat Matrix Bar */}
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

            {/* Simulation demo trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#E5DFD5]">
              <div className="text-[11px] font-mono text-[#556275]">
                Simulate real-time traveler booking for live presentation
              </div>

              <button
                type="button"
                onClick={handleSimulateClaim}
                disabled={activeBeaconSlot.bookedSeats >= activeBeaconSlot.totalCapacity}
                className="px-4 py-2 bg-[#FAF4ED] hover:bg-[#F3EAD8] text-[#C85A32] border border-[#C85A32] rounded-xl text-xs font-heading font-extrabold transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Simulate Live Traveler Claim (+1 Seat · +₹{activeBeaconSlot.flashBeacon.discountedPrice})</span>
              </button>
            </div>
          </div>

          {/* Stand Down Action */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => cancelFlashBeacon(activeBeaconSlot.slotId)}
              className="px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#556275] hover:text-[#C85A32] border border-[#E5DFD5] rounded-xl text-xs font-heading font-bold transition shadow-2xs"
            >
              Stand Down Flash Beacon
            </button>
          </div>
        </div>
      ) : (
        /* ONE-TAP & CUSTOM CONFIGURATOR */
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 space-y-6 shadow-2xs">
          {/* Main Action Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#FAF4ED] to-[#F3EAD8] p-5 rounded-2xl border border-[#E8DEC8]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#C85A32] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                  Ready to Beam
                </span>
                <span className="text-xs font-mono font-bold text-[#12213B]">
                  {emptySeats} Empty Spots for {targetSlot?.timeLabel.split('·')[1]?.trim() || '5:00 PM'} Session
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-[#12213B]">
                {targetSlot?.listingTitle || 'Master Artisan Workshop'}
              </h3>
              <p className="text-xs text-[#556275] font-sans">
                Standard: <span className="line-through font-mono">₹{basePrice}</span> ➔ Flash Rate: <strong className="text-[#065F46] font-mono font-bold">₹{discountedPrice} / seat</strong> ({discountPercent}% OFF)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Preset 1-Tap Quick Launch Button */}
              <button
                type="button"
                onClick={handleOneTapLaunch}
                disabled={isActivating || emptySeats <= 0}
                className="px-5 py-3 bg-[#C85A32] hover:bg-[#B34322] text-white font-heading font-extrabold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>
                  {isActivating
                    ? 'Launching Beacon...'
                    : '⚡ 1-Tap Flash Beacon: 30% Off for Next 45 Mins →'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={`px-3.5 py-3 rounded-xl text-xs font-heading font-bold transition border flex items-center gap-1.5 ${
                  isCustomizing
                    ? 'bg-[#12213B] text-white border-[#12213B]'
                    : 'bg-white text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF4ED]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isCustomizing ? 'Hide Customizer' : 'Customize Beacon'}</span>
              </button>
            </div>
          </div>

          {/* INTERACTIVE CUSTOMIZER CONTROLS (TACTILE CONTROLS - NO BORING TEXT INPUTS) */}
          <AnimatePresence>
            {isCustomizing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-5 pt-2 border-t border-[#E5DFD5] overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* 1. Empty Spots to Release (Tactile Stepper) */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] space-y-2">
                    <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                      1. Spots to Release
                    </label>
                    <div className="flex items-center justify-between bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E5DFD5]">
                      <button
                        type="button"
                        onClick={() => setSpotsToRelease(Math.max(1, spotsToRelease - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-[#E5DFD5] text-[#12213B] flex items-center justify-center font-bold hover:bg-[#FAF4ED]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <div className="text-sm font-mono font-extrabold text-[#12213B]">
                        {spotsToRelease} {spotsToRelease === 1 ? 'Spot' : 'Spots'}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSpotsToRelease(Math.min(emptySeats, spotsToRelease + 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-[#E5DFD5] text-[#12213B] flex items-center justify-center font-bold hover:bg-[#FAF4ED]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-[#556275] text-center">
                      Max {emptySeats} spots currently open
                    </div>
                  </div>

                  {/* 2. Flash Discount Selector */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] space-y-2">
                    <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                      2. Flash Discount
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[15, 20, 30, 40].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountPercent(pct)}
                          className={`py-2 text-center rounded-lg text-xs font-mono font-bold transition border ${
                            discountPercent === pct
                              ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-2xs'
                              : 'bg-[#FAF8F5] text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF4ED]'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                    <div className="text-[10px] font-mono text-[#065F46] font-bold text-center">
                      ₹{basePrice} ➔ ₹{discountedPrice} / seat
                    </div>
                  </div>

                  {/* 3. Beacon Countdown Window */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] space-y-2">
                    <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                      3. Duration Window
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {[30, 45, 60, 90].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => setDurationMinutes(mins)}
                          className={`py-2 text-center rounded-lg text-xs font-mono font-bold transition border ${
                            durationMinutes === mins
                              ? 'bg-[#12213B] text-white border-[#12213B] shadow-2xs'
                              : 'bg-[#FAF8F5] text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF4ED]'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                    <div className="text-[10px] font-mono text-[#556275] text-center">
                      Urgency timer: {durationMinutes} mins
                    </div>
                  </div>

                  {/* 4. Geo-Fence Broadcast Radius */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E5DFD5] space-y-2">
                    <label className="text-xs font-heading font-bold text-[#12213B] uppercase tracking-wider block">
                      4. Geo-Radius
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[3, 5, 10].map((km) => (
                        <button
                          key={km}
                          type="button"
                          onClick={() => setRadiusKm(km)}
                          className={`py-2 text-center rounded-lg text-xs font-mono font-bold transition border ${
                            radiusKm === km
                              ? 'bg-[#D99B43] text-[#12213B] border-[#D99B43] font-extrabold shadow-2xs'
                              : 'bg-[#FAF8F5] text-[#12213B] border-[#E5DFD5] hover:bg-[#FAF4ED]'
                          }`}
                        >
                          {km} km
                        </button>
                      ))}
                    </div>
                    <div className="text-[10px] font-mono text-[#556275] text-center">
                      ~{estimatedTravelers} travelers nearby
                    </div>
                  </div>

                </div>

                {/* Projected Revenue Recovery Banner */}
                <div className="p-4 bg-white rounded-2xl border border-[#E8DEC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#065F46]" />
                    <span className="text-xs font-sans text-[#556275]">
                      Projected Yield Recovery: Filling {spotsToRelease} seats unlocks{' '}
                      <strong className="text-[#065F46] font-mono font-bold">
                        +₹{recoveredRevenue.toLocaleString('en-IN')} direct payout
                      </strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCustomLaunch}
                    disabled={isActivating || emptySeats <= 0}
                    className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#B34322] text-white font-heading font-bold rounded-xl text-xs transition shadow-2xs flex items-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Launch Custom Flash Beacon ⚡</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default FlashBeaconStudio;
