import { describe, it, expect } from "vitest";
import { OVERALL_STYLE_MOCKUPS } from "../../../tddesign/cli/init/mockups.js";
import { CHOICES } from "../../../tddesign/cli/init/choices.js";
import { buildIndexHtml } from "../../../tddesign/cli/init/render.js";

describe("overall_style mockups", () => {
  const overall = CHOICES.find((c) => c.dimension === "overall_style")!;

  it("has one mockup per overall_style option", () => {
    for (const opt of overall.options) {
      expect(OVERALL_STYLE_MOCKUPS[opt.id]).toBeDefined();
    }
  });

  it("every mockup uses inline styling (at least one style= attribute)", () => {
    for (const opt of overall.options) {
      expect(OVERALL_STYLE_MOCKUPS[opt.id]).toMatch(/style=/);
    }
  });

  const expectedHeadlines: Record<string, string> = {
    "minimal-precise": "Write less. Ship more.",
    "editorial-serif": "The quiet renaissance of slow software.",
    "playful-rounded": "Make something people will hug.",
    "brutalist-raw": "BUILT. NOT RENDERED.",
    "warm-technical": "Developer tools, built with warmth.",
    "vivid-modern": "The future, early.",
  };

  it("each mockup contains its canonical headline copy", () => {
    for (const [id, headline] of Object.entries(expectedHeadlines)) {
      expect(OVERALL_STYLE_MOCKUPS[id]).toContain(headline);
    }
  });

  it("SPA HTML embeds the minimal-precise headline (mockup wired into render)", () => {
    const html = buildIndexHtml();
    expect(html).toContain("Write less. Ship more.");
  });
});
