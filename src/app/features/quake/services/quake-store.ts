import { inject, Service } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Quake } from '../../../shared/models/quake.models';
import { QuakeApi } from './quake-api';

@Service()
export class QuakeStore {
  quakeApi = inject(QuakeApi)
  quakes = toSignal(this.quakeApi.loadAll(), { initialValue: [] as Quake[] });
}
