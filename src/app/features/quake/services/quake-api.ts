import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { GaFeatureCollection } from './ga-feed.models';
import { map } from 'rxjs';
import { mapFeatureToQuake } from './ga-feed.mapper';

@Service()
export class QuakeApi {
  private http = inject(HttpClient);
  private feedUrl = "https://earthquakes.ga.gov.au/geoserver/earthquakes/wfs" +
    "?service=WFS&request=getfeature&typeNames=earthquakes:earthquakes_seven_days" +
    "&outputFormat=application/json&CQL_FILTER=display_flag='Y'";

  loadAll() {
    return this.http.get<GaFeatureCollection>(this.feedUrl).pipe(
      map(res => res.features.map((f) => {
        return mapFeatureToQuake(f);
      }))
    );
  }
}
