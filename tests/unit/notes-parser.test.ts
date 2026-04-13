import { describe, it, expect } from "vitest";
import { parsePreferenceVector } from "../../tddesign/composer/notes-parser.js";
import { PreferenceVectorSchema, type PreferenceVector } from "../../tddesign/schemas.js";

function makeVector(overrides: Partial<Record<string, { choice: string; notes: string }>> = {}): PreferenceVector {
  const base = {
    profile_name: "t",
    scope: "project" as const,
    selections: {
      overall_style: { choice: "x", source_refs: [], notes: "" },
      color_direction: { choice: "x", source_refs: [], notes: "" },
      typography: { choice: "x", source_refs: [], notes: "" },
      component_style: { choice: "x", source_refs: [], notes: "" },
      layout_spacing: { choice: "x", source_refs: [], notes: "" },
      detail_elements: { choice: "x", source_refs: [], notes: "" },
      motion: { choice: "x", source_refs: [], notes: "" },
    },
    created_at: "2026-04-13T00:00:00Z",
    updated_at: "2026-04-13T00:00:00Z",
  };
  for (const [k, v] of Object.entries(overrides)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (base.selections as any)[k] = { choice: v!.choice, source_refs: [], notes: v!.notes };
  }
  return PreferenceVectorSchema.parse(base);
}

describe("notes-parser: hex extractor", () => {
  it("extracts three frozen color checks from the fixture notes", () => {
    const v = makeVector({
      color_direction: {
        choice: "near-black-with-indigo-accent",
        notes: "Background #0F0F10, primary text #FAFAFA, accent #5B6EE1",
      },
    });
    const checks = parsePreferenceVector(v);
    const bg = checks.find((c) => c.id === "color.background");
    const tp = checks.find((c) => c.id === "color.text_primary");
    const ac = checks.find((c) => c.id === "color.accent");
    if (!bg || bg.type !== "exact") throw new Error("bg");
    if (!tp || tp.type !== "exact") throw new Error("tp");
    if (!ac || ac.type !== "exact") throw new Error("ac");
    expect(bg).toMatchObject({
      id: "color.background",
      type: "exact",
      dimension: "color_direction",
      rule: "Background color is #0F0F10",
      property: "background-color",
      expected: "#0F0F10",
    });
    expect(tp).toMatchObject({
      id: "color.text_primary",
      type: "exact",
      dimension: "color_direction",
      rule: "Primary text color is #FAFAFA",
      property: "color",
      expected: "#FAFAFA",
    });
    expect(ac).toMatchObject({
      id: "color.accent",
      type: "exact",
      dimension: "color_direction",
      rule: "Accent color is #5B6EE1",
      property: "background-color",
      expected: "#5B6EE1",
    });
  });

  it("preserves hex casing as written", () => {
    const v = makeVector({
      color_direction: { choice: "x", notes: "Background #111111" },
    });
    const [bg] = parsePreferenceVector(v);
    if (!bg || bg.type !== "exact") throw new Error("bg");
    expect(bg.expected).toBe("#111111");
  });

  it("ignores hex values without a known role keyword", () => {
    const v = makeVector({
      color_direction: { choice: "x", notes: "Mystery color #ABCDEF somewhere" },
    });
    expect(parsePreferenceVector(v)).toEqual([]);
  });
});

describe("notes-parser: hex extractor hardening (H1)", () => {
  it("handles multiple hexes in one clause joined by conjunction without comma", () => {
    const v = makeVector({
      color_direction: {
        choice: "x",
        notes: "Background is #0F0F10 and primary text is #FAFAFA",
      },
    });
    const checks = parsePreferenceVector(v);
    const bg = checks.find((c) => c.id === "color.background");
    const tp = checks.find((c) => c.id === "color.text_primary");
    if (!bg || bg.type !== "exact") throw new Error("bg");
    if (!tp || tp.type !== "exact") throw new Error("tp");
    expect(bg.expected).toBe("#0F0F10");
    expect(tp.expected).toBe("#FAFAFA");
  });

  it("does not treat bare 'primary button' as a text_primary role hit", () => {
    const v = makeVector({
      color_direction: { choice: "x", notes: "primary button #5B6EE1" },
    });
    const checks = parsePreferenceVector(v);
    expect(checks.find((c) => c.id === "color.text_primary")).toBeUndefined();
  });

  it("binds hex to nearest role keyword, not the first keyword in clause", () => {
    const v = makeVector({
      color_direction: {
        choice: "x",
        notes: "background color is #0F0F10 and #FAFAFA is primary text",
      },
    });
    const checks = parsePreferenceVector(v);
    const bg = checks.find((c) => c.id === "color.background");
    const tp = checks.find((c) => c.id === "color.text_primary");
    if (!bg || bg.type !== "exact") throw new Error("bg");
    if (!tp || tp.type !== "exact") throw new Error("tp");
    expect(bg.expected).toBe("#0F0F10");
    expect(tp.expected).toBe("#FAFAFA");
  });

  it("rejects 3-digit shorthand hex (v0 parser: 6-digit only)", () => {
    const v = makeVector({
      color_direction: { choice: "x", notes: "Background #fff" },
    });
    expect(parsePreferenceVector(v)).toEqual([]);
  });
});

