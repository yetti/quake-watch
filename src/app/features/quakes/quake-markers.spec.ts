import { radiusFor, recencyFor, buildShape, markerHtml } from './quake-markers';
import { MS_PER_HOUR } from './quake-filters';
import { quakeWith } from './quake-list/quake-fixtures';

const NOW = Date.parse('2026-08-03T02:00:00Z');

describe('Quake Markers', () => {
  describe('radiusFor', () => {
    it('excludes quakes with negative magnitudes', () => {
      expect(radiusFor(-1)).toBeUndefined();
    });

    it("returns a label of '< 3' when magnitude is less than 3, but greater than 0", () => {
      const marker = radiusFor(2);
      expect(marker!.label).toEqual('< 3');
    });

    it("returns a label of '3 - 3.9' when magnitude is 3", () => {
      const marker = radiusFor(3);
      expect(marker!.label).toEqual('3 - 3.9');
    });

    it("returns a label of '3 - 3.9' when the magnitude is 3.999", () => {
      const marker = radiusFor(3.999);
      expect(marker!.label).toEqual('3 - 3.9');
    });

    it("returns a label of '9+' when the magnitude is 10", () => {
      const marker = radiusFor(10);
      expect(marker!.label).toEqual('9+');
    });
  });

  describe('recencyFor', () => {
    it('excludes quakes with negative hours ago', () => {
      const futureQuake = quakeWith({ id: 'future', time: NOW + 1 });
      const marker = recencyFor(futureQuake, NOW);
      expect(marker).toBeUndefined();
    });

    it("returns a label of 'Older' when the recency is more than 24 hours ago", () => {
      const quake = quakeWith({ id: 'older', time: NOW - 25 * MS_PER_HOUR });
      const marker = recencyFor(quake, NOW);
      expect(marker!.label).toEqual('Older');
    });

    it("returns a label of 'Today' when the recency is within 4 hours ago", () => {
      const quake = quakeWith({ id: 'today', time: NOW - 4 * MS_PER_HOUR });
      const marker = recencyFor(quake, NOW);
      expect(marker!.label).toEqual('Today');
    });

    it("returns a label of 'Recent' when the recency is less than 4 hours ago", () => {
      const quake = quakeWith({ id: 'recent', time: NOW - 3.999 * MS_PER_HOUR });
      const marker = recencyFor(quake, NOW);
      expect(marker!.label).toEqual('Recent');
    });
  });

  describe('buildShape', () => {
    it('renders a triangle with equal sides', () => {
      const dist = ([x1, y1]: [number, number], [x2, y2]: [number, number]) =>
        Math.hypot(x2 - x1, y2 - y1);

      const shape = buildShape('Triangle', 6);
      const [top, right, left] = shape.points;

      const topRight = dist(top, right);
      const topLeft = dist(top, left);
      const leftRight = dist(left, right);

      expect(topLeft).toBeCloseTo(topRight);
      expect(leftRight).toBeCloseTo(topRight);
    });

    it('pads out the size when less than 24', () => {
      const shape = buildShape('Triangle', 6);
      expect(shape.size).toEqual(24);
    });

    it('pads out the size by 3 pixels all around to account for the stroke', () => {
      const shape = buildShape('Circle', 9.5);
      expect(shape.size).toEqual(25);
    });
  });

  describe('markerHtml', () => {
    it('fills circles with the recency colour and fixed stroke', () => {
      const html = markerHtml(buildShape('Circle', 6), '#F20203');

      expect(html).toContain('fill="#F20203"');
      expect(html).toContain('stroke="#1C1C1C"');
      expect(html).toContain('stroke-width="1"');
      expect(html).toContain('<circle ');
    });

    it('fills polygons with the recency colour and rounded stroke joins', () => {
      const html = markerHtml(buildShape('Diamond', 6), '#F29F03');

      expect(html).toContain('fill="#F29F03"');
      expect(html).toContain('stroke="#1C1C1C"');
      expect(html).toContain('stroke-linejoin="round"');
      expect(html).toContain('<polygon ');
    });
  });
});
