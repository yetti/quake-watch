import { TestBed } from '@angular/core/testing';

import { QuakeStore } from './quake-store';

describe('QuakeStore', () => {
  let service: QuakeStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuakeStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
