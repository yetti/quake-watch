import { Service, resource, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map } from 'rxjs';
import { mapFeatureToQuake } from './feed-mapper';
import { GaFeature, GaFeatureCollection } from './ga-feed';

@Service()
export class QuakeApi {
  private http = inject(HttpClient);
  #constResource = resource({
    params: () => ({}),
    loader: () => this.loadAll(),
  });

  private async loadAll() {
    return this.http.get<GaFeatureCollection>(environment.feedUrl, {}).pipe(
      map((res) => {
        res.features.map((feature: GaFeature) => {
          return mapFeatureToQuake(feature);
        })
      })
    );
  }
}
