import React from 'react';
import { LandingHero } from '../home/LandingHero';

interface HeroScrollExperienceProps {
  onOpenPlanner?: () => void;
}

export function HeroScrollExperience({ onOpenPlanner }: HeroScrollExperienceProps) {
  return <LandingHero onOpenDiscovery={onOpenPlanner} />;
}

export default HeroScrollExperience;
