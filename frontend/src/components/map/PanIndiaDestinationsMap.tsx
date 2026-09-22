import React, { useState } from 'react';
import { InteractiveIndiaMap } from './InteractiveIndiaMap';
import { DEFAULT_JOURNEY_PREFERENCES } from '../../data/indiaStateMetadata';

export interface PanIndiaDestinationsMapProps {
  className?: string;
  selectedState?: any;
  onSelectState?: (state: any) => void;
  [key: string]: any;
}

export function PanIndiaDestinationsMap(props: PanIndiaDestinationsMapProps) {
  const [selectedState, setSelectedState] = useState(
    props.selectedState?.name || 'Rajasthan'
  );

  return (
    <InteractiveIndiaMap
      userPreferences={DEFAULT_JOURNEY_PREFERENCES}
      selectedState={selectedState}
      onSelectState={(st) => {
        setSelectedState(st);
        if (props.onSelectState) props.onSelectState({ name: st });
      }}
      className={props.className}
    />
  );
}

export default PanIndiaDestinationsMap;
