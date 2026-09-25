export interface WorkshopSlot {
  slotId: string;
  listingId: string;
  listingTitle: string;
  timeLabel: string;
  totalCapacity: number;
  bookedSeats: number;
  basePricePerPerson: number;
  flashBeacon?: {
    isActive: boolean;
    discountPercent: number;
    durationMinutes: number;
    expiresAt: number;
    discountedPrice: number;
    broadcastRadiusKm: number;
    notifiedTravelersCount: number;
    claimedSpotsDuringFlash: number;
  };
}

export interface NearbyTravelerCluster {
  clusterId: string;
  label: string;
  partySize: number;
  distanceKm: number;
  budgetPerPerson: number;
  matchedInterests: string[];
  accessibilityNeed?: string;
  pingedWithBeacon: boolean;
}

export interface ProviderBookingRecord {
  bookingId: string;
  travelerName: string;
  partySize: number;
  slotTime: string;
  listingTitle: string;
  amountPaid: number;
  bookedViaFlashBeacon: boolean;
  status: 'confirmed' | 'checked_in' | 'completed';
  timestamp: string;
  guestEmail?: string;
  guestPhone?: string;
}

export interface ProviderListing {
  id: string;
  title: string;
  category: string;
  city: string;
  precinct: string;
  pricePerPerson: number;
  durationHours: number;
  maxGroupSize: number;
  rating: number;
  reviewCount: number;
  coverImage: string;
  isStepFreeAccessible: boolean;
  craftHeritage: string;
  description?: string;
  tags?: string[];
}

export interface ProviderGuildProfile {
  guildName: string;
  craftSpecialty: string;
  city: string;
  precinct: string;
  generationalHeritage: string;
  isStepFreeAccessible: boolean;
  contactEmail: string;
  contactPhone: string;
  isKycVerified: boolean;
  settlementAccount: string;
  avatarUrl?: string;
  bio?: string;
}

export interface FlashBeaconBroadcastEvent {
  type: 'FLASH_BEACON_ACTIVATED' | 'FLASH_BEACON_CANCELLED' | 'FLASH_SEAT_CLAIMED';
  slotId: string;
  listingTitle: string;
  city: string;
  discountPercent: number;
  discountedPrice: number;
  originalPrice: number;
  remainingSeats: number;
  expiresAt: number;
  broadcastRadiusKm: number;
}
