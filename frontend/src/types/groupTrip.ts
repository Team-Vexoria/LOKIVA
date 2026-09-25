export type MemberStatus = 'joined' | 'answering_quiz' | 'ready';

export interface MemberQuizAnswers {
  memberId: string;
  memberName: string;
  budgetPerPerson: number; // Private budget input in INR
  interests: string[]; // e.g. ['Artisan Crafts', 'Street Gastronomy', 'Mountain Treks', 'Sacred Ghats', 'Royal Forts', 'Coastal Cafes']
  pace: 'Relaxed' | 'Balanced' | 'Packed';
  terrainPreference: 'Mountains & Valleys' | 'Royal & Heritage Cities' | 'Coastal & Backwaters' | 'Spiritual & River Ghats';
  tripDays: number;
  lowWalkingRequired: boolean;
  submittedAt: string;
}

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isHost: boolean;
  status: MemberStatus;
  quizAnswers?: MemberQuizAnswers;
}

export interface GroupRecommendationCard {
  city: string;
  state: string;
  tagline: string;
  heroImage: string;
  matchScore: number; // 0 to 100
  recommendedForMemberIds: string[];
  recommendedForMemberNames: string[]; // e.g. ['Harshit', 'Piyush', 'Aarav']
  estimatedCostPerPerson: number;
  financialFitLabel: string; // e.g. "Fits 4/4 Budgets Comfortably" or "Stretches 1 Budget by ₹3,500"
  financialFitStatus: 'comfortable' | 'moderate_stretch' | 'high_stretch';
  sharedHighlights: string[];
  upvotedByMemberIds: string[];
  vetoedByMemberIds: string[];
}

export interface GroupChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isAiMediator?: boolean;
  text: string;
  timestamp: string;
  droppedCard?: {
    city: string;
    state: string;
    estimatedCostPerPerson: number;
    matchScore: number;
    recommendedForNames: string[];
  };
  reactions: {
    mustGo: string[]; // array of memberNames
    maybe: string[];
    veto: string[];
  };
}

export interface GroupTripSession {
  groupId: string;
  groupName: string;
  hostId: string;
  hostName: string;
  expectedMemberCount: number;
  createdAt: string;
  members: GroupMember[];
  messages: GroupChatMessage[];
  lockedDestinationCity?: string;
  cardVotes?: Record<string, { upvotedByMemberIds: string[]; vetoedByMemberIds: string[] }>;
}
