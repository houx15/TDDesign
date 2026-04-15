# `/taste init` v2 — Thread E: Live Mockup Inheritance

**Date:** 2026-04-15
**Status:** Approved for planning
**Parents:** v1 design (`2026-04-14-taste-init-design.md`), v2 Thread A (`2026-04-15-taste-init-v2a-mockups.md`)

## Problem

v2 Thread A made the Q1 overall_style screen excellent — the user said so. But Q2–Q7 still render as abstract swatches, code samples, and icon stubs disconnected from the chosen mood. The user cannot see what their accumulating choices actually produce. The taste signal drops to zero the moment they leave Q1.

The user's feedback:

> is it possible, that after we select a style in the first question, the later ones also render on that page? I think the first question is excellent! because I can see it.

## Goal

After the user picks a mood in Q1, every subsequent question renders its options as mini-mockups **in the chosen mood's silhouette**, with each card applying that option's specific tokens on top of everything previously picked. The user watches their page evolve as they answer. Picks are preserved across Back navigation; going Back to Q1 and changing the mood re-renders the silhouette with existing picks still applied (drift is visible, not hidden).

## Design

### Core shift: mockups become templates with slots

The v2A mockups are static HTML strings with hard-coded colors, fonts, radii, and padding. In v2E they become **parameterized templates** with `{{placeholder}}` tokens that get substituted at render time against a `StyleBundle`.

**StyleBundle shape:**

```ts
interface StyleBundle {
  // color slot
  background: string;       // "#0F0F10"
  text: string;             // "#FAFAFA"
  accent: string;           // "#5B6EE1"
  // typography slot
  fontFamily: string;       // "Inter, system-ui, sans-serif"
  // component slot
  radius: number;           // 6
  shadow: string;           // "0 1px 2px rgba(0,0,0,0.06)"
  border: string;           // "none"
  // layout slot
  paddingMin: number;       // 48
  paddingMax: number;       // 96
  // detail slot
  iconStyle: "line" | "filled" | "emoji" | "duotone";
  // motion slot
  motionDurationMs: number; // 150
  motionEasing: string;     // "ease-out"
  // mood slot — identifies which silhouette to render
  mood: string;             // "minimal-precise"
}
```

Every field in the bundle corresponds to a slot used by at least one mood template. The template substitutes `{{background}}`, `{{fontFamily}}`, `{{radius}}`, etc. Some derived slots (`{{iconRow}}`, `{{buttonTransition}}`) are computed client-side from simpler slots before substitution.

### Templates live in `mockups.ts` as string literals

`OVERALL_STYLE_MOCKUPS: Record<string, string>` from v2A stays — same keys, same 6 moods — but the values become templates with `{{key}}` placeholders instead of hardcoded values. Example (minimal-precise):

```
<div style="background:{{background}}; color:{{text}}; font-family:{{fontFamily}}; ...">
  <h1 style="font-size:28px; ...">Write less. Ship more.</h1>
  <div style="height:1px; background:rgba(255,255,255,0.15); ...">
  <p style="font-size:14px; opacity:0.6; ...">A distraction-free editor for deep work.</p>
  <button style="background:{{accent}}; color:white; border-radius:{{radius}}px; padding:{{paddingMin}}px {{paddingMax}}px; box-shadow:{{shadow}}; transition:{{buttonTransition}};">
    Get started {{iconRow}}
  </button>
</div>
```

The headline copy stays hard-coded per mood (it's the mood's voice, not a slot). Everything that varies with a downstream question becomes a slot.

**Slot set per mood (minimum):** `{{background}}`, `{{text}}`, `{{accent}}`, `{{fontFamily}}`, `{{radius}}`, `{{shadow}}`, `{{border}}`, `{{paddingMin}}`, `{{paddingMax}}`, `{{buttonTransition}}`, `{{iconRow}}`. Each mood may use a subset if a slot doesn't make sense for its silhouette (e.g. editorial-serif has no button, so it ignores `{{radius}}` and `{{buttonTransition}}`).

### Mood defaults

`MOOD_DEFAULTS: Record<string, StyleBundle>` — one full StyleBundle per mood. These defaults are what the user sees on Q1 before any downstream choices are made. They mirror the hardcoded values from v2A.

