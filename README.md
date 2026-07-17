# QuakeWatch

QuakeWatch is a single-page Angular application that lists and maps recent Australian earthquakes. It pulls live seismic data straight from Geoscience Australia's public feed and lets you narrow the results by magnitude and time window, keeping the list and the map in sync as you filter.

## Features

- **Live earthquake list** — recent events sourced from Geoscience Australia.
- **Interactive map** — every quake plotted with [Leaflet](https://leafletjs.com/), kept in step with the current filters.
- **Signal-based filtering** — filter by minimum magnitude (0–8) and time window (up to 168 hours / 7 days); both the list and map update reactively.

## Data source

Earthquake data comes from Geoscience Australia's [Earthquake Notification Service](https://earthquakes.ga.gov.au/help) (see the **Notifications** section). The service publishes recent earthquake data in several formats — RSS, GeoRSS, ATOM CAP-AU, GeoJSON, and KML — and QuakeWatch consumes the **GeoJSON** feed, mapping it into the app's own `Quake` model. The feed is called directly from the browser (CORS is open on the endpoint).

> Note: Geoscience Australia provides these feeds for general informational purposes only. Do not rely on them for emergency response.

## Tech stack

- **Angular 22** — standalone components, signals, and the new control flow syntax.
- **Signal forms** (`@angular/forms/signals`) for the filter controls.
- **Leaflet** for the map rendering.
- **Tailwind CSS v4** for styling.
- **Vitest** as the unit test runner.

## Development server

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.5.

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
