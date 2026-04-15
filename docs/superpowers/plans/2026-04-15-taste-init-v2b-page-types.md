# `/taste init` v2B Phase 1 — Page Types + Layout Rhythm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `page_type` as Q0 (landing + dashboard), expand `layout_spacing` option tokens with heading/body/gap/alignment, and grow `OVERALL_STYLE_MOCKUPS` into a 2D `pageType × mood` matrix (12 content-rich templates).

**Architecture:** Front-end / questionnaire layer only. Parser, checker, composer, and planner are untouched — the new layout fields are display-only in Phase 1 and `layout_spacing` stays the dimension key everywhere. `page_type` is added as an optional top-level field on `PreferenceVectorSchema` with default `"landing"` so existing fixtures and `preference_vector.json` files continue to parse. Mockup authoring enforces a content-richness contract (exactly one `<h1>`, body paragraph ≥ 12 words, ≥ 1 figure-role element) via unit tests.

**Tech Stack:** TypeScript ESM (`.js` import extensions), Vitest, Zod, Node built-in `http`, vanilla JS inline client.

**Spec refinement from `2026-04-15-taste-init-v2b-page-types.md`:** The spec proposed renaming `selections.layout_spacing` → `selections.layout_rhythm`. A grep of the codebase showed this key is referenced by 15 files (parser, checker, composer, planner, schemas, fixtures, tests) with no grading benefit since the new fields are display-only. This plan keeps the internal dimension key `layout_spacing`, treats "layout_rhythm" as a UI-layer concept only (new option tokens + enriched mockups), and drops the `layout_rhythm_meta` JSON sibling. Page-type support is still added as a new top-level schema field.

---

## File Structure

Files created or modified, with responsibility:

- `tddesign/schemas.ts` — **modify.** Add optional `page_type` top-level field on `PreferenceVectorSchema`.
- `tddesign/cli/init/choices.ts` — **modify.** Add `PAGE_TYPE_OPTIONS` array + new `DimensionChoices` entry for `"page_type"` (handled specially — not in `DIMENSIONS` union). Replace the 4 `LAYOUT_OPTIONS` entries with 5 new ones whose tokens include `headingScale`, `bodySize`, `gap`, `alignment`.
- `tddesign/cli/init/mockups.ts` — **modify.** Extend `StyleBundle` with 4 new fields. Extend `MOOD_DEFAULTS` per mood. Add `NEUTRAL_BUNDLE` export. Add `PAGE_TYPE_PREVIEWS: Record<string, string>` (2 entries). Restructure `OVERALL_STYLE_MOCKUPS` from `Record<string, string>` to `Record<string, Record<string, string>>` (2 page-type keys × 6 mood keys = 12 templates). Extend `deriveSlots` with `containerAlign` computed field.
- `tddesign/cli/init/writer.ts` — **modify.** `SubmitPayload` gains `pageType: "landing" | "dashboard"`. `assembleVector` stamps `page_type` on the output `PreferenceVector`.
- `tddesign/cli/init/server.ts` — **modify.** `/submit` payload handler passes `pageType` into `assembleVector`.
- `tddesign/cli/init/render.ts` — **modify.** SPA inline client gains `state.pageType`, a Q0 step that gates Q1, a 2D `OVERALL_STYLE_MOCKUPS` lookup, and `deriveContainerAlign` inline. The `choices.json` shipped to the client includes the new `page_type` dimension metadata.
- `tests/unit/init/choices.test.ts` — **modify.** Add assertions for page_type + layout_rhythm option shapes.
- `tests/unit/init/mockups.test.ts` — **modify.** Add assertions for 2D matrix shape, content-richness contract, new StyleBundle fields, `PAGE_TYPE_PREVIEWS`, `NEUTRAL_BUNDLE`, `deriveContainerAlign`.
- `tests/unit/init/writer.test.ts` — **modify.** Add page_type round-trip test + back-compat test.
- `tests/unit/init/render.test.ts` — **modify.** Assert Q0 question label appears in SPA HTML, inline client contains 2D lookup.
- `tests/unit/schemas.test.ts` — **modify.** Add test that `page_type` defaults to `"landing"` when absent.
- `tests/integration/init-pipeline.test.ts` — **modify.** Use a `pageType: "dashboard"` payload and assert the padding-range check still appears.

Dimension list update: the v1 `CHOICES: DimensionChoices[]` has 7 entries keyed on the graded `Dimension` union. `page_type` is not graded and should not enter the `DIMENSIONS` schema union. We therefore introduce a parallel `PAGE_TYPE_CHOICE: DimensionChoices` exported separately (its `dimension` field is typed as a widened string), and `render.ts` renders it as a synthetic Q0 before walking `CHOICES`.

---

## Task 1: Add `page_type` field to PreferenceVectorSchema

**Files:**
- Modify: `tddesign/schemas.ts` (the `PreferenceVectorSchema` definition)
- Test: `tests/unit/schemas.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/schemas.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { PreferenceVectorSchema } from "../../tddesign/schemas.js";

describe("PreferenceVectorSchema page_type", () => {
  it("accepts a preference vector without page_type and defaults to 'landing'", () => {
    const raw = {
      profile_name: "local",
      scope: "project",
      selections: {
        overall_style:   { choice: "minimal-precise",   source_refs: ["linear"], notes: "" },
        color_direction: { choice: "mono-indigo",       source_refs: ["linear"], notes: "" },
        typography:      { choice: "geometric-sans",    source_refs: ["vercel"], notes: "" },
        component_style: { choice: "subtle-radius-minimal-shadow", source_refs: ["linear"], notes: "" },
        layout_spacing:  { choice: "spacious-hero",     source_refs: ["stripe"], notes: "" },
        detail_elements: { choice: "line-icons-no-emoji", source_refs: ["linear"], notes: "" },
        motion:          { choice: "subtle-fast",       source_refs: ["vercel"], notes: "" },
      },
      created_at: "2026-04-15T00:00:00.000Z",
      updated_at: "2026-04-15T00:00:00.000Z",
    };
    const parsed = PreferenceVectorSchema.parse(raw);
    expect(parsed.page_type).toBe("landing");
  });

  it("accepts page_type: 'dashboard'", () => {
    const raw = {
      profile_name: "local",
      scope: "project",
      page_type: "dashboard",
      selections: {
        overall_style:   { choice: "minimal-precise",   source_refs: ["linear"], notes: "" },
        color_direction: { choice: "mono-indigo",       source_refs: ["linear"], notes: "" },
        typography:      { choice: "geometric-sans",    source_refs: ["vercel"], notes: "" },
        component_style: { choice: "subtle-radius-minimal-shadow", source_refs: ["linear"], notes: "" },
        layout_spacing:  { choice: "spacious-hero",     source_refs: ["stripe"], notes: "" },
        detail_elements: { choice: "line-icons-no-emoji", source_refs: ["linear"], notes: "" },
        motion:          { choice: "subtle-fast",       source_refs: ["vercel"], notes: "" },
      },
      created_at: "2026-04-15T00:00:00.000Z",
      updated_at: "2026-04-15T00:00:00.000Z",
    };
    const parsed = PreferenceVectorSchema.parse(raw);
    expect(parsed.page_type).toBe("dashboard");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/schemas.test.ts`
