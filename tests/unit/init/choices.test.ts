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