Example:
```ts
"minimal-precise": {
  background: "#0F0F10",
  text: "#FAFAFA",
  accent: "#5B6EE1",
  fontFamily: "Inter, system-ui, sans-serif",
  radius: 6,
  shadow: "0 1px 2px rgba(0,0,0,0.06)",
  border: "none",
  paddingMin: 48,
  paddingMax: 96,
  iconStyle: "line",
  motionDurationMs: 150,
  motionEasing: "ease-out",
  mood: "minimal-precise",
}
```

A mood default is derived from: its own appearance in v2A + the hand-picked "sensible" values for slots v2A didn't vary (iconStyle, motion). These are defaults, not constraints — the user overrides them by making downstream picks.

### Token key renames in `choices.ts`

To enable flat-spread merging (`{...bundle, ...option.tokens}`), the existing option token keys must align with `StyleBundle` keys:

| Dimension | v2A key | v2E key |
|---|---|---|
| typography | `family` | `fontFamily` |
| motion | `durationMs` | `motionDurationMs` |
| motion | `easing` | `motionEasing` |
| layout_spacing | `paddingMin` | (unchanged) |
| layout_spacing | `paddingMax` | (unchanged) |
| color_direction | `background`, `text`, `accent` | (unchanged) |
| component_style | `radius`, `shadow`, `border` | (unchanged) |
| detail_elements | `iconStyle` | (unchanged) |

Only typography and motion need renames. Two lines each. No schema changes; `tokens: Record<string, string | number>` already accepts any keys.

### Client state model

State extends to track accumulated tokens:

```js
state = {
  choices: [...],
  step: 0,
  mood: null,              // set when Q1 completes
  picks: {},               // { color_direction: "mono-indigo", ... }
  currentStyle: null,      // StyleBundle — MOOD_DEFAULTS[mood] merged with picks
};
```

`currentStyle` recomputes whenever `state.mood` or `state.picks` changes:

```js
function recomputeStyle() {
  if (!state.mood) { state.currentStyle = null; return; }
  var bundle = Object.assign({}, MOOD_DEFAULTS[state.mood]);
  var dimOrder = ["color_direction", "typography", "component_style", "layout_spacing", "detail_elements", "motion"];
  for (var i = 0; i < dimOrder.length; i++) {
    var dim = dimOrder[i];
    var pickId = state.picks[dim];
    if (!pickId) continue;
    var option = findOption(dim, pickId);
    if (option) Object.assign(bundle, option.tokens);
  }
  state.currentStyle = bundle;
}
```

Order matters: later dimensions can override earlier ones, but since each dimension owns distinct keys there are no conflicts in practice. Deterministic merge via the fixed `dimOrder`.

### Rendering each dimension's cards

For Q2–Q7, each card's preview becomes: "take the current accumulated style, override it with this option's tokens, stamp into the mood template."

```js
function previewHtml(dimension, opt) {
  if (dimension === 'overall_style') {
    var bundle = MOOD_DEFAULTS[opt.id];
    return interpolate(OVERALL_STYLE_MOCKUPS[opt.id], deriveSlots(bundle));
  }
  if (!state.mood) return fallbackPreview(dimension, opt);
  var base = Object.assign({}, state.currentStyle || MOOD_DEFAULTS[state.mood]);
  Object.assign(base, opt.tokens);
  var template = OVERALL_STYLE_MOCKUPS[state.mood];
  return interpolate(template, deriveSlots(base));
}
```

`deriveSlots(bundle)` extends the flat bundle with computed slots:

```js
function deriveSlots(b) {
  var slots = Object.assign({}, b);
  slots.buttonTransition = "transform " + b.motionDurationMs + "ms " + b.motionEasing;
  slots.iconRow = renderIconRow(b.iconStyle); // "→" arrow for line, "▶" for filled, "🚀" for emoji, "◆" for duotone
  return slots;
}
```

`interpolate(template, slots)` is a trivial string replace:

```js
function interpolate(tpl, slots) {
  return tpl.replace(/\{\{(\w+)\}\}/g, function (_, k) {
    return slots[k] !== undefined ? String(slots[k]) : '';
  });
}
```

### Back navigation: preserve picks, re-render silhouette

