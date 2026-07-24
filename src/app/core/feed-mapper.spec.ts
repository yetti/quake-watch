import { mapFeatureToQuake } from './feed-mapper';
import { macquarie_islands, alice_springs } from './ga-feed-fixtures';

describe('mapFeatureToQuake', () => {
  it('parses origin_time to epoch millis', () => {
    const result = mapFeatureToQuake(macquarie_islands);
    expect(result.time).toEqual(1783365044334);
  });

  it('maps coordinates to [lng, lat]', () => {
    const result = mapFeatureToQuake(macquarie_islands);
    expect(result.lat).toEqual(-33.44377518);
    expect(result.lng).toEqual(-177.96400452);
  });

  it('normalizes located_in_australia "Y" to true', () => {
    const result2 = mapFeatureToQuake(alice_springs);
    expect(result2.inAustralia).toEqual(true);
  });

  it('normalizes located_in_australia "N" to false', () => {
    const result = mapFeatureToQuake(macquarie_islands);
    expect(result.inAustralia).toEqual(false);
  });
});
