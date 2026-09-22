import React, { useState } from 'react';
import { InteractiveIndiaMap } from './InteractiveIndiaMap';
import { DEFAULT_JOURNEY_PREFERENCES } from '../../data/indiaStateMetadata';

export interface IndiaDiscoveryMapProps {
  className?: string;
  onSelectState?: (stateName: string) => void;
}

export function IndiaDiscoveryMap({
  className = '',
  onSelectState,
}: IndiaDiscoveryMapProps) {
  const [selectedState, setSelectedState] = useState('Rajasthan');

  return (
    <InteractiveIndiaMap
      userPreferences={DEFAULT_JOURNEY_PREFERENCES}
      selectedState={selectedState}
      onSelectState={(st) => {
        setSelectedState(st);
        if (onSelectState) onSelectState(st);
      }}
      className={className}
    />
  );
}

export default IndiaDiscoveryMap;
