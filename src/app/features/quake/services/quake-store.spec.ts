import { TestBed } from '@angular/core/testing';

import { QuakeStore } from './quake-store';
import { QuakeApi } from './quake-api';
import { Observable, of } from 'rxjs';
import { Quake } from '../../../shared/models/quake.models';
class QuakeApiStub {
  loadAll(): Observable<Quake[]> {
    return of([
      {
        id: 'ga2026mudirw',
        place: 'N of Minyerri, NT',
        magnitude: 2.678,
        time: Date.now() - 129600,
        lng: 134.019,
        lat: -14.504,
        depth: 17.46,
        magnitudeType: 'MLa',
        inAustralia: true,
        feltReportUrl: 'https://earthquakes.ga.gov.au/feltreport/ga2026mudirw'
      },
      {
        id: 'ga2026nhalgc',
        place: 'outh of Kermadec Islands',
        magnitude: 4.97096996303719,
        time: Date.now() - 172800,
        lng: -177.96400452,
        lat: -33.44377518,
        depth: 10,
        magnitudeType: 'mb',
        inAustralia: false,
        feltReportUrl: 'https://earthquakes.ga.gov.au/feltreport/ga2026nhalgc'
      }
    ]);
  }
}

describe('QuakeStore', () => {
  let service: QuakeStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: QuakeApi, useClass: QuakeApiStub }]
    });
    service = TestBed.inject(QuakeStore);
  });

  it('should filter quakes with magnitude less than 3', () => {
    service.filters.set({ minMag: 3, sinceHours: 168 });
    const visible = service.visibleQuakes();
    expect(visible.length).toBe(1);
    expect(visible[0].id).toBe('ga2026nhalgc');
  });

  it('should filter quakes with magnitude less than 1', () => {
    service.filters.set({ minMag: 1, sinceHours: 168 });
    const visible = service.visibleQuakes();
    expect(visible.length).toBe(2);
    expect(visible.map(q => q.id)).toEqual(['ga2026mudirw', 'ga2026nhalgc']);
  });
});
