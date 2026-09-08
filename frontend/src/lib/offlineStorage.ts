import { useState, useEffect } from 'react';
import { Experience } from '../types';

const OFFLINE_KEY = 'lokiva_offline_itinerary';

export interface CachedOfflineItinerary {
  meta: {
    title?: string;
    city?: string;
    cachedAt?: string;
    [key: string]: any;
  };
  experiences: Experience[];
}

export function saveActiveItineraryOffline(meta: any, experiences: Experience[]) {
  try {
    const payload: CachedOfflineItinerary = {
      meta: {
        ...meta,
        cachedAt: new Date().toISOString(),
      },
      experiences,
    };
    localStorage.setItem(OFFLINE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save itinerary to localStorage:', err);
  }
}

export function getOfflineItinerary(): CachedOfflineItinerary | null {
  try {
    const raw = localStorage.getItem(OFFLINE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read itinerary from localStorage:', err);
    return null;
  }
}

export function clearOfflineItinerary() {
  try {
    localStorage.removeItem(OFFLINE_KEY);
  } catch (err) {
    console.error('Failed to clear offline itinerary:', err);
  }
}

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
