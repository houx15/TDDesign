import { describe, it, expect } from "vitest";
import { buildSection, STITCH_SECTIONS } from "../../tddesign/composer/sections.js";
import { exactCheck } from "../../tddesign/composer/checks.js";

describe("stitch sections", () => {
  it("exposes exactly nine section titles in Stitch order", () => {
    expect(STITCH_SECTIONS).toEqual([
      "Visual Theme & Atmosphere",
      "Color Palette & Roles",
      "Typography Rules",
      "Component Stylings",
      "Layout Principles",
      "Depth & Elevation",
      "Do's and Don'ts",
      "Responsive Behavior",
      "Agent Prompt Guide",
    ]);
  });

  it("renders a section with guidance body and checks subsection", () => {
    const section = buildSection({
      title: "Color Palette & Roles",
      body: "Background: #0F0F10",
      checks: [
        exactCheck({
          id: "color.background",
          dimension: "color_direction",
          rule: "Background is #0F0F10",
          expected: "#0F0F10",
        }),
      ],
    });
    expect(section).toContain("## Color Palette & Roles");
    expect(section).toContain("Background: #0F0F10");
    expect(section).toContain("### Checks");
    expect(section).toContain("[exact] Background is #0F0F10");
  });

  it("omits the checks subsection when there are no checks", () => {
    const section = buildSection({
      title: "Agent Prompt Guide",
      body: "When generating code, read this file first.",
      checks: [],
    });
    expect(section).not.toContain("### Checks");
  });
});
