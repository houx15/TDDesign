# `/taste init` v2 — Thread B Phase 1: Page Types + Layout Rhythm

**Date:** 2026-04-15
**Status:** Approved for planning
**Parents:** v1 (`2026-04-14-taste-init-design.md`), v2A (`2026-04-15-taste-init-v2a-mockups.md`), v2E (`2026-04-15-taste-init-v2e-live-mockup.md`)
**Scope:** Phase 1 of Thread B. Adds page_type as Q0, replaces `layout_spacing` with a richer `layout_rhythm` dimension, and doubles the mockup matrix to cover landing + dashboard. List and docs page types, plus parser extractors for heading/body/gap/alignment, are deferred to Phase 2.

## Problem

The v1/v2 questionnaire assumes every page is a landing hero. The user's feedback:

> we may also have some different types of websites, 官网, 数据页面，列表页面 - they would be different. layout is not only about spacing, it is about 不同层级字符的大小、margin, padding, left/right or top down

Two gaps:

1. **Page type is implicit.** A "minimal" dashboard looks nothing like a "minimal" landing page, but the mood silhouettes pretend they're the same kind of page. Users building a dashboard see irrelevant hero mockups and can't tell if the mood fits their actual work.
2. **Layout is impoverished.** `layout_spacing` only varies `paddingMin`/`paddingMax`. The user can't express type scale, alignment, or gap rhythm — which is most of what "layout" means.

The cards also don't carry enough real content (heading, body, figure) for layout differences to be visible at a glance.

## Goal

Before picking a mood, the user picks the **kind of page** they're building. Every downstream mockup then renders in that page type's skeleton with the chosen mood applied. The layout dimension grows from padding-only into a full rhythm pick that bundles type scale, spacing, gap, and alignment. Every mockup carries enough real content (heading + body paragraph + figure/data element) that layout differences are visible at a glance instead of implied.

## Design

### New Q0: `page_type`

Asked before `overall_style`. Phase 1 options:

- `landing` (官网) — hero headline + subhead + CTA + figure + feature row silhouette
- `dashboard` (数据页面) — top bar + KPI cards row + chart area + table stub silhouette

Each Q0 card is a 480×320 mini-mockup rendered in a **neutral mood** (a single hand-picked default bundle used only on Q0 — not one of the 6 user-selectable moods — so the user picks page *shape* first and mood second without the shape being biased toward any mood). The Q0 cards show the full skeleton the user is committing to.

Q0 is a hard gate — the user cannot proceed to Q1 without picking a page type. Back navigation from later questions to Q0 and changing the page type does NOT clear `state.picks` (same drift behavior as Q1 mood change in v2E). The silhouette re-renders with preserved tokens; the drift is visible.

### Mockup matrix becomes 2D

`OVERALL_STYLE_MOCKUPS` changes shape:

```ts
// Before (v2E)
export const OVERALL_STYLE_MOCKUPS: Record<string, string>;  // keyed by mood

// After (v2B Phase 1)
export const OVERALL_STYLE_MOCKUPS: Record<string, Record<string, string>>;
//                                         pageType        mood    template
```

Phase 1 authors **2 × 6 = 12 templates**. Template lookup becomes `OVERALL_STYLE_MOCKUPS[state.pageType][state.mood]`. Each template still uses the same `{{slot}}` contract from v2E plus the new slots listed below.

**Content-richness contract** (asserted by test): every template must contain

- exactly one `<h1>` element,
- at least one `<p>` with ≥ 12 words of body copy,
- at least one "figure-role" element — one of: an `<img>`, a `<figure>`, a `div` styled as a chart/image placeholder (background + height, identifiable via inline `aria-label` or a `data-role="figure"` attribute), or (for dashboards) a row of at least 3 KPI-card `div`s.

This replaces v2E's looser "headline + subhead + button" baseline. Dashboards in particular need real-looking data widgets so density and alignment differences register visually.

### `layout_rhythm` replaces `layout_spacing`

New dimension. Five Phase 1 options:

- `airy-centered`
- `tight-left`
- `editorial-wide`
- `dense-split`
- `compact-dashboard`

Each option's `tokens` bundle:

```ts
tokens: {
  paddingMin: number,       // existing — keeps notes-parser round-trip
  paddingMax: number,       // existing — keeps notes-parser round-trip
  headingScale: number,     // NEW — h1 font-size in px
  bodySize: number,         // NEW — body font-size in px
  gap: number,              // NEW — flex/grid gap in px
  alignment: "centered" | "left" | "split",  // NEW
}
```

