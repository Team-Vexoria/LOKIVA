import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Flame,
  XCircle,
  MessageSquare,
  Lock,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Tag,
  Crown,
  Zap,
} from 'lucide-react';
import {
  GroupTripSession,
  GroupRecommendationCard,
  GroupMember,
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

  // Active filter tab: 'consensus' | 'for_me' | 'member:[id]'
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
  const topWinner = cards[0];

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

  // Host locks winner and initiates group itinerary compilation
  const handleLockAndBuild = (city: string) => {
    lockDestination(session.groupId, city);

    // Announce in chat
    sendChatMessage(
      session.groupId,
      { id: 'lokiva-ai', name: 'Lokiva AI Mediator' },
      `🎯 ${session.hostName} officially locked ${city} as our group destination! Generating collaborative 60/40 itinerary...`
    );

    // Calculate group compilation constraints
    const metrics = computeCrewSynergyMetrics(session.members, session.expectedMemberCount);
    const travelers = Math.max(session.members.length, 1);
    const perPersonBudget = metrics.groupSweetSpotBudget;
    const totalBudget = perPersonBudget * travelers;
    const days = metrics.medianDays;
    const allInterests = Array.from(
      new Set(readyMembers.flatMap((m) => m.quizAnswers?.interests || []))
    );

    // Direct transition to /itinerary with group parameters
    navigate(
      `/itinerary?city=${encodeURIComponent(city)}&groupId=${session.groupId}&travelers=${travelers}&budget=${totalBudget}&perPersonBudget=${perPersonBudget}&days=${days}&interests=${encodeURIComponent(allInterests.join(','))}&groupMode=true`
    );
  };

  // Non-host member nudges the host to lock this choice
  const handleNudgeHost = (city: string) => {
    sendChatMessage(
      session.groupId,
      { id: currentUserId, name: currentUserName },
      `👋 ${currentUserName} voted to lock ${city} as the final group destination!`
    );
    showToast(`Nudge sent to ${session.hostName} in chat!`);
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-6 z-50 px-4 py-2.5 rounded-2xl bg-white border border-[#E5DFD5] text-[#12213B] shadow-xl text-xs font-heading font-extrabold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. #1 Crew Consensus Winner Spotlight Banner */}
      {topWinner && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-white border-2 border-[#D99B43] shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4ED] border border-[#E8DEC8] text-[#C85A32] text-xs font-heading font-extrabold uppercase tracking-wide">
                <Crown className="w-3.5 h-3.5 text-[#D99B43]" />
                <span>#1 Crew Consensus Winner</span>
              </span>
              <span className="text-xs font-mono font-bold text-ink">
                ✨ {topWinner.matchScore}% Collective Match
              </span>
            </div>

            <span className="text-[11px] font-sans text-dusk-500">
              Evaluated across all {readyMembers.length} submitted member profiles
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-heading font-black text-ink">
                {topWinner.city}, {topWinner.state}
              </h3>
              <p className="text-xs font-sans text-dusk-600 max-w-xl leading-relaxed">
                {topWinner.tagline}
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-xs font-mono font-bold text-ink">
                  ₹{topWinner.estimatedCostPerPerson.toLocaleString('en-IN')}{' '}
                  <span className="text-dusk-500 text-[10px] font-normal">/ person</span>
                </span>
                <span className="text-dusk-300 font-mono">·</span>
                <span className="text-xs font-heading font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {topWinner.financialFitLabel}
                </span>
              </div>
            </div>

            {/* Winner Lock & Build Actions */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={() => handleDropCard(topWinner)}
                type="button"
                className="px-3.5 py-2 rounded-xl bg-white border border-[#DDD7CC] hover:border-[#C85A32] text-xs font-heading font-bold text-ink transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>Drop to Chat</span>
              </button>

              {isHost ? (
                <button
                  onClick={() => handleLockAndBuild(topWinner.city)}
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-[#12213B] hover:bg-[#1D3258] text-white text-xs font-heading font-extrabold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 text-[#D99B43]" />
                  <span>Lock Winner & Generate Itinerary →</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNudgeHost(topWinner.city)}
                  type="button"
                  className="px-3.5 py-2 rounded-xl bg-[#FAF4ED] hover:bg-[#F5ECE0] border border-[#E8DEC8] text-xs font-heading font-extrabold text-[#C85A32] transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Zap className="w-3.5 h-3.5 text-[#D99B43]" />
                  <span>Nudge Host to Lock {topWinner.city}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. Filter Navigation Tabs & Member Filter Pills */}
      <div className="bg-white/90 rounded-2xl border border-[#E5DFD5] p-3 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Top Group Consensus Tab */}
            <button
              onClick={() => setActiveTab('consensus')}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'consensus'
                  ? 'bg-[#12213B] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-dusk-600 hover:text-ink hover:bg-white border border-[#E5DFD5]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D99B43]" />
              <span>Top Group Consensus ({cards.length})</span>
            </button>

            {/* Recommended For Me Tab */}
            <button
              onClick={() => setActiveTab('for_me')}
              type="button"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'for_me'
                  ? 'bg-[#C85A32] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-dusk-600 hover:text-ink hover:bg-white border border-[#E5DFD5]'
              }`}
            >
              <span>Recommended For Me</span>
            </button>
          </div>

          <span className="text-[11px] font-sans text-dusk-500">
            Showing <span className="font-bold text-ink">{filteredCards.length}</span> destinations
          </span>
        </div>

        {/* Individual Member Filter Pills */}
        {readyMembers.length > 0 && (
          <div className="pt-2 border-t border-[#FAF4ED] flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-dusk-400 mr-1">
              Member Filter:
            </span>
            {readyMembers.map((member) => {
              const tabKey = `member:${member.id}`;
              const isSelected = activeTab === tabKey;
              const isCurrent = member.id === currentUserId;

              return (
                <button
                  key={member.id}
                  onClick={() => setActiveTab(isSelected ? 'consensus' : tabKey)}
                  type="button"
                  className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold transition cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-[#FAF4ED] border-[#C85A32] text-[#C85A32] shadow-2xs'
                      : 'bg-white border-[#DDD7CC] text-dusk-600 hover:border-[#C85A32]/40'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32]" />
                  <span>{member.name}'s Picks</span>
                  {isCurrent && <span className="text-[9px] font-mono text-dusk-400">(You)</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Destination Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCards.map((card, index) => {
          const isUpvotedByMe = card.upvotedByMemberIds.includes(currentUserId);
          const isVetoedByMe = card.vetoedByMemberIds.includes(currentUserId);
          const isLocked = session.lockedDestinationCity === card.city;
          const matchPercentage = card.matchScore;

          return (
            <motion.div
              key={card.city}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.04 }}
              className={`rounded-3xl border bg-white shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between ${
                isLocked
                  ? 'border-2 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'border-[#E5DFD5]'
              }`}
            >
              {/* Card Media Header */}
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-[#FAF8F5]">
                  <img
                    src={card.heroImage}
                    alt={card.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-heading font-extrabold uppercase tracking-wide">
                      <MapPin className="w-3 h-3 text-[#D99B43]" />
                      <span>{card.city}, {card.state}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-ink text-xs font-mono font-extrabold shadow-sm">
                      <Sparkles className="w-3 h-3 text-[#C85A32]" />
                      <span>{matchPercentage}% Match</span>
                    </span>
                  </div>

                  {/* Locked Badge Overlay */}
                  {isLocked && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-heading font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Consensus Choice Locked</span>
                    </div>
                  )}
                </div>

                {/* Card Main Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Title & Tagline */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-heading font-black text-ink">
                      {card.city}
                    </h3>
                    <p className="text-xs font-sans text-dusk-600 leading-relaxed line-clamp-2">
                      {card.tagline}
                    </p>
                  </div>

                  {/* Budget Equalizer Financial Fit Badge */}
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DEC8] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-heading font-extrabold uppercase text-[10px] tracking-wider text-dusk-400">
                        Financial Equalizer
                      </span>
                      <span className="font-mono font-bold text-ink">
                        ₹{card.estimatedCostPerPerson.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] text-dusk-500">/ person</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {card.financialFitStatus === 'comfortable' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-heading font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{card.financialFitLabel}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-heading font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          <TrendingUp className="w-3 h-3 text-amber-600" />
                          <span>{card.financialFitLabel}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Member Attribution Box */}
                  <div className="space-y-2 pt-1 border-t border-[#FAF4ED]">
                    <div className="flex items-center justify-between text-[11px] font-heading font-bold text-dusk-500">
                      <span>
                        Recommended for {card.recommendedForMemberNames.length} of{' '}
                        {Math.max(1, readyMembers.length)} Travelers:
                      </span>
                    </div>

                    {card.recommendedForMemberNames.length > 0 ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {card.recommendedForMemberNames.map((name) => {
                          const isCurrentUser = name === currentUserName;
                          return (
                            <span
                              key={name}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-heading font-extrabold border transition ${
                                isCurrentUser
                                  ? 'bg-[#FAF4ED] border-[#C85A32] text-[#C85A32]'
                                  : 'bg-white border-[#E5DFD5] text-ink shadow-2xs'
                              }`}
                            >
                              <span>✦ {name}</span>
                              {isCurrentUser && (
                                <span className="text-[9px] font-mono text-dusk-400 font-bold">
                                  (You)
                                </span>
                              )}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] font-sans text-dusk-400 italic">
                        Awaiting member profile submissions
                      </span>
                    )}
                  </div>

                  {/* Highlights Pills */}
                  {card.sharedHighlights.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {card.sharedHighlights.slice(0, 3).map((hl, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E5DFD5] text-[10px] font-sans text-dusk-600"
                        >
                          {hl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Interactive Action Footer with Host Lock & Member Nudge */}
              <div className="p-3.5 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  {/* Upvote Button */}
                  <button
                    onClick={() => handleUpvote(card.city)}
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold transition cursor-pointer flex items-center gap-1.5 border shadow-2xs ${
                      isUpvotedByMe
                        ? 'bg-[#C85A32] text-white border-[#C85A32]'
                        : 'bg-white text-ink border-[#DDD7CC] hover:border-[#C85A32]'
                    }`}
                  >
                    <Flame className={`w-3.5 h-3.5 ${isUpvotedByMe ? 'text-white' : 'text-[#C85A32]'}`} />
                    <span>Upvote ({card.upvotedByMemberIds.length})</span>
                  </button>

                  {/* Pass / Veto Button */}
                  <button
                    onClick={() => handleVeto(card.city)}
                    type="button"
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-heading font-bold transition cursor-pointer flex items-center gap-1 border ${
                      isVetoedByMe
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-white text-dusk-500 border-[#DDD7CC] hover:text-rose-600 hover:border-rose-300'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{isVetoedByMe ? 'Vetoed' : 'Pass'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Drop to Chat Button */}
                  <button
                    onClick={() => handleDropCard(card)}
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#DDD7CC] hover:border-[#C85A32] text-xs font-heading font-extrabold text-ink transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    title="Send interactive recommendation card to squad chat"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span className="hidden sm:inline">Drop to Chat</span>
                  </button>

                  {/* Lock / Nudge Action */}
                  {isLocked ? (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-heading font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Locked</span>
                    </span>
                  ) : isHost ? (
                    <button
                      onClick={() => handleLockAndBuild(card.city)}
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-[#12213B] hover:bg-[#1D3258] text-white text-xs font-heading font-extrabold transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Lock destination and generate collaborative group itinerary"
                    >
                      <Lock className="w-3 h-3 text-[#D99B43]" />
                      <span>Lock & Build →</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleNudgeHost(card.city)}
                      type="button"
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] hover:border-[#C85A32] text-xs font-heading font-extrabold text-[#C85A32] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Nudge the group host to lock this choice"
                    >
                      <Zap className="w-3 h-3 text-[#D99B43]" />
                      <span className="hidden sm:inline">Nudge Host</span>
                    </button>
                  )}
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
