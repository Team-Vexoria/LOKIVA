import React from 'react';
import { City, State, Experience } from '../../types';
import { IndiaInteractiveMap } from './IndiaInteractiveMap';

export interface PanIndiaDestinationsMapProps {
  cities: City[];
  states?: State[];
  experiences?: Experience[];
  selectedCity?: City | null;
  selectedState?: State | null;
  userCoords?: { lat: number; lng: number } | null;
  onSelectCity?: (city: City) => void;
  onSelectState?: (state: State) => void;
  className?: string;
  initialRegion?: string;
}

export function PanIndiaDestinationsMap(props: PanIndiaDestinationsMapProps) {
  return <IndiaInteractiveMap {...props} />;
}

export default PanIndiaDestinationsMap;
