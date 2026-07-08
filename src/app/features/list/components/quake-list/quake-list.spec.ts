import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuakeList } from './quake-list';

describe('QuakeList', () => {
  let component: QuakeList;
  let fixture: ComponentFixture<QuakeList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuakeList],
    }).compileComponents();

    fixture = TestBed.createComponent(QuakeList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
