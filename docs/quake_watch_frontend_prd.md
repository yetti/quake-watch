# Quake Watch, Frontend Build Doc (Angular)

A small Angular app that browses recent earthquakes from Geoscience Australia's live feed, shows them on a map, and lets you filter by magnitude and time window. The aim is a working app written in current Angular idioms, small enough to finish in a day. This document is self-contained; everything you need to build the frontend is here.

---

## 1. Goals and non-goals

**Goals**
- A working app: a list and a map of recent quakes, with a magnitude and time filter that updates both.
- Written in modern Angular: standalone components, signals, the new control flow.
- Finishable in a day, with clear stretch items after the core is done.

**Non-goals**
- No authentication, no database, no server-side rendering, no production hardening.
- No account or API key. The GA feed is open.

---

## 2. Stack

- Angular 22 (standalone, signals). Angular 22 is the current stable release.
- Leaflet for the map.
- TypeScript.
- Optional later: point the app at your own backend API (see the backend build doc) instead of calling GA directly.

---

## 3. Data source

Primary source is Geoscience Australia's own live feed, called directly from the browser. A cross-origin `fetch` to it was tested and returned data with CORS OK, so no proxy or workaround is needed to build the frontend. USGS remains a fallback only if GA is ever unavailable. All options produce the same internal `Quake` type, so your components do not care which you use.

**Option A (recommended): Geoscience Australia's Earthquake Notification Service.** GA's public GeoServer WFS endpoint, returning GeoJSON for the last seven days. This is GA's own production feed, the same data behind earthquakes.ga.gov.au, which makes it the most on-brand choice for this role:

```
https://earthquakes.ga.gov.au/geoserver/earthquakes/wfs?service=WFS&request=getfeature&typeNames=earthquakes:earthquakes_seven_days&outputFormat=application/json&CQL_FILTER=display_flag='Y'
```

CORS: confirmed working. A cross-origin `fetch` from a different origin returned the feature collection, so `HttpClient` can call this directly. Nothing special to configure.

Server-side vs client-side filtering: because this is WFS with a CQL filter, you can push filters upstream, for example `...&CQL_FILTER=display_flag='Y' AND located_in_australia='Y' AND preferred_magnitude>=3`. But the seven-day `display_flag='Y'` set is small (tens of features), so for this app it is simpler and snappier to fetch once and filter client-side with your signals (M4). Reach for upstream CQL filtering when the result set is large or when you do not want to ship all the data to the client. Being able to explain that choice is a good interview talking point.

**Option B (fallback only): USGS, global or bounded to Australia.** Different schema (see below). Only needed if GA is down, since GA calls work directly:
- Global, past day: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
- Australia-bounded query: `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=-45&maxlatitude=-9&minlongitude=110&maxlongitude=156&starttime=2026-07-01`

**Option C: GA feed via your backend proxy (a deliberate choice, not a necessity).** Now that CORS is confirmed open, the proxy is not required to unblock the browser. It still earns its place: it caches GA's GeoServer response so you are not re-querying on every interaction, adds resilience if GA is slow or down, and gives you a clean backend to show. Treat this as the M6 payoff and a design decision you made on the merits, which is a stronger story than a proxy you needed to work around CORS.

Recommended path: build directly against Option A now. Add Option C later for caching and resilience, not to fix a problem.

### GA feed shape (Option A)

A trimmed GA feature, from the live feed:

```json
{
  "id": "earthquakes_seven_days.fid-...",
  "geometry": { "type": "Point", "coordinates": [134.019, -14.504] },
  "properties": {
    "event_id": "ga2026mudirw",
    "description": "N of Minyerri, NT",
    "preferred_magnitude": 2.678,
    "preferred_magnitude_type": "MLa",
    "origin_time": "2026-06-29T19:42:04.442Z",
    "depth": 17.46,
    "latitude": -14.504,
    "longitude": 134.019,
    "located_in_australia": "Y",
    "felt_report_url": "https://earthquakes.ga.gov.au/feltreport/ga2026mudirw"
  }
}
```

Watch these differences from USGS:
- Magnitude is `preferred_magnitude`, with a scale in `preferred_magnitude_type` (mb, Mw, MLa, MLa075, and so on).
- Time is `origin_time`, an ISO 8601 string, not epoch millis. Parse it with `Date.parse(...)`.
- `geometry.coordinates` is `[lng, lat]` only. Depth is a separate `depth` property, in km, not part of the coordinates.
- The useful id is `event_id`, not the WFS feature `id`.
- The place name is `description`.

### Internal type

Source-agnostic on purpose. Whichever feed you use, map into this and never let the raw feed shape reach your components.

```ts
export interface Quake {
  id: string;
  place: string;
  magnitude: number;
  time: number;   // epoch millis
  lng: number;
  lat: number;
  depth: number;
  // optional extras GA gives you for free:
  magnitudeType?: string;
  inAustralia?: boolean;
  feltReportUrl?: string;
}
```

