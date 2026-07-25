import { TestBed } from '@angular/core/testing';
import { QuakeApi } from './quake-api';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApplicationRef } from '@angular/core';
import { environment } from '../../environments/environment';
import { featuresCollection } from './ga-feed-fixtures';

describe('QuakeApi', () => {
  let service: QuakeApi;
  let httpTesting: HttpTestingController;
  let appRef: ApplicationRef;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(QuakeApi);
    httpTesting = TestBed.inject(HttpTestingController);
    appRef = TestBed.inject(ApplicationRef);
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('loads and maps the Geoscience Australia Feed', async () => {
    TestBed.tick();

    const request = httpTesting.expectOne(environment.feedUrl, 'Request to load the quake data');
    request.flush(featuresCollection);

    await appRef.whenStable();

    const quakes = service.quakes();
    expect(quakes).toBeDefined();
    expect(quakes).toHaveLength(2);
    expect(quakes![0].id).toEqual('ga2026nhalgc');
    expect(quakes![0].inAustralia).toEqual(false);
    expect(quakes![0].time).toEqual(1783365044334);
    expect(quakes![1].id).toEqual('ga2026nhivas');
    expect(quakes![1].inAustralia).toEqual(true);
  });

  it('returns an empty array on system errors', async () => {
    TestBed.tick();

    const request = httpTesting.expectOne(environment.feedUrl, 'Request to load the quake data');
    request.flush('failed!', { status: 500, statusText: 'Internal Server Error' });

    await appRef.whenStable();

    expect(service.status()).toEqual('error');
    expect(service.error()).toBeDefined();
    expect(service.error()?.status).toEqual(500);

    expect(service.quakes()).toBeDefined();
    expect(service.quakes().length).toEqual(0);
  });

  it('returns an empty array for network errors', async () => {
    TestBed.tick();

    const request = httpTesting.expectOne(environment.feedUrl, 'Request to load the quake data');
    request.error(new ProgressEvent('network error'));

    await appRef.whenStable();

    expect(service.status()).toEqual('error');
    expect(service.error()).toBeDefined();
    expect(service.error()?.status).toEqual(0);

    expect(service.quakes()).toBeDefined();
    expect(service.quakes().length).toEqual(0);
  });

  it('returns an empty array while loading', async () => {
    TestBed.tick();

    expect(service.loading()).toEqual(true);

    const request = httpTesting.expectOne(environment.feedUrl, 'Request to load the quake data');
    request.flush(featuresCollection);

    await appRef.whenStable();
  });
});