describe("notes-parser: range extractor", () => {
  it("extracts the frozen hero padding range from the fixture notes", () => {
    const v = makeVector({
      layout_spacing: {
        choice: "spacious-hero",
        notes: "Section padding between 48 and 96 px",
      },
    });
    const checks = parsePreferenceVector(v);
    const pad = checks.find((c) => c.id === "layout.hero_section_padding");
    if (!pad || pad.type !== "range") throw new Error("pad");
    expect(pad).toMatchObject({
      id: "layout.hero_section_padding",
      type: "range",
      dimension: "layout_spacing",
      rule: "Hero section vertical padding between 48 and 96 px",
      property: "padding-block",
      min: 48,
      max: 96,
      unit: "px",
    });
  });

  it("supports the N-M <unit> alt syntax with padding keyword", () => {
    const v = makeVector({
      layout_spacing: { choice: "x", notes: "padding 32-64 px" },
    });
    const [pad] = parsePreferenceVector(v);
    if (!pad || pad.type !== "range") throw new Error("pad");
    expect(pad.min).toBe(32);
    expect(pad.max).toBe(64);
  });

  it("rejects a range where min >= max", () => {
    const v = makeVector({
      layout_spacing: { choice: "x", notes: "padding between 96 and 48 px" },
    });
    expect(parsePreferenceVector(v)).toEqual([]);
  });

  it("ignores padding ranges found outside layout_spacing dimension", () => {
    const v = makeVector({
      detail_elements: { choice: "x", notes: "padding between 10 and 20 px" },
    });
    // WI-3 only wires layout_spacing; detail_elements WI-4 handles its own things.
    const checks = parsePreferenceVector(v);
    expect(checks.find((c) => c.id === "layout.hero_section_padding")).toBeUndefined();
  });
});

describe("notes-parser: range extractor hardening (H2)", () => {
  it("binds range to padding clause even when gap clause appears first", () => {
    const v = makeVector({
      layout_spacing: {
        choice: "x",
        notes: "gap between 8 and 16 px, padding between 48 and 96 px",
      },
    });
    const [pad] = parsePreferenceVector(v);
    if (!pad || pad.type !== "range") throw new Error("pad");
    expect(pad.min).toBe(48);
    expect(pad.max).toBe(96);
  });

  it("binds range to padding clause when padding clause appears first", () => {
    const v = makeVector({
      layout_spacing: {
        choice: "x",
        notes: "padding between 48 and 96 px, gap between 8 and 16 px",
      },
    });
    const [pad] = parsePreferenceVector(v);
    if (!pad || pad.type !== "range") throw new Error("pad");
    expect(pad.min).toBe(48);
    expect(pad.max).toBe(96);
  });
});

describe("notes-parser: overall_style adjective source (H3)", () => {
  it("fires atmosphere check for choice 'minimal-precise' with empty notes", () => {
    const v = makeVector({
      overall_style: { choice: "minimal-precise", notes: "" },
    });
    const atm = parsePreferenceVector(v).find(
      (c) => c.id === "atmosphere.minimal_precise"
    );
    expect(atm).toBeDefined();
  });

  it("does NOT fire atmosphere check for choice 'clean-precise' with empty notes", () => {
    const v = makeVector({
      overall_style: { choice: "clean-precise", notes: "" },
    });
    const atm = parsePreferenceVector(v).find(
      (c) => c.id === "atmosphere.minimal_precise"
    );
    expect(atm).toBeUndefined();
  });

  it("fires atmosphere check from notes regardless of unrelated choice", () => {
    const v = makeVector({
      overall_style: { choice: "whatever", notes: "Minimal and precise" },
    });
    const atm = parsePreferenceVector(v).find(
      (c) => c.id === "atmosphere.minimal_precise"
    );
    expect(atm).toBeDefined();
  });

  it("does not fire atmosphere check from unrelated notes", () => {
    const v = makeVector({
      overall_style: { choice: "whatever", notes: "Bold playful" },
    });
    const atm = parsePreferenceVector(v).find(
      (c) => c.id === "atmosphere.minimal_precise"
    );
    expect(atm).toBeUndefined();
  });
});

