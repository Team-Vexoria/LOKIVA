import {
  GroupMember,
  GroupRecommendationCard,
  MemberQuizAnswers,
} from '../types/groupTrip';

interface DestinationHub {
  city: string;
  state: string;
  tagline: string;
  heroImage: string;
  terrain: MemberQuizAnswers['terrainPreference'];
  interests: string[];
  baseCostPerDay: number;
  paceFit: ('Relaxed' | 'Balanced' | 'Packed')[];
  minDays: number;
  maxDays: number;
  highlights: string[];
}

export const INDIAN_CULTURAL_HUBS: DestinationHub[] = [
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'Living Pink City havelis, block-printing guilds & astronomical observatories',
    heroImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Royal & Heritage Cities',
    interests: ['Royal Forts', 'Artisan Crafts', 'Street Gastronomy'],
    baseCostPerDay: 4200,
    paceFit: ['Balanced', 'Packed'],
    minDays: 3,
    maxDays: 5,
    highlights: ['Amber Fort Elephant Corridors', 'Sanganer Block Print Guilds', 'Rawat Pyaaz Kachori Hearths'],
  },
  {
    city: 'Udaipur',
    state: 'Rajasthan',
    tagline: 'Lakeside palaces, miniature Mewar painting schools & marble stone carvings',
    heroImage: 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Royal & Heritage Cities',
    interests: ['Royal Forts', 'Artisan Crafts', 'Coastal Cafes'],
    baseCostPerDay: 5400,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 3,
    maxDays: 6,
    highlights: ['Lake Pichola Boat Ghats', 'City Palace Mirror Courtyards', 'Mewar Miniature Masterclasses'],
  },
  {
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    tagline: 'Ancient living river civilization, evening Ganga aartis & Zari handloom weavers',
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Spiritual & River Ghats',
    interests: ['Sacred Ghats', 'Street Gastronomy', 'Artisan Crafts'],
    baseCostPerDay: 3200,
    paceFit: ['Balanced', 'Packed'],
    minDays: 2,
    maxDays: 4,
    highlights: ['Dashashwamedh Evening Aarti', 'Madanpura Pure Silk Looms', 'Kachori Gali Morning Halts'],
  },
  {
    city: 'Hampi',
    state: 'Karnataka',
    tagline: 'UNESCO boulder kingdom, carved monolithic temples & coracle river crossings',
    heroImage: 'https://images.unsplash.com/photo-1600100397608-f010f4439c27?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Royal & Heritage Cities',
    interests: ['Royal Forts', 'Mountain Treks', 'Offbeat Villages'],
    baseCostPerDay: 3500,
    paceFit: ['Balanced', 'Packed'],
    minDays: 3,
    maxDays: 5,
    highlights: ['Virupaksha Temple Corridors', 'Matanga Hill Sunrise Trek', 'Tungabhadra Coracle Floats'],
  },
  {
    city: 'Srinagar',
    state: 'Jammu & Kashmir',
    tagline: 'Misty Dal Lake shikaras, Pashmina walnut guilds & Mughal terrace gardens',
    heroImage: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Mountains & Valleys',
    interests: ['Mountain Treks', 'Artisan Crafts', 'Street Gastronomy'],
    baseCostPerDay: 5800,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 4,
    maxDays: 7,
    highlights: ['Floating Vegetable Bazaar', 'Downtown Pashmina Masterclasses', 'Nigeen Lake Cedar Houseboats'],
  },
  {
    city: 'Dharamshala',
    state: 'Himachal Pradesh',
    tagline: 'Himalayan Tibetan sanctuaries, cedar ridge treks & Kangra tea estates',
    heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Mountains & Valleys',
    interests: ['Mountain Treks', 'Sacred Ghats', 'Offbeat Villages'],
    baseCostPerDay: 3600,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 3,
    maxDays: 6,
    highlights: ['Triund Ridge Panoramic Trek', 'Norbulingka Thangka Guilds', 'Kangra Valley Tea Tastings'],
  },
  {
    city: 'Kochi',
    state: 'Kerala',
    tagline: 'Historic Fort Kochi spice lanes, Chinese fishing nets & Kathakali hearths',
    heroImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Coastal & Backwaters',
    interests: ['Coastal Cafes', 'Artisan Crafts', 'Street Gastronomy'],
    baseCostPerDay: 4400,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 3,
    maxDays: 5,
    highlights: ['Mattancherry Jewish Spice Bazaars', 'Cantilever Chinese Nets', 'Kathakali Green Room Rituals'],
  },
  {
    city: 'Munnar',
    state: 'Kerala',
    tagline: 'High-altitude emerald tea carpets, Anamudi mist ridges & spice plantation homestays',
    heroImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Mountains & Valleys',
    interests: ['Mountain Treks', 'Coastal Cafes', 'Offbeat Villages'],
    baseCostPerDay: 4600,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 3,
    maxDays: 5,
    highlights: ['Kolukkumalai Sunrise Jeep Circuit', 'Lockhart Tea Factory Tours', 'Attukal Waterfalls Trek'],
  },
  {
    city: 'Rishikesh',
    state: 'Uttarakhand',
    tagline: 'Ganges yoga ashrams, suspension footbridges & white-water river gorges',
    heroImage: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Spiritual & River Ghats',
    interests: ['Sacred Ghats', 'Mountain Treks', 'Street Gastronomy'],
    baseCostPerDay: 3100,
    paceFit: ['Balanced', 'Packed'],
    minDays: 2,
    maxDays: 5,
    highlights: ['Triveni Ghat Maha Aarti', 'Beatles Ashram Graffiti Walk', 'Neer Garh Waterfall Hike'],
  },
  {
    city: 'Goa (Old Goa & Divar)',
    state: 'Goa',
    tagline: 'Portuguese Baroque churches, estuary ferry crossings & feni tavern trails',
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Coastal & Backwaters',
    interests: ['Coastal Cafes', 'Royal Forts', 'Street Gastronomy'],
    baseCostPerDay: 4900,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 3,
    maxDays: 6,
    highlights: ['Divar Island Bicycle Trail', 'Fontainhas Heritage Quarters', 'Traditional Cashew Feni Stills'],
  },
  {
    city: 'Pondicherry',
    state: 'Puducherry',
    tagline: 'Franco-Tamil mustard mansions, Auroville clay pottery & bohemian promenade sunsets',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Coastal & Backwaters',
    interests: ['Coastal Cafes', 'Artisan Crafts', 'Street Gastronomy'],
    baseCostPerDay: 4100,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 3,
    maxDays: 5,
    highlights: ['White Town French Bakery Walk', 'Auroville Handmade Paper Looms', 'Serenity Beach Surf Halts'],
  },
  {
    city: 'Shillong',
    state: 'Meghalaya',
    tagline: 'Living root bridges, sacred forest groves & Khasi highland rock cafes',
    heroImage: 'https://images.unsplash.com/photo-1622308644420-a7d03a1f9a65?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Mountains & Valleys',
    interests: ['Mountain Treks', 'Offbeat Villages', 'Street Gastronomy'],
    baseCostPerDay: 4500,
    paceFit: ['Balanced', 'Packed'],
    minDays: 4,
    maxDays: 7,
    highlights: ['Mawlynnong Living Root Bridges', 'Laitlum Canyons Edge Walk', 'Police Bazar Khasi Food Trail'],
  },
  {
    city: 'Gangtok',
    state: 'Sikkim',
    tagline: 'Kanchenjunga vistas, Buddhist prayer wheel monasteries & alpine momo stalls',
    heroImage: 'https://images.unsplash.com/photo-1627916607164-7b20241db935?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Mountains & Valleys',
    interests: ['Mountain Treks', 'Sacred Ghats', 'Artisan Crafts'],
    baseCostPerDay: 4700,
    paceFit: ['Balanced', 'Packed'],
    minDays: 4,
    maxDays: 6,
    highlights: ['Rumtek Monastery Chantings', 'MG Marg Evening Strolls', 'Tsomgo Glacial Lake Pass'],
  },
  {
    city: 'Leh',
    state: 'Ladakh',
    tagline: 'Trans-Himalayan high passes, stupa cliff sanctuaries & barley tsampa tea',
    heroImage: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Mountains & Valleys',
    interests: ['Mountain Treks', 'Sacred Ghats', 'Offbeat Villages'],
    baseCostPerDay: 6200,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 5,
    maxDays: 8,
    highlights: ['Thiksey Monastery Sunrise Prayers', 'Pangong Tso Turquoise Waters', 'Khardung La Altitude Pass'],
  },
  {
    city: 'Jaisalmer',
    state: 'Rajasthan',
    tagline: 'Golden sandstone living fort, Thar desert camel caravans & folk manganiyar music',
    heroImage: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Royal & Heritage Cities',
    interests: ['Royal Forts', 'Offbeat Villages', 'Artisan Crafts'],
    baseCostPerDay: 4300,
    paceFit: ['Balanced', 'Packed'],
    minDays: 3,
    maxDays: 5,
    highlights: ['Sonar Qila Living Fort Walk', 'Sam Sand Dunes Campfire Stargazing', 'Patwon Ki Haveli Jharokhas'],
  },
  {
    city: 'Mysuru',
    state: 'Karnataka',
    tagline: 'Illuminated Wodeyar palaces, sandalwood perfume bazaars & silk sari weavers',
    heroImage: 'https://images.unsplash.com/photo-1600100397608-f010f4439c27?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Royal & Heritage Cities',
    interests: ['Royal Forts', 'Artisan Crafts', 'Street Gastronomy'],
    baseCostPerDay: 3700,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 2,
    maxDays: 4,
    highlights: ['Mysore Palace Grand Illumination', 'Devaraja Market Fragrance Tour', 'KSIC Pure Mulberry Silk Looms'],
  },
  {
    city: 'Amritsar',
    state: 'Punjab',
    tagline: 'Golden Temple sanctum, community langar kitchens & Wagah border pageantry',
    heroImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Spiritual & River Ghats',
    interests: ['Sacred Ghats', 'Street Gastronomy', 'Royal Forts'],
    baseCostPerDay: 3300,
    paceFit: ['Balanced', 'Packed'],
    minDays: 2,
    maxDays: 4,
    highlights: ['Sri Harmandir Sahib Night Palki', 'Guru Ka Langar Seva Hall', 'Kulcha Land Amritsari Breakfast'],
  },
  {
    city: 'Coorg (Kodagu)',
    state: 'Karnataka',
    tagline: 'Western Ghats coffee estates, cardamom rain forests & Kodava martial feasts',
    heroImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Mountains & Valleys',
    interests: ['Mountain Treks', 'Coastal Cafes', 'Offbeat Villages'],
    baseCostPerDay: 4600,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 3,
    maxDays: 5,
    highlights: ['Private Arabica Coffee Plantation Walks', 'Abbey Falls Forest Gorges', 'Traditional Pandi Curry Hearths'],
  },
  {
    city: 'Alleppey (Alappuzha)',
    state: 'Kerala',
    tagline: 'Venice of the East backwater canals, coir weaving guilds & toddy shop seafood',
    heroImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Coastal & Backwaters',
    interests: ['Coastal Cafes', 'Artisan Crafts', 'Offbeat Villages'],
    baseCostPerDay: 5200,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 2,
    maxDays: 4,
    highlights: ['Vembanad Lake Houseboat Cruise', 'Kuttanad Below-Sea Farming', 'Coir Yarn Village Looms'],
  },
  {
    city: 'Mahabaleshwar & Panchgani',
    state: 'Maharashtra',
    tagline: 'Sahyadri tablelands, strawberry farm trails & mist-clad British colonial points',
    heroImage: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?auto=format&fit=crop&w=1200&q=80',
    terrain: 'Mountains & Valleys',
    interests: ['Mountain Treks', 'Street Gastronomy', 'Royal Forts'],
    baseCostPerDay: 3900,
    paceFit: ['Relaxed', 'Balanced'],
    minDays: 2,
    maxDays: 4,
    highlights: ['Pratapgad Maratha Fort Citadel', 'Venna Lake Boating Corridors', 'Fresh Strawberry & Cream Tastings'],
  },
];

