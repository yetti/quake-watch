import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuakeMap } from './quake-map';

describe('QuakeMap', () => {
  let component: QuakeMap;
  let fixture: ComponentFixture<QuakeMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuakeMap],
    }).compileComponents();

    fixture = TestBed.createComponent(QuakeMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
