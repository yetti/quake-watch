# Quake Map Marker Encoding: Banded Size, Shape and Colour

- **Status:** proposed
- **Date Created:** 2026-08-08 19:34
- **Last Updated:** 2026-08-24 10:45

## Context

The map must show each quake as a marker whose size conveys magnitude and whose appearance conveys how recently it happened. This ADR records how that mapping works: **ordered lookup tables, not formulas.**

The decision is needed now because `QuakeMap` is the next component to build (PRD milestone M3), Leaflet is not yet installed, and the encoding determines what data structures the map consumes. PRD **FR2** requires markers "sized or coloured by magnitude".

A legend already exists from V1 of the app. It shows eight discrete magnitude sizes — `< 3`, `3 - 3.9`, `4 - 4.9`, `5 - 5.9`, `6 - 6.9`, `7 - 7.9`, `8 - 8.9`, `9+` — and three recency colours: red for the last 4 hours, orange for the last 24 hours, yellow for older. The legend is shown to users, so it is a contract: whatever the map draws must match what the legend promises.

Four facts shaped the decision.

1. **Magnitude is logarithmic, so physical proportionality is unrenderable.** Each whole step is roughly 31.6× the energy release (10^1.5) and 10× the ground amplitude (trust class: web, standard seismology, corroborated). If marker _area_ were proportional to energy, radius would scale as 10^0.75ᴹ and an M9 would be about 5,600× the radius of an M4. Proportional to amplitude it is still about 316×. Neither fits on a screen. The encoding is therefore a readability choice, not a truthful one.
2. **Readers judge marks by area, not radius.** Doubling a radius quadruples the area and the eye reads the fourfold change. Any size rule has to be specified in terms of area and then converted.
3. **Marker classification is a different problem from filtering.** `HOUR_LIMITS` and `MAGNITUDE_LIMITS` in `src/app/shared/filter-limits.ts` are deliberately sparse and cumulative — two magnitude thresholds (`2.5+`, `5+`) and two overlapping lookback windows where "Last 24 hours" includes the last 4. Marker rendering is the inverse operation: given a quake, find its one bucket. That demands an exhaustive, disjoint, ordered partition covering every possible value.
4. **Colour alone cannot carry recency.** The project commits to AXE-clean output and WCAG AA (CLAUDE.md). SC 1.4.1 Use of Colour is Level A and covers users who perceive no colour at all, so recency needs a channel that survives the colour channel being deleted entirely. Size is already spent on magnitude. Finding that second channel is the substance of this decision, and most of what follows records what was tried.

## Decision Drivers

- The legend is a **published contract**. Eight legend swatches means eight rendered sizes; three recency swatches means three rendered treatments. A continuous size rule would make the legend approximate with no way for a user to interpret an in-between marker.
- Marker lookup must be **unambiguous over the renderable domain**. Every quake that can be drawn needs exactly one size and one recency treatment, so the tables must partition all magnitudes at or above 0 and all ages at or above 0 with no gaps. Values outside that domain describe a quake that cannot be drawn, and lookup must say so rather than invent an answer.
- The filter tables **cannot be reused**. They partition the same two dimensions differently and for the opposite purpose; forcing one table to serve both would corrupt whichever consumer lost the argument.
- The recency channel **must survive greyscale**, not merely test far apart in hue. This is what disqualifies "pick better colours" as a fix.
- **The size ratio is fixed at 8:1 radius / 64:1 area.** It comes from the legend and sets how strongly large events read against small ones. Any proposal that compresses it is changing the map's message, not just its sizing.
- The project commits to **WCAG AA**, including SC 2.5.8 Target Size (24×24 CSS px).
- Marker size must be **independent of zoom**, because the marker encodes a data value rather than a geographic footprint.

## Considered Options

### For the size and colour tables

