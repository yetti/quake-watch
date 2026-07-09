import { Component, inject } from '@angular/core';
import { QuakeStore } from '../../services/quake-store';
import * as L from "leaflet";

@Component({
  selector: 'app-quake-map',
  imports: [],
  templateUrl: './quake-map.html',
  styleUrl: './quake-map.css',
})
export class QuakeMap {
  store = inject(QuakeStore)
  map: L.Map;

  ngAfterViewInit() {
    this.map = L.map('map').setView([51.505, -0.09], 13);
  }
}
