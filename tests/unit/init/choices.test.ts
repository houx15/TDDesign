import { describe, it, expect } from "vitest";
import { CHOICES, MOODS } from "../../../tddesign/cli/init/choices.js";
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
