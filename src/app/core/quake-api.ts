import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { computed, Service, Signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Quake } from '../shared/quake';
import { mapFeatureToQuake } from './feed-mapper';
import { GaFeatureCollection } from './ga-feed';

@Service()
export class QuakeApi {
  #resource = httpResource<Quake[]>(() => environment.feedUrl, {
    parse: (res) =>
      (res as GaFeatureCollection).features.map((feature) => mapFeatureToQuake(feature)),
  });

  readonly status = this.#resource.status;

  readonly error = this.#resource.error as Signal<HttpErrorResponse | undefined>;

  readonly loading = this.#resource.isLoading;

  readonly quakes = computed(() => {
    if (this.#resource.hasValue()) {
      return this.#resource.value();
    }

    return [];
  });
}
