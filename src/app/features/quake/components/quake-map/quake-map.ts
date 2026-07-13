import { Component, inject, ElementRef, viewChild, effect, Injector, AfterViewInit, OnDestroy } from '@angular/core';
import { QuakeStore } from '../../services/quake-store';
import * as L from "leaflet";

@Component({
  selector: 'app-quake-map',
  imports: [],
  templateUrl: './quake-map.html',
  styleUrl: './quake-map.css',
})
export class QuakeMap implements AfterViewInit, OnDestroy {
  private store = inject(QuakeStore);
  private injector = inject(Injector);
  private mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private map!: L.Map;

  ngAfterViewInit() {
    const el = this.mapContainer().nativeElement;
    const markerLayer = L.layerGroup();

    this.map = L.map(el).setView([-30, 134], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    effect(() => {
      markerLayer.clearLayers();
      this.store.visibleQuakes().forEach((q) => {
        L.circleMarker([q.lat, q.lng], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.5,
          radius: q.magnitude,
        }).addTo(markerLayer);
      });
    }, {injector: this.injector});
    markerLayer.addTo(this.map);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
