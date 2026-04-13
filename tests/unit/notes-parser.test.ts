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
