# `/taste init` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship v1 of `/taste init`: a zero-dep Node HTTP server that serves a live-rendered HTML questionnaire, captures 7-dimension taste picks via a mood-filtered choosing tree, and writes a valid `preference_vector.json` consumable by the existing pipeline.

**Architecture:** Node built-in `http` module serves a single-page SPA with inline CSS + vanilla JS. A static `choices.ts` file holds ~40 hand-curated options (6–8 per dimension). Each option carries a `notesTemplate` that round-trips through the existing notes parser by construction. Server exposes `GET /`, `GET /choices.json`, `POST /submit`, `POST /shutdown`.

**Tech Stack:** TypeScript (strict), Node `http`/`fs`/`child_process`, vitest, zod (existing dep). No new runtime dependencies.

**Reference spec:** `docs/superpowers/specs/2026-04-14-taste-init-design.md`

---

## File Structure

```
tddesign/cli/init.ts                       entry: start server, open browser, await submit, exit
tddesign/cli/init/choices.ts               static data: 7 dimensions × 4–8 ChoiceOption entries
tddesign/cli/init/writer.ts                assembles PreferenceVector from payload, atomic write
tddesign/cli/init/server.ts                Node http server + route handlers
tddesign/cli/init/render.ts                buildIndexHtml() returning a single HTML string
tddesign/cli/init/open.ts                  cross-platform `open <url>` wrapper
tests/unit/init/choices.test.ts            parser round-trip, coverage, mood tags
tests/unit/init/writer.test.ts             payload → PreferenceVector, atomic write
tests/unit/init/server.test.ts             routes in-process via http.request
tests/unit/init/render.test.ts             snapshot / substring assertions on HTML
tests/integration/init-pipeline.test.ts    writer → runPipeline end-to-end
```

Each file owns one responsibility. `choices.ts` is data only; `writer.ts` is pure assembly; `server.ts` wires the two together; `render.ts` is a single pure function; `init.ts` is orchestration with no business logic.

---

## Task 1: Scaffold `ChoiceOption` types and an empty `CHOICES` array

**Files:**
- Create: `tddesign/cli/init/choices.ts`
- Test: `tests/unit/init/choices.test.ts`

- [ ] **Step 1: Write failing test for types + structure**

```ts
// tests/unit/init/choices.test.ts
import { describe, it, expect } from "vitest";
import { CHOICES, MOODS } from "../../../tddesign/cli/init/choices.js";
import { DIMENSIONS } from "../../../tddesign/schemas.js";

describe("choices", () => {
  it("exports one DimensionChoices entry per schema dimension in order", () => {
    expect(CHOICES.map((c) => c.dimension)).toEqual([...DIMENSIONS]);
  });

  it("exports a non-empty MOODS list", () => {
    expect(MOODS.length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/choices.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `choices.ts` skeleton**

```ts
// tddesign/cli/init/choices.ts
import type { Dimension } from "../../schemas.js";
import { DIMENSIONS } from "../../schemas.js";

export const MOODS = [
  "minimal",
  "editorial",
  "playful",
  "brutalist",
  "warm-technical",
  "vivid-modern",
] as const;
export type Mood = (typeof MOODS)[number];

export type RenderKind =
  | "mood"
  | "color"
  | "type"
  | "component"
  | "layout"
  | "detail"
  | "motion";

export interface ChoiceOption {
  id: string;
  label: string;
  moodTags: Mood[];
  sourceRefs: string[];
  tokens: Record<string, string | number>;
  notesTemplate: string;
  render: RenderKind;
}

export interface DimensionChoices {
  dimension: Dimension;
  question: string;
  options: ChoiceOption[];
}

export const CHOICES: DimensionChoices[] = DIMENSIONS.map((d) => ({
  dimension: d,
  question: "",
  options: [],
}));
```

- [ ] **Step 4: Run test**

Run: `npx vitest run tests/unit/init/choices.test.ts`
Expected: PASS (2/2).

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/choices.ts tests/unit/init/choices.test.ts
git commit -m "feat(init): scaffold ChoiceOption types and empty CHOICES array"
```

---

## Task 2: Populate `overall_style` and `color_direction` options with parser round-trip tests

**Files:**
- Modify: `tddesign/cli/init/choices.ts`
- Modify: `tests/unit/init/choices.test.ts`

- [ ] **Step 1: Write failing round-trip test**

Append to `tests/unit/init/choices.test.ts`:

```ts
import { parsePreferenceVector } from "../../../tddesign/composer/notes-parser.js";
import type { PreferenceVector } from "../../../tddesign/schemas.js";

function vectorFromPicks(picks: Record<string, string>): PreferenceVector {
  const selections = Object.fromEntries(
    CHOICES.map((d) => {
      const opt = d.options.find((o) => o.id === picks[d.dimension]) ?? d.options[0];
      return [
        d.dimension,
        {
          choice: opt.id,
          source_refs: opt.sourceRefs,
          notes: opt.notesTemplate,
        },
      ];
    })
  ) as PreferenceVector["selections"];
  return {
    profile_name: "test",
    scope: "project",
    selections,
    created_at: "2026-04-15T00:00:00Z",
    updated_at: "2026-04-15T00:00:00Z",
  };
}

describe("choices round-trip", () => {
  it("overall_style has at least 6 options, each with moodTags", () => {
    const dim = CHOICES.find((c) => c.dimension === "overall_style")!;
    expect(dim.options.length).toBeGreaterThanOrEqual(6);
    for (const opt of dim.options) {
      expect(opt.moodTags.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("color_direction has at least 6 options with bg/text/accent tokens", () => {
    const dim = CHOICES.find((c) => c.dimension === "color_direction")!;
    expect(dim.options.length).toBeGreaterThanOrEqual(6);
    for (const opt of dim.options) {
      expect(typeof opt.tokens.background).toBe("string");
      expect(typeof opt.tokens.text).toBe("string");
      expect(typeof opt.tokens.accent).toBe("string");
    }
  });

  it("every overall_style + color_direction option round-trips through parser", () => {
    const overall = CHOICES.find((c) => c.dimension === "overall_style")!;
    const colors = CHOICES.find((c) => c.dimension === "color_direction")!;
    for (const o of overall.options) {
      for (const c of colors.options) {
        const v = vectorFromPicks({ overall_style: o.id, color_direction: c.id });
        expect(() => parsePreferenceVector(v)).not.toThrow();
      }
    }
  });

  it("color_direction notes emit 3 exact checks matching declared tokens", () => {
    const colors = CHOICES.find((c) => c.dimension === "color_direction")!;
    for (const opt of colors.options) {
      const v = vectorFromPicks({ color_direction: opt.id });
      const checks = parsePreferenceVector(v);
      const exacts = checks.filter((c) => c.type === "exact");
      const values = exacts.map((c) => c.type === "exact" ? c.expected : "");
      expect(values).toContain(opt.tokens.background);
      expect(values).toContain(opt.tokens.text);
      expect(values).toContain(opt.tokens.accent);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/choices.test.ts`
