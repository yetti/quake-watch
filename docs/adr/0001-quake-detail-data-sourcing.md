# Quake Detail View Data Sourcing

- **Status:** accepted
- **Date Created:** 2026-07-24 17:15
- **Last Updated:** 2026-07-24 17:15

## Context

The app needs a quake detail view, and the data source for it is not obvious because the feed the app already loads is a rolling window.

The list feature fetches earthquakes from Geoscience Australia's GeoServer WFS endpoint (a plain HTTP API returning GeoJSON FeatureCollections). It queries the layer `earthquakes:earthquakes_seven_days` filtered by `display_flag='Y'` via `CQL_FILTER` (a server-side query filter passed as a URL parameter). The response (~75 features on 2026-07-24) already carries every field the planned detail view would display.

Three facts, all verified against the live API on 2026-07-24, shape the decision:

1. **The 7-day layer silently forgets.** Querying it for a quake older than the window returns a *valid, empty* FeatureCollection with HTTP 200 — not an error. Any per-id fetch against it breaks silently once a quake ages out.
2. **A full-history layer exists.** `GetCapabilities` (the WFS operation that lists available layers) shows `earthquakes:earthquakes` (full history) and `earthquakes:earthquakes_ten_years`. A `CQL_FILTER=event_id='<id>'` query against the full-history layer returned exactly one feature.
3. **The full-history layer's schema nearly matches.** It returns every property `feed-mapper.ts` reads *except* `felt_report_url` (it has 52 properties, a superset otherwise). Observed data suggests the URL is derivable as `https://earthquakes.ga.gov.au/feltreport/{event_id}`; this must be confirmed before relying on it.

"Deep link" below means: a URL to a specific quake that works when pasted into a fresh browser tab or refreshed, without visiting the list first. No detail route exists today — `app.routes.ts` is empty and nothing consumes `QuakeApi.quakes()` yet.

## Decision Drivers

- No detail route or consumer exists yet; building fetch machinery for it now has zero concrete uses (evidence: empty `app.routes.ts`).
- The already-fetched list contains all fields the detail view needs, so an extra HTTP request buys nothing for in-app navigation.
- The 7-day rolling window makes per-id fetches against the current layer a *correctness* problem (silent empty results), not a performance one.
- Deep links must eventually work for quakes outside the 7-day window.
- Knowledge of WFS layers and CQL filters should stay inside the `core/` data layer; components should never learn which layer answers their lookup.

## Considered Options

1. **Phased: in-memory lookup now, full-history fetch later (chosen)** — Pros: zero extra HTTP and zero new config today; defers routing work until a real route exists; migration is contained if the lookup seam lives in `QuakeApi`. Cons: detail state does not survive a hard reload (not deep-linkable in Phase 1); detail data is only as fresh as the last list fetch; a scheduled migration remains on the books.
2. **Per-detail fetch from `earthquakes_seven_days`** — Pros: reuses the exact layer and filter already configured; gives the detail view an independent load lifecycle. Cons: silently returns nothing for aged-out quakes (verified), which is exactly the deep-link case a standalone detail page exists to serve; still costs a request for data already in memory.
3. **Fetch every detail from `earthquakes:earthquakes` from day one** — Pros: reload-safe and window-immune immediately; always reflects GA's latest revision of a quake; avoids the Phase 1→2 migration entirely. Cons: extra request and `environment.ts` decomposition for a route that does not exist yet; the missing `felt_report_url` field needs handling now instead of later.
4. **No detail view** — Pros: zero risk on every technical dimension; nothing to maintain. Cons: fails the product goal (the app exists to let users inspect quakes); defers the decision without gathering any new information.

## Decision

We will use **Option 1**, the phased approach.

**Phase 1 (now):** the detail view is reachable only from the loaded list and reads from the in-memory data. `QuakeApi` exposes the lookup (e.g. a `quakeById(id)` signal-returning method) so that components never run `.find()` on `quakes()` themselves. Phase 1 and Phase 2 must present the *same* lookup seam to the detail view; only the service's internals change between phases.

**Phase 2 (triggered by building a standalone, deep-linkable `/quakes/:id` route):** the lookup fetches from `earthquakes:earthquakes` with `CQL_FILTER=event_id='<id>'`, making links work for quakes outside the 7-day window.

Why the alternatives lost:

