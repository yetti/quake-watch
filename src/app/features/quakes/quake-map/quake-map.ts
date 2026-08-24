import { Component, effect, ElementRef, inject, Injector, input, viewChild } from '@angular/core';
import { Quake } from '../../../shared/quake';
import * as L from 'leaflet';
import { buildShape, markerHtml, radiusFor, recencyFor } from '../quake-markers';

@Component({
  selector: 'div[app-quake-map]',
  imports: [],
  templateUrl: './quake-map.html',
  styleUrl: './quake-map.scss',
})
export class QuakeMap {
  readonly quakes = input<Quake[]>([]);
  private injector = inject(Injector);
  private mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private map!: L.Map;

  ngAfterViewInit() {
    const el = this.mapContainer().nativeElement;
    const markerLayer = L.layerGroup();

    this.map = L.map(el).setView([-30, 134], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    effect(
      () => {
        markerLayer.clearLayers();
        this.quakes().forEach((q) => {
          const magnitudeMarker = radiusFor(q.magnitude);
          const recencyMarker = recencyFor(q, Date.now());
          if (magnitudeMarker && recencyMarker) {
            const shape = buildShape(recencyMarker.shape, magnitudeMarker.mapRadius);
            const html = markerHtml(shape, recencyMarker.fill);
            L.marker([q.lat, q.lng], {
              icon: L.divIcon({ html, iconSize: [shape.size, shape.size], className: '' }),
            }).addTo(markerLayer);
          }
        });
      },
      { injector: this.injector },
    );
    markerLayer.addTo(this.map);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
