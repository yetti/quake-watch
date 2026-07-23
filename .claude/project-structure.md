# Angular 22+ Project Structure

Best-practice file organization for this project, based on the Angular style guide (angular.dev/style-guide) for standalone applications.

## Guiding principle

**Organize by feature, not by file type.** Do NOT create top-level `components/`, `services/`, or `pipes/` buckets. A feature folder is a self-contained, lazy-loadable unit — you should be able to delete a feature by deleting one folder.

## Target structure

```
src/
├── main.ts                      # bootstrapApplication(App, appConfig)
├── index.html
├── styles.scss                  # global styles only
└── app/
    ├── app.ts                   # root component (shell: header, nav, <router-outlet>)
    ├── app.html
    ├── app.scss
    ├── app.config.ts            # ApplicationConfig: provideRouter, provideHttpClient, …
    ├── app.routes.ts            # top-level routes — mostly lazy pointers
    │
    ├── quakes/                  # ── feature area ──
    │   ├── quakes.routes.ts     # feature routes, loaded via loadChildren
    │   ├── quake-list.ts        # smart/page component
    │   ├── quake-list.html
    │   ├── quake-detail.ts
    │   ├── quake-card.ts        # presentational component (inline template if small)
    │   ├── quake-store.ts       # signal-based state for this feature
    │   └── magnitude.pipe.ts
    │
    ├── settings/                # ── another feature area ──
    │   ├── settings.routes.ts
    │   └── settings-page.ts
    │
    ├── core/                    # app-wide singletons (used once, injected everywhere)
    │   ├── quake-api.ts         # @Service() data-access service
    │   ├── auth-interceptor.ts
    │   └── error-handler.ts
    │
    └── shared/                  # reusable, stateless, feature-agnostic
        ├── ui/
        │   ├── spinner.ts
        │   └── badge.ts
        └── utils/
            └── format-date.ts
```

## Rules

### File naming — no `.component.ts` suffixes

Since Angular v20, the CLI generates `quake-list.ts` with class `QuakeList` — not `quake-list.component.ts` / `QuakeListComponent`. Suffixes survive only where the type isn't obvious from context: `.pipe.ts`, `.routes.ts`, and by convention `-store.ts` for state containers.

### One concept per file, related files side by side

A component's `.ts`/`.html`/`.scss` sit together. A feature's store sits next to the components that use it.

### Routes are the seams

`app.routes.ts` stays tiny — each entry is a lazy pointer, so each feature folder becomes its own JS chunk, downloaded only when navigated to:

```ts
export const routes: Routes = [
  { path: 'quakes', loadChildren: () => import('./quakes/quakes.routes') },
  { path: 'settings', loadComponent: () => import('./settings/settings-page') },
];
```

### `core/` vs `shared/`

- **`core/`** = stateful singletons: API clients, interceptors, auth. Injected app-wide via `@Service()`. Never contains components.
- **`shared/`** = stateless, reusable UI and utilities with **no dependencies on any feature**. If a "shared" component imports from `quakes/`, it belongs in `quakes/`.

Both can become junk drawers — the stronger rule is *feature-first*: only promote something to `shared/` once a second feature actually needs it, never preemptively.

### Flat until it hurts

Don't create `quakes/components/` or `quakes/services/` sub-buckets for a feature with six files. Nest only when a folder genuinely gets crowded (~10+ files) or a sub-feature emerges (`quakes/map/`, `quakes/feed/`).

## Why these rules (dependency-direction rationale)

1. **`core/` services must not be provided in a feature's route `providers`** — a `providedIn: 'root'` / `@Service()` service is tree-shaken if unused and instantiated once; providing it in a lazy route's injector creates a *second instance* scoped to that route.
2. **`shared/` must never import from features** — it inverts the dependency direction and welds lazy chunks together, defeating code-splitting.
