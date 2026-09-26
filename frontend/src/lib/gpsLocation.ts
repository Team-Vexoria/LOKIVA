import { api } from './api';

export interface LiveLocationResult {
  latitude: number;
  longitude: number;
  city: string;
  state?: string;
  locality?: string;
  fullLocationString: string;
  source: 'gps' | 'ip' | 'fallback';
}

/**
 * Resolves user live location using browser HTML5 Geolocation API,
 * with multi-tier reverse geocoding (LOKIVA backend -> BigDataCloud -> Nominatim -> IP fallback).
 */
export async function getUserLiveLocation(): Promise<LiveLocationResult> {
  // Step 1: Attempt HTML5 Geolocation API
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 30000,
        });
      });

      const { latitude, longitude } = position.coords;
      const reverseResult = await reverseGeocodeCoordinates(latitude, longitude);

      return {
        latitude,
        longitude,
        city: reverseResult.city,
        state: reverseResult.state,
        locality: reverseResult.locality,
        fullLocationString: reverseResult.fullLocationString,
        source: 'gps',
      };
    } catch (gpsError: any) {
      console.warn('HTML5 Geolocation unavailable or denied, attempting IP-based live fallback:', gpsError?.message);
    }
  }

  // Step 2: Client IP Geolocation Fallback if GPS is blocked or timed out
  try {
    const ipRes = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
    if (ipRes.ok) {
      const data = await ipRes.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Delhi';
      const state = data.principalSubdivision || data.countryName || 'India';
      const locality = data.locality || city;

      return {
        latitude: data.latitude || 28.6139,
        longitude: data.longitude || 77.2090,
        city,
        state,
        locality,
        fullLocationString: `${city}, ${state}`,
        source: 'ip',
      };
    }
  } catch (ipError) {
    console.warn('IP location fallback failed:', ipError);
  }

  // Step 3: Default fallback
  return {
    latitude: 28.6139,
    longitude: 77.2090,
    city: 'Delhi',
    state: 'India',
    locality: 'Connaught Place',
    fullLocationString: 'Delhi, India',
    source: 'fallback',
  };
}

async function reverseGeocodeCoordinates(latitude: number, longitude: number): Promise<{
  city: string;
  state?: string;
  locality?: string;
  fullLocationString: string;
}> {
  // Tier 1: Try LOKIVA backend nearest destination search
  try {
    const nearbyRes = await api.getNearbyDestinations(latitude, longitude, 300);
    if (nearbyRes?.nearest_city?.name) {
      const cityName = nearbyRes.nearest_city.name;
      const stateName = nearbyRes.nearest_city.state_name || nearbyRes.nearest_city.state_code;
      return {
        city: cityName,
        state: stateName,
        locality: nearbyRes.nearest_city.tagline || cityName,
        fullLocationString: stateName ? `${cityName}, ${stateName}` : `${cityName}, India`,
      };
    }
  } catch (err) {
    console.warn('Backend nearby check bypassed:', err);
  }

  // Tier 2: Try BigDataCloud reverse geocode client API
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || 'Delhi';
      const state = data.principalSubdivision || data.countryName || 'India';
      const locality = data.locality || city;
      return {
        city,
        state,
        locality,
        fullLocationString: `${city}, ${state}`,
      };
    }
  } catch (err) {
    console.warn('BigDataCloud reverse geocode failed, trying Nominatim:', err);
  }

  // Tier 3: Try OpenStreetMap Nominatim reverse geocode
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.suburb || addr.state_district || 'Delhi';
      const state = addr.state || addr.country || 'India';
      const locality = addr.suburb || addr.neighbourhood || city;
      return {
        city,
        state,
        locality,
        fullLocationString: `${city}, ${state}`,
      };
    }
  } catch (err) {
    console.warn('Nominatim reverse geocode failed:', err);
  }

  return {
    city: 'Current Location',
    state: 'India',
    locality: 'Detected Area',
    fullLocationString: `${latitude.toFixed(3)}°N, ${longitude.toFixed(3)}°E`,
  };
}
