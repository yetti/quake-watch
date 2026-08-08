import { atLeastMagnitudeOf, withinHoursOf } from './quake-filters';
import { allQuakes, quakeWith } from './quake-list/quake-fixtures';

const NOW = Date.parse('2026-08-03T02:00:00Z');
const HOUR = 3_600_000;

describe('withinHoursOf', () => {
  it('excludes quakes older than the limit', () => {
    const lastFourHours = { label: 'Last 4 hours', max: 4 };

    const olderQuake = quakeWith({ id: 'older', time: NOW - 4 * HOUR - 1 });
    const borderlineQuake = quakeWith({ id: 'borderline', time: NOW - 4 * HOUR });
    const quakes = [borderlineQuake, olderQuake].filter((q) =>
      withinHoursOf(q, lastFourHours, NOW),
    );

    expect(quakes.map((q) => q.id)).toEqual(['borderline']);
  });

  it('excludes quakes at least 24 hours old', () => {
    const last24Hours = { label: 'Last 24 hours', max: 24 };
    const recent = allQuakes.filter((q) => withinHoursOf(q, last24Hours, NOW));

    expect(recent.map((q) => q.id)).toEqual(['ga2026qbmwrt', 'ga2026qcnzvy']);
  });

  it('includes all when limit is null', () => {
    const quakes = allQuakes.filter((q) => withinHoursOf(q, null, NOW));

    expect(quakes.map((q) => q.id)).toEqual([
      'ga2026nhalgc',
      'ga2026nhivas',
      'ga2026paxkuj',
      'ga2026qbmwrt',
      'ga2026qcnzvy',
    ]);
  });
});

describe('atLeastMagnitudeOf', () => {
  it('excludes quakes less than the limit', () => {
    const atLeast5 = { label: '5+', min: 5 };

    const borderlineQuake = quakeWith({ id: 'borderline', magnitude: 5 });
    const smallerQuake = quakeWith({ id: 'smaller', magnitude: 4.999 });
    const quakes = [borderlineQuake, smallerQuake].filter((q) => atLeastMagnitudeOf(q, atLeast5));

    expect(quakes.map((q) => q.id)).toEqual(['borderline']);
  });

  it('excludes quakes less than 2.5 magnitude', () => {
    const atLeast2_5 = { label: '2.5+', min: 2.5 };
    const quakes = allQuakes.filter((q) => atLeastMagnitudeOf(q, atLeast2_5));

    expect(quakes.map((q) => q.id)).toEqual(['ga2026nhalgc', 'ga2026paxkuj', 'ga2026qcnzvy']);
  });

  it('includes all when limit is null', () => {
    const quakes = allQuakes.filter((q) => atLeastMagnitudeOf(q, null));

    expect(quakes.map((q) => q.id)).toEqual([
      'ga2026nhalgc',
      'ga2026nhivas',
      'ga2026paxkuj',
      'ga2026qbmwrt',
      'ga2026qcnzvy',
    ]);
  });
});
