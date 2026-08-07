import { Quake } from '../../../shared/quake';

/**
 * Domain-level counterparts to the raw feed fixtures in `core/ga-feed-fixtures.ts`.
 *
 * These are written as literals rather than produced by `mapFeatureToQuake` so that
 * component tests fail only for component reasons — a regression in the mapper should
 * surface in `feed-mapper.spec.ts`, not here.
 *
 * `time` values are `Date.parse(origin_time)` of the matching GA fixture.
 */

export const kermadecIslands: Quake = {
  id: 'ga2026nhalgc',
  place: 'South of Kermadec Islands',
  magnitude: 4.97096996303719,
  time: 1783365044334, // 2026-07-06T19:10:44.334Z
  lng: -177.96400452,
  lat: -33.44377518,
  depth: 10,
  magnitudeType: 'mb',
  inAustralia: false,
  feltReportUrl: 'https://earthquakes.ga.gov.au/feltreport/ga2026nhalgc',
};

export const georgetown: Quake = {
  id: 'ga2026nhivas',
  place: '7 km SE of Georgetown, SA',
  magnitude: 1.62409707530464,
  time: 1783380099987, // 2026-07-06T23:21:39.987Z
  lng: 138.80341358,
  lat: -33.41130137,
  depth: 1.64966666698456,
  magnitudeType: 'MLa075',
  inAustralia: true,
  feltReportUrl: 'https://earthquakes.ga.gov.au/feltreport/ga2026nhivas',
};

export const marbleBar: Quake = {
  id: 'ga2026paxkuj',
  place: 'Marble Bar, WA',
  magnitude: 4.6,
  time: 1785394920000, // 2026-07-30T07:02:00Z
  lng: 119.74,
  lat: -21.17,
  depth: 10,
  magnitudeType: 'MLa',
  inAustralia: true,
  feltReportUrl: 'https://earthquakes.ga.gov.au/event/ga2026paxkuj',
};

export const boulia: Quake = {
  id: 'ga2026qbmwrt',
  place: 'Boulia, QLD',
  magnitude: 2.1,
  time: 1785657600000, // 2026-08-02T08:00:00Z
  lng: 139.91,
  lat: -22.91,
  depth: 3,
  magnitudeType: 'ML',
  inAustralia: true,
  feltReportUrl: 'https://earthquakes.ga.gov.au/event/ga2026qbmwrt',
};

export const bandaSea: Quake = {
  id: 'ga2026qcnzvy',
  place: 'Banda Sea',
  magnitude: 6.2,
  time: 1785721380000, // 2026-08-03T01:43:00Z
  lng: 129.85,
  lat: -6.75,
  depth: 130,
  magnitudeType: 'Mww',
  inAustralia: false,
  feltReportUrl: 'https://earthquakes.ga.gov.au/event/ga2026qcnzvy',
};

/** Mirrors `featuresCollection` — same quakes, same order. */
export const allQuakes: Quake[] = [kermadecIslands, georgetown, marbleBar, boulia, bandaSea];
