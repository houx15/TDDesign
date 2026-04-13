import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { compose } from "../../tddesign/composer/index.js";
import {
  PreferenceVectorSchema,
  MaterialIndexSchema,
} from "../../tddesign/schemas.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vector = PreferenceVectorSchema.parse(
  JSON.parse(readFileSync(join(__dirname, "../fixtures/preference_vector.json"), "utf8"))
);
const emptyLibrary = MaterialIndexSchema.parse({ version: 1, entries: [] });

describe("composer", () => {
  it("emits a DESIGN.md containing all 9 Stitch sections", () => {
    const { designMd } = compose(vector, emptyLibrary);
    for (const title of [
      "## Visual Theme & Atmosphere",
      "## Color Palette & Roles",
      "## Typography Rules",
      "## Component Stylings",
      "## Layout Principles",
      "## Depth & Elevation",
      "## Do's and Don'ts",
      "## Responsive Behavior",
      "## Agent Prompt Guide",
    ]) {
      expect(designMd).toContain(title);
    }
  });

  it("emits the three critical checks derived from the vector notes", () => {
    const { checks } = compose(vector, emptyLibrary);
    const ids = checks.map((c) => c.id);
    expect(ids).toContain("color.background");
    expect(ids).toContain("layout.hero_section_padding");
    expect(ids).toContain("detail.no_emoji");
  });

  it("generates the background check with the expected hex", () => {
    const { checks } = compose(vector, emptyLibrary);
    const bg = checks.find((c) => c.id === "color.background");
    expect(bg).toBeDefined();
    expect(bg!.type).toBe("exact");
    if (bg!.type === "exact") {
      expect(bg.expected).toBe("#0F0F10");
    }
  });

  it("generates the hero padding range check with bounds 48..96 px", () => {
    const { checks } = compose(vector, emptyLibrary);
    const pad = checks.find((c) => c.id === "layout.hero_section_padding");
    expect(pad?.type).toBe("range");
    if (pad?.type === "range") {
      expect(pad.min).toBe(48);
      expect(pad.max).toBe(96);
      expect(pad.unit).toBe("px");
    }
  });

  it("generates the no-emoji pattern check", () => {
    const { checks } = compose(vector, emptyLibrary);
    const emoji = checks.find((c) => c.id === "detail.no_emoji");
    expect(emoji?.type).toBe("pattern");
    if (emoji?.type === "pattern") {
      expect(emoji.mode).toBe("absent");
      expect(emoji.target).toBe("emoji");
    }
  });
});