- Option 2 shares Phase 1's window limitation *without* its justification. Phase 1 is only ever asked about quakes that are currently in the list, so the window cannot bite; a per-id fetch exists to serve standalone links, which is precisely where the empty-result failure lands. It works in-window — conceded — but the failure mode is silent and data-dependent.
- Option 3 is the correct destination and is rebutted on timing alone: with no detail route today, its costs are all paid up front for no current benefit. The trigger that flips it to "chosen" is named above, and Phase 2 *is* Option 3.
- Option 4 scores best on pure technical risk because it ships nothing; it is rejected on product grounds, which sit outside that scoring.

## Consequences

**Positive:**

- No new HTTP requests, config, or routing work now; the detail feature can ship as soon as a list UI exists.
- The `quakeById` seam makes the Phase 2 migration a one-file change inside `QuakeApi`, provided no component bypasses it.
- Existing service signals (`status`, `loading`, `error`) already cover the states the detail view must render.

**Negative (accepted costs, mostly relative to Option 3):**

- **Phase 1 is not reload-safe.** A hard refresh, shared link, or new tab rebuilds the app; the lookup runs against a not-yet-loaded list. This is the highest-rated risk in review and is *accepted as a known Phase 1 limitation*, not a bug: Phase 1 deliberately has no standalone route, so no URL promises what it cannot keep.
- **"Not found" is ambiguous in Phase 1.** `quakes()` returns `[]` while loading *and* on error, so a naive lookup cannot distinguish "still loading," "feed errored," and "id absent." The detail view must gate on `loading()`/`error()` before concluding a quake does not exist.
- **Staleness.** Detail data is a snapshot from the last list fetch; GA revises quakes (magnitudes especially) after initial publication. Low severity, self-correcting at Phase 2.
- **A scheduled migration exists.** Its cost stays contained only if the seam rule above is enforced; every component that reaches around `quakeById` converts "swap the data source" into a multi-module rewrite.

**Neutral / risks to watch:**

- **Undocumented API.** Both phases build on GA's public but uncontracted GeoServer. Layer names, schemas, and filter behavior were verified live on 2026-07-24 only; a silent change would surface as empty pages, not errors. A smoke test against the live endpoint is the cheap mitigation when Phase 2 lands.
- **Schema gap:** `felt_report_url` is absent from `earthquakes:earthquakes`; confirm the `feltreport/{event_id}` URL pattern (or drop the field for fetched details) before Phase 2.
- **Unverified assumption:** `event_id` is unique and stable across GA's revision process. Both phases depend on it; no counter-evidence observed, but it has not been confirmed against GA documentation.
- Quakes with `display_flag='N'` never enter the list, so Phase 1 can never display them. Acceptable: the detail view is only reachable from listed quakes.

## Notes

**Key files:**

| File | Purpose |
|------|---------|
| `src/app/core/quake-api.ts` | Service owning the feed resource and (Phase 1) the `quakeById` lookup seam |
| `src/app/core/feed-mapper.ts` | `GaFeature → Quake` mapping; reads the fields whose parity was checked |
| `src/app/core/ga-feed.ts` | Wire types for the GA feed |
| `src/environments/environment.ts` | `feedUrl` — currently one opaque string; Phase 2 forces decomposition into base URL + per-query layer/filter |
| `src/app/app.routes.ts` | Empty today; Phase 2's trigger is adding a standalone `/quakes/:id` route here |
| `src/app/shared/quake.ts` | Domain model consumed by the detail view |

**Phase 2 checklist (recorded now so the trigger moment is cheap):**

1. Confirm `felt_report_url` derivation or drop the field for fetched details.
2. Decompose `environment.feedUrl`; build queries in `core/` using `httpResource`'s request-object overload (`{ url, params }`) so CQL values are encoded, never string-concatenated.
3. Keep the `quakeById` signature unchanged; swap only the implementation.
4. Add a live smoke test for the `earthquakes:earthquakes` layer.
5. Consider `earthquakes:earthquakes_ten_years` if full history proves slow; it was verified to exist but not probed further.

**Evidence (trust class: live API probes, single-source, 2026-07-24):**

```sh
# layer inventory
curl -s '.../wfs?service=WFS&request=GetCapabilities' | grep -o '<Name>[^<]*</Name>'
# single-quake fetch + schema check against the full-history layer
curl -sG '.../wfs' --data-urlencode "typeNames=earthquakes:earthquakes" \
  --data-urlencode "CQL_FILTER=event_id='ga2026obazqj'" ...
```

**Cross-references:** first ADR in this repository; none yet. Related docs: [.claude/project-structure.md](../../.claude/project-structure.md) (core/ vs shared/ rules the seam placement relies on).