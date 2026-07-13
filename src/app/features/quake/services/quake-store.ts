import { computed, inject, Service, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Quake } from '../../../shared/models/quake.models';
import { QuakeApi } from './quake-api';

interface QuakeFilters {
  minMag: number;
  sinceHours: number;
}

@Service()
export class QuakeStore {
  private quakeApi = inject(QuakeApi)
  private quakes = toSignal(this.quakeApi.loadAll(), { initialValue: [] as Quake[] });
  filters = signal<QuakeFilters>({
    minMag: 0,
    sinceHours: 48,
  });
  visibleQuakes = computed(() => {
    const { minMag, sinceHours } = this.filters();
    const cutoff = Date.now() - sinceHours * 60 * 60 * 1000;
    return this.quakes().filter((q) => q.magnitude >= minMag && q.time >= cutoff);
  })
}