**notesTemplate** for each option keeps the canonical padding sentence (`"Section padding between X and Y px"`) that the v1 parser extractor handles. Heading/body/gap/alignment are written to the token bundle but do NOT appear in notesTemplate — they land in `preference_vector.json` under a new optional field `layout_rhythm_meta` that the parser ignores in Phase 1. Display-only until Phase 2 adds extractors.

Dimension order in the questionnaire becomes: `page_type` → `overall_style` → `color_direction` → `typography` → `component_style` → `layout_rhythm` → `detail_elements` → `motion`. Eight questions total (Q0 through Q7).

### New `StyleBundle` slots

`StyleBundle` grows by four fields to mirror the new tokens:

```ts
interface StyleBundle {
  // ...all existing fields from v2E...
  headingScale: number;     // NEW, defaults per mood
  bodySize: number;         // NEW, defaults per mood
  gap: number;              // NEW, defaults per mood
  alignment: "centered" | "left" | "split";  // NEW, defaults per mood
}
```

Templates substitute `{{headingScale}}px`, `{{bodySize}}px`, `{{gap}}px`. Alignment drives a computed slot `{{containerAlign}}` derived in `deriveSlots`:

```ts
function deriveContainerAlign(a: StyleBundle["alignment"]): string {
  if (a === "centered") return "center";
  if (a === "split")    return "space-between";
  return "flex-start";  // "left"
}
```

`MOOD_DEFAULTS` gains sensible per-mood values for the four new fields. Example (minimal-precise landing): heading 28, body 14, gap 24, alignment "centered". Example (warm-technical dashboard): heading 22, body 13, gap 16, alignment "left". Defaults are hand-picked per mood using the existing v2E values as the visual anchor.

### Client state

```ts
state = {
  choices,
  step,
  pageType: null,       // NEW — set when Q0 completes
  mood: null,
  picks: {},
  customTokens: {},
  currentStyle: null,
}
```

`recomputeStyle()` is unchanged in shape — it still starts from `MOOD_DEFAULTS[state.mood]` and merges dimension picks in fixed dimension order. The only wiring change is that `previewHtml(dimension, opt)` picks the template via the 2D lookup:

```js
function previewHtml(dimension, opt) {
  if (dimension === 'page_type') {
    return interpolate(PAGE_TYPE_PREVIEWS[opt.id], deriveSlots(NEUTRAL_BUNDLE));
  }
  if (dimension === 'overall_style') {
    if (!state.pageType) return fallbackPreview(dimension, opt);
    var tpl = OVERALL_STYLE_MOCKUPS[state.pageType][opt.id];
    return interpolate(tpl, deriveSlots(MOOD_DEFAULTS[opt.id]));
  }
  if (!state.pageType || !state.mood) return fallbackPreview(dimension, opt);
  var base = Object.assign({}, state.currentStyle || MOOD_DEFAULTS[state.mood]);
  Object.assign(base, opt.tokens);
  var template = OVERALL_STYLE_MOCKUPS[state.pageType][state.mood];
  return interpolate(template, deriveSlots(base));
}
```

`PAGE_TYPE_PREVIEWS` is a separate 2-entry map (`landing`, `dashboard`) holding the Q0 neutral-mood templates. `NEUTRAL_BUNDLE` is a new named export in `mockups.ts`.

### Writer / JSON schema

`SubmitPayload` gains one field:

```ts
interface SubmitPayload {
  pageType: "landing" | "dashboard";   // NEW — required for new submissions
  mood: Mood;
  picks: { /* ... */ };
  customTokens?: { /* ... */ };
}
```

