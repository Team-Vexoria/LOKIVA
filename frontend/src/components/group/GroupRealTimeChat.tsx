import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Sparkles,
  Users,
  Flame,
  XCircle,
  HelpCircle,
  Clock,
  Compass,
  ArrowRight,
  Check,
  Copy,
  UserPlus,
  Vote,
} from 'lucide-react';
import { GroupTripSession, GroupChatMessage } from '../../types/groupTrip';
import { useGroupTripStore } from '../../store/useGroupTripStore';

interface GroupRealTimeChatProps {
  session: GroupTripSession;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
  inviteUrl: string;
}

interface PollOption {
  id: string;
  label: string;
  votes: string[]; // member names who voted
  basePercent: number;
}

export const GroupRealTimeChat: React.FC<GroupRealTimeChatProps> = ({
  session,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  inviteUrl,
}) => {
  const { sendChatMessage, toggleCardReaction, triggerAiMediator, addDemoMember } = useGroupTripStore();
  const [chatInput, setChatInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── LIVE CREW PULSE POLL STATE ───
  const [polls, setPolls] = useState<PollOption[]>([
    {
      id: 'poll-1',
      label: '🌅 Start days after 9:30 AM (No dawn rush)',
      votes: [session.hostName],
      basePercent: 75,
    },
    {
      id: 'poll-2',
      label: '🍲 Prioritize authentic local street hearths over luxury dining',
      votes: [session.hostName],
      basePercent: 90,
    },
    {
      id: 'poll-3',
      label: '🚗 Dedicated private AC cab between stops',
      votes: [],
      basePercent: 60,
    },
  ]);

  const handleTogglePoll = (pollId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId) return p;
        const hasVoted = p.votes.includes(currentUserName);
        const newVotes = hasVoted
          ? p.votes.filter((name) => name !== currentUserName)
          : [...p.votes, currentUserName];
        return { ...p, votes: newVotes };
      })
    );
  };

  const handleCopyLink = () => {
    if (inviteUrl) {
      navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSimulateTwoFriends = () => {
    // Add 1st friend
    addDemoMember(session.groupId);
    setTimeout(() => {
      // Add 2nd friend
      addDemoMember(session.groupId);
    }, 400);
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendChatMessage(
      session.groupId,
      {
        id: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
      },
      chatInput.trim()
    );
    setChatInput('');
  };

  const handleQuickPrompt = (promptText: string) => {
    sendChatMessage(
      session.groupId,
      {
        id: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
      },
      promptText
    );
  };

  const handleMediatorClick = () => {
    triggerAiMediator(session.groupId, 'resolve our tie and suggest harmonious compromise');
  };

  const handleReaction = (
    messageId: string,
    reactionType: 'mustGo' | 'maybe' | 'veto'
  ) => {
    toggleCardReaction(session.groupId, messageId, currentUserName, reactionType);
  };

  const remainingSlots = Math.max(0, session.expectedMemberCount - session.members.length);

  return (
    <div className="h-[calc(100vh-5.5rem)] sticky top-20 rounded-[32px] bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EC] to-[#F3EAE0] border border-[#E2D5BE] shadow-xl flex flex-col justify-between overflow-hidden select-none">
      {/* ── 1. WARM TRAVERTINE LOUNGE HEADER ── */}
      <div className="px-6 py-4 bg-[#FFFDF9]/90 backdrop-blur-md border-b border-[#E6DAC6] flex items-center justify-between shrink-0">
        <div className="space-y-0.5 min-w-0">
          <h2 className="font-heading text-lg font-extrabold text-[#3B2316] truncate">
            Crew Comms &amp; AI Mediator
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-meta font-semibold text-[#8C6751]">
            <span className="w-2 h-2 rounded-full bg-[#D47A39] animate-pulse" />
            <span>Live Room Sync · {session.members.length} Members Active</span>
          </div>
        </div>

        {/* Ask @Lokiva Mediator Action */}
        <button
          onClick={handleMediatorClick}
          type="button"
          className="bg-gradient-to-r from-[#B84A27] to-[#D47A39] hover:from-[#9E3C1D] hover:to-[#B84A27] text-[#FFFDF9] font-heading font-bold text-xs px-4 py-2 rounded-full shadow-sm hover:scale-105 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          title="Ask Lokiva AI Mediator to resolve ties or differences"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>✦ Ask @Lokiva</span>
        </button>
      </div>

      {/* ── 2. SCROLLABLE MESSAGE STREAM & INTERACTIVE LIVE CREW PULSE ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Messages List */}
        {session.messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;

          // Case A: LOKIVA AI GROUP MEDIATOR DISPATCH NOTE
          if (msg.isAiMediator) {
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                className="bg-[#FFFDF9] border-l-4 border-l-[#B84A27] border border-[#E6DAC6] rounded-2xl p-4 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-meta font-extrabold uppercase tracking-wider text-[#B84A27] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D47A39]" />
                    <span>LOKIVA AI GROUP MEDIATOR</span>
                  </span>
                  <span className="font-mono text-xs text-[#8C6751]">{msg.timestamp}</span>
                </div>

                <p className="font-sans text-sm sm:text-[15px] leading-relaxed text-[#3B2316] whitespace-pre-line">
                  {msg.text}
                </p>
              </motion.div>
            );
          }

          // Case B: STANDARD USER CHAT BUBBLE
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Sender Name & Timestamp */}
              <div className="flex items-center gap-1.5 text-xs font-meta font-bold text-[#8C6751] mb-1 px-1">
                <span>{msg.senderName}</span>
                {isMe && <span className="text-[#B84A27] font-bold">(You)</span>}
                <span className="text-[#C9B69E]">·</span>
                <span className="font-mono text-[11px]">{msg.timestamp}</span>
              </div>

              {/* Bubble Body */}
              <div
                className={`max-w-[90%] p-4 rounded-2xl text-sm sm:text-[15px] leading-relaxed space-y-2.5 shadow-2xs ${
                  isMe
                    ? 'bg-[#B84A27] text-[#FFFDF9] rounded-tr-xs'
                    : 'bg-[#FFFDF9] border border-[#E2D5BE] text-[#3B2316] rounded-tl-xs'
                }`}
              >
                <p className="font-sans">{msg.text}</p>

                {/* Embedded Destination Card if dropped */}
                {msg.droppedCard && (
                  <div
                    className={`rounded-2xl p-3.5 space-y-2.5 border transition ${
                      isMe
                        ? 'bg-[#FFFDF9] text-[#3B2316] border-[#E2D5BE] shadow-xs'
                        : 'bg-[#FAF6F0] text-[#3B2316] border-[#E2D5BE] shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-black text-sm text-[#3B2316] truncate">
                        📍 {msg.droppedCard.city}, {msg.droppedCard.state}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FAF4ED] text-[#B84A27] text-xs font-mono font-black border border-[#E8DEC8]">
                        ✨ {msg.droppedCard.matchScore}% Match
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-meta text-[#7A5C49]">
                      <span>Target Split:</span>
                      <span className="font-bold text-[#3B2316]">
                        ₹{msg.droppedCard.estimatedCostPerPerson.toLocaleString('en-IN')} / person
                      </span>
                    </div>

                    {/* Reaction Pills */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#E8DEC8] flex-wrap">
                      <button
                        onClick={() => handleReaction(msg.id, 'mustGo')}
                        type="button"
                        className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition cursor-pointer flex items-center gap-1 border ${
                          msg.reactions?.mustGo?.includes(currentUserName)
                            ? 'bg-[#B84A27] text-[#FFFDF9] border-[#B84A27]'
                            : 'bg-[#FFFDF9] text-[#3B2316] border-[#E2D5BE] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 text-[#D47A39]" />
                        <span>Must Go</span>
                        <span className="font-mono text-xs">({msg.reactions?.mustGo?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => handleReaction(msg.id, 'maybe')}
                        type="button"
                        className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition cursor-pointer flex items-center gap-1 border ${
                          msg.reactions?.maybe?.includes(currentUserName)
                            ? 'bg-[#F5EDE0] text-[#8C4A1D] border-[#D47A39]'
                            : 'bg-[#FFFDF9] text-[#7A5C49] border-[#E2D5BE] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-[#D47A39]" />
                        <span>Maybe</span>
                        <span className="font-mono text-xs">({msg.reactions?.maybe?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => handleReaction(msg.id, 'veto')}
                        type="button"
                        className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition cursor-pointer flex items-center gap-1 border ${
                          msg.reactions?.veto?.includes(currentUserName)
                            ? 'bg-[#F5E2DE] text-[#8C2A1E] border-[#B84A27]'
                            : 'bg-[#FFFDF9] text-[#7A5C49] border-[#E2D5BE] hover:bg-[#FAF6F0]'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Pass</span>
                        <span className="font-mono text-xs">({msg.reactions?.veto?.length || 0})</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* ── 3. INTERACTIVE LIVE CREW PULSE & ICEBREAKER DECK (FILLS EMPTY LOWER CHAT VOID) ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-[#FFFDF9]/95 border border-[#DFCBB2] rounded-3xl p-5 shadow-xs space-y-4"
        >
          {/* Header */}
          <div className="space-y-1">
            <span className="font-meta text-xs font-extrabold tracking-wider text-[#B84A27] uppercase flex items-center gap-1.5">
              <Vote className="w-4 h-4 text-[#D47A39]" />
              <span>LIVE CREW PULSE · VOTE WHILE OTHERS JOIN</span>
            </span>
            <h3 className="font-heading text-base font-bold text-[#3B2316]">
              Set the ground rules for {session.groupName}:
            </h3>
          </div>

          {/* 3 Interactive 1-Tap Poll Items */}
          <div className="space-y-2.5">
            {polls.map((poll) => {
              const hasVoted = poll.votes.includes(currentUserName);
              const voteCount = poll.votes.length;
              const fillWidth = Math.min(100, poll.basePercent + voteCount * 5);

              return (
                <button
                  key={poll.id}
                  onClick={() => handleTogglePoll(poll.id)}
                  type="button"
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                    hasVoted
                      ? 'bg-[#FAF3E8] border-[#B84A27] shadow-2xs'
                      : 'bg-[#FAF8F5] border-[#E2D5BE] hover:border-[#B84A27]/60'
                  }`}
                >
                  {/* Subtle Animated Progress Fill Behind */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fillWidth}%` }}
                    transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                    className="absolute inset-y-0 left-0 bg-[#D47A39]/10 rounded-2xl -z-0 pointer-events-none"
                  />

                  <div className="relative z-10 flex items-center justify-between gap-3">
                    <span className="font-heading font-semibold text-xs sm:text-sm text-[#3B2316] leading-snug">
                      {poll.label}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-xs font-bold text-[#B84A27]">
                        {voteCount} vote{voteCount === 1 ? '' : 's'}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition ${
                          hasVoted
                            ? 'bg-[#B84A27] border-[#B84A27] text-white'
                            : 'border-[#C9B69E] bg-white group-hover:border-[#B84A27]'
                        }`}
                      >
                        {hasVoted && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Invite Dispatch Strip Inside Chat */}
          <div className="pt-3 border-t border-[#E8DEC8] p-3 rounded-2xl bg-[#FAF5EC] border border-[#E2D5BE] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="text-xs font-meta text-[#7A5C49]">
              Waiting on <strong className="text-[#3B2316]">{remainingSlots}</strong> crew members? Share the room key:
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyLink}
                type="button"
                className="px-3 py-1.5 rounded-xl bg-[#FFFDF9] border border-[#E2D5BE] hover:border-[#B84A27] text-xs font-heading font-bold text-[#3B2316] transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                {copiedLink ? <Check className="w-3 h-3 text-[#B84A27]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy Room Link'}</span>
              </button>

              <button
                onClick={handleSimulateTwoFriends}
                type="button"
                className="px-3 py-1.5 rounded-xl bg-[#B84A27] hover:bg-[#9E3C1D] text-[#FFFDF9] text-xs font-heading font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ Auto-Simulate 2 Friends</span>
              </button>
            </div>
          </div>
        </motion.div>

        <div ref={messagesEndRef} />
      </div>

      {/* ── 4. PROMINENT COMPOSER DOCK (BOTTOM OF RIGHT PANEL) ── */}
      <div className="p-4 sm:p-5 bg-[#FFFDF9] border-t border-[#E6DAC6] space-y-3 shrink-0">
        {/* Quick AI Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { label: '✦ "@lokiva resolve our tie"', prompt: '@lokiva resolve our tie and pick our compromise destination' },
            { label: '💰 "Compare budget comfort"', prompt: '@lokiva check our group budget sweet-spot fit' },
            { label: '🗳️ "Drop top match to vote"', prompt: 'Everyone check the top destination choices and cast your votes!' },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleQuickPrompt(chip.prompt)}
              type="button"
              className="text-xs font-heading font-bold px-3.5 py-1.5 rounded-full bg-[#F5EDE0] hover:bg-[#EADBC8] text-[#5C3D2E] transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-2xs"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Large Input + Send Button */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Message your crew or type @lokiva to mediate..."
            className="w-full bg-[#FAF6F0] border border-[#DFCBB2] focus:border-[#B84A27] rounded-2xl px-4 py-3 text-sm sm:text-base text-[#3B2316] placeholder:text-[#9C826E] outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="bg-[#B84A27] hover:bg-[#9E3C1D] disabled:opacity-40 text-[#FFFDF9] px-5 py-3 rounded-2xl font-heading font-bold text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupRealTimeChat;
