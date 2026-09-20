import { Experience } from '../../types';
import { POPULAR_CITIES_PLACES } from './popularCitiesData';
import { NORTH_REGIONAL_PLACES } from './northPlacesData';
import { SOUTH_REGIONAL_PLACES } from './southPlacesData';
import { WEST_REGIONAL_PLACES } from './westPlacesData';
import { EAST_REGIONAL_PLACES } from './eastPlacesData';
import { CENTRAL_REGIONAL_PLACES } from './centralPlacesData';
import { INDIAN_STATES_AND_CITIES, POPULAR_CITIES_LIST, StateCityInfo } from './statesData';

export { INDIAN_STATES_AND_CITIES, POPULAR_CITIES_LIST };
export type { StateCityInfo };

export const ALL_LOKIVA_PLACES: Experience[] = [
  ...POPULAR_CITIES_PLACES,
  ...NORTH_REGIONAL_PLACES,
  ...SOUTH_REGIONAL_PLACES,
  ...WEST_REGIONAL_PLACES,
  ...EAST_REGIONAL_PLACES,
  ...CENTRAL_REGIONAL_PLACES,
];

// O(1) indexed lookup tables for instant UI filtering
const PLACES_BY_CITY = new Map<string, Experience[]>();
const PLACES_BY_STATE = new Map<string, Experience[]>();

for (const place of ALL_LOKIVA_PLACES) {
  const cityKey = place.city.toLowerCase().trim();
  if (!PLACES_BY_CITY.has(cityKey)) {
    PLACES_BY_CITY.set(cityKey, []);
  }
  PLACES_BY_CITY.get(cityKey)!.push(place);

  if (place.state) {
    const stateKey = place.state.toLowerCase().trim();
    if (!PLACES_BY_STATE.has(stateKey)) {
      PLACES_BY_STATE.set(stateKey, []);
    }
    PLACES_BY_STATE.get(stateKey)!.push(place);
  }
}

export function getPlacesByCity(city: string): Experience[] {
  if (!city) return [];
  const key = city.toLowerCase().trim();
  return PLACES_BY_CITY.get(key) || [];
}

export function getPlacesByState(state: string): Experience[] {
  if (!state) return [];
  const key = state.toLowerCase().trim();
  return PLACES_BY_STATE.get(key) || [];
}

export function getPopularPlaces(): Experience[] {
  return POPULAR_CITIES_PLACES;
}

export function searchAllPlaces(query: string, limit = 50): Experience[] {
  if (!query || !query.trim()) return ALL_LOKIVA_PLACES.slice(0, limit);
  const q = query.toLowerCase().trim();
  const matched: Experience[] = [];
  for (const place of ALL_LOKIVA_PLACES) {
    if (
      place.title.toLowerCase().includes(q) ||
      place.city.toLowerCase().includes(q) ||
      (place.state && place.state.toLowerCase().includes(q)) ||
      (place.area_name && place.area_name.toLowerCase().includes(q)) ||
      (place.category && place.category.toLowerCase().includes(q)) ||
      (place.tagline && place.tagline.toLowerCase().includes(q)) ||
      (place.tags && place.tags.some((t) => t.toLowerCase().includes(q)))
    ) {
      matched.push(place);
      if (matched.length >= limit) break;
    }
  }
  return matched;
}