export interface SynergyRadarMetrics {
  readyCount: number;
  totalExpected: number;
  readinessPercentage: number;
  groupSweetSpotBudget: number;
  minBudget: number;
  medianBudget: number;
  medianDays: number;
  topSharedInterests: string[];
  groupSynergyScore: number;
}

/**
 * Computes telemetry and sweet-spot metrics for the crew radar.
 */
export function computeCrewSynergyMetrics(
  members: GroupMember[],
  expectedCount: number
): SynergyRadarMetrics {
  const readyMembers = members.filter((m) => m.status === 'ready' && m.quizAnswers);
  const readyCount = readyMembers.length;
  const totalExpected = Math.max(readyCount, expectedCount || 2);
  const readinessPercentage = Math.round((readyCount / totalExpected) * 100);

  if (readyCount === 0) {
    return {
      readyCount: 0,
      totalExpected,
      readinessPercentage: 0,
      groupSweetSpotBudget: 25000,
      minBudget: 20000,
      medianBudget: 25000,
      medianDays: 4,
      topSharedInterests: ['Artisan Crafts', 'Street Gastronomy'],
      groupSynergyScore: 75,
    };
  }

  // Budgets
  const budgets = readyMembers.map((m) => m.quizAnswers!.budgetPerPerson).sort((a, b) => a - b);
  const minBudget = budgets[0];
  const midIndex = Math.floor(budgets.length / 2);
  const medianBudget =
    budgets.length % 2 === 0 ? Math.round((budgets[midIndex - 1] + budgets[midIndex]) / 2) : budgets[midIndex];

  // Sweet spot: 65% weight on min budget, 35% on median budget
  const groupSweetSpotBudget = Math.round(0.65 * minBudget + 0.35 * medianBudget);

  // Median Days
  const daysList = readyMembers.map((m) => m.quizAnswers!.tripDays).sort((a, b) => a - b);
  const medianDays = daysList[Math.floor(daysList.length / 2)] || 4;

  // Shared Interests count
  const interestCounts: Record<string, number> = {};
  readyMembers.forEach((m) => {
    m.quizAnswers?.interests.forEach((item) => {
      interestCounts[item] = (interestCounts[item] || 0) + 1;
    });
  });

  const sortedInterests = Object.entries(interestCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);

  const topSharedInterests = sortedInterests.slice(0, 3);

  // Group Synergy Score based on interest agreement & pace overlap
  let interestAgreementSum = 0;
  topSharedInterests.forEach((int) => {
    interestAgreementSum += (interestCounts[int] || 0) / readyCount;
  });
  const avgInterestOverlap = topSharedInterests.length > 0 ? interestAgreementSum / topSharedInterests.length : 0.7;

  // Pace agreement
  const paceCounts: Record<string, number> = {};
  readyMembers.forEach((m) => {
    const p = m.quizAnswers!.pace;
    paceCounts[p] = (paceCounts[p] || 0) + 1;
  });
  const maxPaceAgreement = Math.max(...Object.values(paceCounts)) / readyCount;

  const rawSynergy = Math.round((avgInterestOverlap * 0.65 + maxPaceAgreement * 0.35) * 100);
  const groupSynergyScore = Math.min(98, Math.max(68, rawSynergy));

  return {
    readyCount,
    totalExpected,
    readinessPercentage,
    groupSweetSpotBudget,
    minBudget,
    medianBudget,
    medianDays,
    topSharedInterests,
    groupSynergyScore,
  };
}

