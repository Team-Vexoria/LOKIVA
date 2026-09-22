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

        let plan: DayPlanResponse;
        try {
          plan = await api.generateDayPlan(payload);
        } catch (err) {
          console.warn('Using client fallback plan for hero:', err);
          plan = {
            city: 'Jaipur',
            feasibility_score: 94,
            feasibility_summary: `Curated ${answers.days}-day route packed with living heritage and artisan ateliers.`,
            stops: [
              {
                order: 1,
                time: '09:30 AM',
                name: 'Hawa Mahal Palace Courtyards & Heritage Street View',
                duration_mins: 75,
                cost_label: '₹50 entry',
                fit_reason: 'Ground-floor courtyard access with seating, matches your pacing',
                match_notes: 'Verified step-free outer pavilion and heritage street tea stall',
              },
              {
                order: 2,
                time: '11:15 AM',
                name: 'Sanganer Master Hand-Block Printing Guild Atelier',
                duration_mins: 90,
                cost_label: '₹350 workshop fee',
                fit_reason: 'Hands-on natural dye printing with master Chiwda craftsmen',
                match_notes: 'Direct artisan studio with authentic vegetable pigments',
              },
              {
                order: 3,
                time: '01:00 PM',
                name: 'Laxmi Mishthan Bhandar (LMB) Heritage Ghewar Tasting',
                duration_mins: 60,
                cost_label: '₹300 tasting',
                fit_reason: 'Historic 1727 Johari Bazaar sweetshop, pure vegetarian royal sweets',
                match_notes: 'Famous paneer ghewar and royal Rajasthani spiced lassi',
              },
            ],
          };
        }
        onPlanGenerated(mappedAnswers, plan);
      } catch (outerErr) {
        console.warn('Plan generation error:', outerErr);
      }

      // Close modal and keep user on the current page to view their solved plan
      onClose();
      return;
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
