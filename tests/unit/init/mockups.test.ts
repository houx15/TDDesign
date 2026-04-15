import { describe, it, expect } from "vitest";
import {
  OVERALL_STYLE_MOCKUPS,
  MOOD_DEFAULTS,
  interpolate,
  deriveSlots,
  type StyleBundle,
} from "../../../tddesign/cli/init/mockups.js";
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

describe("MOOD_DEFAULTS", () => {
  const overall = CHOICES.find((c) => c.dimension === "overall_style")!;

  it("has one bundle per mood id", () => {
    for (const opt of overall.options) {
      expect(MOOD_DEFAULTS[opt.id]).toBeDefined();
    }
  });

  it("every bundle has every StyleBundle field populated with the right primitive type", () => {
    const numKeys: (keyof StyleBundle)[] = [
      "radius",
      "paddingMin",
      "paddingMax",
      "motionDurationMs",
    ];
    const strKeys: (keyof StyleBundle)[] = [
      "background",
      "text",
      "accent",
      "fontFamily",
      "shadow",
      "border",
      "iconStyle",
      "motionEasing",
      "mood",
    ];
    for (const opt of overall.options) {
      const b = MOOD_DEFAULTS[opt.id];
      for (const k of numKeys) expect(typeof b[k]).toBe("number");
      for (const k of strKeys) expect(typeof b[k]).toBe("string");
      expect(b.mood).toBe(opt.id);
    }
  });
});

describe("interpolate", () => {
  it("substitutes {{slot}} placeholders", () => {
    const out = interpolate("a {{x}} b {{y}} c", { x: "1", y: 2 });
    expect(out).toBe("a 1 b 2 c");
  });

  it("leaves empty string for missing slots", () => {
    expect(interpolate("{{missing}}", {})).toBe("");
  });
});

describe("deriveSlots", () => {
  it("adds buttonTransition and iconRow derived from bundle", () => {
    const slots = deriveSlots(MOOD_DEFAULTS["minimal-precise"]);
    expect(slots.buttonTransition).toBe("transform 150ms ease-out");
    expect(slots.iconRow).toBe("→");
  });
});

describe("templates interpolated with mood defaults", () => {
  const overall = CHOICES.find((c) => c.dimension === "overall_style")!;

  it("every template produces no leftover placeholders when interpolated with its mood default", () => {
    for (const opt of overall.options) {
      const out = interpolate(
        OVERALL_STYLE_MOCKUPS[opt.id],
        deriveSlots(MOOD_DEFAULTS[opt.id]),
      );
      expect(out).not.toMatch(/\{\{\w+\}\}/);
    }
  });

  it("minimal-precise interpolated with paper-black color tokens yields #FFFFFF and the original headline", () => {
    const bundle: StyleBundle = {
      ...MOOD_DEFAULTS["minimal-precise"],
      background: "#FFFFFF",
      text: "#111111",
      accent: "#0057FF",
    };
    const out = interpolate(
      OVERALL_STYLE_MOCKUPS["minimal-precise"],
      deriveSlots(bundle),
    );
    expect(out).toContain("#FFFFFF");
    expect(out).toContain("Write less. Ship more.");
    expect(out).toContain("Inter");
  });
});

describe("StyleBundle v2B new fields", () => {
  it("every mood in MOOD_DEFAULTS has headingScale, bodySize, gap, alignment", () => {
    for (const [moodKey, bundle] of Object.entries(MOOD_DEFAULTS)) {
      expect(typeof bundle.headingScale).toBe("number");
      expect(typeof bundle.bodySize).toBe("number");
      expect(typeof bundle.gap).toBe("number");
      expect(["centered", "left", "split"]).toContain(bundle.alignment);
    }
  });
});