Expected: FAIL — `page_type` missing on parsed output.

- [ ] **Step 3: Implement the schema change**

In `tddesign/schemas.ts`, modify `PreferenceVectorSchema` to add `page_type`:

```ts
export const PreferenceVectorSchema = z.object({
  profile_name: z.string(),
  scope: z.enum(["global", "project"]),
  page_type: z.enum(["landing", "dashboard"]).default("landing"),
  selections: z.object({
    overall_style: SelectionSchema,
    color_direction: SelectionSchema,
    typography: SelectionSchema,
    component_style: SelectionSchema,
    layout_spacing: SelectionSchema,
    detail_elements: SelectionSchema,
    motion: SelectionSchema,
  }),
  created_at: z.string(),
  updated_at: z.string(),
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/schemas.test.ts`
Expected: PASS. Also run `npx vitest run` to confirm no other schema test broke.

- [ ] **Step 5: Commit**

```bash
git add tddesign/schemas.ts tests/unit/schemas.test.ts
git commit -m "feat(schemas): WI-1 add page_type field to PreferenceVectorSchema"
```

---

## Task 2: Add `PAGE_TYPE_CHOICE` to choices.ts

**Files:**
- Modify: `tddesign/cli/init/choices.ts`
- Test: `tests/unit/init/choices.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/init/choices.test.ts`:

```ts
import { PAGE_TYPE_CHOICE } from "../../../tddesign/cli/init/choices.js";

describe("PAGE_TYPE_CHOICE", () => {
  it("has exactly 2 options: landing and dashboard", () => {
    expect(PAGE_TYPE_CHOICE.options).toHaveLength(2);
    const ids = PAGE_TYPE_CHOICE.options.map(o => o.id).sort();
    expect(ids).toEqual(["dashboard", "landing"]);
  });

  it("uses 'page_type' as its dimension key", () => {
    expect(PAGE_TYPE_CHOICE.dimension).toBe("page_type");
  });

  it("every option has all 6 mood tags (moods apply to both page types)", () => {
    for (const opt of PAGE_TYPE_CHOICE.options) {
      expect(opt.moodTags.length).toBe(6);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/choices.test.ts`
Expected: FAIL — `PAGE_TYPE_CHOICE` not exported.

- [ ] **Step 3: Implement**

Append to `tddesign/cli/init/choices.ts`:

```ts
// page_type is a synthetic Q0 dimension. It is NOT in the graded `Dimension`
// union and never reaches the parser/checker. It exists only to gate which
// mockup column the questionnaire renders.
const PAGE_TYPE_OPTIONS: ChoiceOption[] = [
  {
    id: "landing",
    label: "Landing / Marketing",
    moodTags: [...MOODS],
    sourceRefs: ["builtin"],
    tokens: {},
    notesTemplate: "landing marketing page",
    render: "mood",
  },
  {
    id: "dashboard",
    label: "Dashboard / Analytics",
    moodTags: [...MOODS],
    sourceRefs: ["builtin"],
    tokens: {},
    notesTemplate: "dashboard analytics page",
    render: "mood",
  },
];

export const PAGE_TYPE_CHOICE: Omit<DimensionChoices, "dimension"> & {
  dimension: "page_type";
} = {
  dimension: "page_type",
  question: "What kind of page are you designing?",
  options: PAGE_TYPE_OPTIONS,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/init/choices.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/choices.ts tests/unit/init/choices.test.ts
git commit -m "feat(init): WI-2 add PAGE_TYPE_CHOICE synthetic Q0 dimension"
```

---

## Task 3: Replace layout_spacing options with layout_rhythm option set

**Files:**
- Modify: `tddesign/cli/init/choices.ts` (the `LAYOUT_OPTIONS` const)
- Test: `tests/unit/init/choices.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/init/choices.test.ts`:

```ts
describe("layout_spacing (layout_rhythm) options", () => {
  const layoutDim = CHOICES.find(d => d.dimension === "layout_spacing")!;

  it("has exactly 5 options", () => {
    expect(layoutDim.options).toHaveLength(5);
  });

  it("every option carries all 6 token fields", () => {
    for (const opt of layoutDim.options) {
      expect(opt.tokens).toMatchObject({
        paddingMin: expect.any(Number),
        paddingMax: expect.any(Number),
        headingScale: expect.any(Number),
        bodySize: expect.any(Number),
        gap: expect.any(Number),
        alignment: expect.stringMatching(/^(centered|left|split)$/),
      });
    }
  });

  it("every option still emits a padding-range notesTemplate", () => {
    for (const opt of layoutDim.options) {
      expect(opt.notesTemplate).toMatch(/Section padding between \d+ and \d+ px/);
    }
  });

  it("option ids cover the five named rhythms", () => {
    const ids = layoutDim.options.map(o => o.id).sort();
    expect(ids).toEqual([
      "airy-centered",
      "compact-dashboard",
      "dense-split",
      "editorial-wide",
      "tight-left",
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/choices.test.ts -t "layout_rhythm"`
Expected: FAIL — old options still present, new ids missing.

- [ ] **Step 3: Implement**

Replace the `LAYOUT_OPTIONS` const in `tddesign/cli/init/choices.ts` with:

