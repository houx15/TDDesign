# `/taste init` v2 — Thread A: Overall-Style Mini-Mockups

**Date:** 2026-04-15
**Status:** Approved for planning
**Parent:** `2026-04-14-taste-init-design.md` (v1)
**Scope:** Replace the 6 overall_style cards' preview content with distinctive hand-authored mini-mockups. No schema changes, no new dimensions, no new server routes.

## Problem

In v1, every overall_style card renders as a generic 300×180 tile with a short label. Users cannot tell moods apart at a glance. The feedback from the first smoke-run:

> 不够直观 ... 从 name 看不出来，应该可以预览一下不同风格的样式

The root cause: the silhouette dominates perception. Six tiles with the same silhouette read as one design in six colors. Mood is structural, not decorative — we need to express it through layout itself.

## Goal

When the user lands on the `overall_style` question, each card reads as a *distinct kind of website* within 2 seconds. Copy, layout, type scale, and color tokens all cooperate to sell the mood. The user picks not by reading a label but by recognizing which tile *feels* like the thing they want to build.

## Non-goals

- Page type selection (landing vs dashboard vs list) — that is Thread B.
- Richer layout model (margin/padding/gap rhythm, type scale) — also Thread B.
- Custom colors or expanded palette — Thread C.
- Asset slot for logos/mascots — Thread D.

## Design

### Card shape and size

Each card grows from 300×180 to **480×320** with a **320-pixel preview area** (up from 120). The choosing grid becomes 2 columns on wide screens, 1 on narrow. Six moods × 320px preview fits in roughly two laptop viewport heights — acceptable for a step you pass through once.

CSS changes in `render.ts`:

- `.grid` `grid-template-columns: repeat(auto-fill, minmax(440px, 1fr))`
- `.card-preview { height: 320px }` — but only when the dimension is `overall_style`. All other dimensions keep the 120px preview for v2.

### Where mockup HTML lives

New file: `tddesign/cli/init/mockups.ts`. Exports:

```ts
export const OVERALL_STYLE_MOCKUPS: Record<string, string>;
```

One entry per `overall_style` option id, keyed by id. Value is a complete HTML fragment (no outer `<html>` / `<body>`) designed to fit a 480×320 container. Each fragment is hand-authored to sell the mood through distinctive layout, not just tokens. Inline styles only — no shared CSS — so the fragments are self-contained and can be concatenated into any parent.

`choices.ts` stays untouched for option data. `render.ts` imports `OVERALL_STYLE_MOCKUPS` and uses it in `previewHtml` when `dimension === 'overall_style'`, falling back to the existing label-only stub for any option id missing from the map.

Rationale for a separate file: mockup HTML is ~40–80 lines per mood × 6 moods = ~300 lines of hand-crafted markup. Inlining that into `choices.ts` would bury the data schema. Keeping it alongside `render.ts` is the closest layer.

### Mood-by-mood design direction

Each mockup is a landing-page hero (v2 doesn't introduce page types yet) but the *shape* of that hero differs per mood. The copy below is the canonical v2 content — editable in the spec before code lands.

| Mood | Layout silhouette | Copy | Visual markers |
|---|---|---|---|
| **minimal-precise** | Centered, generous whitespace, single H1 + single subhead + one primary CTA. Thin hairline divider under the H1. | **"Write less. Ship more."** / *"A distraction-free editor for deep work."* / `[Get started]` | `#0F0F10` bg, 28px H1, 400 weight, 96px vertical padding, 1px hairline |
| **editorial-serif** | Wide left margin, serif display H1 at top-left, long subhead below, small-caps tertiary label at top ("ISSUE 14"). No button in the hero — it's a magazine cover. | **"The quiet renaissance of slow software."** / *"Craft, rhythm, and the things we lose when everything is optimized for speed."* / `ISSUE 14 · APRIL` | `#FDFCF8` bg, Georgia 32px italic, 1.1 line-height, left margin = 25% of width |
| **playful-rounded** | Diagonal split background, tilted-by-2° headline, rounded 16px buttons, a circular "new!" badge in the corner. Two CTAs, primary and secondary. | **"Make something people will hug."** / *"The fastest way to ship a product users actually love."* / `[Try it free ↗] [See examples]` | Gradient pink→violet, Inter 26px bold, 16px radius, rotated 2deg on the badge |
| **brutalist-raw** | Full-bleed background with a single huge all-caps slab headline breaking out of the container. No subhead. One raw rectangular button with a thick black border. Visible grid lines / rules along the edges. | **"BUILT. NOT RENDERED."** / — / `[ENTER →]` | `#D4D4D4` bg, Arial Black 44px uppercase, 0 radius, 4px solid black border |
| **warm-technical** | Two-column: left = H1 + subhead + CTA, right = inline monospace code sample with syntax highlighting. Amber accent color. | **"Developer tools, built with warmth."** / *"APIs that feel hand-held. SDKs that read like prose."* / `[Read the docs]` + mini code block on the right | `#F7F3EC` bg, JetBrains Mono for code, `#C2410C` accent, 1.5 line-height body |
| **vivid-modern** | Bold geometric gradient background, center-aligned very large H1 with color-mixed gradient text, floating glassy button below. Small iridescent shimmer line at the bottom. | **"The future, early."** / *"Compute, rendered at the speed of thought."* / `[Join the waitlist]` | Violet→magenta gradient, Inter 32px 700, backdrop-blur button, gradient-text H1 |

Each mockup is expected to land at ~40–80 lines of inline-styled HTML. The dev writing them can tweak pixel values freely as long as the **silhouette** (column structure, alignment, presence/absence of secondary elements) matches the table.

### Rendering integration

In `render.ts`, modify `previewHtml(dimension, opt)` to branch on `overall_style` and look up the mockup:

```ts
if (dimension === 'overall_style') {
  var mockup = OVERALL_STYLE_MOCKUPS[opt.id];
  if (mockup) return mockup;
  return '<div style="padding:20px;font-size:13px;opacity:0.7">' + opt.label + '</div>';
}
```

The card-preview height must be tall enough for overall_style. The cleanest path is conditional inline styling on the card container in the `cardHtml` helper: when `dim.dimension === 'overall_style'`, emit `<div class="card-preview" style="height:320px">`; otherwise keep the default 120px.

### Tests

One new file: `tests/unit/init/mockups.test.ts`.

- Every `overall_style` option id has an entry in `OVERALL_STYLE_MOCKUPS`.
- Every mockup value contains the option's headline copy (substring match) — locks the spec's copy into code.
- Every mockup value has at least one inline `style=` attribute — asserts self-contained styling.
- Rendered HTML from `buildIndexHtml()` contains the `minimal-precise` headline substring — proves the mockup is wired into the SPA.

Existing `render.test.ts` continues to pass (its assertions are structural, not content-specific beyond dimension ids).

### Scope guard

No changes to: `choices.ts` option schema, `writer.ts`, `server.ts`, `init.ts`, `open.ts`, the preference vector JSON format, the notes parser, or any pipeline stage downstream of the writer. The generated `preference_vector.json` must remain byte-identical to v1 when the user picks the same options.

## Commit sequence

1. `mockups.ts` with all 6 entries + passing tests (TDD: red → green)
2. `render.ts` wired to use mockups + conditional 320px card height + render test update
3. Smoke-verify by booting the server, hitting `GET /`, grepping for the 6 headlines

Each commit lands green.
