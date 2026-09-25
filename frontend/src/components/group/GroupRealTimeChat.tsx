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
  Share2,
  Clock,
  Compass,
  ArrowRight,
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

export const GroupRealTimeChat: React.FC<GroupRealTimeChatProps> = ({
  session,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  inviteUrl,
}) => {
  const { sendChatMessage, toggleCardReaction, triggerAiMediator } = useGroupTripStore();
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] min-h-[580px] max-h-[820px] bg-white/95 rounded-3xl border border-[#E5DFD5] shadow-xs overflow-hidden sticky top-20">
      {/* 1. Chat Header Bar */}
      <div className="p-3.5 sm:p-4 border-b border-[#E5DFD5] flex items-center justify-between bg-[#FAF8F5] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FAF4ED] border border-[#E8DEC8] flex items-center justify-center text-[#C85A32] shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-extrabold text-xs text-ink uppercase tracking-wider truncate">
                Squad Chat & AI Mediator
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-sans text-dusk-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Group Sync · {session.members.length} Members Online</span>
            </div>
          </div>
        </div>

        {/* Member Avatars Stack & AI Mediator Trigger Button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {session.members.slice(0, 4).map((member) => (
              <div
                key={member.id}
                title={`${member.name}${member.id === currentUserId ? ' (You)' : ''}`}
                className="w-6 h-6 rounded-full border border-white bg-[#FAF4ED] text-[#C85A32] flex items-center justify-center text-[10px] font-heading font-black shadow-2xs"
              >
                {member.name ? member.name[0].toUpperCase() : 'T'}
              </div>
            ))}
            {session.members.length > 4 && (
              <div className="w-6 h-6 rounded-full border border-white bg-[#FAF8F5] text-dusk-500 flex items-center justify-center text-[9px] font-mono font-bold shadow-2xs">
                +{session.members.length - 4}
              </div>
            )}
          </div>

          <button
            onClick={handleMediatorClick}
            type="button"
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D99B43] to-[#C85A32] hover:opacity-90 text-white text-[11px] font-heading font-extrabold transition cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Ask Lokiva AI Mediator to resolve ties or differences"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">✨ @Lokiva Mediator</span>
            <span className="sm:hidden">@Lokiva</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;

          // Case A: LOKIVA AI MEDIATOR MESSAGE
          if (msg.isAiMediator) {
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl p-4 bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0] border-2 border-[#D99B43] shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-[#E8DEC8] text-[#C85A32] font-heading font-extrabold uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5 text-[#D99B43]" />
                    <span>LOKIVA AI GROUP MEDIATOR</span>
                  </div>
                  <span className="text-[10px] font-mono text-dusk-400">{msg.timestamp}</span>
                </div>

                <p className="text-xs font-sans text-ink leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>
              </motion.div>
            );
          }

          // Case B: STANDARD USER MESSAGE / DROPPED DESTINATION CARD
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {/* Sender Name & Timestamp */}
              <div className="flex items-center gap-1.5 text-[11px] font-heading font-bold text-dusk-500 mb-1 px-1">
                <span>{msg.senderName}</span>
                {isMe && <span className="text-[10px] font-mono text-[#C85A32]">(You)</span>}
                <span className="text-dusk-300 font-mono">·</span>
                <span className="text-[10px] font-mono text-dusk-400">{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2.5 shadow-2xs ${
                  isMe
                    ? 'bg-[#C85A32] text-white rounded-tr-xs'
                    : 'bg-[#FAF8F5] border border-[#E5DFD5] text-ink rounded-tl-xs'
                }`}
              >
                <p className="font-sans text-xs">{msg.text}</p>

                {/* Embedded Destination Mini-Card */}
                {msg.droppedCard && (
                  <div
                    className={`rounded-2xl p-3 space-y-2.5 border transition ${
                      isMe
                        ? 'bg-white text-ink border-white/40 shadow-sm'
                        : 'bg-white text-ink border-[#E5DFD5] shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-heading font-black text-xs text-ink truncate">
                          📍 {msg.droppedCard.city}, {msg.droppedCard.state}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[#FAF4ED] text-[#C85A32] text-[10px] font-mono font-extrabold border border-[#E8DEC8] shrink-0">
                        ✨ {msg.droppedCard.matchScore}% Match
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-dusk-600">
                      <span>Target Split:</span>
                      <span className="font-bold text-ink">
                        ₹{msg.droppedCard.estimatedCostPerPerson.toLocaleString('en-IN')}{' '}
                        <span className="text-[10px] font-normal text-dusk-500">/ person</span>
                      </span>
                    </div>

                    {msg.droppedCard.recommendedForNames.length > 0 && (
                      <div className="text-[10px] font-heading font-bold text-dusk-500 pt-0.5">
                        Recommended for: {msg.droppedCard.recommendedForNames.join(', ')}
                      </div>
                    )}

                    {/* 3 Interactive Live Reaction Pills */}
                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#FAF4ED] flex-wrap">
                      {/* Must Go */}
                      <button
                        onClick={() => handleReaction(msg.id, 'mustGo')}
                        type="button"
                        title={
                          msg.reactions?.mustGo?.length
                            ? `Reacted: ${msg.reactions.mustGo.join(', ')}`
                            : 'Click to mark as Must Go'
                        }
                        className={`px-2 py-1 rounded-xl text-[10px] font-heading font-extrabold transition cursor-pointer flex items-center gap-1 border ${
                          msg.reactions?.mustGo?.includes(currentUserName)
                            ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-2xs'
                            : 'bg-[#FAF8F5] text-ink border-[#DDD7CC] hover:bg-white'
                        }`}
                      >
                        <Flame className="w-3 h-3" />
                        <span>Must Go</span>
                        <span className="font-mono">({msg.reactions?.mustGo?.length || 0})</span>
                      </button>

                      {/* Maybe */}
                      <button
                        onClick={() => handleReaction(msg.id, 'maybe')}
                        type="button"
                        title={
                          msg.reactions?.maybe?.length
                            ? `Reacted: ${msg.reactions.maybe.join(', ')}`
                            : 'Click to mark as Maybe'
                        }
                        className={`px-2 py-1 rounded-xl text-[10px] font-heading font-bold transition cursor-pointer flex items-center gap-1 border ${
                          msg.reactions?.maybe?.includes(currentUserName)
                            ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                            : 'bg-[#FAF8F5] text-dusk-600 border-[#DDD7CC] hover:bg-white'
                        }`}
                      >
                        <HelpCircle className="w-3 h-3 text-amber-600" />
                        <span>Maybe</span>
                        <span className="font-mono">({msg.reactions?.maybe?.length || 0})</span>
                      </button>

                      {/* Veto */}
                      <button
                        onClick={() => handleReaction(msg.id, 'veto')}
                        type="button"
                        title={
                          msg.reactions?.veto?.length
                            ? `Reacted: ${msg.reactions.veto.join(', ')}`
                            : 'Click to mark as Pass'
                        }
                        className={`px-2 py-1 rounded-xl text-[10px] font-heading font-bold transition cursor-pointer flex items-center gap-1 border ${
                          msg.reactions?.veto?.includes(currentUserName)
                            ? 'bg-rose-100 text-rose-900 border-rose-300 shadow-2xs'
                            : 'bg-[#FAF8F5] text-dusk-600 border-[#DDD7CC] hover:bg-white hover:text-rose-600'
                        }`}
                      >
                        <XCircle className="w-3 h-3 text-rose-500" />
                        <span>Pass</span>
                        <span className="font-mono">({msg.reactions?.veto?.length || 0})</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick AI Prompt Chips */}
      <div className="px-3 py-2 bg-[#FAF8F5] border-t border-[#E5DFD5] flex items-center gap-1.5 overflow-x-auto shrink-0">
        {[
          { label: '💬 "@lokiva resolve our tie"', prompt: '@lokiva resolve our tie and pick our compromise destination' },
          { label: '💰 "Check our budget fit"', prompt: '@lokiva check our group budget sweet-spot fit' },
          { label: '🗳️ "Everyone vote on top 2!"', prompt: 'Everyone check the top 2 destinations and cast your upvotes!' },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleQuickPrompt(chip.prompt)}
            type="button"
            className="px-2.5 py-1 rounded-lg bg-white border border-[#DDD7CC] hover:border-[#C85A32] text-[11px] font-heading font-bold text-ink whitespace-nowrap transition cursor-pointer shrink-0 shadow-2xs"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* 4. Chat Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[#E5DFD5] bg-white flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Message your crew or type @lokiva to mediate..."
          className="flex-1 px-3.5 py-2.5 bg-[#FAF8F5] border border-[#DDD7CC] rounded-xl text-xs font-sans text-ink placeholder:text-dusk-400 focus:outline-none focus:border-[#C85A32]"
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className="w-9 h-9 rounded-xl bg-[#C85A32] hover:bg-[#B84E28] disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default GroupRealTimeChat;
