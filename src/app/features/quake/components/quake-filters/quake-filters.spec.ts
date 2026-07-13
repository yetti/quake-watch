import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuakeFilters } from './quake-filters';

describe('QuakeFilters', () => {
  let component: QuakeFilters;
  let fixture: ComponentFixture<QuakeFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuakeFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(QuakeFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
