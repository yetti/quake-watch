// Marker encoding lookup tables — see docs/adr/0003-quake-map-marker-encoding.md
//
// Two ordered tables, resolved first-match-wins:
//   magnitude -> nominal radius (px)
//   age in hours -> shape + fill colour
//
// These are NOT the filter tables in shared/filter-limits.ts. Those are sparse and
// cumulative (for selecting quakes); these are exhaustive and disjoint (for classifying
// one quake into exactly one bucket). Do not merge them.

import { Quake } from '../../shared/quake';
import { MS_PER_HOUR } from './quake-filters';

export type MarkerShape = 'Circle' | 'Diamond' | 'Triangle';

export interface MapMarker {
  label: string;
  lowerBound: number;
}

export interface MagnitudeMarker extends MapMarker {
  radius: number;
  mapRadius: number;
}

export interface RecencyMarker extends MapMarker {
  shape: MarkerShape;
  fill: string;
}

export const MAGNITUDE_MARKERS: MagnitudeMarker[] = [
  {
    label: '9+',
    lowerBound: 9,
    radius: 80,
    mapRadius: 40,
  },
  {
    label: '8 - 8.9',
    lowerBound: 8,
    radius: 70,
    mapRadius: 35,
  },
  {
    label: '7 - 7.9',
    lowerBound: 7,
    radius: 60,
    mapRadius: 30,
  },
  {
    label: '6 - 6.9',
    lowerBound: 6,
    radius: 50,
    mapRadius: 25,
  },
  {
    label: '5 - 5.9',
    lowerBound: 5,
    radius: 40,
    mapRadius: 20,
  },
  {
    label: '4 - 4.9',
    lowerBound: 4,
    radius: 30,
    mapRadius: 15,
  },
  {
    label: '3 - 3.9',
    lowerBound: 3,
    radius: 20,
    mapRadius: 10,
  },
  {
    label: '< 3',
    lowerBound: 0,
    radius: 10,
    mapRadius: 5,
  },
];

export const RECENCY_MARKERS: RecencyMarker[] = [
  {
    label: 'Older',
    lowerBound: 24,
    shape: 'Circle',
    fill: '#F2D83C',
  },
  {
    label: 'Today',
    lowerBound: 4,
    shape: 'Diamond',
    fill: '#F29F03',
  },
  {
    label: 'Recent',
    lowerBound: 0,
    shape: 'Triangle',
    fill: '#F20203',
  },
];

export function radiusFor(magnitude: number): MagnitudeMarker | undefined {
  return MAGNITUDE_MARKERS.find((marker) => {
    return magnitude >= marker.lowerBound;
  });
}

export function recencyFor(quake: Quake, now: number): RecencyMarker | undefined {
  const hoursAgo = (now - quake.time) / MS_PER_HOUR;
  return RECENCY_MARKERS.find((marker) => {
    return hoursAgo >= marker.lowerBound;
  });
}

export type CircleGeometry = {
  shape: 'Circle';
  cx: number;
  cy: number;
  r: number;
  size: number;
};

export type PolygonGeometry = {
  shape: 'Diamond' | 'Triangle';
  points: [number, number][];
  size: number;
};

export type MarkerGeometry = CircleGeometry | PolygonGeometry;

export function buildShape(shape: 'Circle', radius: number): CircleGeometry;
export function buildShape(shape: 'Diamond' | 'Triangle', radius: number): PolygonGeometry;
export function buildShape(shape: MarkerShape, radius: number): MarkerGeometry;
export function buildShape(shape: MarkerShape, radius: number): MarkerGeometry {
  const size = Math.max(24, 2 * radius + 6);
  const center = size / 2;
  switch (shape) {
    case 'Circle':
      return {
        shape: 'Circle',
        cx: center,
        cy: center,
        r: radius,
        size: size,
      };
    case 'Diamond':
      return {
        shape: 'Diamond',
        // top, right, bottom, left
        points: [
          [center, center - radius],
          [center + radius, center],
          [center, center + radius],
          [center - radius, center],
        ],
        size: size,
      };
    case 'Triangle':
      return {
        shape: 'Triangle',
        // top, right, left
        points: [
          [center, center - radius],
          [center + (radius * Math.sqrt(3)) / 2, center + radius / 2],
          [center - (radius * Math.sqrt(3)) / 2, center + radius / 2],
        ],
        size: size,
      };
  }
}
