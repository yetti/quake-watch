import { GaFeature } from './ga-feed.models';
import { mapFeatureToQuake } from './ga-feed.mapper';

describe('mapFeatureToQuake', () => {
  let feature: GaFeature;
  let feature2: GaFeature;

  beforeEach(() => {
    feature = {
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
      }
    };
    feature2 = {
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
      }
    };
  });

  it('parses origin_time to epoch millis', () => {
    const result = mapFeatureToQuake(feature);
    expect(result.time).toEqual(1783365044334);
  });

  it('maps coordinates to [lng, lat]', () => {
    const result = mapFeatureToQuake(feature);
    expect(result.lat).toEqual(-33.44377518);
    expect(result.lng).toEqual(-177.96400452);
  });

  it('normalizes located_in_australia "Y" to true', () => {
    const result2 = mapFeatureToQuake(feature2);
    expect(result2.inAustralia).toEqual(true);
  });

  it('normalizes located_in_australia "N" to false', () => {
    const result = mapFeatureToQuake(feature);
    expect(result.inAustralia).toEqual(false);
  });
});
