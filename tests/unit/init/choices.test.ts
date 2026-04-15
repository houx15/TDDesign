import { describe, it, expect } from "vitest";
import { CHOICES, MOODS, PAGE_TYPE_CHOICE } from "../../../tddesign/cli/init/choices.js";
import { DIMENSIONS } from "../../../tddesign/schemas.js";
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

describe("choices", () => {
  it("exports one DimensionChoices entry per schema dimension in order", () => {
    expect(CHOICES.map((c) => c.dimension)).toEqual([...DIMENSIONS]);
  });

  it("exports a non-empty MOODS list", () => {
    expect(MOODS.length).toBeGreaterThanOrEqual(4);
  });
});

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
