# GA Feed Access: Client-Direct, No Backend Proxy

- **Status:** accepted
- **Date Created:** 2026-07-25 13:49
- **Last Updated:** 2026-07-25 17:40

## Context

The app needs Geoscience Australia (GA) earthquake data, and the question was whether a backend proxy should sit between the browser and GA. This ADR records the decision: **no backend — the Angular client calls GA directly.** A backend proxy was explored in depth — it was to be milestone M6 — and rejected.

Today the Angular app calls GA's GeoServer WFS endpoint directly from the browser, querying `earthquakes:earthquakes_seven_days` (filtered by `display_flag='Y'` via `CQL_FILTER`) and receiving GeoJSON. CORS is open, so the direct call works.

Three findings from the investigation shaped the decision:

1. **GA publishes no usage governor.** GA licenses the data under CC BY 4.0, disclaims warranties ("as-is and as-available"), and states "the availability and currency of the web services is not guaranteed." There is **no published rate limit or fair-use quota** (trust class: web, GA official site, single-source, 2026-07-25). The etiquette burden therefore falls on the client author.
2. **A proxy would protect GA from nothing.** The full-history layer `earthquakes:earthquakes` is reachable by an anonymous request with no credential (trust class: live API probe recorded in [ADR-0001](./0001-quake-detail-data-sourcing.md), 2026-07-24). Anyone who would abuse the feed can query GA directly, so a proxy is not in their path.
3. **This is a low-traffic portfolio piece.** It lives on a personal blog/portfolio, so concurrent traffic is rare.

## Decision Drivers

- Every real need the app has is met **client-side**: being a good citizen and not choking on oversized responses are both solved by disciplined bounded queries (correct layer, bounded page size, a request timeout) — no backend required.
- A proxy is a security boundary only when the origin holds a secret (API key, paid quota, private data, write capability). GA holds none, so "hide the endpoint" buys no protection.
- The **only** thing a backend adds that a client cannot — a cache *shared across users* — is worth effectively nothing at 1–5 rarely-concurrent visitors.
- A backend introduces a **second runtime** (the Workers runtime) into a frontend project, and that carries recurring, concrete tradeoffs: split test toolchains (jsdom for Angular vs. `workerd` for functions), placement of the shared contract type across the runtime boundary, a second deploy unit, and added infrastructure to provision and operate.
- The owner is **not willing to accept those tradeoffs** for a benefit the app cannot feel. This is a deliberate cost/benefit judgment, not a technical limitation — a backend is entirely buildable; it is simply not worth it here.

## Considered Options

1. **No backend — client calls GA directly with disciplined bounded queries (chosen)** — Pros: one runtime and one test suite; no cross-boundary shared-type problem (`Quake` and `feed-mapper.ts` stay in the app); no infrastructure to provision, deploy, or monitor; the fastest path to a shippable, polished frontend. Cons: no shared cache (irrelevant at this traffic); the client bundle carries GeoServer specifics — layer names, CQL, GeoJSON shape (accepted, low cost, reversible); no independent resilience/fallback layer (a USGS fallback, if ever wanted, can live in the client service).
2. **Backend proxy** — the thoroughly explored option. Pros: a cache shared across users; a clean contract that keeps GeoServer specifics server-side; a resilience/fallback seam; a full-stack and deployment demonstration. Cons: the shared cache is worth ~nothing at portfolio traffic; it introduces a second runtime whose recurring tradeoffs (test-toolchain split, shared-type placement, a second deploy unit) surfaced repeatedly during design; it is infrastructure the app does not need. Rejected: the tradeoffs are not worth it for this project's traffic and goals.
3. **Backend proxy motivated by security / hiding the endpoint (rejected framing)** — recorded so the reasoning is not re-litigated. A proxy stops no abuser (finding 2); it only moves obfuscation one hop and keeps the layer name out of the bundle. Security was never a valid reason to build one.

## Decision

We will **not** build a backend. The Angular client fetches from GA directly, using **disciplined bounded queries** — the correct layer for the need, a bounded page size, and a request timeout — and maps `GaFeature → Quake` **client-side** (`feed-mapper.ts` stays in `core/`). [ADR-0001](./0001-quake-detail-data-sourcing.md)'s Phase 2 detail lookup becomes a direct client query against the full-history layer by `event_id`, which is exactly its Option 3.

**Revival trigger:** revisit only if the app gains real concurrent traffic where a shared cache meaningfully reduces load on GA, or a full-stack/deployment demonstration becomes a specific goal worth its tradeoffs. Neither is expected.

Why the alternatives lost:

- Option 2 is buildable and was designed in full, but its one client-impossible benefit (a shared cache) is worthless at this traffic, and the second runtime it drags in imposes tradeoffs the owner has decided not to pay. The complications that surfaced during design — split test toolchains, cross-boundary placement of the shared type, a second deploy unit — were all symptoms of that same second runtime.
- Option 3 was never valid: a proxy protects nothing GA does not already expose to anonymous callers.

## Consequences

**Positive:**

- One runtime, one test suite, no cross-boundary shared-type problem; `feed-mapper.ts`, `ga-feed.ts`, and `shared/quake.ts` all stay where they are.
- The fastest path to a shippable, polished frontend, with effort concentrated on the skills actually being practiced — Angular idioms, Leaflet interop, accessibility, and Vitest coverage — rather than on infrastructure.
- The `quakeById` seam from ADR-0001 stays a purely in-app concern.

**Negative (accepted costs):**

- The client bundle carries GeoServer specifics (layer names, CQL, GeoJSON wire types). Accepted: low cost, and reversible if a backend is ever built.
- No cache shared across users — irrelevant at portfolio traffic.
- Good citizenship is now a **client discipline**, not an infrastructure guarantee: the bounded-query rule (right layer, bounded page size, timeout) must be enforced in code and review wherever the fetch lives.

**Neutral / risks to watch:**

- Both this app and ADR-0001's Phase 2 build on GA's public but uncontracted GeoServer; a silent schema or layer change surfaces as empty pages, not errors.
- The GA attribution — `© Commonwealth of Australia (Geoscience Australia)`, CC BY 4.0, with links to source and licence — must appear in the app regardless of this decision.

## Notes

**Key files:**

| File | Purpose |
|------|---------|
| `src/app/core/quake-api.ts` | Owns the direct GA fetch and the `quakeById` lookup seam; the place to enforce bounded queries and a timeout |
| `src/app/core/feed-mapper.ts` | `GaFeature → Quake` mapping; stays client-side |
| `src/app/core/ga-feed.ts` | GeoServer wire types; stays client-side |
| `src/app/shared/quake.ts` | Domain model; stays in the app — no cross-runtime sharing needed |
| `src/environments/environment.ts` | `feedUrl` points at GA directly |

**Cross-references:**

- [ADR-0001: Quake Detail View Data Sourcing](./0001-quake-detail-data-sourcing.md) — its deferred Phase 2 detail fetch is now a direct client query against the full-history layer.
