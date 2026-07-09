import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { QuakeStore } from '../../services/quake-store';

@Component({
  selector: 'app-quake-list',
  imports: [DecimalPipe],
  templateUrl: './quake-list.html',
  styleUrl: './quake-list.css',
})
export class QuakeList {
  store = inject(QuakeStore);
}
