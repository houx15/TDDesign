import { describe, it, expect } from "vitest";
import {
  exactCheck,
  rangeCheck,
  patternCheck,
  subjectiveCheck,
} from "../../tddesign/composer/checks.js";

describe("check generators", () => {
  it("builds an exact check with a property", () => {
    const c = exactCheck({
      id: "color.background",
      dimension: "color_direction",
      rule: "Background is #0F0F10",
      property: "background-color",
      expected: "#0F0F10",
    });
    expect(c.type).toBe("exact");
    expect(c).toMatchObject({
      property: "background-color",
      expected: "#0F0F10",
    });
  });

  it("builds a range check with a property", () => {
    const c = rangeCheck({
      id: "layout.hero_section_padding",
      dimension: "layout_spacing",
      rule: "Hero section padding between 48 and 96 px",
      property: "padding-block",
      min: 48,
      max: 96,
      unit: "px",
    });
    expect(c.type).toBe("range");
    expect(c).toMatchObject({
      property: "padding-block",
      min: 48,
      max: 96,
      unit: "px",
    });
  });

  it("builds a pattern check (absent)", () => {
    const c = patternCheck({
      id: "detail.no_emoji",
      dimension: "detail_elements",
      rule: "No emoji characters",
      mode: "absent",
      target: "emoji",
    });
    expect(c.type).toBe("pattern");
    expect(c).toMatchObject({ mode: "absent", target: "emoji" });
  });

  it("builds a subjective check", () => {
    const c = subjectiveCheck({
      id: "atmosphere.minimal",
      dimension: "overall_style",
      rule: "Atmosphere is minimal and precise",
      criterion: "Feels calm, technical, not cold",
    });
    expect(c.type).toBe("subjective");
    expect(c).toMatchObject({ criterion: "Feels calm, technical, not cold" });
  });
});
