import { TestBed } from '@angular/core/testing';

import { QuakeApi } from './quake-api';

describe('QuakeApi', () => {
  let service: QuakeApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuakeApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