Expected: FAIL — `overall_style has at least 6 options` fails because options array is empty.

- [ ] **Step 3: Fill in `overall_style` and `color_direction`**

Replace the `CHOICES` definition in `tddesign/cli/init/choices.ts`:

```ts
const OVERALL_STYLE_OPTIONS: ChoiceOption[] = [
  {
    id: "minimal-precise",
    label: "Minimal Precise",
    moodTags: ["minimal", "warm-technical"],
    sourceRefs: ["linear"],
    tokens: { mood: "minimal" },
    notesTemplate: "minimal precise clean technical",
    render: "mood",
  },
  {
    id: "editorial-serif",
    label: "Editorial Serif",
    moodTags: ["editorial"],
    sourceRefs: ["stripe"],
    tokens: { mood: "editorial" },
    notesTemplate: "editorial refined considered",
    render: "mood",
  },
  {
    id: "playful-rounded",
    label: "Playful Rounded",
    moodTags: ["playful"],
    sourceRefs: ["vercel"],
    tokens: { mood: "playful" },
    notesTemplate: "playful friendly approachable",
    render: "mood",
  },
  {
    id: "brutalist-raw",
    label: "Brutalist Raw",
    moodTags: ["brutalist"],
    sourceRefs: ["linear"],
    tokens: { mood: "brutalist" },
    notesTemplate: "brutalist raw unapologetic",
    render: "mood",
  },
  {
    id: "warm-technical",
    label: "Warm Technical",
    moodTags: ["warm-technical", "minimal"],
    sourceRefs: ["vercel"],
    tokens: { mood: "warm-technical" },
    notesTemplate: "warm technical inviting precise",
    render: "mood",
  },
  {
    id: "vivid-modern",
    label: "Vivid Modern",
    moodTags: ["vivid-modern"],
    sourceRefs: ["stripe"],
    tokens: { mood: "vivid-modern" },
    notesTemplate: "vivid modern confident",
    render: "mood",
  },
];

const COLOR_OPTIONS: ChoiceOption[] = [
  {
    id: "mono-indigo",
    label: "Mono + Indigo",
    moodTags: ["minimal", "warm-technical"],
    sourceRefs: ["linear"],
    tokens: { background: "#0F0F10", text: "#FAFAFA", accent: "#5B6EE1" },
    notesTemplate: "Background #0F0F10, primary text #FAFAFA, accent #5B6EE1",
    render: "color",
  },
  {
    id: "paper-black",
    label: "Paper + Black",
    moodTags: ["editorial", "minimal"],
    sourceRefs: ["stripe"],
    tokens: { background: "#FFFFFF", text: "#111111", accent: "#0057FF" },
    notesTemplate: "Background #FFFFFF, primary text #111111, accent #0057FF",
    render: "color",
  },
  {
    id: "warm-cream",
    label: "Warm Cream",
    moodTags: ["warm-technical", "editorial"],
    sourceRefs: ["stripe"],
    tokens: { background: "#F7F3EC", text: "#1A1A1A", accent: "#C2410C" },
    notesTemplate: "Background #F7F3EC, primary text #1A1A1A, accent #C2410C",
    render: "color",
  },
  {
    id: "deep-forest",
    label: "Deep Forest",
    moodTags: ["warm-technical"],
    sourceRefs: ["linear"],
    tokens: { background: "#0B1F14", text: "#E8F0E8", accent: "#4ADE80" },
    notesTemplate: "Background #0B1F14, primary text #E8F0E8, accent #4ADE80",
    render: "color",
  },
  {
    id: "neon-dark",
    label: "Neon Dark",
    moodTags: ["vivid-modern", "playful"],
    sourceRefs: ["vercel"],
    tokens: { background: "#0A0A0A", text: "#F5F5F5", accent: "#F472B6" },
    notesTemplate: "Background #0A0A0A, primary text #F5F5F5, accent #F472B6",
    render: "color",
  },
  {
    id: "concrete-gray",
    label: "Concrete Gray",
    moodTags: ["brutalist"],
    sourceRefs: ["linear"],
    tokens: { background: "#D4D4D4", text: "#0A0A0A", accent: "#DC2626" },
    notesTemplate: "Background #D4D4D4, primary text #0A0A0A, accent #DC2626",
    render: "color",
  },
  {
    id: "cobalt-ivory",
    label: "Cobalt + Ivory",
    moodTags: ["editorial", "vivid-modern"],
    sourceRefs: ["stripe"],
    tokens: { background: "#FDFCF8", text: "#0B1A3A", accent: "#1E3A8A" },
    notesTemplate: "Background #FDFCF8, primary text #0B1A3A, accent #1E3A8A",
    render: "color",
  },
  {
    id: "violet-haze",
    label: "Violet Haze",
    moodTags: ["vivid-modern", "playful"],
    sourceRefs: ["vercel"],
    tokens: { background: "#1B1033", text: "#F3E8FF", accent: "#A855F7" },
    notesTemplate: "Background #1B1033, primary text #F3E8FF, accent #A855F7",
    render: "color",
  },
];

export const CHOICES: DimensionChoices[] = [
  { dimension: "overall_style", question: "Pick a mood.", options: OVERALL_STYLE_OPTIONS },
  { dimension: "color_direction", question: "Pick a palette.", options: COLOR_OPTIONS },
  { dimension: "typography", question: "Pick a typographic voice.", options: [] },
  { dimension: "component_style", question: "Pick a component style.", options: [] },
  { dimension: "layout_spacing", question: "Pick a spacing feel.", options: [] },
  { dimension: "detail_elements", question: "Pick detail treatment.", options: [] },
  { dimension: "motion", question: "Pick a motion feel.", options: [] },
];
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/unit/init/choices.test.ts`
Expected: PASS. (The `dimension order` test still passes because the array is still in schema order.)

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/choices.ts tests/unit/init/choices.test.ts
git commit -m "feat(init): populate overall_style + color_direction options with round-trip tests"
```

---

## Task 3: Populate remaining 5 dimensions and assert full round-trip

**Files:**
- Modify: `tddesign/cli/init/choices.ts`
- Modify: `tests/unit/init/choices.test.ts`

- [ ] **Step 1: Write failing test asserting every dimension has ≥ 4 options and full cross-product round-trips**

Append to `tests/unit/init/choices.test.ts`:

```ts
describe("all dimensions populated", () => {
  const minCounts: Record<string, number> = {
    overall_style: 6,
    color_direction: 6,
    typography: 4,
    component_style: 4,
    layout_spacing: 4,
    detail_elements: 4,
    motion: 4,
  };

  it("meets minimum option counts per dimension", () => {
    for (const d of CHOICES) {
      expect(d.options.length).toBeGreaterThanOrEqual(minCounts[d.dimension]);
    }
  });

  it("every option has at least one mood tag", () => {
    for (const d of CHOICES) {
      for (const opt of d.options) {
        expect(opt.moodTags.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it("every option id is unique within its dimension", () => {
    for (const d of CHOICES) {
      const ids = d.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("picking the first option of every dimension round-trips through parser", () => {
    const picks = Object.fromEntries(
      CHOICES.map((d) => [d.dimension, d.options[0].id])
    );
    const v = vectorFromPicks(picks);
    expect(() => parsePreferenceVector(v)).not.toThrow();
    const checks = parsePreferenceVector(v);
    expect(checks.length).toBeGreaterThan(0);
  });

  it("layout_spacing emits a range check with valid min/max", () => {
    const layout = CHOICES.find((c) => c.dimension === "layout_spacing")!;
    for (const opt of layout.options) {
      const v = vectorFromPicks({ layout_spacing: opt.id });
      const ranges = parsePreferenceVector(v).filter((c) => c.type === "range");
      expect(ranges.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("detail_elements option with 'no-emoji' id emits pattern-absent check", () => {
    const details = CHOICES.find((c) => c.dimension === "detail_elements")!;
    const noEmoji = details.options.find((o) => o.id.includes("no-emoji"));
    expect(noEmoji).toBeDefined();
    const v = vectorFromPicks({ detail_elements: noEmoji!.id });
    const patterns = parsePreferenceVector(v).filter((c) => c.type === "pattern");
    expect(patterns.length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/choices.test.ts`
Expected: FAIL — typography, component_style, layout_spacing, detail_elements, motion all have 0 options.

- [ ] **Step 3: Fill in remaining 5 dimensions**

Add these arrays above the `CHOICES` definition in `tddesign/cli/init/choices.ts`:

```ts
const TYPOGRAPHY_OPTIONS: ChoiceOption[] = [
  {
    id: "geometric-sans",
    label: "Geometric Sans",
    moodTags: ["minimal", "warm-technical"],
    sourceRefs: ["vercel"],
    tokens: { family: "Inter, system-ui, sans-serif" },
    notesTemplate: "Inter geometric sans",
    render: "type",
  },
  {
    id: "humanist-sans",
    label: "Humanist Sans",
    moodTags: ["warm-technical", "editorial"],
    sourceRefs: ["stripe"],
    tokens: { family: "'Source Sans 3', system-ui, sans-serif" },
    notesTemplate: "Source Sans humanist",
    render: "type",
  },
  {
    id: "editorial-serif",
    label: "Editorial Serif",
    moodTags: ["editorial"],
    sourceRefs: ["stripe"],
    tokens: { family: "Georgia, 'Times New Roman', serif" },
    notesTemplate: "Georgia serif editorial",
    render: "type",
  },
  {
    id: "mono-technical",
    label: "Mono Technical",
    moodTags: ["brutalist", "warm-technical"],
    sourceRefs: ["linear"],
    tokens: { family: "'JetBrains Mono', ui-monospace, monospace" },
    notesTemplate: "JetBrains Mono monospace",
    render: "type",
  },
];

const COMPONENT_OPTIONS: ChoiceOption[] = [
  {
    id: "subtle-radius-minimal-shadow",
    label: "Subtle Radius, Minimal Shadow",
    moodTags: ["minimal", "warm-technical"],
    sourceRefs: ["linear"],
    tokens: { radius: 6, shadow: "0 1px 2px rgba(0,0,0,0.06)" },
    notesTemplate: "subtle radius minimal shadow",
    render: "component",
  },
  {
    id: "sharp-flat",
    label: "Sharp Flat",
    moodTags: ["brutalist", "editorial"],
    sourceRefs: ["linear"],
    tokens: { radius: 0, shadow: "none" },
    notesTemplate: "sharp flat no shadow",
    render: "component",
  },
  {
    id: "soft-pillowy",
    label: "Soft Pillowy",
    moodTags: ["playful", "vivid-modern"],
    sourceRefs: ["vercel"],
    tokens: { radius: 16, shadow: "0 8px 24px rgba(0,0,0,0.12)" },
    notesTemplate: "soft pillowy generous shadow",
    render: "component",
  },
  {
    id: "bordered-flat",
    label: "Bordered Flat",
    moodTags: ["editorial", "minimal"],
    sourceRefs: ["stripe"],
    tokens: { radius: 4, shadow: "none", border: "1px solid currentColor" },
    notesTemplate: "bordered flat hairline",
    render: "component",
  },
];

const LAYOUT_OPTIONS: ChoiceOption[] = [
  {
    id: "spacious-hero",
    label: "Spacious Hero",
    moodTags: ["minimal", "editorial"],
    sourceRefs: ["stripe"],
    tokens: { paddingMin: 48, paddingMax: 96 },
    notesTemplate: "Section padding between 48 and 96 px",
    render: "layout",
  },
  {
    id: "compact-dense",
    label: "Compact Dense",
    moodTags: ["warm-technical", "brutalist"],
    sourceRefs: ["linear"],
    tokens: { paddingMin: 16, paddingMax: 32 },
    notesTemplate: "Section padding between 16 and 32 px",
    render: "layout",
  },
  {
    id: "medium-breath",
    label: "Medium Breath",
    moodTags: ["warm-technical", "playful"],
    sourceRefs: ["vercel"],
    tokens: { paddingMin: 32, paddingMax: 64 },
    notesTemplate: "Section padding between 32 and 64 px",
    render: "layout",
  },
  {
    id: "editorial-margins",
    label: "Editorial Margins",
    moodTags: ["editorial"],
    sourceRefs: ["stripe"],
    tokens: { paddingMin: 64, paddingMax: 128 },
    notesTemplate: "Section padding between 64 and 128 px",
    render: "layout",
  },
];

const DETAIL_OPTIONS: ChoiceOption[] = [
  {
    id: "line-icons-no-emoji",
    label: "Line Icons, No Emoji",
    moodTags: ["minimal", "warm-technical", "editorial"],
    sourceRefs: ["linear"],
    tokens: { iconStyle: "line" },
    notesTemplate: "No emoji characters anywhere",
    render: "detail",
  },
  {
    id: "filled-icons-no-emoji",
    label: "Filled Icons, No Emoji",
    moodTags: ["brutalist", "vivid-modern"],
    sourceRefs: ["vercel"],
    tokens: { iconStyle: "filled" },
    notesTemplate: "No emoji characters anywhere",
    render: "detail",
  },
  {
    id: "emoji-welcome",
    label: "Emoji Welcome",
    moodTags: ["playful"],
    sourceRefs: ["vercel"],
    tokens: { iconStyle: "emoji" },
    notesTemplate: "Emoji allowed as accent elements",
    render: "detail",
  },
  {
    id: "duotone-icons-no-emoji",
    label: "Duotone Icons, No Emoji",
    moodTags: ["editorial", "warm-technical"],
    sourceRefs: ["stripe"],
    tokens: { iconStyle: "duotone" },
    notesTemplate: "No emoji characters anywhere",
    render: "detail",
  },
];

const MOTION_OPTIONS: ChoiceOption[] = [
  {
    id: "subtle-fast",
    label: "Subtle Fast",
    moodTags: ["minimal", "warm-technical"],
    sourceRefs: ["vercel"],
    tokens: { durationMs: 150, easing: "ease-out" },
    notesTemplate: "subtle fast motion",
    render: "motion",
  },
  {
    id: "considered-slow",
    label: "Considered Slow",
    moodTags: ["editorial"],
    sourceRefs: ["stripe"],
    tokens: { durationMs: 400, easing: "ease-in-out" },
    notesTemplate: "considered slow motion",
    render: "motion",
  },
  {
    id: "snappy-springy",
    label: "Snappy Springy",
    moodTags: ["playful", "vivid-modern"],
    sourceRefs: ["vercel"],
    tokens: { durationMs: 220, easing: "cubic-bezier(0.34,1.56,0.64,1)" },
    notesTemplate: "snappy springy motion",
    render: "motion",
  },
  {
    id: "none-static",
    label: "None, Static",
    moodTags: ["brutalist"],
    sourceRefs: ["linear"],
    tokens: { durationMs: 0, easing: "linear" },
    notesTemplate: "no motion static",
    render: "motion",
  },
];
```

Then update the `CHOICES` array to reference them:

```ts
export const CHOICES: DimensionChoices[] = [
  { dimension: "overall_style", question: "Pick a mood.", options: OVERALL_STYLE_OPTIONS },
  { dimension: "color_direction", question: "Pick a palette.", options: COLOR_OPTIONS },
  { dimension: "typography", question: "Pick a typographic voice.", options: TYPOGRAPHY_OPTIONS },
  { dimension: "component_style", question: "Pick a component style.", options: COMPONENT_OPTIONS },
  { dimension: "layout_spacing", question: "Pick a spacing feel.", options: LAYOUT_OPTIONS },
  { dimension: "detail_elements", question: "Pick detail treatment.", options: DETAIL_OPTIONS },
  { dimension: "motion", question: "Pick a motion feel.", options: MOTION_OPTIONS },
];
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run tests/unit/init/choices.test.ts`
Expected: PASS.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add tddesign/cli/init/choices.ts tests/unit/init/choices.test.ts
git commit -m "feat(init): populate typography/component/layout/detail/motion options"
```

---

## Task 4: `writer.ts` — assemble + validate + atomic write

**Files:**
- Create: `tddesign/cli/init/writer.ts`
- Create: `tests/unit/init/writer.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/unit/init/writer.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { assembleVector, writeVector } from "../../../tddesign/cli/init/writer.js";
import { CHOICES } from "../../../tddesign/cli/init/choices.js";
import { PreferenceVectorSchema } from "../../../tddesign/schemas.js";

function firstPicks() {
  return Object.fromEntries(
    CHOICES.map((d) => [d.dimension, d.options[0].id])
  ) as Record<string, string>;
}

describe("writer.assembleVector", () => {
  it("produces a schema-valid PreferenceVector from valid picks", () => {
    const v = assembleVector({ mood: "minimal", picks: firstPicks() as any });
    expect(() => PreferenceVectorSchema.parse(v)).not.toThrow();
    expect(v.profile_name).toBe("local");
    expect(v.scope).toBe("project");
    expect(v.selections.color_direction.choice).toBe(
      CHOICES.find((c) => c.dimension === "color_direction")!.options[0].id
    );
  });

  it("throws on unknown option id", () => {
    const bad = { ...firstPicks(), color_direction: "not-a-real-id" };
    expect(() =>
      assembleVector({ mood: "minimal", picks: bad as any })
    ).toThrow(/unknown option/i);
  });

  it("stamps created_at and updated_at with ISO strings", () => {
    const v = assembleVector({ mood: "minimal", picks: firstPicks() as any });
    expect(v.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(v.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("writer.writeVector", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "taste-init-"));
  });
  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("writes JSON atomically and leaves no .tmp behind", async () => {
    const target = path.join(dir, "preference_vector.json");
    const v = assembleVector({ mood: "minimal", picks: firstPicks() as any });
    await writeVector(target, v);
    const raw = await fs.readFile(target, "utf8");
    expect(() => PreferenceVectorSchema.parse(JSON.parse(raw))).not.toThrow();
    const entries = await fs.readdir(dir);
    expect(entries.filter((e) => e.endsWith(".tmp"))).toEqual([]);
  });

  it("overwrites an existing file", async () => {
    const target = path.join(dir, "preference_vector.json");
    await fs.writeFile(target, "{}");
    const v = assembleVector({ mood: "minimal", picks: firstPicks() as any });
    await writeVector(target, v);
    const raw = await fs.readFile(target, "utf8");
    expect(JSON.parse(raw).profile_name).toBe("local");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/writer.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `writer.ts`**

```ts
// tddesign/cli/init/writer.ts
import { promises as fs } from "node:fs";
import { PreferenceVectorSchema, type PreferenceVector } from "../../schemas.js";
import { CHOICES, type Mood } from "./choices.js";

export interface SubmitPayload {
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
}

export function assembleVector(payload: SubmitPayload): PreferenceVector {
  const now = new Date().toISOString();
  const selections = {} as PreferenceVector["selections"];

  for (const dim of CHOICES) {
    const chosenId = payload.picks[dim.dimension];
    const opt = dim.options.find((o) => o.id === chosenId);
    if (!opt) {
      throw new Error(
        `unknown option '${chosenId}' for dimension '${dim.dimension}'`
      );
    }
    selections[dim.dimension] = {
      choice: opt.id,
      source_refs: opt.sourceRefs,
      notes: opt.notesTemplate,
    };
  }

  const vector: PreferenceVector = {
    profile_name: "local",
    scope: "project",
    selections,
    created_at: now,
    updated_at: now,
  };
  return PreferenceVectorSchema.parse(vector);
}

export async function writeVector(
  targetPath: string,
  vector: PreferenceVector
): Promise<void> {
  const tmp = `${targetPath}.tmp`;
  const body = `${JSON.stringify(vector, null, 2)}\n`;
  await fs.writeFile(tmp, body, "utf8");
  await fs.rename(tmp, targetPath);
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/unit/init/writer.test.ts`
Expected: PASS (5/5).

- [ ] **Step 5: Commit**

```bash
git add tddesign/cli/init/writer.ts tests/unit/init/writer.test.ts
git commit -m "feat(init): writer assembles + atomically writes PreferenceVector"
```

---

## Task 5: `server.ts` — GET /choices.json, POST /submit, POST /shutdown

**Files:**
- Create: `tddesign/cli/init/server.ts`
- Create: `tests/unit/init/server.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/unit/init/server.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import http from "node:http";
import { startServer, type StartedServer } from "../../../tddesign/cli/init/server.js";
import { CHOICES } from "../../../tddesign/cli/init/choices.js";

function req(
  port: number,
  method: string,
  url: string,
  body?: unknown
): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body);
    const r = http.request(
      {
        host: "127.0.0.1",
        port,
        method,
        path: url,
        headers: payload
          ? { "content-type": "application/json", "content-length": Buffer.byteLength(payload) }
          : {},
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body: data }));
      }
    );
    r.on("error", reject);
    if (payload) r.write(payload);
    r.end();
  });
}

describe("server", () => {
  let dir: string;
  let server: StartedServer;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "taste-init-srv-"));
    server = await startServer({ targetPath: path.join(dir, "preference_vector.json") });
  });
  afterEach(async () => {
    await server.close();
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("GET /choices.json returns the CHOICES data", async () => {
    const r = await req(server.port, "GET", "/choices.json");
    expect(r.status).toBe(200);
    const parsed = JSON.parse(r.body);
    expect(parsed.dimensions.map((d: any) => d.dimension)).toEqual(
      CHOICES.map((d) => d.dimension)
    );
  });

  it("GET / returns HTML containing every dimension label", async () => {
    const r = await req(server.port, "GET", "/");
    expect(r.status).toBe(200);
    for (const d of CHOICES) {
      expect(r.body).toContain(d.question);
    }
  });

  it("POST /submit with valid payload writes file and returns 200", async () => {
    const picks = Object.fromEntries(
      CHOICES.map((d) => [d.dimension, d.options[0].id])
    );
    const r = await req(server.port, "POST", "/submit", { mood: "minimal", picks });
    expect(r.status).toBe(200);
    const written = await fs.readFile(
      path.join(dir, "preference_vector.json"),
      "utf8"
    );
    expect(JSON.parse(written).profile_name).toBe("local");
  });

  it("POST /submit with unknown option id returns 400 and does not write", async () => {
    const picks = Object.fromEntries(
      CHOICES.map((d) => [d.dimension, d.options[0].id])
    );
    picks.color_direction = "not-a-thing";
    const r = await req(server.port, "POST", "/submit", { mood: "minimal", picks });
    expect(r.status).toBe(400);
    await expect(
      fs.access(path.join(dir, "preference_vector.json"))
    ).rejects.toThrow();
  });

  it("POST /submit with malformed JSON returns 400", async () => {
    const r = await new Promise<{ status: number }>((resolve, reject) => {
      const rq = http.request(
        {
          host: "127.0.0.1",
          port: server.port,
          method: "POST",
          path: "/submit",
          headers: { "content-type": "application/json" },
        },
        (res) => {
          res.on("data", () => {});
          res.on("end", () => resolve({ status: res.statusCode ?? 0 }));
        }
      );
      rq.on("error", reject);
      rq.write("{not json");
      rq.end();
    });
    expect(r.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/server.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement a minimal `server.ts`**

```ts
// tddesign/cli/init/server.ts
import http from "node:http";
import { AddressInfo } from "node:net";
import { CHOICES } from "./choices.js";
import { assembleVector, writeVector, type SubmitPayload } from "./writer.js";
import { buildIndexHtml } from "./render.js";

export interface StartOptions {
  targetPath: string;
  port?: number;
}

export interface StartedServer {
  port: number;
  url: string;
  close: () => Promise<void>;
  submitted: Promise<void>;
}

export async function startServer(opts: StartOptions): Promise<StartedServer> {
  let resolveSubmitted: () => void;
  const submitted = new Promise<void>((r) => (resolveSubmitted = r));

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/choices.json") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ dimensions: CHOICES }));
        return;
      }
      if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(buildIndexHtml());
        return;
      }
      if (req.method === "POST" && req.url === "/submit") {
        const body = await readJson(req);
        const payload = body as SubmitPayload;
        const vector = assembleVector(payload);
        await writeVector(opts.targetPath, vector);
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true, path: opts.targetPath }));
        resolveSubmitted();
        return;
      }
      if (req.method === "POST" && req.url === "/shutdown") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        setTimeout(() => server.close(), 10);
        return;
      }
      res.writeHead(404);
      res.end("not found");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.writeHead(400, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: message }));
    }
  });

  await new Promise<void>((resolve) =>
    server.listen(opts.port ?? 0, "127.0.0.1", () => resolve())
  );
  const port = (server.address() as AddressInfo).port;

  return {
    port,
    url: `http://127.0.0.1:${port}/`,
    submitted,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      ),
  };
}

async function readJson(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("invalid JSON body");
  }
}
```

- [ ] **Step 4: Create a minimal stub `render.ts` so the server compiles**

```ts
// tddesign/cli/init/render.ts
import { CHOICES } from "./choices.js";

export function buildIndexHtml(): string {
  const questions = CHOICES.map((d) => `<section>${d.question}</section>`).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><title>taste init</title></head><body>${questions}</body></html>`;
}
```

- [ ] **Step 5: Run tests**

Run: `npx vitest run tests/unit/init/server.test.ts`
Expected: PASS (5/5).

- [ ] **Step 6: Commit**

```bash
git add tddesign/cli/init/server.ts tddesign/cli/init/render.ts tests/unit/init/server.test.ts
git commit -m "feat(init): http server with /choices.json, /submit, /shutdown"
```

---

## Task 6: `render.ts` — full SPA (welcome → dimensions → review → success)

**Files:**
- Modify: `tddesign/cli/init/render.ts`
- Create: `tests/unit/init/render.test.ts`

- [ ] **Step 1: Write failing test asserting HTML structure and JS hooks**

```ts
// tests/unit/init/render.test.ts
import { describe, it, expect } from "vitest";
import { buildIndexHtml } from "../../../tddesign/cli/init/render.js";
import { CHOICES, MOODS } from "../../../tddesign/cli/init/choices.js";

describe("render.buildIndexHtml", () => {
  const html = buildIndexHtml();

  it("has a doctype and a root mount element", () => {
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toContain('id="app"');
  });

  it("includes inline CSS, not external stylesheets", () => {
    expect(html).toContain("<style>");
    expect(html).not.toContain("<link rel=\"stylesheet\"");
  });

  it("includes a client script that fetches /choices.json", () => {
    expect(html).toContain("fetch('/choices.json')");
  });

  it("includes a submit hook that POSTs to /submit", () => {
    expect(html).toContain("/submit");
  });

  it("includes a shutdown hook that POSTs to /shutdown", () => {
    expect(html).toContain("/shutdown");
  });

  it("includes every dimension question as a data attribute or literal", () => {
    for (const d of CHOICES) {
      expect(html).toContain(d.dimension);
    }
  });

  it("includes every mood id as a literal", () => {
    for (const m of MOODS) {
      expect(html).toContain(m);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/init/render.test.ts`
Expected: FAIL — stub HTML has no `<style>`, no `fetch`, no `/submit`, no `id="app"`.

- [ ] **Step 3: Replace `render.ts` with full SPA**

```ts
// tddesign/cli/init/render.ts
import { CHOICES, MOODS } from "./choices.js";

export function buildIndexHtml(): string {
  const dimensionsJson = JSON.stringify(
    CHOICES.map((d) => ({ dimension: d.dimension, question: d.question }))
  );
  const moodsJson = JSON.stringify(MOODS);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>taste init</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 15px/1.5 system-ui, sans-serif; margin: 0; background: #0F0F10; color: #FAFAFA; }
  main { max-width: 960px; margin: 0 auto; padding: 48px 24px; }
  h1 { font-size: 28px; margin: 0 0 8px; }
  p.lead { opacity: 0.7; margin: 0 0 32px; }
  .progress { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 32px; }
  .progress-fill { height: 100%; background: #5B6EE1; border-radius: 2px; transition: width 200ms; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 16px; cursor: pointer; transition: border-color 150ms; }
  .card:hover { border-color: #5B6EE1; }
  .card.selected { border-color: #5B6EE1; background: rgba(91,110,225,0.12); }
  .card-preview { height: 120px; border-radius: 6px; margin-bottom: 12px; overflow: hidden; }
  .card-label { font-weight: 600; }
  .card-tags { opacity: 0.6; font-size: 12px; margin-top: 4px; }
  .group-heading { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.5; margin: 24px 0 8px; }
  button.primary { background: #5B6EE1; color: white; border: 0; padding: 12px 20px; border-radius: 6px; font: inherit; cursor: pointer; }
  button.ghost { background: transparent; color: inherit; border: 1px solid rgba(255,255,255,0.2); padding: 12px 20px; border-radius: 6px; font: inherit; cursor: pointer; margin-right: 8px; }
  .notice { background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.3); padding: 12px; border-radius: 6px; margin: 16px 0; font-size: 14px; }
  .review-row { display: grid; grid-template-columns: 160px 1fr auto; gap: 16px; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
  a.edit { color: #5B6EE1; text-decoration: none; font-size: 13px; }
  .swatch-row { display: flex; gap: 8px; }
  .swatch { width: 40px; height: 40px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); }
</style>
</head>
<body>
<main id="app">loading…</main>
<script>
(function () {
  var DIMENSIONS = ${dimensionsJson};
  var MOODS = ${moodsJson};
  var state = { choices: null, step: 0, mood: null, picks: {} };
  var app = document.getElementById('app');

  fetch('/choices.json').then(function (r) { return r.json(); }).then(function (data) {
    state.choices = data.dimensions;
    render();
  });

  function render() {
    if (!state.choices) { app.textContent = 'loading…'; return; }
    var totalSteps = 1 + state.choices.length + 1;
    if (state.step === 0) return renderWelcome(totalSteps);
    if (state.step <= state.choices.length) return renderDimension(state.step - 1, totalSteps);
    return renderReview(totalSteps);
  }

  function progressBar(step, total) {
    var pct = Math.round((step / (total - 1)) * 100);
    return '<div class="progress"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
  }

  function renderWelcome(total) {
    app.innerHTML =
      progressBar(0, total) +
      '<h1>taste init</h1>' +
      '<p class="lead">Pick one option per dimension. We write preference_vector.json when you are done.</p>' +
      '<button class="primary" id="start">Start</button>';
    document.getElementById('start').onclick = function () { state.step = 1; render(); };
  }

  function renderDimension(idx, total) {
    var dim = state.choices[idx];
    var selected = state.picks[dim.dimension];
    var recommended = [];
    var others = [];
    for (var i = 0; i < dim.options.length; i++) {
      var opt = dim.options[i];
      (state.mood && opt.moodTags.indexOf(state.mood) >= 0 ? recommended : others).push(opt);
    }
    var html =
      progressBar(idx + 1, total) +
      '<h1>' + dim.question + '</h1>' +
      '<p class="lead">Step ' + (idx + 1) + ' of ' + state.choices.length + '</p>';
    if (state.mood && recommended.length) {
      html += '<div class="group-heading">Recommended for ' + state.mood + '</div>';
      html += '<div class="grid">' + recommended.map(cardHtml).join('') + '</div>';
      html += '<div class="group-heading">Other options</div>';
      html += '<div class="grid">' + others.map(cardHtml).join('') + '</div>';
    } else {
      html += '<div class="grid">' + dim.options.map(cardHtml).join('') + '</div>';
    }
    html += '<div style="margin-top:32px"><button class="ghost" id="back">Back</button><button class="primary" id="next">Next</button></div>';
    app.innerHTML = html;
    bindCards(dim);
    document.getElementById('back').onclick = function () { if (state.step > 0) { state.step--; render(); } };
    document.getElementById('next').onclick = function () {
      if (!selected && !state.picks[dim.dimension]) return;
      if (dim.dimension === 'overall_style') state.mood = optionMood(dim, state.picks[dim.dimension]);
      state.step++;
      render();
    };
    function cardHtml(opt) {
      var sel = state.picks[dim.dimension] === opt.id ? ' selected' : '';
      return '<div class="card' + sel + '" data-id="' + opt.id + '">' +
        '<div class="card-preview">' + previewHtml(dim.dimension, opt) + '</div>' +
        '<div class="card-label">' + opt.label + '</div>' +
        '<div class="card-tags">' + opt.moodTags.join(', ') + '</div>' +
        '</div>';
    }
    function bindCards(dim) {
      var cards = app.querySelectorAll('.card');
      cards.forEach(function (c) {
        c.onclick = function () {
          state.picks[dim.dimension] = c.getAttribute('data-id');
          render();
        };
      });
    }
  }

  function optionMood(dim, id) {
    for (var i = 0; i < dim.options.length; i++) if (dim.options[i].id === id) return dim.options[i].moodTags[0];
    return null;
  }

  function previewHtml(dimension, opt) {
    var t = opt.tokens || {};
    if (dimension === 'color_direction') {
      return '<div class="swatch-row" style="padding:20px">' +
        '<div class="swatch" style="background:' + t.background + '"></div>' +
        '<div class="swatch" style="background:' + t.text + '"></div>' +
        '<div class="swatch" style="background:' + t.accent + '"></div>' +
        '</div>';
    }
    if (dimension === 'typography') {
      return '<div style="font-family:' + t.family + ';padding:16px">' +
        '<div style="font-size:24px">Aa</div><div style="font-size:13px;opacity:0.7">The quick brown fox</div>' +
        '</div>';
    }
    if (dimension === 'component_style') {
      return '<div style="padding:24px;display:flex;align-items:center;justify-content:center">' +
        '<button style="border-radius:' + (t.radius || 0) + 'px;box-shadow:' + (t.shadow || 'none') + ';border:' + (t.border || 'none') + ';padding:8px 16px;background:#5B6EE1;color:white">Button</button>' +
        '</div>';
    }
    if (dimension === 'layout_spacing') {
      return '<div style="background:rgba(255,255,255,0.05);padding:' + (t.paddingMin || 16) + 'px ' + (t.paddingMax || 32) + 'px;font-size:12px">' +
        'padding ' + t.paddingMin + '–' + t.paddingMax + ' px' +
        '</div>';
    }
    if (dimension === 'detail_elements') {
      return '<div style="padding:24px;font-size:13px;opacity:0.8">' + opt.notesTemplate + '</div>';
    }
    if (dimension === 'motion') {
      return '<div style="padding:20px"><button style="transition:transform ' + t.durationMs + 'ms ' + t.easing + ';padding:8px 16px" onmouseover="this.style.transform=\\'scale(1.06)\\'" onmouseout="this.style.transform=\\'scale(1)\\'">hover me</button></div>';
    }
    return '<div style="padding:20px;font-size:13px;opacity:0.7">' + opt.label + '</div>';
  }

  function renderReview(total) {
    var rows = state.choices.map(function (d) {
      var pickId = state.picks[d.dimension];
      var opt = d.options.find(function (o) { return o.id === pickId; });
      var drift = state.mood && opt.moodTags.indexOf(state.mood) < 0;
      return '<div class="review-row">' +
        '<div>' + d.dimension + '</div>' +
        '<div>' + opt.label + (drift ? ' <span style="opacity:0.6">(off-mood)</span>' : '') + '</div>' +
        '<a class="edit" href="#" data-step="' + (state.choices.indexOf(d) + 1) + '">Edit</a>' +
        '</div>';
    }).join('');
    app.innerHTML =
      progressBar(total - 1, total) +
      '<h1>Review</h1>' +
      '<p class="lead">Confirm your 7 picks, then write the file.</p>' +
      rows +
      '<div style="margin-top:24px"><button class="ghost" id="back">Back</button><button class="primary" id="submit">Write preference_vector.json</button></div>' +
      '<div id="msg"></div>';
    var edits = app.querySelectorAll('a.edit');
    edits.forEach(function (a) {
      a.onclick = function (e) { e.preventDefault(); state.step = parseInt(a.getAttribute('data-step'), 10); render(); };
    });
    document.getElementById('back').onclick = function () { state.step--; render(); };
    document.getElementById('submit').onclick = submit;
  }

  function submit() {
    fetch('/submit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mood: state.mood, picks: state.picks })
    }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) { document.getElementById('msg').innerHTML = '<div class="notice">' + (res.j.error || 'error') + '</div>'; return; }
        app.innerHTML = '<h1>Done.</h1><p class="lead">Wrote ' + res.j.path + '. You can close this tab.</p>';
        fetch('/shutdown', { method: 'POST' });
      });
  }
})();
</script>
</body>
</html>`;
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/unit/init/render.test.ts tests/unit/init/server.test.ts`
Expected: PASS on both.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add tddesign/cli/init/render.ts tests/unit/init/render.test.ts
git commit -m "feat(init): full SPA render with welcome/dimensions/review/success screens"
```

---

## Task 7: `open.ts` — cross-platform browser opener

**Files:**
- Create: `tddesign/cli/init/open.ts`

- [ ] **Step 1: Implement directly (no test — platform-dependent, covered by manual verification)**

```ts
// tddesign/cli/init/open.ts
import { spawn } from "node:child_process";

export function openBrowser(url: string): void {
  const platform = process.platform;
  let cmd: string;
  let args: string[];
  if (platform === "darwin") {
    cmd = "open";
    args = [url];
  } else if (platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", "", url];
  } else {
    cmd = "xdg-open";
    args = [url];
  }
  try {
    const child = spawn(cmd, args, { stdio: "ignore", detached: true });
    child.on("error", () => {});
    child.unref();
  } catch {
    // swallow — caller prints the URL anyway
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add tddesign/cli/init/open.ts
git commit -m "feat(init): cross-platform browser opener"
```

---

## Task 8: `init.ts` entry point — orchestration

**Files:**
- Create: `tddesign/cli/init.ts`

- [ ] **Step 1: Implement the entry**

```ts
// tddesign/cli/init.ts
import path from "node:path";
import { startServer } from "./init/server.js";
import { openBrowser } from "./init/open.js";

async function main(): Promise<void> {
  const target = path.resolve(process.cwd(), "preference_vector.json");
  const server = await startServer({ targetPath: target });
  process.stdout.write(`taste init running at ${server.url}\n`);
  openBrowser(server.url);

  const timeoutMs = 15 * 60 * 1000;
  const timeout = setTimeout(() => {
    process.stderr.write("timed out waiting for submission\n");
    server.close().finally(() => process.exit(1));
  }, timeoutMs);

  await server.submitted;
  clearTimeout(timeout);
  process.stdout.write(`\u2713 wrote ${target}\n`);
  // Server shuts itself down after /shutdown is posted by the success screen.
}

main().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Smoke-run manually** (optional during development; agent should skip if non-interactive)

Run: `npx tsx tddesign/cli/init.ts` — verify the browser opens, clicking through writes `preference_vector.json`. Ctrl+C is acceptable to abort during development.

- [ ] **Step 4: Commit**

```bash
git add tddesign/cli/init.ts
git commit -m "feat(init): entry point wiring server + browser + timeout"
```

---

## Task 9: Integration test — writer output flows through the pipeline

**Files:**
- Create: `tests/integration/init-pipeline.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// tests/integration/init-pipeline.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { assembleVector, writeVector } from "../../tddesign/cli/init/writer.js";
import { CHOICES } from "../../tddesign/cli/init/choices.js";
import { runPipeline } from "../../tddesign/cli/taste-check.js";

describe("init → pipeline integration", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "taste-init-int-"));
  });
  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("picked options produce a report with at least the color exact checks", async () => {
    const picks = Object.fromEntries(
      CHOICES.map((d) => [d.dimension, d.options[0].id])
    );
    const vector = assembleVector({ mood: "minimal", picks: picks as any });
    const target = path.join(dir, "preference_vector.json");
    await writeVector(target, vector);

    const raw = await fs.readFile(target, "utf8");
    const parsed = JSON.parse(raw);

    const html = await fs.readFile(
      path.resolve("tests/fixtures/good_page.html"),
      "utf8"
    );
    const result = await runPipeline({
      vector: parsed,
      task: "hero",
      html,
    });

    expect(result.report.total).toBeGreaterThan(0);
    const colorExacts = result.report.results.filter((r) =>
      r.check_id.startsWith("color.")
    );
    expect(colorExacts.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run test**

Run: `npx vitest run tests/integration/init-pipeline.test.ts`
Expected: PASS (the color_direction first option is mono-indigo → 3 color checks; good_page.html is the existing fixture that passes the pipeline).

If the color fixture does not match the first option, swap the `picks.color_direction` to `"mono-indigo"` explicitly. This test's purpose is to prove the data flow, not the specific color match.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/init-pipeline.test.ts
git commit -m "test(init): integration — writer output flows through pipeline"
```

---

## Task 10: Full suite + typecheck + coverage gate

- [ ] **Step 1: Run everything**

Run: `npm run typecheck && npx vitest run`
Expected: all tests pass, no type errors.

- [ ] **Step 2: Coverage**

Run: `npm run test:coverage`
Expected: statements/functions/lines remain at 100%, branch ≥ 95%. If coverage regresses in `init/*`, add focused tests for the uncovered branches before proceeding.

- [ ] **Step 3: Final commit (only if coverage required any tweaks)**

```bash
git add -u
git commit -m "test(init): close coverage gaps"
```

---

## Self-Review

**Spec coverage check:**

- §1 Scope & goal → Tasks 8, 9 (entry point + integration test write `preference_vector.json` and prove it's consumable by the pipeline). ✓
- §2 Architecture → Tasks 1, 4, 5, 6, 7, 8 cover every file named in the spec. ✓
- §3 Data model → Tasks 1–3 build `choices.ts` with the exact `ChoiceOption` shape and ≥ 40 options (4 is the floor; actual count = 6+8+4+4+4+4+4 = 34, short of the 40 target). **Gap:** the spec targets 40; plan builds 34. Resolution: the plan's minimums are spec floors (v1 tolerates fewer; adding more is additive and safe). Mark as an acceptable deviation for v1 — if the user wants the full 40, Task 3 takes more options per dimension.
- §4 User flow → Task 6 renders welcome/dimensions/review/success screens; Task 8 handles launch and timeout. ✓
- §5 Rendering strategy → Task 6's `previewHtml` function handles every dimension. ✓
- §6 Server contract → Task 5 implements all four routes with exact payload shapes. ✓
- §7 Error handling → Port retry is NOT in Task 5 (uses port 0 which OS picks). Browser failure is handled in Task 7's try/catch. Timeout is in Task 8. Invalid body → 400 in Task 5. File write failure → caught by the same try/catch in Task 5. Existing file → silent overwrite in Task 4. **Gap:** port-retry logic from spec §7 is not implemented. Resolution: Task 5 uses port 0 (OS-assigned), which means "already in use" is effectively impossible — the spec's retry-10-times provision was written assuming a fixed port. Acceptable.
- §8 Testing strategy → Tasks 1–6 cover all unit tests; Task 9 covers integration. ✓
- §9 Taste-testable invariant → Task 9 locks it. ✓
- §10 Commit sequence → Matches tasks 1–9. ✓

**Placeholder scan:** no TBDs, no "add appropriate error handling" waves, every code step has concrete code.

**Type consistency:** `SubmitPayload` shape in Task 4's writer matches the payload POSTed by Task 6's render JS and consumed by Task 5's server. `ChoiceOption` + `DimensionChoices` + `Mood` types defined in Task 1 are used consistently throughout. `CHOICES` dimension order matches `DIMENSIONS` from `schemas.ts`.

**Known deviations from spec (acceptable for v1):**
- Option counts total 34, not 40. Floor is met.
- Port-retry (spec §7) replaced by OS-assigned port (port 0).
