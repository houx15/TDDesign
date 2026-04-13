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
