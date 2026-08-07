import { GaFeature, GaFeatureCollection } from './ga-feed';

export const kermadecIslands: GaFeature = {
  geometry: {
    coordinates: [-177.96400452, -33.44377518],
  },
  properties: {
    event_id: 'ga2026nhalgc',
    description: 'South of Kermadec Islands',
    preferred_magnitude: 4.97096996303719,
    preferred_magnitude_type: 'mb',
    origin_time: '2026-07-06T19:10:44.334Z',
    depth: 10,
    located_in_australia: 'N',
    felt_report_url: 'https://earthquakes.ga.gov.au/feltreport/ga2026nhalgc',
  },
};

export const georgetown: GaFeature = {
  geometry: {
    coordinates: [138.80341358, -33.41130137],
  },
  properties: {
    event_id: 'ga2026nhivas',
    description: '7 km SE of Georgetown, SA',
    preferred_magnitude: 1.62409707530464,
    preferred_magnitude_type: 'MLa075',
    origin_time: '2026-07-06T23:21:39.987Z',
    depth: 1.64966666698456,
    located_in_australia: 'Y',
    felt_report_url: 'https://earthquakes.ga.gov.au/feltreport/ga2026nhivas',
  },
};

export const marbleBar: GaFeature = {
  geometry: { coordinates: [119.74, -21.17] },
  properties: {
    event_id: 'ga2026paxkuj',
    description: 'Marble Bar, WA',
    preferred_magnitude: 4.6,
    preferred_magnitude_type: 'MLa',
    origin_time: '2026-07-30T07:02:00Z',
    depth: 10,
    located_in_australia: 'Y',
    felt_report_url: 'https://earthquakes.ga.gov.au/event/ga2026paxkuj',
  },
};

export const boulia: GaFeature = {
  geometry: { coordinates: [139.91, -22.91] },
  properties: {
    event_id: 'ga2026qbmwrt',
    description: 'Boulia, QLD',
    preferred_magnitude: 2.1,
    preferred_magnitude_type: 'ML',
    origin_time: '2026-08-02T08:00:00Z',
    depth: 3,
    located_in_australia: 'Y',
    felt_report_url: 'https://earthquakes.ga.gov.au/event/ga2026qbmwrt',
  },
};

export const bandaSea: GaFeature = {
  geometry: { coordinates: [129.85, -6.75] },
  properties: {
    event_id: 'ga2026qcnzvy',
    description: 'Banda Sea',
    preferred_magnitude: 6.2,
    preferred_magnitude_type: 'Mww',
    origin_time: '2026-08-03T01:43:00Z',
    depth: 130,
    located_in_australia: 'N',
    felt_report_url: 'https://earthquakes.ga.gov.au/event/ga2026qcnzvy',
  },
};

export const featuresCollection: GaFeatureCollection = {
  features: [kermadecIslands, georgetown, marbleBar, boulia, bandaSea],
};