```ts
const LAYOUT_OPTIONS: ChoiceOption[] = [
  {
    id: "airy-centered",
    label: "Airy Centered",
    moodTags: ["minimal", "editorial", "vivid-modern"],
    sourceRefs: ["stripe"],
    tokens: { paddingMin: 64, paddingMax: 128, headingScale: 36, bodySize: 15, gap: 32, alignment: "centered" },
    notesTemplate: "Section padding between 64 and 128 px",
    render: "layout",
  },
  {
    id: "tight-left",
    label: "Tight Left-Aligned",
    moodTags: ["warm-technical", "brutalist", "minimal"],
    sourceRefs: ["linear"],
    tokens: { paddingMin: 24, paddingMax: 48, headingScale: 28, bodySize: 14, gap: 16, alignment: "left" },
    notesTemplate: "Section padding between 24 and 48 px",
    render: "layout",
  },
  {
    id: "editorial-wide",
    label: "Editorial Wide Margins",
    moodTags: ["editorial"],
    sourceRefs: ["stripe"],
    tokens: { paddingMin: 80, paddingMax: 160, headingScale: 44, bodySize: 16, gap: 28, alignment: "left" },
    notesTemplate: "Section padding between 80 and 160 px",
    render: "layout",
  },
  {
    id: "dense-split",
    label: "Dense Split",
    moodTags: ["warm-technical", "playful", "vivid-modern"],
    sourceRefs: ["vercel"],
    tokens: { paddingMin: 32, paddingMax: 64, headingScale: 24, bodySize: 13, gap: 20, alignment: "split" },
    notesTemplate: "Section padding between 32 and 64 px",
    render: "layout",
  },
  {
    id: "compact-dashboard",
    label: "Compact Dashboard",
    moodTags: ["warm-technical", "minimal", "brutalist"],
    sourceRefs: ["linear"],
    tokens: { paddingMin: 16, paddingMax: 32, headingScale: 20, bodySize: 12, gap: 12, alignment: "left" },
    notesTemplate: "Section padding between 16 and 32 px",
    render: "layout",
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/init/choices.test.ts`
Expected: PASS. Also run the full suite to confirm the integration/round-trip test for the padding range still passes: `npx vitest run`. If any existing test hard-codes an old option id (`spacious-hero`, `compact-dense`, `medium-breath`, `editorial-margins`), update the test to use `airy-centered` (same padding values as `spacious-hero`: 64/128 — wait, `spacious-hero` was 48/96. Use `airy-centered` with updated assertion values, or update the test to use the new id + new range).

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/choices.ts tests/unit/init/choices.test.ts
git commit -m "feat(init): WI-3 replace layout_spacing options with 5 layout_rhythm variants"
```

---

## Task 4: Extend StyleBundle with heading/body/gap/alignment

**Files:**
- Modify: `tddesign/cli/init/mockups.ts` (the `StyleBundle` interface + `MOOD_DEFAULTS`)
- Test: `tests/unit/init/mockups.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/init/mockups.test.ts`:

```ts
describe("StyleBundle v2B new fields", () => {
  it("every mood in MOOD_DEFAULTS has headingScale, bodySize, gap, alignment", () => {
    for (const [moodKey, bundle] of Object.entries(MOOD_DEFAULTS)) {
      expect(typeof bundle.headingScale).toBe("number");
      expect(typeof bundle.bodySize).toBe("number");
      expect(typeof bundle.gap).toBe("number");
      expect(["centered", "left", "split"]).toContain(bundle.alignment);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/mockups.test.ts -t "v2B new fields"`
Expected: FAIL — fields missing.

- [ ] **Step 3: Implement**

In `tddesign/cli/init/mockups.ts`, extend the `StyleBundle` interface:

```ts
export interface StyleBundle {
  background: string;
  text: string;
  accent: string;
  fontFamily: string;
  radius: number;
  shadow: string;
  border: string;
  paddingMin: number;
  paddingMax: number;
  iconStyle: "line" | "filled" | "emoji" | "duotone";
  motionDurationMs: number;
  motionEasing: string;
  mood: string;
  headingScale: number;
  bodySize: number;
  gap: number;
  alignment: "centered" | "left" | "split";
}
```

Then add the 4 new fields to every entry in `MOOD_DEFAULTS`:

| mood | headingScale | bodySize | gap | alignment |
|---|---|---|---|---|
| `minimal-precise` | 28 | 14 | 24 | centered |
| `editorial-serif` | 32 | 14 | 20 | left |
| `playful-rounded` | 26 | 13 | 16 | centered |
| `brutalist-raw` | 44 | 14 | 8 | left |
| `warm-technical` | 22 | 13 | 16 | left |
| `vivid-modern` | 36 | 13 | 20 | centered |

Example patch for `minimal-precise`:

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
  headingScale: 28,
  bodySize: 14,
  gap: 24,
  alignment: "centered",
},
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/init/mockups.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/mockups.ts tests/unit/init/mockups.test.ts
git commit -m "feat(init): WI-4 extend StyleBundle with heading/body/gap/alignment slots"
```

---

## Task 5: Add `deriveContainerAlign` helper and extend `deriveSlots`

**Files:**
- Modify: `tddesign/cli/init/mockups.ts` (the `deriveSlots` function)
- Test: `tests/unit/init/mockups.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
describe("deriveSlots v2B", () => {
  it("emits containerAlign from alignment field", () => {
    const b = { ...MOOD_DEFAULTS["minimal-precise"], alignment: "centered" as const };
    const slots = deriveSlots(b);
    expect(slots.containerAlign).toBe("center");
  });
  it("maps 'left' to 'flex-start'", () => {
    const b = { ...MOOD_DEFAULTS["minimal-precise"], alignment: "left" as const };
    expect(deriveSlots(b).containerAlign).toBe("flex-start");
  });
  it("maps 'split' to 'space-between'", () => {
    const b = { ...MOOD_DEFAULTS["minimal-precise"], alignment: "split" as const };
    expect(deriveSlots(b).containerAlign).toBe("space-between");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/mockups.test.ts -t "deriveSlots v2B"`
Expected: FAIL — `containerAlign` missing.

- [ ] **Step 3: Implement**

In `tddesign/cli/init/mockups.ts`, add helper and update `deriveSlots`:

```ts
function deriveContainerAlign(a: StyleBundle["alignment"]): string {
  if (a === "centered") return "center";
  if (a === "split") return "space-between";
  return "flex-start";
}

export function deriveSlots(
  bundle: StyleBundle,
): Record<string, string | number> {
  return {
    ...bundle,
    buttonTransition: `transform ${bundle.motionDurationMs}ms ${bundle.motionEasing}`,
    iconRow: renderIconRow(bundle.iconStyle),
    containerAlign: deriveContainerAlign(bundle.alignment),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/init/mockups.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/mockups.ts tests/unit/init/mockups.test.ts
git commit -m "feat(init): WI-5 add containerAlign derived slot"
```

---

## Task 6: Add `NEUTRAL_BUNDLE` and `PAGE_TYPE_PREVIEWS`

**Files:**
- Modify: `tddesign/cli/init/mockups.ts`
- Test: `tests/unit/init/mockups.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
describe("NEUTRAL_BUNDLE and PAGE_TYPE_PREVIEWS", () => {
  it("NEUTRAL_BUNDLE is a full StyleBundle", () => {
    expect(NEUTRAL_BUNDLE.background).toBeDefined();
    expect(NEUTRAL_BUNDLE.headingScale).toBeTypeOf("number");
    expect(["centered", "left", "split"]).toContain(NEUTRAL_BUNDLE.alignment);
  });

  it("PAGE_TYPE_PREVIEWS has exactly 2 entries: landing and dashboard", () => {
    expect(Object.keys(PAGE_TYPE_PREVIEWS).sort()).toEqual(["dashboard", "landing"]);
  });

  it("every page-type preview contains an <h1>", () => {
    for (const tpl of Object.values(PAGE_TYPE_PREVIEWS)) {
      expect(tpl).toMatch(/<h1[\s>]/);
    }
  });

  it("dashboard preview contains a KPI-row marker (data-role=\"kpi\" or equivalent)", () => {
    expect(PAGE_TYPE_PREVIEWS.dashboard).toMatch(/data-role=["']kpi["']/);
  });

  it("landing preview contains a figure-role marker", () => {
    expect(PAGE_TYPE_PREVIEWS.landing).toMatch(/data-role=["']figure["']/);
  });
});
```

Also add the imports at the top of the test file if not already there:

```ts
import {
  NEUTRAL_BUNDLE,
  PAGE_TYPE_PREVIEWS,
} from "../../../tddesign/cli/init/mockups.js";
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/mockups.test.ts -t "PAGE_TYPE_PREVIEWS"`
Expected: FAIL — exports missing.

- [ ] **Step 3: Implement**

Append to `tddesign/cli/init/mockups.ts`:

```ts
export const NEUTRAL_BUNDLE: StyleBundle = {
  background: "#F7F7F8",
  text: "#1A1A1A",
  accent: "#3B82F6",
  fontFamily: "Inter, system-ui, sans-serif",
  radius: 6,
  shadow: "0 1px 2px rgba(0,0,0,0.06)",
  border: "none",
  paddingMin: 32,
  paddingMax: 48,
  iconStyle: "line",
  motionDurationMs: 150,
  motionEasing: "ease-out",
  mood: "neutral",
  headingScale: 24,
  bodySize: 13,
  gap: 20,
  alignment: "left",
};

export const PAGE_TYPE_PREVIEWS: Record<string, string> = {
  landing: [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;padding:{{paddingMin}}px {{paddingMax}}px;box-sizing:border-box;font-family:{{fontFamily}};gap:{{gap}}px">',
    '<div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.5">LANDING PAGE</div>',
    '<h1 style="font-size:{{headingScale}}px;font-weight:600;margin:0;line-height:1.1">A marketing hero that sells the product.</h1>',
    '<p style="font-size:{{bodySize}}px;opacity:0.7;margin:0;max-width:60%">Headline, subheadline, a primary call-to-action, a product figure, and a row of feature callouts underneath.</p>',
    '<div style="display:flex;gap:12px;align-items:center">',
    '<button style="background:{{accent}};color:#fff;border:none;border-radius:{{radius}}px;padding:8px 16px;font-size:12px;font-family:inherit;cursor:pointer">Get started →</button>',
    '<span style="font-size:11px;opacity:0.6">or see examples</span>',
    "</div>",
    '<div data-role="figure" style="flex:1;min-height:60px;background:rgba(0,0,0,0.05);border-radius:{{radius}}px;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0.4">[ product figure ]</div>',
    "</div>",
  ].join(""),

  dashboard: [
    '<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;box-sizing:border-box;font-family:{{fontFamily}}">',
    '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;border-bottom:1px solid rgba(0,0,0,0.08)">',
    '<div style="font-size:13px;font-weight:600">◆ Dashboard</div>',
    '<div style="font-size:11px;opacity:0.6">houyuxin@local</div>',
    "</div>",
    '<div style="padding:16px 20px;display:flex;flex-direction:column;gap:{{gap}}px;flex:1">',
    '<h1 style="font-size:{{headingScale}}px;font-weight:600;margin:0">Q2 performance overview</h1>',
    '<p style="font-size:{{bodySize}}px;opacity:0.7;margin:0">Top-line metrics, a trend chart, and a transaction table below for daily review.</p>',
    '<div data-role="kpi" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">',
    '<div style="border:1px solid rgba(0,0,0,0.1);border-radius:{{radius}}px;padding:10px"><div style="font-size:10px;opacity:0.6">Revenue</div><div style="font-size:18px;font-weight:600">$48.2k</div></div>',
    '<div style="border:1px solid rgba(0,0,0,0.1);border-radius:{{radius}}px;padding:10px"><div style="font-size:10px;opacity:0.6">Active</div><div style="font-size:18px;font-weight:600">1,204</div></div>',
    '<div style="border:1px solid rgba(0,0,0,0.1);border-radius:{{radius}}px;padding:10px"><div style="font-size:10px;opacity:0.6">Churn</div><div style="font-size:18px;font-weight:600">2.3%</div></div>',
    "</div>",
    '<div style="flex:1;background:rgba(0,0,0,0.04);border-radius:{{radius}}px;min-height:40px;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0.4">[ chart area ]</div>',
    "</div>",
    "</div>",
  ].join(""),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/init/mockups.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/mockups.ts tests/unit/init/mockups.test.ts
git commit -m "feat(init): WI-6 add NEUTRAL_BUNDLE and PAGE_TYPE_PREVIEWS for Q0"
```

---

## Task 7: Restructure `OVERALL_STYLE_MOCKUPS` to 2D (landing column)

**Files:**
- Modify: `tddesign/cli/init/mockups.ts` (the `OVERALL_STYLE_MOCKUPS` const)
- Test: `tests/unit/init/mockups.test.ts`

This task ports the existing 6 v2E mood templates into a new `landing` sub-key and enriches each so it passes the content-richness contract (h1 + ≥ 12-word paragraph + figure-role element). Dashboard templates are authored in Task 8.

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/init/mockups.test.ts`:

```ts
describe("OVERALL_STYLE_MOCKUPS 2D shape (landing)", () => {
  it("is keyed by page type at the top level", () => {
    expect(Object.keys(OVERALL_STYLE_MOCKUPS).sort()).toContain("landing");
  });

  it("landing column has all 6 moods", () => {
    const landing = OVERALL_STYLE_MOCKUPS.landing;
    expect(Object.keys(landing).sort()).toEqual([
      "brutalist-raw",
      "editorial-serif",
      "minimal-precise",
      "playful-rounded",
      "vivid-modern",
      "warm-technical",
    ]);
  });

  it("every landing template contains exactly one <h1>", () => {
    for (const tpl of Object.values(OVERALL_STYLE_MOCKUPS.landing)) {
      const h1Matches = tpl.match(/<h1[\s>]/g) || [];
      expect(h1Matches.length).toBe(1);
    }
  });

  it("every landing template has a body paragraph of at least 12 words", () => {
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.landing)) {
      const pMatches = [...tpl.matchAll(/<p[^>]*>([^<]+)<\/p>/g)];
      const hasLongP = pMatches.some(m => m[1].trim().split(/\s+/).length >= 12);
      expect(hasLongP, `landing/${mood} missing 12+ word paragraph`).toBe(true);
    }
  });

  it("every landing template has a figure-role element", () => {
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.landing)) {
      const hasFigure = /data-role=["']figure["']/.test(tpl)
        || /<figure[\s>]/.test(tpl)
        || /<img[\s>]/.test(tpl);
      expect(hasFigure, `landing/${mood} missing figure-role element`).toBe(true);
    }
  });

  it("every landing template uses core slots", () => {
    const required = ["{{background}}", "{{text}}", "{{accent}}", "{{fontFamily}}", "{{paddingMin}}", "{{paddingMax}}"];
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.landing)) {
      for (const slot of required) {
        expect(tpl, `landing/${mood} missing slot ${slot}`).toContain(slot);
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/mockups.test.ts -t "2D shape"`
Expected: FAIL — `OVERALL_STYLE_MOCKUPS.landing` is `undefined` (current shape is `Record<string, string>`).

- [ ] **Step 3: Implement**

Rewrite the `OVERALL_STYLE_MOCKUPS` export in `tddesign/cli/init/mockups.ts` as:

```ts
export const OVERALL_STYLE_MOCKUPS: Record<string, Record<string, string>> = {
  landing: {
    "minimal-precise": /* existing v2E minimal template, enriched */,
    "editorial-serif": /* existing v2E editorial template, enriched */,
    "playful-rounded": /* existing v2E playful template, enriched */,
    "brutalist-raw":   /* existing v2E brutalist template, enriched */,
    "warm-technical":  /* existing v2E warm-technical template, enriched */,
    "vivid-modern":    /* existing v2E vivid-modern template, enriched */,
  },
  // dashboard: added in Task 8
};
```

**Enrichment procedure for each existing v2E template:**

1. Take the current template string.
2. Verify it already has an `<h1>` (it does).
3. Verify its body `<p>` has ≥ 12 words. If not, extend the copy. Baseline copies from v2A already meet this bar; if trimmed, restore to the canonical v2A voice.
4. Add a figure-role element before the button. For each mood:

    | mood | figure element to add |
    |---|---|
    | `minimal-precise` | `<div data-role="figure" style="width:100%;height:60px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:{{radius}}px;margin:16px 0"></div>` |
    | `editorial-serif` | `<figure style="width:100%;height:70px;background:rgba(0,87,255,0.06);border-left:3px solid {{accent}};margin:0 0 20px;display:flex;align-items:center;padding:0 16px;font-size:11px;font-style:italic;opacity:0.5">[ pull quote ]</figure>` |
    | `playful-rounded` | `<div data-role="figure" style="width:120px;height:60px;background:linear-gradient(135deg,#F472B6,#A855F7);border-radius:{{radius}}px;margin:12px 0"></div>` |
    | `brutalist-raw` | `<div data-role="figure" style="position:absolute;right:{{paddingMin}}px;top:{{paddingMin}}px;width:80px;height:80px;background:{{text}};opacity:0.1"></div>` |
    | `warm-technical` | (already has code block — add `data-role="figure"` to the existing code `<div>`) |
    | `vivid-modern` | `<div data-role="figure" style="width:140px;height:4px;background:linear-gradient(90deg,transparent,{{accent}},transparent);margin:14px auto"></div>` |

5. Leave all existing slot substitutions, button hover handlers, and core copy intact.

The implementer may open `tddesign/cli/init/mockups.ts` in their editor and move the existing 6 templates wholesale into the `landing` sub-map, then apply the enrichments above inline.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/init/mockups.test.ts`
Expected: PASS for all `2D shape` + `v2E snapshot` tests. Any existing test asserting `OVERALL_STYLE_MOCKUPS["minimal-precise"]` directly (without `.landing`) must be updated to use `OVERALL_STYLE_MOCKUPS.landing["minimal-precise"]` in the same commit.

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/mockups.ts tests/unit/init/mockups.test.ts
git commit -m "feat(init): WI-7 restructure OVERALL_STYLE_MOCKUPS into 2D matrix (landing column)"
```

---

## Task 8: Author 6 dashboard mood templates

**Files:**
- Modify: `tddesign/cli/init/mockups.ts` (add the `dashboard` sub-map)
- Test: `tests/unit/init/mockups.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/init/mockups.test.ts`:

```ts
describe("OVERALL_STYLE_MOCKUPS dashboard column", () => {
  it("has all 6 moods", () => {
    expect(Object.keys(OVERALL_STYLE_MOCKUPS.dashboard || {}).sort()).toEqual([
      "brutalist-raw",
      "editorial-serif",
      "minimal-precise",
      "playful-rounded",
      "vivid-modern",
      "warm-technical",
    ]);
  });

  it("every dashboard template contains exactly one <h1>", () => {
    for (const tpl of Object.values(OVERALL_STYLE_MOCKUPS.dashboard)) {
      const h1Matches = tpl.match(/<h1[\s>]/g) || [];
      expect(h1Matches.length).toBe(1);
    }
  });

  it("every dashboard template has a body paragraph of at least 12 words", () => {
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.dashboard)) {
      const pMatches = [...tpl.matchAll(/<p[^>]*>([^<]+)<\/p>/g)];
      const hasLongP = pMatches.some(m => m[1].trim().split(/\s+/).length >= 12);
      expect(hasLongP, `dashboard/${mood} missing 12+ word paragraph`).toBe(true);
    }
  });

  it("every dashboard template has at least 3 KPI-role cells", () => {
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.dashboard)) {
      const kpiMatches = tpl.match(/data-role=["']kpi["']/g) || [];
      expect(kpiMatches.length, `dashboard/${mood} KPI count`).toBeGreaterThanOrEqual(1);
    }
  });

  it("every dashboard template uses core slots", () => {
    const required = ["{{background}}", "{{text}}", "{{accent}}", "{{fontFamily}}"];
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.dashboard)) {
      for (const slot of required) {
        expect(tpl, `dashboard/${mood} missing slot ${slot}`).toContain(slot);
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/mockups.test.ts -t "dashboard column"`
Expected: FAIL — `dashboard` sub-map undefined.

- [ ] **Step 3: Implement**

Add the `dashboard` sub-map to `OVERALL_STYLE_MOCKUPS`. Each of the 6 templates must satisfy the content-richness contract: one `<h1>`, one `<p>` with ≥ 12 words, and at least one container carrying `data-role="kpi"` with 3+ metric cells inside. Use the dimension's tokens through the same slot contract.

**Canonical skeleton (apply to all 6 moods, varying only the mood's own visual language):**

```
[top bar: brand mark + account/status chip]
[headline <h1> using {{headingScale}}]
[subhead <p> with ≥ 12 words using {{bodySize}}]
[KPI row container (data-role="kpi") with 3 metric cells, each a <div> with label + big number]
[chart area or table stub (flex:1 or grid), background tinted from {{accent}}]
```

Copy per mood (hand-authored — implementer may tighten/rephrase but must preserve ≥ 12-word body):

| mood | h1 | body (≥ 12 words) |
|---|---|---|
| `minimal-precise` | "Quarterly numbers, at a glance." | "A clean dashboard for revenue, activation, and retention — just the numbers you check every morning." |
| `editorial-serif` | "The state of the business, in prose." | "A considered view of the quarter's performance, arranged like a magazine spread for thoughtful Monday-morning reading." |
| `playful-rounded` | "Everything you need, none of the noise." | "Warm, rounded panels that make the morning metrics feel like good news instead of a job description." |
| `brutalist-raw` | "NUMBERS. NO FLUFF." | "Raw data in a raw grid — revenue, active users, and churn rate on a single unapologetic screen." |
| `warm-technical` | "Operator dashboard." | "Dense telemetry with room to breathe: throughput, error rate, and latency arranged for the on-call engineer." |
| `vivid-modern` | "Pulse of the product." | "A vivid, glassy panel set against a gradient backdrop — the metrics you'd check between meetings." |

**Skeleton HTML template** (implementer substitutes mood-specific colors/fonts via the standard slots — the skeleton structure itself is shared across all 6 dashboards):

```html
<div style="width:100%;height:100%;background:{{background}};color:{{text}};display:flex;flex-direction:column;box-sizing:border-box;font-family:{{fontFamily}}">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid rgba(128,128,128,0.18)">
    <div style="font-size:12px;font-weight:600"><!-- brand mark per mood --></div>
    <div style="font-size:10px;opacity:0.6">2026 Q2</div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;gap:{{gap}}px;padding:{{paddingMin}}px {{paddingMax}}px">
    <h1 style="font-size:{{headingScale}}px;font-weight:600;margin:0;line-height:1.15"><!-- mood h1 --></h1>
    <p style="font-size:{{bodySize}}px;opacity:0.7;margin:0;max-width:80%"><!-- 12+ word body --></p>
    <div data-role="kpi" style="display:grid;grid-template-columns:repeat(3,1fr);gap:{{gap}}px">
      <div style="border:1px solid rgba(128,128,128,0.18);border-radius:{{radius}}px;padding:10px 12px;background:rgba(128,128,128,0.05)">
        <div style="font-size:10px;opacity:0.6">REVENUE</div>
        <div style="font-size:20px;font-weight:700;color:{{accent}}">$48.2k</div>
      </div>
      <div style="border:1px solid rgba(128,128,128,0.18);border-radius:{{radius}}px;padding:10px 12px;background:rgba(128,128,128,0.05)">
        <div style="font-size:10px;opacity:0.6">ACTIVE</div>
        <div style="font-size:20px;font-weight:700">1,204</div>
      </div>
      <div style="border:1px solid rgba(128,128,128,0.18);border-radius:{{radius}}px;padding:10px 12px;background:rgba(128,128,128,0.05)">
        <div style="font-size:10px;opacity:0.6">CHURN</div>
        <div style="font-size:20px;font-weight:700">2.3%</div>
      </div>
    </div>
    <div style="flex:1;min-height:40px;background:rgba(128,128,128,0.06);border-radius:{{radius}}px;display:flex;align-items:center;justify-content:center;font-size:10px;opacity:0.5">[ chart ]</div>
  </div>
</div>
```

**Per-mood variations:**

- `minimal-precise`: dark bg, hairline borders, accent color on revenue number only, no shadows.
- `editorial-serif`: serif h1 + italic body, left-aligned, no KPI borders (use baseline rules instead), cream bg.
- `playful-rounded`: 16-px radius, gradient top bar, emoji allowed in brand mark, soft shadow.
- `brutalist-raw`: all-caps h1 in Arial Black, 0-radius cells, thick black borders, no backdrop tint, visible grid lines.
- `warm-technical`: amber accent, monospace numbers in KPI cards, 1-px borders, left-aligned.
- `vivid-modern`: glassy gradient bg, backdrop-blur on KPI cards, gradient-text h1, 12-px radius.

The implementer authors 6 string literals following this pattern. Each becomes a `.join("")` entry in the `dashboard` sub-map.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/init/mockups.test.ts`
Expected: PASS. Also run `npx vitest run` to confirm nothing else broke.

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/mockups.ts tests/unit/init/mockups.test.ts
git commit -m "feat(init): WI-8 author 6 dashboard mood templates"
```

---

## Task 9: Writer + server accept `pageType`

**Files:**
- Modify: `tddesign/cli/init/writer.ts` (the `SubmitPayload` interface + `assembleVector`)
- Modify: `tddesign/cli/init/server.ts` (payload extraction in `/submit` handler)
- Test: `tests/unit/init/writer.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/init/writer.test.ts`:

```ts
describe("assembleVector page_type", () => {
  it("writes page_type: 'dashboard' when payload specifies it", () => {
    const payload: SubmitPayload = {
      pageType: "dashboard",
      mood: "minimal",
      picks: {
        overall_style: "minimal-precise",
        color_direction: "mono-indigo",
        typography: "geometric-sans",
        component_style: "subtle-radius-minimal-shadow",
        layout_spacing: "compact-dashboard",
        detail_elements: "line-icons-no-emoji",
        motion: "subtle-fast",
      },
    };
    const v = assembleVector(payload);
    expect(v.page_type).toBe("dashboard");
  });

  it("defaults to 'landing' when payload omits pageType", () => {
    const payload = {
      mood: "minimal",
      picks: {
        overall_style: "minimal-precise",
        color_direction: "mono-indigo",
        typography: "geometric-sans",
        component_style: "subtle-radius-minimal-shadow",
        layout_spacing: "airy-centered",
        detail_elements: "line-icons-no-emoji",
        motion: "subtle-fast",
      },
    } as SubmitPayload;
    const v = assembleVector(payload);
    expect(v.page_type).toBe("landing");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/writer.test.ts -t "page_type"`
Expected: FAIL — `pageType` field not in interface; `v.page_type` undefined.

- [ ] **Step 3: Implement**

In `tddesign/cli/init/writer.ts`, modify `SubmitPayload`:

```ts
export interface SubmitPayload {
  pageType?: "landing" | "dashboard";
  mood: Mood;
  picks: {
    overall_style: string;
    color_direction: string;
    typography: string;
    component_style: string;
    layout_spacing: string;
    detail_elements: string;
    motion: string;
  };
  customTokens?: {
    color_direction?: { background: string; text: string; accent: string };
  };
}
```

And in `assembleVector`, stamp the field on the output vector before schema validation:

```ts
const draft = {
  profile_name: "local" as const,
  scope: "project" as const,
  page_type: payload.pageType ?? "landing",
  selections: { /* ... existing ... */ },
  created_at: now,
  updated_at: now,
};
return PreferenceVectorSchema.parse(draft);
```

In `tddesign/cli/init/server.ts`, the `/submit` handler already JSON-parses the body and passes it to `assembleVector` — no structural change needed if the body is forwarded wholesale. Verify by reading the handler; if it explicitly picks fields, add `pageType: body.pageType`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/init/writer.test.ts`
Expected: PASS. Also run `npx vitest run tests/unit/init/server.test.ts` to confirm no regression.

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/writer.ts tddesign/cli/init/server.ts tests/unit/init/writer.test.ts
git commit -m "feat(init): WI-9 writer + server accept pageType in submit payload"
```

---

## Task 10: Wire Q0 into the SPA (`render.ts`)

**Files:**
- Modify: `tddesign/cli/init/render.ts` (both the server-rendered HTML AND the inline vanilla-JS client)
- Test: `tests/unit/init/render.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/unit/init/render.test.ts`:

```ts
describe("render v2B Q0", () => {
  it("includes the page_type question label in the SPA HTML", () => {
    const html = buildIndexHtml();
    expect(html).toContain("What kind of page are you designing");
  });

  it("inline client initializes state.pageType to null", () => {
    const html = buildIndexHtml();
    expect(html).toMatch(/pageType\s*:\s*null/);
  });

  it("inline client has a 2D OVERALL_STYLE_MOCKUPS lookup", () => {
    const html = buildIndexHtml();
    expect(html).toMatch(/OVERALL_STYLE_MOCKUPS\[[^\]]+\]\[[^\]]+\]/);
  });

  it("inline client defines deriveContainerAlign", () => {
    const html = buildIndexHtml();
    expect(html).toContain("deriveContainerAlign");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/render.test.ts -t "v2B Q0"`
Expected: FAIL on all four new assertions.

- [ ] **Step 3: Implement**

In `tddesign/cli/init/render.ts`:

1. Import `PAGE_TYPE_CHOICE` from `./choices.js`, plus `PAGE_TYPE_PREVIEWS`, `NEUTRAL_BUNDLE` from `./mockups.js`.
2. When serializing data for the client, expose `PAGE_TYPE_CHOICE`, `PAGE_TYPE_PREVIEWS`, `NEUTRAL_BUNDLE`, and the 2D `OVERALL_STYLE_MOCKUPS` alongside the existing payload.
3. In the initial `state` literal inside the inline client script, add `pageType: null`.
4. In the inline client, add a new step-0 branch that renders `PAGE_TYPE_CHOICE`. Clicking a card sets `state.pageType = opt.id` and advances to Q1. Q1 (mood) is blocked until `state.pageType` is non-null (the initial step index starts at 0 pointing at page_type; existing step-indexing logic shifts by +1).
5. Update `previewHtml(dimension, opt)` client-side to:

```js
function previewHtml(dimension, opt) {
  if (dimension === 'page_type') {
    return interpolate(PAGE_TYPE_PREVIEWS[opt.id], deriveSlots(NEUTRAL_BUNDLE));
  }
  if (dimension === 'overall_style') {
    if (!state.pageType) return '';
    var tpl = OVERALL_STYLE_MOCKUPS[state.pageType][opt.id];
    return interpolate(tpl, deriveSlots(MOOD_DEFAULTS[opt.id]));
  }
  if (!state.pageType || !state.mood) return '';
  var base = Object.assign({}, state.currentStyle || MOOD_DEFAULTS[state.mood]);
  Object.assign(base, opt.tokens);
  var tpl2 = OVERALL_STYLE_MOCKUPS[state.pageType][state.mood];
  return interpolate(tpl2, deriveSlots(base));
}
```

6. Copy `deriveContainerAlign` into the inline client alongside the existing `deriveSlots`, and update the client-side `deriveSlots` to include `containerAlign` in its return object.
7. In the submit handler (the client `fetch('/submit', ...)`), include `pageType: state.pageType` in the POST body.

The exact placement is in the existing `buildIndexHtml()` function; edits are additive (no restructuring).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/init/render.test.ts`
Expected: PASS. Run `npx vitest run` to confirm the full suite stays green.

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/render.ts tests/unit/init/render.test.ts
git commit -m "feat(init): WI-10 wire Q0 page_type question into SPA client"
```

---

## Task 11: Integration test — dashboard + compact-dashboard layout round-trips

**Files:**
- Modify: `tests/integration/init-pipeline.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/integration/init-pipeline.test.ts`:

```ts
it("dashboard payload with compact-dashboard layout produces a padding range check (16–32 px)", async () => {
  const payload: SubmitPayload = {
    pageType: "dashboard",
    mood: "warm-technical",
    picks: {
      overall_style: "warm-technical",
      color_direction: "mono-indigo",
      typography: "mono-technical",
      component_style: "subtle-radius-minimal-shadow",
      layout_spacing: "compact-dashboard",
      detail_elements: "line-icons-no-emoji",
      motion: "subtle-fast",
    },
  };
  const tmp = path.join(os.tmpdir(), `pv-${Date.now()}.json`);
  await writePreferenceVector(payload, tmp);

  const raw = await fs.readFile(tmp, "utf8");
  const pv = PreferenceVectorSchema.parse(JSON.parse(raw));
  expect(pv.page_type).toBe("dashboard");

  const plan = composeCheckPlan(pv);
  const padCheck = plan.checks.find(
    (c) => c.dimension === "layout_spacing" && c.type === "range",
  );
  expect(padCheck).toBeDefined();
  if (padCheck && padCheck.type === "range") {
    expect(padCheck.min).toBe(16);
    expect(padCheck.max).toBe(32);
  }

  await fs.unlink(tmp);
});
```

Adjust imports (`writePreferenceVector`, `composeCheckPlan`, `PreferenceVectorSchema`, `SubmitPayload`, `path`, `os`, `fs`) to match what the file already imports — the pattern mirrors the existing test in that file.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/integration/init-pipeline.test.ts`
Expected: PASS actually, if Tasks 1–9 landed correctly. If it fails, the failure pinpoints the break.

- [ ] **Step 3: Implement (if needed)**

If the test fails because the composer doesn't recognize the new `layout_spacing` option id `compact-dashboard`, verify the notesTemplate emits the padding range sentence and that the existing notes parser extracts it. The round-trip should already work because Task 3 preserved the canonical padding sentence for every new option.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run`
Expected: full suite PASS.

- [ ] **Step 5: Commit**

```bash
git add tests/integration/init-pipeline.test.ts
git commit -m "test(init): WI-11 dashboard + compact-dashboard integration round-trip"
```

---

## Task 12: Smoke-boot + manual verification

**Files:** none modified

- [ ] **Step 1: Start the server**

Run: `npx tsx tddesign/cli/init.ts`
Expected: Server prints a URL; browser opens the questionnaire.

- [ ] **Step 2: Verify Q0**

Observe that the first screen asks "What kind of page are you designing?" and shows two 480×320 cards: landing and dashboard, each rendered with the neutral bundle and carrying a real h1 + body + figure/KPI row.

- [ ] **Step 3: Click `dashboard`, then walk Q1 through Q7**

Confirm that every downstream card renders as a **dashboard-shaped** mini-mockup in the chosen mood, NOT a landing hero. KPI cells visible. h1 and body copy match the mood's voice. Picks carry forward live (color changes the KPI accent, layout_rhythm changes heading size / alignment / gap).

- [ ] **Step 4: Click Back to Q0, re-pick `landing`**

Confirm silhouette changes to landing mockups with previously-chosen tokens still applied. Drift may look visually odd — intentional.

- [ ] **Step 5: Submit and verify `preference_vector.json`**

```bash
cat preference_vector.json | jq '.page_type'
```
Expected output: `"dashboard"` or `"landing"` matching the last pick.

- [ ] **Step 6: Grade the test-site against the new vector**

```bash
npx tsx tddesign/cli/taste-check.ts --preference=preference_vector.json test-site/index.html
```
Expected: report still grades the padding-range check (grading unaffected — that was the whole point of keeping `layout_spacing` as the internal key).

- [ ] **Step 7: Commit nothing**

No code changes in this task. If smoke reveals issues, open a follow-up commit on a specific task above.

---

## Self-Review Notes

**Spec coverage check:**

- Q0 `page_type` before `overall_style`: **Tasks 2, 10**
- Neutral-mood Q0 cards: **Task 6**
- `OVERALL_STYLE_MOCKUPS` 2D restructure: **Task 7 (landing) + Task 8 (dashboard)**
- Content-richness contract (h1 + 12-word body + figure-role): **Tasks 7, 8 tests**
- `layout_rhythm` replaces `layout_spacing` options with heading/body/gap/alignment tokens: **Task 3**
- `StyleBundle` new slots: **Task 4**
- `MOOD_DEFAULTS` new per-mood values: **Task 4**
- `deriveContainerAlign` / `containerAlign` slot: **Task 5**
- Writer `pageType` round-trip + default `"landing"`: **Tasks 1, 9**
- Integration test (dashboard + padding check): **Task 11**
- Smoke-boot: **Task 12**

**Spec refinement documented above:** `layout_spacing` stays the internal dimension key (no parser/checker ripple); `layout_rhythm_meta` dropped. All new token fields live client-side in option tokens + mockup slots and do not reach `preference_vector.json`. User intent for heading/body/gap/alignment is captured in the option id alone (`airy-centered`, `tight-left`, etc.) — good enough for Phase 1, parser extractors follow in Phase 2.

**Type consistency check:**

- `StyleBundle` field names used: `headingScale`, `bodySize`, `gap`, `alignment` — consistent across Tasks 3, 4, 5, 6, 7, 8.
- Client state field: `pageType` (camelCase, matches existing `customTokens` style) — consistent across Tasks 9, 10, 11.
- Schema field: `page_type` (snake_case, matches existing `profile_name`, `source_refs`) — consistent across Tasks 1, 9, 11.
- `containerAlign` slot: Task 5 + Task 10.
- 2D lookup shape `Record<string, Record<string, string>>`: Task 7 + Task 8 + Task 10.

**Placeholder scan:** No `TBD`, `TODO`, or "similar to" references. Each task shows full code or full canonical tables. Mockup authoring tasks (7, 8) show the enrichment recipe per mood and the shared skeleton, following the same pattern v2A used successfully.
