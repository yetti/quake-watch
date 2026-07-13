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
        magnitude: 6.55,
        time: Date.now() - (36 * 60 * 60 * 1000),
        lng: 134.019,
        lat: -14.504,
        depth: 17.46,
        magnitudeType: 'MLa',
        inAustralia: true,
        feltReportUrl: 'https://earthquakes.ga.gov.au/feltreport/ga2026mudirw'
      },
      {
        id: 'ga2026nhalgc',
        place: 'South of Kermadec Islands',
        magnitude: 4.97096996303719,
        time: Date.now() - (48 * 60 * 60 * 1000),
        lng: -177.96400452,
        lat: -33.44377518,
        depth: 10,
        magnitudeType: 'mb',
        inAustralia: false,
        feltReportUrl: 'https://earthquakes.ga.gov.au/feltreport/ga2026nhalgc'
      },
      {
        id: 'ga2026nhivas',
        place: '7 km SE of Georgetown, SA',
        magnitude: 3,
        time: Date.now() - (48 * 60 * 60 * 1000),
        lng: 138.45024109,
        lat: -33.40748215,
        depth: 1.64966666698456,
        magnitudeType: 'MLa075',
        inAustralia: true,
        feltReportUrl: 'https://earthquakes.ga.gov.au/feltreport/ga2026nhivas'
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

  it('should filter out with magnitude less than 5', () => {
    service.filters.set({ minMag: 5, sinceHours: 168 });
    const visible = service.visibleQuakes();
    expect(visible.map(q => q.id)).toEqual(['ga2026mudirw']);
  })

  it('should filter out quakes with magnitude less than 4', () => {
    service.filters.set({ minMag: 4, sinceHours: 168 });
    const visible = service.visibleQuakes();
    expect(visible.map(q => q.id)).toEqual(['ga2026mudirw', 'ga2026nhalgc']);
  });

  it('should filter out quakes with a magnitude less than 3', () => {
    service.filters.set({ minMag: 3, sinceHours: 168 });
    const visible = service.visibleQuakes();
    expect(visible.map(q => q.id)).toEqual(['ga2026mudirw', 'ga2026nhalgc', 'ga2026nhivas']);
  });

  it('should filter quakes less than 50 hours ago', () => {
    service.filters.set({ minMag: 0, sinceHours: 50 });
    const visible = service.visibleQuakes();
    expect(visible.map(q => q.id)).toEqual(['ga2026mudirw', 'ga2026nhalgc', 'ga2026nhivas']);
  });

  it('should filter quakes less than 42 hours ago', () => {
    service.filters.set({ minMag: 0, sinceHours: 42 });
    const visible = service.visibleQuakes();
    expect(visible.map(q => q.id)).toEqual(['ga2026mudirw']);
  });
});