Going Back from any question to Q1 and picking a different mood does NOT clear `state.picks`. The silhouette changes but the color/typography/etc. tokens stay. The mockup re-renders with the new silhouette + preserved tokens, which may look ugly (e.g. editorial serif on a brutalist slab). That ugliness is intentional — it tells the user their current combination is drifting.

Going Back from Q3 to Q2 and picking a different color changes `state.picks.color_direction`, recomputes `state.currentStyle`, and Q3's cards re-render with the new accumulated base.

### Card size / grid for downstream questions

v2A widened the grid to `minmax(440px, 1fr)` and made Q1 card-previews 320px tall. v2E keeps both: **all questions** now use 440px-min cards with 320px card-preview height. Every card is a full mini-mockup. Downstream questions lose density (fewer cards per row) but gain signal (each card is a believable page).

The 480×320 preview area per card is enough to render the mood's full silhouette, including the button whose radius/border/transition is being overridden.

### Review screen

Unchanged in shape, but each review row now shows a tiny 240×160 mockup of the accumulated style (sixth-size version of the preview). The tiny mockup uses the final `currentStyle`. This replaces the text-only review rows from v1/v2A.

### Tests

New tests in `tests/unit/init/mockups.test.ts` (extending the v2A file):

1. **Every mood template contains every core slot placeholder.** Assert `{{background}}`, `{{text}}`, `{{accent}}`, `{{fontFamily}}` appear in every mood template (except editorial-serif which intentionally omits button-related slots — asserted explicitly).
2. **`MOOD_DEFAULTS` has one full bundle per mood.** Assert every key of `StyleBundle` is present and correctly typed for every mood.
3. **Interpolation round-trips.** Pure function: pass a template with known slots, verify the output contains expected substitutions and no remaining `{{...}}`.
4. **`deriveSlots` produces `buttonTransition` and `iconRow` from base fields.** Assert shape.
5. **Snapshot test: interpolating `minimal-precise` template with `paper-black` color tokens produces HTML containing `#FFFFFF` (new bg), `Inter` (unchanged fontFamily), and the original "Write less. Ship more." headline.** Locks the merge+interpolate path.

No new integration tests — the server/writer/pipeline layer is unchanged. The generated `preference_vector.json` remains byte-compatible with v1 since `choices.ts` token renames only affect the `tokens` field (internal to init), not the `notes` field (which is the parser-facing surface).

### Out of scope

- No new dimensions.
- No new questions.
- No schema changes.
- No material-library integration.
- No Thread B (page-type picker), Thread C (custom colors), or Thread D (asset slot).

### Migration risks

1. **v2A's static HTML mockups get rewritten as templates.** The `"Write less. Ship more."` tests still pass because the headline copy is hard-coded inside the template. The slot-aware tests are additive.
2. **`choices.ts` token renames ripple into `render.ts`'s client-side `previewHtml` switch cases** (typography uses `t.family`, motion uses `t.durationMs`, `t.easing`). Those switch cases are about to be deleted entirely — previewHtml collapses into the interpolate+merge path for every non-overall_style dimension. Net simplification.
3. **`tests/unit/init/render.test.ts` asserts `fontFamily: '` substring for typography** — not currently, but if it did, renames would break it. Verified that the existing render tests assert only dimension/mood literals and structural hooks, not token field names, so they stay green.

## Commit sequence

1. Add `StyleBundle` interface and `MOOD_DEFAULTS` to `mockups.ts`. Tests assert every mood has a full bundle.
2. Rewrite the 6 v2A mockup strings as templates with `{{slot}}` placeholders. Add `interpolate` function and test round-trips.
3. Rename typography `family` → `fontFamily`, motion `durationMs`/`easing` → `motionDurationMs`/`motionEasing` in `choices.ts`. Update any tests referencing those keys.
4. Rewrite `render.ts`'s inline client `previewHtml`: delete the per-dimension switch branches (typography/component/layout/detail/motion), replace with the merge+interpolate path; add `recomputeStyle`, `deriveSlots`, `interpolate` helpers into the inline script.
5. Wire the review screen's tiny mockups. Add a test asserting the review page's HTML contains the interpolated mockup for each picked dimension.
6. Smoke-boot and eyeball every screen manually (the author of this spec will do this step — not automated).

Each commit stays green. Each lands on main.