`preference_vector.json` gains a top-level `page_type` field. The Zod schema makes it optional with default `"landing"`, so existing fixture files (which don't have it) still parse. `selections.layout_spacing` is renamed to `selections.layout_rhythm` — the schema accepts both on read (back-compat), emits only `layout_rhythm` on write. A new optional `layout_rhythm_meta` sibling field holds `{ headingScale, bodySize, gap, alignment }` and is ignored by the parser in Phase 1.

### Tests

New and extended tests:

- **`choices.test.ts`**: `page_type` dimension has exactly 2 options; `layout_rhythm` replaces `layout_spacing`; every `layout_rhythm` option has all 6 token fields and the correct types.
- **`mockups.test.ts`**: `OVERALL_STYLE_MOCKUPS` has exactly 2 page-type keys, each with exactly 6 mood keys, total 12 templates. Every template contains exactly one `<h1>`, at least one `<p>` with ≥ 12 body words, and at least one figure-role element (asserted by regex on tag/class/data-role markers). Every template contains all core slots (`{{background}}`, `{{text}}`, `{{accent}}`, `{{fontFamily}}`, `{{headingScale}}`, `{{bodySize}}`, `{{gap}}`). `PAGE_TYPE_PREVIEWS` has 2 entries. `MOOD_DEFAULTS` has valid values for the 4 new fields on every mood.
- **`render.test.ts`**: rendered SPA HTML contains the Q0 page_type question label; the inline client script has the 2D template lookup; the `deriveContainerAlign` helper is present.
- **`writer.test.ts`**: payload with `pageType: "dashboard"` round-trips through `assembleVector` and produces a `PreferenceVector` whose top-level `page_type === "dashboard"`; a payload missing `pageType` defaults to `"landing"` (back-compat read path); a `preference_vector.json` with the old `selections.layout_spacing` key parses and is re-emitted as `selections.layout_rhythm`.
- **`init-pipeline.test.ts`**: dashboard + minimal-precise + airy-centered picks → `preference_vector.json` → existing parser → resulting report still contains a padding-range check derived from `paddingMin`/`paddingMax`.

Existing v2A/v2E mockup tests (`"Write less. Ship more."` literal lookup etc.) stay green because the landing-variant templates in Phase 1 preserve the original headline copy from v2E.

### Out of scope

- `list` and `docs` page types (Phase 2 of Thread B).
- Parser extractors for `headingScale`, `bodySize`, `gap`, `alignment` (Phase 2 or later).
- Page-type-specific mood *availability* filtering — all 6 moods apply to both page types in Phase 1.
- Schema migration of existing user `preference_vector.json` files beyond the back-compat read path.
- Any changes to Thread A (Q1 mockup library), Thread C (custom colors), or Thread D (asset slot).

### Migration risks

1. **v2E landing templates become the landing column.** The 6 existing v2E templates are moved into `OVERALL_STYLE_MOCKUPS.landing` and enriched to meet the new content-richness contract (most already have h1 + body + button; they need a figure-role element added). This is a controlled mechanical edit, not a rewrite.
2. **`layout_spacing` → `layout_rhythm` rename ripples into choices.ts, writer.ts schema, render.ts dimension loop, and any integration tests that hardcode the old key.** All ripples are in Phase 1 scope and land in one commit.
3. **Existing `preference_vector.json` files in `fixtures/` and any dogfood outputs lack `page_type`.** The Zod default makes them parse as `"landing"`. No migration script needed.
4. **Content-richness test is strict.** If a dashboard template forgets the KPI row or a landing template has no figure, the test fails loudly. This is intentional — the failure mode is visible at test time, not at user time.

## Commit sequence

1. Add `page_type` dimension to `choices.ts` (2 options) + `PAGE_TYPE_PREVIEWS` + `NEUTRAL_BUNDLE` in `mockups.ts`. Tests assert shape.
2. Add `layout_rhythm` dimension replacing `layout_spacing` in `choices.ts` with 5 options. Extend `StyleBundle` and `MOOD_DEFAULTS` with the 4 new fields. Add `deriveContainerAlign` to `deriveSlots`. Tests.
3. Rewrite `OVERALL_STYLE_MOCKUPS` as a 2D map. Port the 6 v2E templates into the `landing` column, enriching each to meet the content-richness contract (add figure-role element, ensure ≥ 12 body words). Tests assert 2D shape and content-richness for landing.
4. Author the 6 `dashboard` templates from scratch (top bar + KPI row + chart/table area in each mood's silhouette). Tests assert content-richness for dashboard.
5. Wire `previewHtml` to the 2D lookup in `render.ts` inline script. Add Q0 routing to the client state machine so Q0 gates Q1. Render tests.
6. Update `SubmitPayload`, `PreferenceVectorSchema`, and `assembleVector` in `writer.ts`: add top-level `page_type` (optional, default `"landing"`), rename `selections.layout_spacing` → `selections.layout_rhythm` with back-compat read, add optional `layout_rhythm_meta` sibling. Writer tests + integration test.
7. Smoke-boot and eyeball every screen manually (author of this spec).

Each commit stays green. Each lands on main.
