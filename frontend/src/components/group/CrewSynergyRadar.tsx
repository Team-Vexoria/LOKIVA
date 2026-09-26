import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  Users,
  Copy,
  Check,
  UserPlus,
  Sparkles,
  Settings2,
  Clock,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { GroupTripSession } from '../../types/groupTrip';
import { computeCrewSynergyMetrics } from '../../lib/groupRecommendationEngine';
import { useGroupTripStore } from '../../store/useGroupTripStore';

interface CrewSynergyRadarProps {
  session: GroupTripSession;
  currentUserId: string;
  onEditQuiz: () => void;
  inviteUrl: string;
}

export const CrewSynergyRadar: React.FC<CrewSynergyRadarProps> = ({
  session,
  currentUserId,
  onEditQuiz,
  inviteUrl,
}) => {
  const { addDemoMember } = useGroupTripStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animatedBudget, setAnimatedBudget] = useState(0);

  const metrics = computeCrewSynergyMetrics(session.members, session.expectedMemberCount);
  const remainingSlots = Math.max(0, session.expectedMemberCount - session.members.length);

  // GSAP Counter & Staggered Reveal Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Budget Counter
      const budgetObj = { val: 0 };
      gsap.to(budgetObj, {
        val: metrics.groupSweetSpotBudget,
        duration: 1.1,
        ease: 'power2.out',
        onUpdate: () => {
          setAnimatedBudget(Math.round(budgetObj.val));
        },
      });

      // 2. Staggered 3D entrance of Crew Slots
      gsap.fromTo(
        '.gsap-crew-slot',
        { opacity: 0, y: 20, rotateX: -10 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [metrics.groupSweetSpotBudget, session.members.length]);

  const handleCopyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSimulateFriend = () => {
    addDemoMember(session.groupId);
  };

  // Format top shared interests text for magazine prose
  const topPassionsText =
    metrics.topSharedInterests.length > 0
      ? metrics.topSharedInterests.slice(0, 2).join(' & ')
      : 'Artisan Crafts & Street Gastronomy';

  return (
    <div ref={containerRef} className="space-y-6 select-none">
      {/* ── 1. TOP EDITORIAL OVERLINE & UNIFIED GLASS ACTION BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Typographic Overline (No Clunky Badges) */}
        <div className="font-meta text-xs sm:text-sm font-bold tracking-[0.18em] text-[#B84A27] uppercase flex items-center gap-2 flex-wrap">
          <span>EXPEDITION ROOM · #GRP-{session.groupId}</span>
          <span className="text-[#D47A39]">·</span>
          <span>HOSTED BY {session.hostName.toUpperCase()}</span>
        </div>

        {/* Sleek Unified Action Bar */}
        <div className="bg-[#FFFDF9] border border-[#E6DAC6] rounded-full p-1.5 shadow-xs flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
          <button
            onClick={handleCopyLink}
            type="button"
            className="bg-[#B84A27] hover:bg-[#9E3C1D] text-[#FFFDF9] font-heading font-bold text-xs sm:text-sm px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#FFFDF9]" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Invite Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleSimulateFriend}
            type="button"
            className="text-[#3B2316] hover:bg-[#F3ECE1] font-heading font-bold text-xs sm:text-sm px-3.5 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
            title="Add simulated friend with preferences"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#B84A27]" />
            <span>+ Simulate Friend</span>
          </button>

          <button
            onClick={onEditQuiz}
            type="button"
            className="text-[#7A5C49] hover:text-[#3B2316] font-meta text-xs sm:text-sm px-3 py-2 underline underline-offset-4 transition-colors cursor-pointer"
          >
            Edit Preferences
          </button>
        </div>
      </div>

      {/* ── 2. HERO EXPEDITION TITLE ── */}
      <div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[#3B2316] tracking-tight leading-[1.05]">
          {session.groupName}
        </h1>
      </div>

      {/* ── 3. ARCHITECTURAL EDITORIAL SYNTHESIS BANNER ── */}
      <div className="border-y border-[#E2D5BE] py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left 7 Cols: Flowing Magazine Prose (No Pill Clutter) */}
        <div className="md:col-span-7 space-y-2">
          <span className="font-meta text-xs font-extrabold uppercase tracking-widest text-[#B84A27] block">
            Collective Harmony Synthesis
          </span>
          <p className="font-sans text-lg sm:text-xl leading-relaxed text-[#5C3D2E]">
            Calibrated for a{' '}
            <strong className="font-heading font-extrabold text-[#3B2316] underline decoration-[#D47A39] decoration-2 underline-offset-4">
              {metrics.medianDays}-Day
            </strong>{' '}
            journey centered on{' '}
            <strong className="font-heading font-extrabold text-[#3B2316] underline decoration-[#D47A39] decoration-2 underline-offset-4">
              {topPassionsText}
            </strong>
            , weighted gently so every traveler stays comfortable.
          </p>
        </div>

        {/* Right 5 Cols: GSAP Animated Budget Sweet-Spot Dial */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#FFFDF9] to-[#F5EBE0] border border-[#E2D2BC] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2">
          <span className="font-meta text-xs font-bold tracking-widest text-[#B84A27] uppercase block">
            Group Comfort Ceiling
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl sm:text-4xl font-black text-[#3B2316]">
              ₹{animatedBudget.toLocaleString('en-IN')}
            </span>
            <span className="font-meta text-sm text-[#7A5C49]">/ traveler</span>
          </div>
          <p className="text-xs font-meta font-semibold text-[#9E5414]">
            {metrics.groupSynergyScore}% Crew Synergy · Protected lowest budget ceiling
          </p>
        </div>
      </div>

      {/* ── 4. TACTILE CREW BOARDING PASS STRIP ── */}
      <div className="space-y-3">
        {/* Readiness Header with Warm Liquid Progress Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D47A39] animate-pulse" />
            <h3 className="font-heading text-base sm:text-lg font-bold text-[#3B2316]">
              Crew Readiness : {metrics.readyCount} of {metrics.totalExpected} Profiles Synced
            </h3>
          </div>
          <span className="font-mono text-xs font-bold text-[#B84A27]">
            {metrics.readinessPercentage}% Calibrated
          </span>
        </div>

        {/* Liquid Warm Terracotta-to-Saffron Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-[#EFE6D8] overflow-hidden p-0.5 border border-[#E2D5BE]/60">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metrics.readinessPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-[#B84A27] to-[#D47A39]"
          />
        </div>

        {/* 4 Crew Boarding Pass Tickets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 pt-2">
          {session.members.map((member) => {
            const isReady = member.status === 'ready' && member.quizAnswers;
            const isCurrent = member.id === currentUserId;

            return (
              <div
                key={member.id}
                className="gsap-crew-slot bg-[#FFFDF9] border-2 border-[#D47A39] rounded-2xl p-4 shadow-xs relative overflow-hidden transition-transform hover:-translate-y-0.5"
              >
                {/* Decorative Top Accent Tag */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-[#D47A39]/20 to-transparent rounded-bl-2xl" />

                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#FAF4ED] border border-[#E8DEC8] text-[#B84A27] flex items-center justify-center font-display font-black text-sm shrink-0">
                      {member.name ? member.name[0].toUpperCase() : 'T'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-heading font-extrabold text-base text-[#3B2316] truncate">
                        {member.name}
                        {isCurrent && (
                          <span className="text-xs font-mono text-[#B84A27] font-bold ml-1">
                            (You)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D47A39]" />
                        <span className="text-xs font-bold text-[#B84A27]">
                          {isReady ? 'Profile Synced' : 'Answering...'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Bottom Hairline Metadata */}
                  {isReady && member.quizAnswers && (
                    <div className="pt-2 border-t border-[#EFE6D8] flex items-center justify-between text-xs font-meta text-[#7A5C49]">
                      <span>{member.quizAnswers.tripDays} Days</span>
                      <span className="font-semibold text-[#3B2316]">{member.quizAnswers.pace} Pace</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Waiting Slot Tickets */}
          {Array.from({ length: remainingSlots }).map((_, idx) => (
            <button
              key={`slot-${idx}`}
              onClick={handleCopyLink}
              type="button"
              className="gsap-crew-slot bg-[#F6EFE4]/70 hover:bg-[#FFFDF9] border border-dashed border-[#C9B69E] hover:border-[#B84A27] rounded-2xl p-4 transition-all text-left cursor-pointer group space-y-2"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl border border-dashed border-[#C9B69E] group-hover:border-[#B84A27] group-hover:bg-[#FAF4ED] text-[#7A5C49] group-hover:text-[#B84A27] flex items-center justify-center font-heading font-bold text-sm transition-colors">
                  +
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-heading font-bold text-sm text-[#5C3D2E] group-hover:text-[#3B2316]">
                    Seat {String(session.members.length + idx + 1).padStart(2, '0')} · Awaiting
                  </div>
                  <div className="text-xs text-[#B84A27] font-semibold flex items-center gap-1">
                    <span>Copy invite link</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrewSynergyRadar;