---

## 4. Functional requirements

- **FR1.** Show a list of recent quakes (place and magnitude at minimum).
- **FR2.** Show the quakes on a map, with each marker sized or coloured by magnitude.
- **FR3.** Filter by minimum magnitude and by time window. The list and the map both reflect the current filter.
- **FR4 (stretch).** A detail view for a single quake at its own route.
- **FR5 (stretch).** Fetch from your own backend API instead of GA directly.

---

## 5. Modern Angular reference

If your last serious Angular exposure predates version 17, this is the delta. Use these idioms and skip the old equivalents.

- **Standalone components are the default.** No `NgModule`, no `declarations` array. A component imports what it needs in its own `imports`.
- **Signals for state.** `count = signal(0)`, read with `count()`, write with `count.set(1)` or `count.update(n => n + 1)`. Derived state uses `computed(() => ...)`. Side effects use `effect(() => ...)`.
- **New control flow in templates.** `@if`, `@else if`, `@else`, `@for (x of items; track x.id) { } @empty { }`, and `@switch`. These replace `*ngIf` and `*ngFor`. `@for` requires a `track` expression, like React's `key`.
- **`inject()` over constructor injection.** `private http = inject(HttpClient)` in the class body.
- **`input()`, `output()`, `model()`** replace the `@Input()` and `@Output()` decorators. `input()` is read-only. `model()` gives two-way binding without a separate input plus output pair.
- **`httpResource()` and `resource()`** are the signal-native way to fetch async data; an `httpResource` re-runs when a signal it reads changes and exposes `value()`, `isLoading()`, and `error()`. The exact API is still settling, so check angular.dev as you use it. If it feels fiddly, `HttpClient` plus `toSignal()` is current and fine.
- **Zoneless and OnPush** are the modern defaults (v21 and v22). With signals you rarely think about change detection. No special config needed for this app.

A real enterprise codebase may still be on an older Angular with `NgModule` and `*ngFor`. That is fine to acknowledge: you would learn their patterns for daily work while understanding where the framework is heading.

**RxJS vs signals, the short version.** An Observable is a stream of values over time that you subscribe to; it suits events, sockets, debounced inputs, and HTTP responses. A signal is a single current value you read synchronously, with automatic dependency tracking for derived values and rendering. Modern Angular uses signals for component state and keeps RxJS for genuine streams. `toSignal()` and `toObservable()` bridge the two.

---

## 6. Build stages

Small snippets are given only for the Angular idioms that may be new to you. Write the rest yourself.

### M0: Scaffold
```bash
npm install -g @angular/cli
ng new quake-watch          # accept standalone, choose CSS, skip SSR for now
cd quake-watch
ng serve                    # confirm it runs at localhost:4200
```

### M1: A static list
- Add the `Quake` interface from section 3.
- Generate a `QuakeListComponent` and render a hard-coded array of two or three quakes with the new control flow:
```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-quake-list',
  template: `
    <ul>
      @for (q of quakes; track q.id) {
        <li>{{ q.place }} (M{{ q.magnitude }})</li>
      } @empty {
        <li>No earthquakes to show.</li>
      }
    </ul>
  `,
})
export class QuakeListComponent {
  quakes = [/* a couple of literals */];
}
```

### M2: Live data from GA
- Add `provideHttpClient()` to your `app.config.ts` providers.
- Create a `QuakeService` that fetches the GA feed and maps features to your `Quake` shape. Note the GA-specific mapping: `event_id`, `preferred_magnitude`, `origin_time` parsed to millis, `depth` as a property, and coordinates as `[lng, lat]` only:
```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuakeService {
  private http = inject(HttpClient);
  private feed =
    "https://earthquakes.ga.gov.au/geoserver/earthquakes/wfs" +
    "?service=WFS&request=getfeature&typeNames=earthquakes:earthquakes_seven_days" +
    "&outputFormat=application/json&CQL_FILTER=display_flag='Y'";

  loadAll() {
    return this.http.get<any>(this.feed).pipe(
      map(res => res.features.map((f: any) => {
        const p = f.properties;
        return {
          id: p.event_id,
          place: p.description,
          magnitude: p.preferred_magnitude,
          time: Date.parse(p.origin_time),   // ISO string to epoch millis
          lng: f.geometry.coordinates[0],
          lat: f.geometry.coordinates[1],
          depth: p.depth,
          magnitudeType: p.preferred_magnitude_type,
          inAustralia: p.located_in_australia === 'Y',
          feltReportUrl: p.felt_report_url,
        };
      }))
    );
  }
}
```
- CORS is confirmed working, so this direct call is the expected path. The USGS fallback (with its different mapping: `mag`, `place`, `time`, `coordinates[2]` for depth) is only needed if GA is ever unavailable.
- In the component, turn that into a signal:
```ts
import { toSignal } from '@angular/core/rxjs-interop';
// in the component:
private service = inject(QuakeService);
quakes = toSignal(this.service.loadAll(), { initialValue: [] as Quake[] });
```

