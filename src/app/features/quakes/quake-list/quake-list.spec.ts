import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LOCALE_ID, signal } from '@angular/core';
import { QuakeApi } from '../../../core/quake-api';
import { Quake } from '../../../shared/quake';
import { QuakeList } from './quake-list';
import { allQuakes } from './quake-fixtures';

describe('QuakeList', () => {
  let component: QuakeList;
  let fixture: ComponentFixture<QuakeList>;
  let quakes = signal<Quake[]>([]);

  beforeEach(async () => {
    quakes.set(allQuakes);

    await TestBed.configureTestingModule({
      imports: [QuakeList],
      providers: [
        {
          provide: QuakeApi,
          useValue: {
            quakes: quakes,
          },
        },
        {
          provide: LOCALE_ID,
          useValue: 'en-US',
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuakeList);
    component = fixture.componentInstance;

    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a table of quakes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('tbody tr')?.length).toEqual(5);

    const boulia = compiled.querySelector('td[data-testid="ga2026qbmwrt-inAustralia"] span');
    expect(boulia?.textContent.trim()).toContain('Yes');

    const bandaSea = compiled.querySelector('td[data-testid="ga2026qcnzvy-inAustralia"] span');
    expect(bandaSea?.textContent.trim()).toContain('No');
  });
});