/**
 * Pure, deterministic synthesis engine that scores candidate hubs
 * across all ready group members.
 */
export function synthesizeGroupRecommendations(
  members: GroupMember[],
  expectedCount: number = 4,
  cardVotes?: Record<string, { upvotedByMemberIds: string[]; vetoedByMemberIds: string[] }>
): GroupRecommendationCard[] {
  const readyMembers = members.filter((m) => m.status === 'ready' && m.quizAnswers);

  // If no members are ready yet, return an initial curated showcase with mock readiness notes
  if (readyMembers.length === 0) {
    return INDIAN_CULTURAL_HUBS.slice(0, 8).map((hub) => ({
      city: hub.city,
      state: hub.state,
      tagline: hub.tagline,
      heroImage: hub.heroImage,
      matchScore: 88,
      recommendedForMemberIds: [],
      recommendedForMemberNames: [],
      estimatedCostPerPerson: hub.baseCostPerDay * 4,
      financialFitLabel: 'Waiting for crew members to submit budgets',
      financialFitStatus: 'comfortable',
      sharedHighlights: hub.highlights,
      upvotedByMemberIds: cardVotes?.[hub.city]?.upvotedByMemberIds || [],
      vetoedByMemberIds: cardVotes?.[hub.city]?.vetoedByMemberIds || [],
    }));
  }

  const { medianDays } = computeCrewSynergyMetrics(members, expectedCount);

  const scoredCards: GroupRecommendationCard[] = INDIAN_CULTURAL_HUBS.map((hub) => {
    const recommendedForMemberIds: string[] = [];
    const recommendedForMemberNames: string[] = [];
    const memberAffinityScores: number[] = [];
    const matchingReasons: string[] = [];

    // 1. Evaluate affinity for each ready member
    readyMembers.forEach((m) => {
      const answers = m.quizAnswers!;

      // Factor 1: Interest Overlap (35%)
      const interestMatches = answers.interests.filter((i) => hub.interests.includes(i));
      const interestRatio = answers.interests.length > 0 ? interestMatches.length / answers.interests.length : 0.5;
      const interestScore = Math.min(100, interestRatio * 115);

      // Factor 2: Terrain Preference (25%)
      let terrainScore = 20;
      if (answers.terrainPreference === hub.terrain) {
        terrainScore = 100;
      } else if (
        (answers.terrainPreference.includes('Royal') && hub.terrain.includes('Spiritual')) ||
        (answers.terrainPreference.includes('Spiritual') && hub.terrain.includes('Royal'))
      ) {
        terrainScore = 60;
      } else if (
        (answers.terrainPreference.includes('Coastal') && hub.terrain.includes('Spiritual')) ||
        (answers.terrainPreference.includes('Mountains') && hub.terrain.includes('Offbeat'))
      ) {
        terrainScore = 45;
      }

      // Factor 3: Budget Fit (25%)
      const estimatedCost = hub.baseCostPerDay * (answers.tripDays || medianDays);
      let budgetScore = 70;
      if (answers.budgetPerPerson >= estimatedCost) {
        const surplus = answers.budgetPerPerson - estimatedCost;
        budgetScore = Math.min(100, 85 + (surplus / answers.budgetPerPerson) * 15);
      } else {
        const deficit = estimatedCost - answers.budgetPerPerson;
        budgetScore = Math.max(20, 85 - (deficit / answers.budgetPerPerson) * 140);
      }

      // Factor 4: Pace & Duration Fit (15%)
      const paceScore = hub.paceFit.includes(answers.pace) ? 100 : 55;
      const durationScore =
        answers.tripDays >= hub.minDays && answers.tripDays <= hub.maxDays ? 100 : 65;
      const paceDurationScore = (paceScore + durationScore) / 2;

      // Weighted total affinity score (0 to 100)
      const affinity = Math.round(
        interestScore * 0.35 +
          terrainScore * 0.25 +
          budgetScore * 0.25 +
          paceDurationScore * 0.15
      );

      memberAffinityScores.push(affinity);

      // Threshold check: Recommended if affinity >= 62
      if (affinity >= 62) {
        recommendedForMemberIds.push(m.id);
        recommendedForMemberNames.push(answers.memberName || m.name);

        if (interestMatches.length > 0) {
          matchingReasons.push(`${answers.memberName || m.name}'s ${interestMatches[0]}`);
        }
      }
    });

    // 2. Whole-Group Consensus Score Calculation
    const avgAffinity =
      memberAffinityScores.length > 0
        ? memberAffinityScores.reduce((acc, curr) => acc + curr, 0) / memberAffinityScores.length
        : 70;

    const memberCoverageRatio =
      readyMembers.length > 0 ? recommendedForMemberNames.length / readyMembers.length : 0.5;

    const consensusScore = Math.min(
      99,
      Math.max(55, Math.round(avgAffinity * 0.82 + memberCoverageRatio * 18))
    );

    // 3. Estimated Cost for Group Median Days
    const estimatedCostPerPerson = hub.baseCostPerDay * medianDays;

    // 4. Budget Sweet-Spot & Financial Fit Evaluation
    const fittingMembers = readyMembers.filter(
      (m) => (m.quizAnswers?.budgetPerPerson || 0) >= estimatedCostPerPerson
    );
    const stretchedMembers = readyMembers.filter(
      (m) => (m.quizAnswers?.budgetPerPerson || 0) < estimatedCostPerPerson
    );

    let financialFitStatus: 'comfortable' | 'moderate_stretch' | 'high_stretch' = 'comfortable';
    let financialFitLabel = `Fits All ${readyMembers.length}/${readyMembers.length} Budgets Comfortably`;

    if (stretchedMembers.length > 0) {
      let maxDeficit = 0;
      stretchedMembers.forEach((m) => {
        const diff = estimatedCostPerPerson - (m.quizAnswers?.budgetPerPerson || 0);
        if (diff > maxDeficit) maxDeficit = diff;
      });

      financialFitStatus = maxDeficit > 6500 ? 'high_stretch' : 'moderate_stretch';
      financialFitLabel = `Fits ${fittingMembers.length}/${readyMembers.length} Budgets · Stretches ${
        stretchedMembers.length
      } by ~₹${Math.round(maxDeficit).toLocaleString('en-IN')}`;
    }

    // Dynamic shared highlights with crew context
    const dynamicHighlights = [...hub.highlights];
    if (matchingReasons.length > 0) {
      dynamicHighlights.unshift(`Matches ${matchingReasons.slice(0, 2).join(' + ')}`);
    }

    return {
      city: hub.city,
      state: hub.state,
      tagline: hub.tagline,
      heroImage: hub.heroImage,
      matchScore: consensusScore,
      recommendedForMemberIds,
      recommendedForMemberNames,
      estimatedCostPerPerson,
      financialFitLabel,
      financialFitStatus,
      sharedHighlights: dynamicHighlights,
      upvotedByMemberIds: cardVotes?.[hub.city]?.upvotedByMemberIds || [],
      vetoedByMemberIds: cardVotes?.[hub.city]?.vetoedByMemberIds || [],
    };
  });

  // Sort descending by consensus match score, member match coverage, and upvotes
  return scoredCards.sort((a, b) => {
    // Veto penalty
    const aVetoPenalty = a.vetoedByMemberIds.length * 15;
    const bVetoPenalty = b.vetoedByMemberIds.length * 15;

    // Upvote bonus
    const aUpvoteBonus = a.upvotedByMemberIds.length * 5;
    const bUpvoteBonus = b.upvotedByMemberIds.length * 5;

    const aEffectiveScore = a.matchScore + aUpvoteBonus - aVetoPenalty;
    const bEffectiveScore = b.matchScore + bUpvoteBonus - bVetoPenalty;

    if (b.recommendedForMemberNames.length !== a.recommendedForMemberNames.length) {
      return b.recommendedForMemberNames.length - a.recommendedForMemberNames.length;
    }
    return bEffectiveScore - aEffectiveScore;
  });
}
