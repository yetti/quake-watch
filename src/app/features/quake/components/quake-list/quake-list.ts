import { Component, inject } from '@angular/core';
import { Quake } from '../../../../shared/models/quake.models';
import { DecimalPipe } from '@angular/common';
import { QuakeApi } from '../../services/quake-api';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-quake-list',
  imports: [DecimalPipe],
  templateUrl: './quake-list.html',
  styleUrl: './quake-list.css',
})
export class QuakeList {
  private service = inject(QuakeApi);
  quakes = toSignal(this.service.loadAll(), { initialValue: [] as Quake[] });
}
