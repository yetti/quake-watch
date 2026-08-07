import { mapFeatureToQuake } from './feed-mapper';
import { georgetown, kermadecIslands } from './ga-feed-fixtures';

describe('mapFeatureToQuake', () => {
  it('parses origin_time to epoch millis', () => {
    const result = mapFeatureToQuake(kermadecIslands);
    expect(result.time).toEqual(1783365044334);
  });

  it('maps coordinates to [lng, lat]', () => {
    const result = mapFeatureToQuake(kermadecIslands);
    expect(result.lat).toEqual(-33.44377518);
    expect(result.lng).toEqual(-177.96400452);
  });

  it('normalizes located_in_australia "Y" to true', () => {
    const result2 = mapFeatureToQuake(georgetown);
    expect(result2.inAustralia).toEqual(true);
  });

  it('normalizes located_in_australia "N" to false', () => {
    const result = mapFeatureToQuake(kermadecIslands);
    expect(result.inAustralia).toEqual(false);
  });
});
