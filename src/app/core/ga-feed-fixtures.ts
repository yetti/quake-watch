import { GaFeature, GaFeatureCollection } from './ga-feed';

export const macquarie_islands: GaFeature = {
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

export const alice_springs: GaFeature = {
  geometry: {
    coordinates: [-172.18708801, -16.79418182],
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

export const featuresCollection: GaFeatureCollection = {
  features: [macquarie_islands, alice_springs],
}
