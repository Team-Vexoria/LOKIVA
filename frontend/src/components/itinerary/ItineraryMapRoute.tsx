import React, { useMemo } from 'react';

export interface RouteStop {
  lat: number;
  lng: number;
  title?: string;
  id?: number;
}

/**
 * Generates smooth quadratic Bézier curved arc points between sequential stops.
 * Paths bow outward gracefully by ~9% perpendicular to the chord line,
 * simulating natural aerial transit corridors rather than straight rigid lines.
 */
export function generateCurvedFlightArc(
  stops: RouteStop[],
  segmentsPerHop = 16
): [number, number][] {
  if (stops.length < 2) return [];

  const arcPoints: [number, number][] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const p1 = stops[i];
    const p2 = stops[i + 1];

    const dLat = p2.lat - p1.lat;
    const dLng = p2.lng - p1.lng;
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);

    if (dist < 0.0001) {
      if (i === 0) arcPoints.push([p1.lat, p1.lng]);
      continue;
    }

    // Midpoint between coordinates
    const midLat = (p1.lat + p2.lat) / 2;
    const midLng = (p1.lng + p2.lng) / 2;

    // Subtle natural curved bow offset perpendicular to the transit corridor (~9%)
    const curvature = 0.09;
    const ctrlLat = midLat - dLng * curvature;
    const ctrlLng = midLng + dLat * curvature;

    // Quadratic Bézier interpolation
    const startIndex = i === 0 ? 0 : 1;
    for (let step = startIndex; step <= segmentsPerHop; step++) {
      const t = step / segmentsPerHop;
      const oneMinusT = 1 - t;
      const lat =
        oneMinusT * oneMinusT * p1.lat +
        2 * oneMinusT * t * ctrlLat +
        t * t * p2.lat;
      const lng =
        oneMinusT * oneMinusT * p1.lng +
        2 * oneMinusT * t * ctrlLng +
        t * t * p2.lng;
      arcPoints.push([lat, lng]);
    }
  }

  return arcPoints;
}

export interface AnimatedTransitCorridorProps {
  stops: RouteStop[];
}

export function AnimatedTransitCorridor({ stops }: AnimatedTransitCorridorProps) {
  const curvedPositions = useMemo(() => generateCurvedFlightArc(stops), [stops]);

  if (curvedPositions.length < 2) return null;

  return null;
}