describe("notes-parser: dimension iteration order (M1)", () => {
  it("produces the frozen 6-ID sequence for the fixture vector", async () => {
    const fixture = await import("../fixtures/preference_vector.json");
    const pv = PreferenceVectorSchema.parse(fixture.default ?? fixture);
    const ids = parsePreferenceVector(pv).map((c) => c.id);
    expect(ids).toEqual([
      "color.background",
      "color.text_primary",
      "color.accent",
      "layout.hero_section_padding",
      "detail.no_emoji",
      "atmosphere.minimal_precise",
    ]);
  });
});

describe("notes-parser: pattern-absent extractor", () => {
  it("extracts the frozen no-emoji check from the fixture notes", () => {
    const v = makeVector({
      detail_elements: { choice: "x", notes: "No emoji characters anywhere" },
    });
    const [emoji] = parsePreferenceVector(v);
    if (!emoji || emoji.type !== "pattern") throw new Error("emoji");
    expect(emoji).toMatchObject({
      id: "detail.no_emoji",
      type: "pattern",
      dimension: "detail_elements",
      rule: "No emoji characters anywhere in the rendered page",
      mode: "absent",
      target: "emoji",
    });
  });

  it("ignores No <target> phrases with unknown targets", () => {
    const v = makeVector({
      detail_elements: { choice: "x", notes: "No wombats" },
    });
    expect(parsePreferenceVector(v)).toEqual([]);
  });
});

describe("notes-parser: subjective fallback for overall_style", () => {
  it("emits the frozen atmosphere check for the fixture choice+notes", () => {
    const v = makeVector({
      overall_style: { choice: "minimal-precise", notes: "" },
    });
    const checks = parsePreferenceVector(v);
    const atm = checks.find((c) => c.id === "atmosphere.minimal_precise");
    if (!atm || atm.type !== "subjective") throw new Error("atm");
    expect(atm).toMatchObject({
      id: "atmosphere.minimal_precise",
      type: "subjective",
      dimension: "overall_style",
      rule: "Overall atmosphere feels minimal and precise",
      criterion: "minimal-precise",
    });
  });

  it("emits the atmosphere check when notes mention minimal and technical", () => {
    const v = makeVector({
      overall_style: { choice: "other", notes: "minimal, technical vibe" },
    });
    const atm = parsePreferenceVector(v).find(
      (c) => c.id === "atmosphere.minimal_precise"
    );
    expect(atm).toBeDefined();
  });

  it("does not emit atmosphere check when adjectives are absent", () => {
    const v = makeVector({
      overall_style: { choice: "playful", notes: "loud and chaotic" },
    });
    const atm = parsePreferenceVector(v).find(
      (c) => c.id === "atmosphere.minimal_precise"
    );
    expect(atm).toBeUndefined();
  });
});

describe("notes-parser: branch coverage fill-ins", () => {
  it("ignores color clauses without any hex value", () => {
    const v = makeVector({
      color_direction: { choice: "x", notes: "Background is dark, accent #5B6EE1" },
    });
    const checks = parsePreferenceVector(v);
    expect(checks.find((c) => c.id === "color.background")).toBeUndefined();
    expect(checks.find((c) => c.id === "color.accent")).toBeDefined();
  });

  it("only emits one check per role when the role repeats", () => {
    const v = makeVector({
      color_direction: {
        choice: "x",
        notes: "Background #111111; Background #222222",
      },
    });
    const bgs = parsePreferenceVector(v).filter((c) => c.id === "color.background");
    expect(bgs).toHaveLength(1);
    if (bgs[0].type !== "exact") throw new Error("bg");
    expect(bgs[0].expected).toBe("#111111");
  });

  it("returns [] for layout notes without the padding keyword", () => {
    const v = makeVector({
      layout_spacing: { choice: "x", notes: "Gap between 8 and 16 px" },
    });
    expect(parsePreferenceVector(v)).toEqual([]);
  });

  it("returns [] when layout notes contain padding but no numeric range", () => {
    const v = makeVector({
      layout_spacing: { choice: "x", notes: "Generous padding everywhere" },
    });
    expect(parsePreferenceVector(v)).toEqual([]);
  });

  it("only emits one no-emoji check when the phrase repeats", () => {
    const v = makeVector({
      detail_elements: { choice: "x", notes: "No emoji. No emoji ever." },
    });
    const emojis = parsePreferenceVector(v).filter((c) => c.id === "detail.no_emoji");
    expect(emojis).toHaveLength(1);
  });
});

describe("notes-parser: scaffold", () => {
  it("returns [] when all notes are empty", () => {
    expect(parsePreferenceVector(makeVector())).toEqual([]);
  });

  it("returns [] when notes are only whitespace", () => {
    const v = makeVector({
      color_direction: { choice: "x", notes: "   \n\t " },
      layout_spacing: { choice: "x", notes: "  " },
      detail_elements: { choice: "x", notes: "" },
    });
    expect(parsePreferenceVector(v)).toEqual([]);
  });
});

export { makeVector };
