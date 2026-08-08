import { Component, computed, inject, signal } from '@angular/core';
import { Globe } from '@primeicons/angular/globe';
import { MenubarModule } from 'primeng/menubar';
import { PanelModule } from 'primeng/panel';
import { environment } from '../environments/environment';
import { QuakeList } from './features/quakes/quake-list/quake-list';
import {
  HOUR_LIMITS,
  LowerFilterLimit,
  MAGNITUDE_LIMITS,
  UpperFilterLimit,
} from './shared/filter-limits';
import { QuakeApi } from './core/quake-api';
import { atLeastMagnitudeOf, withinHoursOf } from './features/quakes/quake-filters';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-root',
  imports: [Globe, MenubarModule, PanelModule, QuakeList, Select],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = environment.title;
  private readonly quakeApi = inject(QuakeApi);

  protected readonly magnitudeOptions = [...MAGNITUDE_LIMITS];
  protected readonly hourOptions = [...HOUR_LIMITS];

  magnitudeLimit = signal<LowerFilterLimit | null>(null);
  hourLimit = signal<UpperFilterLimit | null>(null);

  quakes = computed(() => {
    return this.quakeApi
      .quakes()
      .filter(
        (q) =>
          withinHoursOf(q, this.hourLimit(), Date.now()) &&
          atLeastMagnitudeOf(q, this.magnitudeLimit()),
      );
  });
}
