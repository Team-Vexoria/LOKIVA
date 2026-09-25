import { create } from 'zustand';
import {
  GroupTripSession,
  GroupMember,
  MemberStatus,
  MemberQuizAnswers,
  GroupChatMessage,
  GroupRecommendationCard,
} from '../types/groupTrip';
import {
  computeCrewSynergyMetrics,
  synthesizeGroupRecommendations,
} from '../lib/groupRecommendationEngine';

const STORAGE_KEY = 'lokiva_group_trip_sessions_v1';

// Cross-tab broadcast channel for real-time synchronization
const syncChannel: BroadcastChannel | null =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('lokiva_group_sync')
    : null;

function loadStoredSessions(): Record<string, GroupTripSession> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to parse group trip sessions from storage:', err);
    return {};
  }
}

function persistSessions(sessions: Record<string, GroupTripSession>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to persist group trip sessions:', err);
  }
}

interface GroupTripState {
  sessions: Record<string, GroupTripSession>;
  activeSessionId: string | null;

  // Actions
  createGroupSession: (
    groupName: string,
    expectedMemberCount: number,
    hostUser: { id: string | number; name: string; email: string; avatar?: string }
  ) => string;

  joinGroupSession: (
    groupId: string,
    user: { id: string | number; name: string; email: string; avatar?: string }
  ) => void;

  updateMemberStatus: (groupId: string, memberId: string, status: MemberStatus) => void;

  submitMemberQuiz: (
    groupId: string,
    memberId: string,
    answers: MemberQuizAnswers
  ) => void;

  addChatMessage: (
    groupId: string,
    message: {
      senderId: string;
      senderName: string;
      senderAvatar?: string;
      isAiMediator?: boolean;
      text: string;
      droppedCard?: GroupChatMessage['droppedCard'];
    }
  ) => void;

  sendChatMessage: (
    groupId: string,
    sender: { id: string | number; name: string; avatar?: string },
    text: string
  ) => void;

  dropCardToChat: (
    groupId: string,
    sender: { id: string | number; name: string; avatar?: string },
    card: GroupRecommendationCard
  ) => void;

  reactToMessage: (
    groupId: string,
    messageId: string,
    memberName: string,
    reactionType: 'mustGo' | 'maybe' | 'veto'
  ) => void;

  toggleCardReaction: (
    groupId: string,
    messageId: string,
    memberName: string,
    reactionType: 'mustGo' | 'maybe' | 'veto'
  ) => void;

  triggerAiMediator: (groupId: string, userPrompt?: string) => void;

  lockDestination: (groupId: string, city: string) => void;

  upvoteCard: (groupId: string, city: string, memberId: string) => void;

  vetoCard: (groupId: string, city: string, memberId: string) => void;

  addDemoMember: (groupId: string) => void;

  getGroupSession: (groupId: string) => GroupTripSession | undefined;

  setActiveSessionId: (groupId: string | null) => void;

  syncRemoteSession: (session: GroupTripSession) => void;
}