### M3: The map
```bash
npm install leaflet
npm install -D @types/leaflet
```
- Add a `MapComponent` with a `div` for the map. Initialise Leaflet in `ngAfterViewInit`, add an OpenStreetMap tile layer, and drop a circle marker per quake, radius or colour scaled by magnitude.
- Leaflet is not Angular-aware, so you touch the DOM directly here. Angular owns the component tree; Leaflet owns its own canvas inside one element. Use `viewChild()` (or `@ViewChild`) for the element reference.

### M4: Filtering with signals
- Add a `minMag` signal and a `sinceHours` signal, driven by simple range or select inputs.
- Derive the visible list with `computed`:
```ts
minMag = signal(0);
visibleQuakes = computed(() =>
  this.quakes().filter(q => q.magnitude >= this.minMag())
);
```
- Bind the filter controls to the signals, and feed `visibleQuakes()` to both the list and the map. This is the heart of modern Angular: derived state updates the view with no manual subscription.

**Minimum viable version stops here.** A working app with live data, a map, and filtering is complete. The rest is stretch.

### M5 (stretch): A detail route
- Add routing with `provideRouter` and a routes array. A `/quake/:id` route shows one quake's detail, with a link back. Read the route param as a signal.

### M6 (stretch): Point at your own backend (caching and resilience)
- Once the backend exists (separate doc), change `QuakeService` to call `GET /api/quakes?minMag=&sinceHours=` instead of the GA feed. The response is already in your clean `Quake` shape, so the mapping step disappears from the frontend.
- The reason to do this is not CORS (direct GA calls work). It is that the backend caches GA's GeoServer response, adds resilience if GA is slow or down, and moves the mapping to one place. This is where the two apps connect, and it is a design choice you can defend on its merits.

### M7 (stretch): A couple of tests
- One unit test on the feature-to-`Quake` mapping (pure function, high value).
- One component test that the list renders the right number of items for a given input.
- The current Angular CLI wires up Vitest as the default test runner.

### M8 (stretch): Docker
- Multi-stage Dockerfile: build the Angular app, serve the static output from nginx. You know this path well, so treat it as a victory lap.

---

## 7. Definition of done

- **Core done:** M0 to M4. Live, filterable, mapped earthquake browser.
- **Nice to have:** M5 detail route, M6 backend integration, M7 tests, M8 Docker.

---

## 8. Task checklist

### M0: Scaffold
- [x] Install the Angular CLI
- [x] `ng new quake-watch` (standalone, CSS, no SSR)
- [x] `ng serve` runs cleanly at localhost:4200

### M1: Static list
- [x] Add the `Quake` interface
- [x] Generate `QuakeListComponent`
- [x] Render a hard-coded list with `@for` and `@empty`

### M2: Live data
- [ ] Add `provideHttpClient()` to `app.config.ts`
- [ ] Create `QuakeService` with a `loadAll()` that fetches the GA feed
- [ ] Map GA fields to the `Quake` shape (`event_id`, `preferred_magnitude`, `origin_time` to millis, `depth`, `[lng, lat]`)
- [ ] Confirm the feed loads directly (CORS is confirmed working; USGS/proxy are fallback only)
- [ ] Expose the data as a signal with `toSignal()`
- [ ] List now shows live quakes

### M3: Map
- [ ] Install `leaflet` and `@types/leaflet`
- [ ] Create `MapComponent` with a map container element
- [ ] Initialise Leaflet and add an OpenStreetMap tile layer
- [ ] Render one marker per quake, scaled by magnitude

### M4: Filtering
- [ ] Add `minMag` and `sinceHours` signals
- [ ] Wire filter controls to the signals
- [ ] Derive `visibleQuakes` with `computed`
- [ ] List and map both reflect the filter
- [ ] Core version complete

### M5: Detail route (stretch)
- [ ] Add `provideRouter` and a routes array
- [ ] Add a `/quake/:id` route and detail component
- [ ] Read the route param as a signal
- [ ] Link from list to detail and back

### M6: Backend integration (stretch)
- [ ] Repoint `QuakeService` to `GET /api/quakes`
- [ ] Remove the client-side mapping now the backend returns clean data
- [ ] Confirm filter params pass through to the API

### M7: Tests (stretch)
- [ ] Unit test the mapping logic
- [ ] Component test the list renders the right count

### M8: Docker (stretch)
- [ ] Multi-stage Dockerfile (build, then nginx)
- [ ] Container serves the app locally
