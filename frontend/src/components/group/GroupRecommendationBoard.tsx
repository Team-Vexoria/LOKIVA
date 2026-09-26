import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Flame,
  XCircle,
  MessageSquare,
  Lock,
  Compass,
  ArrowRight,
  MapPin,
  Crown,
  Zap,
  Check,
} from 'lucide-react';
import {
  GroupTripSession,
  GroupRecommendationCard,
} from '../../types/groupTrip';
import {
  synthesizeGroupRecommendations,
  computeCrewSynergyMetrics,
} from '../../lib/groupRecommendationEngine';
import { useGroupTripStore } from '../../store/useGroupTripStore';

interface GroupRecommendationBoardProps {
  session: GroupTripSession;
  currentUserId: string;
  currentUserName: string;
  onDropToChat?: (card: GroupRecommendationCard) => void;
}

export const GroupRecommendationBoard: React.FC<GroupRecommendationBoardProps> = ({
  session,
  currentUserId,
  currentUserName,
  onDropToChat,
}) => {
  const navigate = useNavigate();
  const {
    upvoteCard,
    vetoCard,
    lockDestination,
    dropCardToChat,
    sendChatMessage,
  } = useGroupTripStore();

  const [activeTab, setActiveTab] = useState<string>('consensus');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Synthesize candidate hubs across all ready members
  const cards: GroupRecommendationCard[] = useMemo(() => {
    return synthesizeGroupRecommendations(
      session.members,
      session.expectedMemberCount,
      session.cardVotes
    );
  }, [session.members, session.expectedMemberCount, session.cardVotes]);

  const readyMembers = session.members.filter((m) => m.status === 'ready');
  const isHost = session.hostId === currentUserId;

  // Filtered cards based on active tab
  const filteredCards = useMemo(() => {
    if (activeTab === 'consensus') {
      return cards;
    }
    if (activeTab === 'for_me') {
      return cards.filter(
        (c) =>
          c.recommendedForMemberIds.includes(currentUserId) ||
          c.recommendedForMemberNames.includes(currentUserName)
      );
    }
    if (activeTab.startsWith('member:')) {
      const targetMemberId = activeTab.replace('member:', '');
      const targetMember = session.members.find((m) => m.id === targetMemberId);
      const targetName = targetMember?.name || '';
      return cards.filter(
        (c) =>
          c.recommendedForMemberIds.includes(targetMemberId) ||
          c.recommendedForMemberNames.includes(targetName)
      );
    }
    return cards;
  }, [cards, activeTab, currentUserId, currentUserName, session.members]);

  const handleUpvote = (city: string) => {
    upvoteCard(session.groupId, city, currentUserId);
  };

  const handleVeto = (city: string) => {
    vetoCard(session.groupId, city, currentUserId);
  };

  const handleDropCard = (card: GroupRecommendationCard) => {
    if (onDropToChat) {
      onDropToChat(card);
    } else {
      dropCardToChat(
        session.groupId,
        { id: currentUserId, name: currentUserName },
        card
      );
    }
    showToast(`Dropped ${card.city} into squad chat!`);
  };

  const handleLockAndBuild = (city: string) => {
    lockDestination(session.groupId, city);

    sendChatMessage(
      session.groupId,
      { id: 'lokiva-ai', name: 'Lokiva AI Mediator' },
      `🎯 ${session.hostName} officially locked ${city} as our group destination! Generating collaborative 60/40 itinerary...`
    );

    const metrics = computeCrewSynergyMetrics(session.members, session.expectedMemberCount);
    const travelers = Math.max(session.members.length, 1);
    const perPersonBudget = metrics.groupSweetSpotBudget;
    const totalBudget = perPersonBudget * travelers;
    const days = metrics.medianDays;
    const allInterests = Array.from(
      new Set(readyMembers.flatMap((m) => m.quizAnswers?.interests || []))
    );

    navigate(
      `/itinerary?city=${encodeURIComponent(city)}&groupId=${session.groupId}&travelers=${travelers}&budget=${totalBudget}&perPersonBudget=${perPersonBudget}&days=${days}&interests=${encodeURIComponent(allInterests.join(','))}&groupMode=true`
    );
  };

  const handleNudgeHost = (city: string) => {
    sendChatMessage(
      session.groupId,
      { id: currentUserId, name: currentUserName },
      `👋 ${currentUserName} voted to lock ${city} as the final group destination!`
    );
    showToast(`Nudge sent to ${session.hostName} in chat!`);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-6 z-50 px-5 py-3 rounded-2xl bg-[#FFFDF9] border-2 border-[#B84A27] text-[#3B2316] shadow-xl text-sm font-heading font-extrabold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#B84A27]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. EDITORIAL FILTER BAR (NO PILL SOUP) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E2D5BE]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('consensus')}
            type="button"
            className={`px-4 py-2 rounded-full text-sm font-heading font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'consensus'
                ? 'bg-[#3B2316] text-[#FFFDF9] shadow-xs'
                : 'bg-[#FFFDF9] text-[#7A5C49] hover:text-[#3B2316] border border-[#E2D5BE]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D47A39]" />
            <span>Top Consensus ({cards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('for_me')}
            type="button"
            className={`px-4 py-2 rounded-full text-sm font-heading font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'for_me'
                ? 'bg-[#B84A27] text-[#FFFDF9] shadow-xs'
                : 'bg-[#FFFDF9] text-[#7A5C49] hover:text-[#3B2316] border border-[#E2D5BE]'
            }`}
          >
            <span>My Personal Matches</span>
          </button>
        </div>

        <span className="text-sm font-meta text-[#7A5C49]">
          Showing <strong className="text-[#3B2316] font-bold">{filteredCards.length}</strong> vetted cultural circuits
        </span>
      </div>

      {/* ── 2. ASYMMETRIC MAGAZINE SPLIT CARDS (REPLACING OLD BOXES) ── */}
      <div className="space-y-6">
        {filteredCards.map((card, index) => {
          const isUpvotedByMe = card.upvotedByMemberIds.includes(currentUserId);
          const isVetoedByMe = card.vetoedByMemberIds.includes(currentUserId);
          const isLocked = session.lockedDestinationCity === card.city;
          const isTopConsensus = index === 0 && activeTab === 'consensus';

          return (
            <motion.div
              key={card.city}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`rounded-[32px] bg-[#FFFDF9] border shadow-xs hover:shadow-md transition-all overflow-hidden ${
                isLocked
                  ? 'border-2 border-[#B84A27] ring-4 ring-[#B84A27]/10'
                  : isTopConsensus
                  ? 'border-2 border-[#D47A39]'
                  : 'border-[#E2D5BE]'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 min-h-[300px]">
                {/* ── LEFT 5 COLUMNS: FULL-HEIGHT VISUAL BLEED ── */}
                <div className="md:col-span-5 relative h-64 md:h-auto overflow-hidden bg-[#FAF6F0]">
                  <img
                    src={card.heroImage}
                    alt={card.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3B2316]/80 via-[#3B2316]/20 to-transparent" />

                  {/* Top Espresso Glass Badge */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3B2316]/85 backdrop-blur-md text-[#FFFDF9] text-xs font-meta font-extrabold uppercase tracking-widest">
                      {isTopConsensus ? (
                        <>
                          <Crown className="w-3.5 h-3.5 text-[#D47A39]" />
                          <span>#01 CONSENSUS MATCH</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-3.5 h-3.5 text-[#D47A39]" />
                          <span>CULTURAL HUB</span>
                        </>
                      )}
                    </span>

                    <span className="px-3 py-1 rounded-full bg-[#FFFDF9]/95 backdrop-blur-md text-[#3B2316] text-xs font-mono font-black shadow-xs">
                      {card.matchScore}% Match
                    </span>
                  </div>

                  {/* Bottom Financial Fit Ribbon Over Image */}
                  <div className="absolute bottom-4 inset-x-4">
                    <div className="px-3.5 py-2 rounded-2xl bg-[#3B2316]/85 backdrop-blur-md border border-[#E2D5BE]/30 text-[#FFFDF9] text-xs font-meta flex items-center justify-between">
                      <span className="font-semibold text-[#D47A39]">
                        {card.financialFitLabel}
                      </span>
                      <span className="font-mono font-bold text-[#FFFDF9]">
                        ~₹{card.estimatedCostPerPerson.toLocaleString('en-IN')}/pax
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT 7 COLUMNS: GENEROUS EDITORIAL TYPOGRAPHY & ATTRIBUTION ── */}
                <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* City & State Title */}
                    <div>
                      <span className="font-meta text-xs font-bold text-[#B84A27] tracking-wider uppercase block">
                        {card.state}
                      </span>
                      <h2 className="font-display text-2xl sm:text-3xl font-black text-[#3B2316] tracking-tight mt-0.5">
                        {card.city}
                      </h2>
                    </div>

                    {/* Narrative Description */}
                    <p className="font-meta text-base text-[#5C3D2E] leading-relaxed">
                      {card.tagline}
                    </p>

                    {/* Member Attribution Line */}
                    <div className="bg-[#FAF3E8] p-3.5 rounded-2xl border border-[#EADBC8] space-y-1.5 mt-2">
                      <div className="text-xs font-meta font-extrabold uppercase tracking-wider text-[#B84A27]">
                        Crew Alignment
                      </div>
                      <div className="text-sm font-heading font-bold text-[#3B2316]">
                        Matched for {card.recommendedForMemberNames.length} of{' '}
                        {Math.max(1, readyMembers.length)} Ready Travelers :{' '}
                        <span className="text-[#B84A27]">
                          {card.recommendedForMemberNames.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-4 border-t border-[#E2D5BE] flex items-center justify-between gap-2.5 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleUpvote(card.city)}
                        type="button"
                        className={`px-4 py-2.5 rounded-xl text-sm font-heading font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                          isUpvotedByMe
                            ? 'bg-[#B84A27] text-[#FFFDF9] border-[#B84A27]'
                            : 'bg-[#FFFDF9] text-[#3B2316] border-[#E2D5BE] hover:border-[#B84A27]'
                        }`}
                      >
                        <Flame className={`w-4 h-4 ${isUpvotedByMe ? 'text-[#FFFDF9]' : 'text-[#B84A27]'}`} />
                        <span>Upvote</span>
                        <span className="font-mono text-xs">({card.upvotedByMemberIds.length})</span>
                      </button>

                      {/* Drop to Chat */}
                      <button
                        onClick={() => handleDropCard(card)}
                        type="button"
                        className="px-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E2D5BE] hover:border-[#B84A27] text-sm font-heading font-bold text-[#3B2316] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-4 h-4 text-[#B84A27]" />
                        <span>Drop to Chat</span>
                      </button>
                    </div>

                    {/* Primary Lock CTA */}
                    {isHost ? (
                      <button
                        onClick={() => handleLockAndBuild(card.city)}
                        type="button"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B84A27] to-[#D47A39] hover:from-[#9E3C1D] hover:to-[#B84A27] text-[#FFFDF9] font-heading font-extrabold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Lock Winner & Build Itinerary →</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNudgeHost(card.city)}
                        type="button"
                        className="px-4 py-2.5 rounded-xl bg-[#FAF4ED] hover:bg-[#F5ECE0] border border-[#E8DEC8] text-sm font-heading font-extrabold text-[#B84A27] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Zap className="w-4 h-4 text-[#D47A39]" />
                        <span>Nudge Host to Lock</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupRecommendationBoard;
