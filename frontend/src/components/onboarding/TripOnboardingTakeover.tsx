import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { DayPlanResponse } from '../../types';
import {
  DiscoveryOnboardingFlow,
  DiscoveryAnswers,
  DEFAULT_DISCOVERY_ANSWERS,
} from './DiscoveryOnboardingFlow';

export interface TripContextAnswers {
  city: string;
  timeWindow: string;
  timeHours: number;
  budgetCeiling: number;
  companions: string;
  interests: string[];
  foodPreference: string;
  foodNotes: string;
  mobility: string;
  isWheelchair: boolean;
  isLowWalking: boolean;
  vibe: string;
}

interface TripOnboardingTakeoverProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated?: (answers: TripContextAnswers, plan: DayPlanResponse) => void;
}

export function TripOnboardingTakeover({
  isOpen,
  onClose,
  onPlanGenerated,
}: TripOnboardingTakeoverProps) {
  const navigate = useNavigate();

  const handleComplete = async (answers: DiscoveryAnswers) => {
    const mappedAnswers: TripContextAnswers = {
      city: 'Jaipur',
      timeWindow: `${answers.days} Days`,
      timeHours: answers.days * 8,
      budgetCeiling: answers.budget_max_inr,
      companions: answers.group_type,
      interests: answers.interests,
      foodPreference: 'Pure Vegetarian',
      foodNotes: '',
      mobility: answers.accessibility.wheelchair
        ? 'wheelchair'
        : answers.accessibility.low_walking
        ? 'low_walking'
        : 'moderate',
      isWheelchair: answers.accessibility.wheelchair,
      isLowWalking: answers.accessibility.low_walking,
      vibe: answers.pace,
    };

    if (onPlanGenerated) {
      try {
        const payload = {
          destination: 'Jaipur',
          time_available: `${answers.days} Days`,
          budget: `₹${answers.budget_daily_inr}/day`,
          group_type: answers.group_type,
          interests: answers.interests,
          food_preferences: 'Pure Vegetarian',
          mobility: answers.accessibility.wheelchair
            ? 'Wheelchair Friendly'
            : answers.accessibility.low_walking
            ? 'Low Walking'
            : 'Moderate Walking',
          vibe: answers.pace,
        };

        const plan = await api.generateDayPlan(payload);
        onPlanGenerated(mappedAnswers, plan);
      } catch (err) {
        console.warn('Backend day plan generation paused, redirecting to discovery map:', err);
      }
    }

    onClose();
    navigate('/discovery-map');
  };

  return (
    <DiscoveryOnboardingFlow
      isOpen={isOpen}
      onClose={onClose}
      onComplete={handleComplete}
    />
  );
}

export { DiscoveryOnboardingFlow };
