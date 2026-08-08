import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Check } from '@primeicons/angular/check';
import { Times } from '@primeicons/angular/times';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { YesNoPipe } from '../../../shared/pipes/yes-no-pipe';
import { Quake } from '../../../shared/quake';

@Component({
  selector: 'div[app-quake-list]',
  imports: [PanelModule, TagModule, TableModule, DecimalPipe, DatePipe, Check, Times, YesNoPipe],
  templateUrl: './quake-list.html',
  styleUrl: './quake-list.scss',
})
export class QuakeList {
  readonly quakes = input<Quake[]>([]);
  readonly totalQuakes = computed(() => {
    return this.quakes().length;
  });
}
