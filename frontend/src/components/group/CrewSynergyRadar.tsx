import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Copy,
  Check,
  UserPlus,
  Sparkles,
  ShieldCheck,
  Settings2,
  Clock,
  CheckCircle2,
  Wallet,
  Calendar,
  Compass,
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

  const metrics = computeCrewSynergyMetrics(session.members, session.expectedMemberCount);
  const remainingSlots = Math.max(0, session.expectedMemberCount - session.members.length);

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

  return (
    <div className="bg-white/95 rounded-3xl border border-[#E5DFD5] p-5 sm:p-6 shadow-sm space-y-6">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4ED] border border-[#E8DEC8] text-[#C85A32] text-xs font-heading font-extrabold uppercase tracking-widest">
              <Users className="w-3.5 h-3.5 text-[#D99B43]" />
              <span>Squad Hub #{session.groupId}</span>
            </span>
            <span className="text-xs font-sans text-dusk-500">
              Host: <span className="font-heading font-bold text-ink">{session.hostName}</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-ink tracking-tight">
            {session.groupName}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyLink}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD7CC] hover:border-[#C85A32] text-xs font-heading font-bold text-ink transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-dusk-500" />
                <span>Invite Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleSimulateFriend}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-[#FAF4ED] hover:bg-[#F5ECE0] border border-[#E8DEC8] text-xs font-heading font-bold text-[#C85A32] transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Inject a realistic friend with travel preferences to test multi-user group synthesis"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>+ Simulate Friend</span>
          </button>

          <button
            onClick={onEditQuiz}
            type="button"
            className="px-3 py-2 rounded-xl bg-white border border-[#DDD7CC] hover:bg-[#FAF8F5] text-xs font-heading font-bold text-dusk-600 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-dusk-500" />
            <span>Edit My Quiz</span>
          </button>
        </div>
      </div>

      {/* 2. Readiness Status Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-heading font-bold">
          <span className="text-ink flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Crew Readiness: {metrics.readyCount} of {metrics.totalExpected} Profiles Synced
          </span>
          <span className="text-[#C85A32] font-mono font-bold">
            {metrics.readinessPercentage}% Calibrated
          </span>
        </div>
        <div className="w-full h-2 bg-[#E8DEC8]/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${metrics.readinessPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#C85A32] to-[#D99B43] rounded-full"
          />
        </div>
      </div>

      {/* 3. Live Member Readiness Rail */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {session.members.map((member) => {
          const isReady = member.status === 'ready' && member.quizAnswers;
          const isCurrent = member.id === currentUserId;

          return (
            <div
              key={member.id}
              className={`p-3 rounded-2xl border transition ${
                isReady
                  ? 'bg-white border-[#E5DFD5] shadow-2xs'
                  : 'bg-[#FAF8F5] border-[#DDD7CC] border-dashed'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAF4ED] border border-[#E8DEC8] text-[#C85A32] flex items-center justify-center font-display font-black text-xs shrink-0">
                  {member.name ? member.name[0].toUpperCase() : 'T'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-xs font-heading font-extrabold text-ink">
                      {member.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-[#C85A32] font-bold shrink-0">
                        (You)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] pt-0.5">
                    {isReady ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-heading font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-heading font-medium">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Answering</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Ready member sub-stats */}
              {isReady && member.quizAnswers && (
                <div className="mt-2 pt-2 border-t border-[#FAF4ED] flex items-center justify-between text-[10px] font-mono text-dusk-500">
                  <span>{member.quizAnswers.tripDays}d trip</span>
                  <span className="text-[#C85A32] font-semibold">{member.quizAnswers.pace}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty Waiting Slots */}
        {Array.from({ length: remainingSlots }).map((_, idx) => (
          <button
            key={`slot-${idx}`}
            onClick={handleCopyLink}
            type="button"
            className="p-3 rounded-2xl border-2 border-dashed border-[#DDD7CC] bg-[#FAF8F5]/60 hover:bg-[#FAF4ED] hover:border-[#C85A32]/40 text-left transition flex flex-col justify-center gap-1 cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl border border-dashed border-[#DDD7CC] group-hover:border-[#C85A32] text-dusk-400 group-hover:text-[#C85A32] flex items-center justify-center text-xs font-heading font-bold">
                +
              </div>
              <span className="text-xs font-heading font-bold text-dusk-500 group-hover:text-ink">
                Waiting Slot
              </span>
            </div>
            <span className="text-[10px] font-sans text-dusk-400 pl-1">
              Tap to copy invite link
            </span>
          </button>
        ))}
      </div>

      {/* 4. Budget Sweet-Spot & Cultural Synergy Equalizer Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DFD5] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Fair Group Sweet-Spot Pill */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-heading font-extrabold uppercase tracking-wide">
                <Wallet className="w-3 h-3 text-emerald-600" />
                <span>Fair Group Sweet-Spot</span>
              </span>
              <span className="text-[10px] font-sans text-dusk-400">
                (Private Budgets Equalized)
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-black text-ink">
                ₹{metrics.groupSweetSpotBudget.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-sans text-dusk-500 font-medium">
                per person comfort ceiling
              </span>
            </div>
            <p className="text-[11px] font-sans text-dusk-500 leading-snug">
              Weighted toward lowest budget ceiling so no crew member feels financially stretched.
            </p>
          </div>

          {/* Group Synergy Overlap Badge */}
          <div className="sm:text-right space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF4ED] border border-[#E8DEC8] text-[#C85A32] text-[11px] font-heading font-extrabold uppercase tracking-wide">
              <Sparkles className="w-3 h-3 text-[#D99B43]" />
              <span>{metrics.groupSynergyScore}% Crew Synergy</span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 text-xs font-heading font-bold text-ink">
              <Calendar className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{metrics.medianDays} Days Median Duration</span>
            </div>
          </div>
        </div>

        {/* Top Shared Cultural Interests */}
        {metrics.topSharedInterests.length > 0 && (
          <div className="pt-2 border-t border-[#E8DEC8]/60 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-heading font-extrabold uppercase tracking-wider text-dusk-400">
              Shared Crew Passions:
            </span>
            {metrics.topSharedInterests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#E5DFD5] text-xs font-heading font-bold text-ink shadow-2xs"
              >
                <Compass className="w-3 h-3 text-[#C85A32]" />
                <span>{interest}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrewSynergyRadar;