1. **Banded lookup tables (chosen)** — one table maps a magnitude band to a pixel size, another maps an age bucket to a recency treatment; both are ordered descending, first-match-wins, with a final row bounded at 0. Pros: matches the legend exactly; gapless by construction over the renderable domain; the tables are plain data, so a pure `find` function covers all rendering logic and is testable without a map; new bands are a data edit. Cons: loses resolution inside a band, so an M4.1 and an M4.9 render identically; adds two tables to maintain beside the two filter tables.
2. **Continuous formula** — compute size per quake from magnitude directly. Pros: preserves within-band differences; no table to keep in step with the legend. Cons: the legend can only describe it approximately, so a user seeing an intermediate marker has no key to read it against; requires clamping at both ends anyway, which reintroduces the boundary handling a table gives for free. Rejected: it breaks the legend contract, which is the one thing the map owes the user.
3. **Reuse `HOUR_LIMITS` and `MAGNITUDE_LIMITS`** — drive markers from the existing filter tables. Pros: one set of constants. Cons: the filter tables are sparse (two magnitude thresholds against the legend's eight bands) and cumulative (`Last 24 hours` spans 0–24 hours and overlaps `Last 4 hours`), so a quake would match more than one colour bucket and most quakes would match no size band. Rejected: the two use cases need opposite properties, and the shared table would satisfy neither.

### For the second recency channel

These were evaluated in order, each rejected on evidence, and each is recorded because the rejections are the useful part.

4. **Popup text only** — put a relative age in the marker popup. Rejected: it requires interaction to reach information the map is already claiming to show, and it does nothing for someone scanning the map.
5. **Darker, further-separated fills** — retune the three hues for maximum separation. Rejected: it improves the deficiency case but does nothing for the no-colour case, which SC 1.4.1 also covers. It also abandons the V1 palette for no structural gain.
6. **SVG pattern fills** — hatch, crosshatch or dots in place of a flat fill. **Technically viable and cheaper than expected.** No plugin is required: Leaflet's SVG renderer sets fill with `path.setAttribute('fill', options.fillColor || options.color)` and performs no validation, so any valid SVG paint value passes straight through, including `url(#patternId)`. The `Leaflet.pattern` plugin was investigated and is abandoned (npm 0.1.0, published 2018-08-05, declares `leaflet: ~0.7.1`, last commit 2020-02-06) — but it is also unnecessary. Setting the pattern through `fillColor` is preferred over the `className` + CSS `fill: url(#id)` route, because `src/index.html` carries `<base href="/" />` and CSS fragment references have a history of resolving against it incorrectly. **Rejected on legibility, not feasibility.** Texture is a high-spatial-frequency cue, and blur is a low-pass filter, so blur removes it by definition. Tested in Chrome's vision-deficiency emulation across stripe, crosshatch and dot variants, at both screen-constant and shape-scaled tile sizes, and with density and orientation as the varying parameter: all failed under blurred vision at the smaller bands. No tuning of stripe width or spacing recovers this, because the cue is smaller than the blur kernel.
7. **Elongated shapes (bars)** — a 3:1 stadium for one band. This survives blur best of everything tested, because elongation is a low-frequency property. Rejected on footprint: a 3:1 bar is 1.593× as wide as its nominal diameter, so the `9+` band would be 127px wide. A 2:1 bar is 1.326×, no better than the triangle already chosen, and loses most of the elongation advantage.
8. **Rings and crosses** — a hole or spread arms in place of a solid mark. Rejected: a hole survives blur only while it is wider than the blur kernel, and at the `< 3` band it is not. A cross's arms are thinner still.
9. **Raise the minimum marker size to 24px** — make everything big enough that any encoding reads. Rejected: it is incompatible with the 8:1 ratio. Scaling the whole series by 3× to hold the ratio puts the `9+` band at 192px, which is not a map marker. Compressing the series instead would drop the area ratio from 64:1 to about 11:1, which changes how strongly the map speaks about large events. The ratio is part of the legend contract and is not available to spend on this problem.
10. **Distinct shapes (chosen)** — triangle, diamond and circle, each inscribed in the band's box. Silhouette is a low-frequency cue, so it survives blur where texture does not, and it survives greyscale completely. A square was tested first and rejected: a blurred square and a blurred circle converge, because corner count is itself a high-frequency cue. A diamond keeps its points and separates from the circle at the sizes in use.

## Decision

### Renderer

We will render each quake as a Leaflet **`Marker` with a `divIcon`** containing inline SVG, at **Leaflet 1.9.4** (the current stable release; 2.0 exists only as `2.0.0-alpha.1` on npm's alpha tag and is not a dependency this project takes).

This replaces an earlier decision to use `CircleMarker`, which cannot draw a triangle or a diamond. The switch turns out to pay for itself three times over:

|                              | `CircleMarker`  | `Marker` + `divIcon`                       |
| ---------------------------- | --------------- | ------------------------------------------ |
| Can draw non-circular shapes | no              | yes                                        |
| Keyboard focusable           | no              | yes — `keyboard: true` sets `tabIndex = 0` |
| ARIA role                    | none            | `role="button"`, set by the same option    |
| Hit area                     | is the geometry | is `iconSize`, independent of the shape    |

`Marker`'s `alt` option only applies to `<img>` icons, so a `divIcon` must carry its own `aria-label`.

`Circle` is explicitly not used: its radius is in metres, so markers would grow when zooming in and imply a physical extent the data does not describe. `divIcon` sizes are in pixels and hold constant across zoom, which is the required behaviour.

### Interval semantics

**Labels are display strings; bounds are data.** The legend's `3 - 3.9` is not the comparison the code performs. Read literally as `>= 3 && <= 3.9`, the bands leave a gap at every boundary — a magnitude of 3.95 would match no band at all, and the existing `kermadecIslands` fixture at magnitude `4.97096996303719` would fall through the `4 - 4.9` band despite plainly belonging to it. Each band is therefore the **half-open interval** `[min, next band's min)`.

Rather than store both ends and risk them drifting apart, each table holds **a single lower bound per row and is ordered descending**. Lookup takes the first row whose bound the value meets. Gaps between bands are impossible by construction, because there are no upper bounds to get wrong. Values below the final bound are handled separately — see below.

**Both tables are ordered descending and resolved first-match-wins, with a final row bounded at 0.** Order is therefore load-bearing logic, not presentation: sorting either table alphabetically, or ascending by bound, silently changes every result.

**Lookup returns `Marker | undefined`, and `undefined` means the quake is not renderable.** An earlier version of this ADR required the tables to be total — a final bound of −∞ so that lookup could never fail and no caller needed a fallback branch. That was reversed, because a total lookup has to invent an answer for input that has no meaningful answer.

Three inputs fall through the bound of 0: a negative magnitude, a timestamp in the future, and a non-numeric value (`NaN >= x` is false for every `x`, including `-Infinity`, so `NaN` falls through regardless of where the bound is set). None of these describe a quake that can be drawn, and giving them a marker would put invented data on the map. The map skips them.

This was checked against the live feed rather than reasoned about, because both failure modes turned out to be arguments from imagination:

- **Negative magnitudes do not occur.** A 7-day sample returned 62 events ranging 1.82 to 6.65, with none below 1.0 and none non-numeric. The `display_flag='Y'` filter in `environment.ts` is GA's own editorial cut and is what keeps the very small events out. If that filter is ever removed, the bottom of the magnitude table starts receiving values it was not designed for.
- **Future timestamps do not occur.** GA publishes on a review lag: in the same sample the newest event was 2.0 hours old and nothing was under an hour. Clock skew would have to be hours wrong to produce a negative age, at which point the clock is the problem.

A sentinel row — a valid-looking marker with a zero radius, returned when lookup fails — was also considered and rejected. It makes an impossible state representable, and its failure mode is a marker that silently renders as nothing. `undefined` fails at the type boundary instead, so every caller has to decide what to do about it.

### Magnitude to size

Eight bands, with sizes taken from the V1 legend artwork rather than from a formula. The legend's circles were measured directly: their diameters run 20, 40, 60, 80, 100, 120, 140 and 160 pixels — an arithmetic series adding 20px of diameter, or 10px of radius, per band. **The map draws that series at exactly half scale**, giving `radius = 5 × band index`:

| Label (legend) | Matches when magnitude ≥ | Interval  | Legend radius | Map radius | Nominal diameter |
| -------------- | ------------------------ | --------- | ------------- | ---------- | ---------------- |
| `9+`           | 9                        | `[9, ∞)`  | 80            | 40         | 80px             |
| `8 - 8.9`      | 8                        | `[8, 9)`  | 70            | 35         | 70px             |
| `7 - 7.9`      | 7                        | `[7, 8)`  | 60            | 30         | 60px             |
| `6 - 6.9`      | 6                        | `[6, 7)`  | 50            | 25         | 50px             |
| `5 - 5.9`      | 5                        | `[5, 6)`  | 40            | 20         | 40px             |
| `4 - 4.9`      | 4                        | `[4, 5)`  | 30            | 15         | 30px             |
| `3 - 3.9`      | 3                        | `[3, 4)`  | 20            | 10         | 20px             |
| `< 3`          | −∞                       | `(−∞, 3)` | 10            | 5          | 10px             |

The span from smallest to largest is **8× in radius and 64× in area**. Because radius grows linearly with band index, area grows with its square, which puts strong visual weight on large events — a deliberate emphasis inherited from the legend's design, not an accident of the scaling.

**Sizes must stay proportional to the legend.** The legend exists so a reader can match a marker against a swatch, and that matching only works if both use the same ratios. Any retune therefore rescales the whole series by one constant factor, or changes the legend artwork to match. Retuning a single band breaks the contract. The move from the previous 1/2.5 scale factor to 1/2 is exactly such a rescale: every band grew by the same 1.25×, the ratio is untouched, and **the legend artwork did not change at all** — only the divisor did.

An earlier draft set the sizes by a geometric rule — area doubling per band, radius growing by √2 ≈ 1.41. That rule is sound in isolation and is common advice for proportional symbols, but it was written without measuring the legend and does not match it. The two curves agree only at the endpoints, so mid-range markers would have been unmatchable against their own key. The measured artwork wins, because it is the artefact the user actually sees.

### Recency to shape and colour

Three buckets, same descending single-bound structure, keyed on hours elapsed since the quake. **Shape and colour vary together and encode the same thing.** They are deliberately redundant: colour is the faster read for users who have it, shape is the one that survives when they do not.

| Bucket | Matches when age ≥ | Interval  | Shape    | Fill      |
| ------ | ------------------ | --------- | -------- | --------- |
| Older  | 24 hours           | `[24, ∞)` | Circle   | `#F2D83C` |
| Today  | 4 hours            | `[4, 24)` | Diamond  | `#F29F03` |
| Recent | 0 hours            | `[0, 4)`  | Triangle | `#F20203` |

The hex values are sampled from the V1 legend artwork and are fixed, not indicative.

These intervals are **disjoint**, unlike the cumulative `HOUR_LIMITS` used for filtering, where `Last 24 hours` spans `[0, 24)` and overlaps `Last 4 hours`. A quake two hours old is a red triangle only; it is not also an orange diamond.

**Shape and colour are the only carriers of recency. Size carries magnitude. Nothing else in the marker carries meaning.**

### Shapes inscribe in the band's box

Every shape is drawn to fit the band's `d × d` box, where `d` is the nominal diameter from the size
table. Given the band's nominal radius `r`:

| Shape    | Construction        | Width     | Area vs circle |
| -------- | ------------------- | --------- | -------------- |
| Circle   | radius = `r`        | `1.000 d` | 100%           |
| Diamond  | half-diagonal = `r` | `1.000 d` | 63.7%          |
| Triangle | circumradius = `r`  | `1.000 d` | 41.3%          |

**The shapes therefore do not cover equal area, and that is accepted.** An alternative construction
was considered and rejected: scaling each shape so its area equals the circle's `πr²`, which would
make the diamond's half-diagonal `r√π/√2` and the triangle's side `r√(4π/√3)`. The argument for it is
that size encodes magnitude, so unequal ink means a Recent M5 triangle reads as a smaller event than
an Older M5 circle.

That argument assumes readers compare a triangle's size against a circle's, which is not how the map
is used. Size is read **within a shape** — triangle against triangle — and against the legend's own
swatches, which are drawn with the same construction. Across shapes, the thing being read is recency,
not magnitude.

Inscribing also buys two concrete simplifications:

- **Every marker is exactly `d` wide.** Area-matching makes non-circular shapes wider than their
  nominal diameter — 1.253× for the diamond and 1.347× for the triangle, so the `9+` triangle would
  be 108px across against the circle's 80px. Inscribed, the size table describes the real footprint
  and nothing has to be compared against a 1.347 constant.
- **The 24×24 hit box fits cleanly**, rather than needing to account for a shape that overflows it.

One placement detail: an inscribed triangle spans `cy − r` to `cy + r/2`, so it is 0.75`d` tall and its bounding box is asymmetric — the box centre sits `r/4` **above** the marker's anchor point. Its **centroid**, however, is exactly at the anchor, because an equilateral triangle's circumcentre and centroid coincide. Building the vertices at circumradius `r` from the centre therefore needs no `iconAnchor` compensation; anchoring at the icon box centre is correct. Verified numerically: centroid offset 0.0000. Only a triangle drawn to fill its bounding box would need an offset.

### Target size

Every marker's `divIcon` uses an **`iconSize` of at least 24×24 CSS px**, transparent beyond the drawn shape. This satisfies SC 2.5.8 Target Size (Minimum, Level AA) without changing what is drawn, because the criterion governs the _target_, not the _visual_. It is the same pattern as a 16px icon inside a 44px tap target. A `CircleMarker` cannot do this, since an SVG path's hit area is its geometry — this is the second independent reason for the renderer change.

### Stroke

**Every marker carries a dark stroke, which encodes nothing.** It is one fixed colour on every marker regardless of age or magnitude, and exists solely to meet contrast. Measured against OpenStreetMap's land beige (`#F2EFE9`), the fills give contrast ratios of 3.82:1 (red), 1.88:1 (orange) and 1.25:1 (yellow) — so orange and yellow fall below the 3:1 that SC 1.4.11 asks of graphical objects, and a yellow marker on light terrain is close to invisible. A dark stroke supplies the discernible boundary the criterion wants: against black the same fills measure 9.74:1, 14.66:1 and 4.79:1. Leaflet's `weight` default of 3 is too heavy for a 10px marker, so the stroke is 1px. Corners use `stroke-linejoin="round"` so the triangle's and diamond's points do not spike.

**The stroke colour is `#1C1C1C`.** Any dark grey clears SC 1.4.11 at the outer edge — even `#595959` measures 6.10:1 against the land beige — so the outer edge is not what constrains the choice. The inner edge is: the stroke also has to separate from the fill it outlines, or the outline stops reading as an outline on the darkest fill.

| Stroke    | vs land `#F2EFE9` | vs red `#F20203` | vs orange `#F29F03` | vs yellow `#F2D83C` |
| --------- | ----------------- | ---------------- | ------------------- | ------------------- |
| `#000000` | 18.30             | 4.79             | 9.74                | 14.66               |
| `#1C1C1C` | 14.85             | 3.88             | 7.90                | 11.90               |
| `#262626` | 13.19             | 3.45             | 7.02                | 10.57               |
| `#333333` | 11.01             | 2.88             | 5.86                | 8.82                |
| `#4D4D4D` | 7.37              | 1.93             | 3.92                | 5.90                |

`#1C1C1C` is the lightest value that clears 3:1 against every fill with margin. Red is the binding constraint and is awkward in both directions: it is the only fill that already passes 3:1 against land unaided (3.82:1), so it needs the stroke least, but it is also the darkest, so it is the fill a stroke struggles most to separate from. Since shape now carries recency, a crisp silhouette on the smallest markers is worth the extra darkness.

A future change that varies the stroke per quake would be adding a fourth encoding channel, and would need to be recorded here as an amendment.

### Low vision

**Browser magnification is the accommodation for low vision, not a larger default marker.** Leaflet's own zoom does not help: marker sizes are in screen pixels and hold constant across zoom levels, so zooming in spreads quakes apart geographically while each stays the same size. Fullscreen behaves the same way. Browser zoom (`Cmd +` / `Ctrl +`) scales CSS pixels and does enlarge markers, and is the mechanism WCAG expects for this.

A **fullscreen control** is still worth adding, for crowding rather than for acuity. Leaflet 1.9.4 ships no such control — core has only Attribution, Layers, Scale and Zoom — so it is the native Fullscreen API applied to the map container, followed by `map.invalidateSize()`. Leaflet caches container dimensions and only recomputes on a window `resize` event, which the Fullscreen API does not reliably fire; without the call the map renders at the old size and click coordinates land in the wrong place.

### Legend

The legend is rebuilt as a component reading these same tables, and changes in two ways from the V1 artwork:

- **Magnitude swatches are drawn at map scale and in neutral grey.** V1 coloured its size swatches, which is no longer available: a circle now _means_ "older than 24 hours", so a row of coloured circles would read as eight old quakes rather than eight sizes. Neutral grey says the row is about size only.
- **Recency swatches show shape and colour together**, at a single size, since both encode the same value.

Drawing the magnitude swatches at true map size also means the legend matches markers directly rather than proportionally, and lays out as a compact horizontal strip instead of V1's tall column.

### Why the alternatives lost

- Option 2 optimises for information density at the cost of the legend, and the legend is what makes any of the encoding readable. Within-band resolution is available on demand in the list view and the popup, so nothing is truly lost.
- Option 3 collapses two partitions that exist for opposite reasons. Filtering selects quakes from a limit; rendering classifies a quake into a bucket. The properties each needs — sparse and cumulative versus exhaustive and disjoint — are mutually exclusive.
- Options 6 through 8 all failed the same test for the same underlying reason: they encode in features finer than a blur kernel. Option 10 encodes in the outline, which is the coarsest feature a mark has.
- Option 9 would have worked visually but only by spending the size ratio, which belongs to the legend contract rather than to the accessibility budget.

## Consequences

**Positive:**

- The map and the legend cannot disagree, because both read the same tables.
- All rendering logic reduces to a pure `find` over an array plus a shape-path function, testable against the existing `quake-fixtures.ts` data with no Leaflet instance and no DOM. Every band boundary is an exact-value test, and the unrenderable cases (negative magnitude, future timestamp, `NaN`) are three more.
- Recency survives greyscale and blur, so **SC 1.4.1 Use of Colour is satisfied on the map itself**, not deferred to a text alternative.
- Markers are keyboard focusable with an ARIA role and an accessible name, which `CircleMarker` could not offer at all.
- **SC 2.5.8 Target Size is satisfied at every band**, including `< 3`, without enlarging any marker.
- Marker sizes stay constant across zoom levels, so the visual encoding does not shift as the user navigates.
- The size ratio, and therefore the legend artwork, is unchanged from V1.

**Negative (accepted costs):**

- Within-band magnitude differences are invisible on the map. An M4.1 and an M4.9 draw identically. Accepted: the list view carries exact values.
- Four tables now describe two dimensions — two for filtering, two for rendering. They partition differently on purpose, and that must stay documented, or a future change will "unify" them and break one consumer.
- `divIcon` markers are DOM elements in the marker pane rather than SVG paths in a shared renderer, which is heavier per marker. The GA feed is bounded by a page size (ADR-0002), so this is expected to be acceptable, but it should be measured rather than assumed once real data volumes are known.
- The three shapes do not carry equal ink: a diamond is 63.7% and a triangle 41.3% of the circle's area at the same nominal size. Accepted, because size is read within a shape rather than across shapes. If user testing shows otherwise, the fix is the area-matched construction recorded above, at the cost of markers wider than their nominal diameter.

**Neutral / risks to watch:**

- **24×24 hit boxes overlap in clusters even when the markers do not.** Whichever marker renders last wins the click. SC 2.5.8 tolerates this, but it means click accuracy is worst exactly where quakes are densest. Measured against a 7-day sample of the live feed, 4 of 62 events fell in the `< 3` band and 53 of 62 were older than 24 hours, so the map is dominated by small clustered `Older` circles rather than by the sub-3 events the earlier draft of this ADR assumed. Draw order should put larger magnitudes above smaller ones, so the significant quake is both visible and clickable.
- **The three fills still converge under colour vision deficiency.** Simulated with the Viénot transform, deuteranopia (roughly 6% of men) renders them `#8C8C00`, `#BCBC00` and `#E0E039` — CIE ΔE of 23.1 between red and orange, and 12.8 between orange and yellow, where anything under 25 is weak separation and under 10 is indistinguishable. Protanopia is better for red-versus-orange (43.3) but no better for orange-versus-yellow (17.7). This is now a comfort problem rather than a conformance one, because shape carries the same information independently.
- **The contrast measurements above assume OpenStreetMap's land beige.** Water, satellite imagery, or a dark tile theme would change every ratio, and the dark stroke would stop working on a dark basemap. Re-measure if the tile layer changes. If the stroke is ever dropped, the fills would have to darken to clear 3:1 unaided — holding hue and saturation, that is roughly `#BD7C02` for orange and `#9E890B` for yellow, both of which read as noticeably muddier than the legend.
- **Shape separation at the `< 3` band is adequate but not generous.** At 10px nominal the triangle is 13px wide and the diamond 13px, and they are distinguishable at normal acuity and under mild blur, but not under heavy blur unassisted. Browser zoom is the stated accommodation. If user testing disagrees, the lever is the scale factor — one constant, applied to the whole series — not a per-band adjustment.
- **Leaflet's defaults are wrong for markers this small.** `fillOpacity` defaults to 0.2 and `weight` to 3; both need overriding.
- The `QuakeList` table carries a caption naming the colour key, and `app.html` carries a visible skip link to it (`#quake-list`). These were added while colour was still the only recency channel. They remain useful as a text equivalent and should be kept, but they are no longer load-bearing for SC 1.4.1.

## Notes

**Key files:**

| File                                                   | Purpose                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `src/app/shared/filter-limits.ts`                      | Filter limits — sparse and cumulative. Deliberately _not_ the marker tables; do not merge   |
| `src/app/features/quakes/quake-filters.ts`             | Filter predicates; the marker lookup will be its sibling, not an extension of it            |
| `src/app/features/quakes/quake-list/quake-fixtures.ts` | `allQuakes` and `quakeWith()` — fixture data for testing marker lookup without a map        |
| `src/app/features/quakes/quake-list/quake-list.html`   | Table caption naming the colour key; `id="quake-list"` is the skip-link target              |
| `src/app/app.html`                                     | Visible skip link from the map region to the quake list                                     |
| `src/app/shared/quake.ts`                              | `Quake.magnitude` and `Quake.time` are the two inputs the tables read                       |
| `src/index.html`                                       | Carries `<base href="/" />`, which is why CSS fragment URLs were avoided                    |
| `src/environments/environment.ts`                      | The feed URL's `display_flag='Y'` filter is what keeps sub-1.0 magnitudes out of the tables |
| `docs/quake_watch_prd.md`                              | FR2 (markers sized or coloured by magnitude) and milestone M3                               |

Files this decision anticipates but which do not yet exist: a marker lookup table, its pure resolver, a shape-path helper, a legend component, and the `QuakeMap` component, all under `src/app/features/quakes/`. Leaflet is not yet a dependency.

**Cross-references:**

- [ADR-0001: Quake Detail View Data Sourcing](./0001-quake-detail-data-sourcing.md) — the detail view is where exact magnitude is shown, which is why within-band resolution can be dropped on the map.
- [ADR-0002: GA Feed Access](./0002-backend-proxy-for-ga-feed.md) — names Leaflet interop and accessibility as the skills this project concentrates effort on, and bounds the feed page size that makes `divIcon` marker counts tractable.

**Related docs:**

- [PRD](../quake_watch_prd.md) — FR2, and M3's guidance that Leaflet owns its own canvas inside one Angular-managed element.
- `.claude/CLAUDE.md` — the Accessibility Requirements section that constrains the size, shape and colour choices above.