export const useGroupTripStore = create<GroupTripState>((set, get) => {
  // Initialize with persisted sessions
  const initialSessions = loadStoredSessions();

  return {
    sessions: initialSessions,
    activeSessionId: null,

    createGroupSession: (groupName, expectedMemberCount, hostUser) => {
      const numericRand = Math.floor(1000 + Math.random() * 9000);
      const groupId = `grp-${numericRand}`;
      const hostIdStr = String(hostUser.id);

      const hostMember: GroupMember = {
        id: hostIdStr,
        name: hostUser.name || 'Group Host',
        email: hostUser.email || '',
        avatar: hostUser.avatar,
        isHost: true,
        status: 'joined',
      };

      const welcomeMessage: GroupChatMessage = {
        id: `msg-${Date.now()}-welcome`,
        senderId: 'lokiva-ai',
        senderName: 'Lokiva AI Mediator',
        isAiMediator: true,
        text: `Welcome to ${groupName}! Invite link generated for ${expectedMemberCount} travelers. Once everyone completes their personal quiz, I will synthesize all budgets and cultural preferences into collaborative trip matches.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: {
          mustGo: [],
          maybe: [],
          veto: [],
        },
      };

      const newSession: GroupTripSession = {
        groupId,
        groupName: groupName.trim() || 'Cultural Journey Squad',
        hostId: hostIdStr,
        hostName: hostUser.name || 'Host',
        expectedMemberCount: Math.max(2, expectedMemberCount || 2),
        createdAt: new Date().toISOString(),
        members: [hostMember],
        messages: [welcomeMessage],
      };

      const updatedSessions = {
        ...get().sessions,
        [groupId]: newSession,
      };

      persistSessions(updatedSessions);
      set({ sessions: updatedSessions, activeSessionId: groupId });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: newSession,
      });

      return groupId;
    },

    joinGroupSession: (groupId, user) => {
      const currentSession = get().sessions[groupId];
      if (!currentSession) return;

      const userIdStr = String(user.id);
      const existingMemberIndex = currentSession.members.findIndex(
        (m) => m.id === userIdStr || m.email === user.email
      );

      if (existingMemberIndex >= 0) {
        const existing = currentSession.members[existingMemberIndex];
        const newName = user.name || existing.name;
        const newAvatar = user.avatar || existing.avatar;
        // If nothing changed, do not trigger redundant state updates
        if (existing.name === newName && existing.avatar === newAvatar) {
          return;
        }

        const updatedMembers = [...currentSession.members];
        updatedMembers[existingMemberIndex] = {
          ...existing,
          name: newName,
          avatar: newAvatar,
        };

        const updatedSession = { ...currentSession, members: updatedMembers };
        const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
        persistSessions(updatedSessions);
        set({ sessions: updatedSessions });
        return;
      }

      // Add as new member
      const newMember: GroupMember = {
        id: userIdStr,
        name: user.name || 'Fellow Traveler',
        email: user.email || '',
        avatar: user.avatar,
        isHost: currentSession.hostId === userIdStr,
        status: 'joined',
      };

      const joinAnnouncement: GroupChatMessage = {
        id: `msg-${Date.now()}-join`,
        senderId: 'lokiva-ai',
        senderName: 'Lokiva AI Mediator',
        isAiMediator: true,
        text: `👋 ${newMember.name} joined the crew! Waiting for their personal travel preferences quiz.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: { mustGo: [], maybe: [], veto: [] },
      };

      const updatedSession: GroupTripSession = {
        ...currentSession,
        members: [...currentSession.members, newMember],
        messages: [...currentSession.messages, joinAnnouncement],
      };

      const updatedSessions = {
        ...get().sessions,
        [groupId]: updatedSession,
      };

      persistSessions(updatedSessions);
      set({ sessions: updatedSessions, activeSessionId: groupId });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    updateMemberStatus: (groupId, memberId, status) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const updatedMembers = session.members.map((m) =>
        m.id === String(memberId) ? { ...m, status } : m
      );

      const updatedSession = { ...session, members: updatedMembers };
      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };

      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    submitMemberQuiz: (groupId, memberId, answers) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const memberIdStr = String(memberId);
      const member = session.members.find((m) => m.id === memberIdStr);
      const memberName = answers.memberName || member?.name || 'Traveler';

      const updatedMembers = session.members.map((m) => {
        if (m.id === memberIdStr) {
          return {
            ...m,
            name: memberName,
            status: 'ready' as MemberStatus,
            quizAnswers: { ...answers, memberId: memberIdStr, memberName },
          };
        }
        return m;
      });

      const readyCount = updatedMembers.filter((m) => m.status === 'ready').length;
      const totalCount = session.expectedMemberCount;

      const completionMessage: GroupChatMessage = {
        id: `msg-${Date.now()}-quiz`,
        senderId: 'lokiva-ai',
        senderName: 'Lokiva AI Mediator',
        isAiMediator: true,
        text: `✨ ${memberName} completed their travel profile! (${readyCount}/${totalCount} crew members ready). Cultural preferences and private budget calibrated.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: { mustGo: [], maybe: [], veto: [] },
      };

      const updatedSession: GroupTripSession = {
        ...session,
        members: updatedMembers,
        messages: [...session.messages, completionMessage],
      };

      const updatedSessions = {
        ...get().sessions,
        [groupId]: updatedSession,
      };

      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    addChatMessage: (groupId, msg) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const newMsg: GroupChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderId: String(msg.senderId),
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        isAiMediator: msg.isAiMediator || false,
        text: msg.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        droppedCard: msg.droppedCard,
        reactions: { mustGo: [], maybe: [], veto: [] },
      };

      const updatedSession = {
        ...session,
        messages: [...session.messages, newMsg],
      };

      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    reactToMessage: (groupId, messageId, memberName, reactionType) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const updatedMessages = session.messages.map((m) => {
        if (m.id !== messageId) return m;

        const currentList = m.reactions[reactionType] || [];
        const hasReacted = currentList.includes(memberName);

        const updatedList = hasReacted
          ? currentList.filter((n) => n !== memberName)
          : [...currentList, memberName];

        return {
          ...m,
          reactions: {
            ...m.reactions,
            [reactionType]: updatedList,
          },
        };
      });

      const updatedSession = { ...session, messages: updatedMessages };
      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    sendChatMessage: (groupId, sender, text) => {
      const session = get().sessions[groupId];
      if (!session || !text.trim()) return;

      const newMsg: GroupChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderId: String(sender.id),
        senderName: sender.name,
        senderAvatar: sender.avatar,
        isAiMediator: false,
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: { mustGo: [], maybe: [], veto: [] },
      };

      const updatedSession = {
        ...session,
        messages: [...session.messages, newMsg],
      };

      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });

      // If user typed @lokiva, automatically trigger the AI mediator after 600ms
      if (text.toLowerCase().includes('@lokiva')) {
        setTimeout(() => {
          get().triggerAiMediator(groupId, text);
        }, 600);
      }
    },

    dropCardToChat: (groupId, sender, card) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const newMsg: GroupChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        senderId: String(sender.id),
        senderName: sender.name,
        senderAvatar: sender.avatar,
        isAiMediator: false,
        text: `${sender.name} dropped ${card.city}, ${card.state} for crew review!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        droppedCard: {
          city: card.city,
          state: card.state,
          estimatedCostPerPerson: card.estimatedCostPerPerson,
          matchScore: card.matchScore,
          recommendedForNames: card.recommendedForMemberNames,
        },
        reactions: { mustGo: [], maybe: [], veto: [] },
      };

      const updatedSession = {
        ...session,
        messages: [...session.messages, newMsg],
      };

      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    toggleCardReaction: (groupId, messageId, memberName, reactionType) => {
      get().reactToMessage(groupId, messageId, memberName, reactionType);
    },

    triggerAiMediator: (groupId, userPrompt) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const readyMembers = session.members.filter((m) => m.status === 'ready' && m.quizAnswers);
      const metrics = computeCrewSynergyMetrics(session.members, session.expectedMemberCount);
      const cards = synthesizeGroupRecommendations(
        session.members,
        session.expectedMemberCount,
        session.cardVotes
      );

      const topCard = cards[0];
      const runnerUp = cards[1];

      let mediatorText = '';

      if (readyMembers.length === 0) {
        mediatorText =
          'Namaste crew! I am Lokiva AI Mediator. To synthesize your personalized compromise plan, I need at least one member to complete their travel preferences quiz. Once profiles are submitted, I will calibrate your group sweet-spot budget and recommend harmonious itineraries.';
      } else if (userPrompt && userPrompt.toLowerCase().includes('budget')) {
        mediatorText = `Budget Analysis for ${session.groupName}: Our calibrated Fair Group Sweet-Spot is ₹${metrics.groupSweetSpotBudget.toLocaleString('en-IN')}/person. For a ${metrics.medianDays}-day journey, ${topCard.city} (${topCard.financialFitLabel}) fits comfortably without financial stretch. Recommended daily allowance balances private stays with regional hearth meals.`;
      } else if (userPrompt && (userPrompt.toLowerCase().includes('tie') || userPrompt.toLowerCase().includes('vote'))) {
        if (runnerUp) {
          mediatorText = `Resolving Tie between ${topCard.city} and ${runnerUp.city}: Both are exceptional choices! ${topCard.city} leads slightly in interest overlap (${topCard.matchScore}% vs ${runnerUp.matchScore}%). Compromise Blueprint: If the crew selects ${topCard.city}, members wanting ${runnerUp.tagline.split(',')[0]} will find matching immersion in ${topCard.sharedHighlights[0]}.`;
        } else {
          mediatorText = `Current Frontrunner: ${topCard.city} is leading our squad consensus at ${topCard.matchScore}% match. ${topCard.financialFitLabel}.`;
        }
      } else {
        // Dynamic compromise analysis based on actual members and preferences
        const firstMember = readyMembers[0];
        const secondMember = readyMembers[1] || firstMember;
        const firstInterest = firstMember.quizAnswers?.interests[0] || 'Artisan Crafts';
        const secondInterest = secondMember.quizAnswers?.interests[0] || 'Heritage Forts';

        mediatorText = `Looking at your crew's profiles: ${firstMember.name} prioritizes ${firstInterest} while ${secondMember.name} focuses on ${secondInterest}, and our Fair Group Sweet-Spot is ₹${metrics.groupSweetSpotBudget.toLocaleString('en-IN')}/person. ${topCard.city} is our ${topCard.matchScore}% sweet-spot compromise. Morning Blueprint: split into parallel tracks (${topCard.sharedHighlights[0]} vs local markets), then reunite at golden hour for shared dining without stretching anyone's budget.`;
      }

      const aiMessage: GroupChatMessage = {
        id: `msg-${Date.now()}-ai-mediator`,
        senderId: 'lokiva-ai',
        senderName: 'Lokiva AI Mediator',
        isAiMediator: true,
        text: mediatorText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: { mustGo: [], maybe: [], veto: [] },
      };

      const updatedSession = {
        ...session,
        messages: [...session.messages, aiMessage],
      };

      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    lockDestination: (groupId, city) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const lockMessage: GroupChatMessage = {
        id: `msg-${Date.now()}-lock`,
        senderId: 'lokiva-ai',
        senderName: 'Lokiva AI Mediator',
        isAiMediator: true,
        text: `🎯 Destination Locked: ${city}! Synthesizing 60/40 collective itinerary across all traveler preferences.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: { mustGo: [], maybe: [], veto: [] },
      };

      const updatedSession = {
        ...session,
        lockedDestinationCity: city,
        messages: [...session.messages, lockMessage],
      };

      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    upvoteCard: (groupId, city, memberId) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const currentVotes = session.cardVotes || {};
      const cityVotes = currentVotes[city] || { upvotedByMemberIds: [], vetoedByMemberIds: [] };

      const memberIdStr = String(memberId);
      const isUpvoted = cityVotes.upvotedByMemberIds.includes(memberIdStr);

      const updatedUpvotes = isUpvoted
        ? cityVotes.upvotedByMemberIds.filter((id) => id !== memberIdStr)
        : [...cityVotes.upvotedByMemberIds, memberIdStr];

      // If upvoting, remove any veto by this member
      const updatedVetoes = cityVotes.vetoedByMemberIds.filter((id) => id !== memberIdStr);

      const updatedCardVotes = {
        ...currentVotes,
        [city]: {
          upvotedByMemberIds: updatedUpvotes,
          vetoedByMemberIds: updatedVetoes,
        },
      };

      const updatedSession = { ...session, cardVotes: updatedCardVotes };
      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    vetoCard: (groupId, city, memberId) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const currentVotes = session.cardVotes || {};
      const cityVotes = currentVotes[city] || { upvotedByMemberIds: [], vetoedByMemberIds: [] };

      const memberIdStr = String(memberId);
      const isVetoed = cityVotes.vetoedByMemberIds.includes(memberIdStr);

      const updatedVetoes = isVetoed
        ? cityVotes.vetoedByMemberIds.filter((id) => id !== memberIdStr)
        : [...cityVotes.vetoedByMemberIds, memberIdStr];

      // If vetoing, remove any upvote by this member
      const updatedUpvotes = cityVotes.upvotedByMemberIds.filter((id) => id !== memberIdStr);

      const updatedCardVotes = {
        ...currentVotes,
        [city]: {
          upvotedByMemberIds: updatedUpvotes,
          vetoedByMemberIds: updatedVetoes,
        },
      };

      const updatedSession = { ...session, cardVotes: updatedCardVotes };
      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    addDemoMember: (groupId) => {
      const session = get().sessions[groupId];
      if (!session) return;

      const demoPool = [
        {
          name: 'Sneha Patel',
          email: 'sneha.patel@culturetravel.in',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          answers: {
            budgetPerPerson: 18000,
            interests: ['Artisan Crafts', 'Coastal Cafes', 'Street Gastronomy'],
            pace: 'Relaxed' as const,
            terrainPreference: 'Coastal & Backwaters' as const,
            tripDays: 4,
            lowWalkingRequired: false,
          },
        },
        {
          name: 'Aarav Sharma',
          email: 'aarav.sharma@culturetravel.in',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          answers: {
            budgetPerPerson: 32000,
            interests: ['Royal Forts', 'Street Gastronomy', 'Artisan Crafts'],
            pace: 'Balanced' as const,
            terrainPreference: 'Royal & Heritage Cities' as const,
            tripDays: 4,
            lowWalkingRequired: false,
          },
        },
        {
          name: 'Rohan Verma',
          email: 'rohan.verma@culturetravel.in',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
          answers: {
            budgetPerPerson: 22000,
            interests: ['Mountain Treks', 'Offbeat Villages', 'Street Gastronomy'],
            pace: 'Packed' as const,
            terrainPreference: 'Mountains & Valleys' as const,
            tripDays: 5,
            lowWalkingRequired: false,
          },
        },
        {
          name: 'Ananya Iyer',
          email: 'ananya.iyer@culturetravel.in',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
          answers: {
            budgetPerPerson: 27000,
            interests: ['Sacred Ghats', 'Artisan Crafts', 'Street Gastronomy'],
            pace: 'Balanced' as const,
            terrainPreference: 'Spiritual & River Ghats' as const,
            tripDays: 3,
            lowWalkingRequired: false,
          },
        },
      ];

      // Pick the first demo person not yet in the session
      const existingEmails = new Set(session.members.map((m) => m.email));
      let candidate = demoPool.find((p) => !existingEmails.has(p.email));

      if (!candidate) {
        const nextIdx = session.members.length + 1;
        candidate = {
          name: `Friend ${nextIdx}`,
          email: `friend${nextIdx}@culturetravel.in`,
          avatar: undefined,
          answers: {
            budgetPerPerson: 24000,
            interests: ['Artisan Crafts', 'Street Gastronomy'],
            pace: 'Balanced' as const,
            terrainPreference: 'Royal & Heritage Cities' as const,
            tripDays: 4,
            lowWalkingRequired: false,
          },
        };
      }

      const demoId = `demo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newMember: GroupMember = {
        id: demoId,
        name: candidate.name,
        email: candidate.email,
        avatar: candidate.avatar,
        isHost: false,
        status: 'ready',
        quizAnswers: {
          ...candidate.answers,
          memberId: demoId,
          memberName: candidate.name,
          submittedAt: new Date().toISOString(),
        },
      };

      const announcementMsg: GroupChatMessage = {
        id: `msg-${Date.now()}-demo-join`,
        senderId: 'lokiva-ai',
        senderName: 'Lokiva AI Mediator',
        isAiMediator: true,
        text: `✨ ${candidate.name} joined the crew and synced their travel profile! Target comfort budget and cultural interests calibrated.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: { mustGo: [], maybe: [], veto: [] },
      };

      const updatedMembers = [...session.members, newMember];
      const newExpectedCount = Math.max(session.expectedMemberCount, updatedMembers.length);

      const updatedSession: GroupTripSession = {
        ...session,
        expectedMemberCount: newExpectedCount,
        members: updatedMembers,
        messages: [...session.messages, announcementMsg],
      };

      const updatedSessions = { ...get().sessions, [groupId]: updatedSession };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });

      syncChannel?.postMessage({
        type: 'GROUP_SESSION_UPDATED',
        groupId,
        session: updatedSession,
      });
    },

    getGroupSession: (groupId) => {
      return get().sessions[groupId];
    },

    setActiveSessionId: (groupId) => {
      set({ activeSessionId: groupId });
    },

    syncRemoteSession: (session) => {
      if (!session || !session.groupId) return;
      const updatedSessions = {
        ...get().sessions,
        [session.groupId]: session,
      };
      persistSessions(updatedSessions);
      set({ sessions: updatedSessions });
    },
  };
});

// Setup listeners for multi-tab synchronization
if (typeof window !== 'undefined') {
  // BroadcastChannel listener
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data?.type === 'GROUP_SESSION_UPDATED' && event.data.session) {
        useGroupTripStore.getState().syncRemoteSession(event.data.session);
      }
    };
  }

  // Cross-window storage event listener (for incognito tabs or cross-origin sessions)
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue);
        if (typeof parsed === 'object' && parsed !== null) {
          useGroupTripStore.setState({ sessions: parsed });
        }
      } catch (err) {
        console.error('Failed to sync storage change:', err);
      }
    }
  });
}
