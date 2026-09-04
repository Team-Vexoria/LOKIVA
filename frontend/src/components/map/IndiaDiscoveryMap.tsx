import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { State, City, Experience } from '../../types';
import { IndiaInteractiveMap } from './IndiaInteractiveMap';

export interface IndiaDiscoveryMapProps {
  initialView?: 'all' | 'state' | 'city';
  onPlaceSelect?: (place: Experience) => void;
  enableZoom?: boolean;
  showControls?: boolean;
  className?: string;
}

export function IndiaDiscoveryMap({
  initialView = 'all',
  onPlaceSelect,
  className = '',
}: IndiaDiscoveryMapProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    Promise.all([
      api.getStates(),
      api.getCities({ limit: 150 }),
      api.getExperiences({ limit: 300 }),
    ])
      .then(([stData, ctData, expData]) => {
        setStates(stData || []);
        setCities(ctData || []);
        setExperiences(expData || []);
      })
      .catch((err) => console.error('Failed to load IndiaDiscoveryMap data:', err));
  }, []);

  return (
    <IndiaInteractiveMap
      states={states}
      cities={cities}
      experiences={experiences}
      className={className || 'h-full'}
      initialRegion={initialView === 'state' ? 'north' : 'all'}
    />
  );
}

export default IndiaDiscoveryMap;
