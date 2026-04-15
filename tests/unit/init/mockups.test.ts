import { describe, it, expect } from "vitest";
import {
  OVERALL_STYLE_MOCKUPS,
  MOOD_DEFAULTS,
  interpolate,
  deriveSlots,
  NEUTRAL_BUNDLE,
  PAGE_TYPE_PREVIEWS,
  type StyleBundle,
} from "../../../tddesign/cli/init/mockups.js";
import { CHOICES } from "../../../tddesign/cli/init/choices.js";
import { buildIndexHtml } from "../../../tddesign/cli/init/render.js";

describe("overall_style mockups", () => {
  const overall = CHOICES.find((c) => c.dimension === "overall_style")!;

  it("has one mockup per overall_style option", () => {
    for (const opt of overall.options) {
      expect(OVERALL_STYLE_MOCKUPS.landing[opt.id]).toBeDefined();
    }
  });

  it("every mockup uses inline styling (at least one style= attribute)", () => {
    for (const opt of overall.options) {
      expect(OVERALL_STYLE_MOCKUPS.landing[opt.id]).toMatch(/style=/);
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
      expect(OVERALL_STYLE_MOCKUPS.landing[id]).toContain(headline);
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
        OVERALL_STYLE_MOCKUPS.landing[opt.id],
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
      OVERALL_STYLE_MOCKUPS.landing["minimal-precise"],
      deriveSlots(bundle),
    );
    expect(out).toContain("#FFFFFF");
    expect(out).toContain("Write less. Ship more.");
    expect(out).toContain("Inter");
  });
});

describe("deriveSlots v2B", () => {
  it("emits containerAlign from alignment field", () => {
    const b = { ...MOOD_DEFAULTS["minimal-precise"], alignment: "centered" as const };
    const slots = deriveSlots(b);
    expect(slots.containerAlign).toBe("center");
  });
  it("maps 'left' to 'flex-start'", () => {
    const b = { ...MOOD_DEFAULTS["minimal-precise"], alignment: "left" as const };
    expect(deriveSlots(b).containerAlign).toBe("flex-start");
  });
  it("maps 'split' to 'space-between'", () => {
    const b = { ...MOOD_DEFAULTS["minimal-precise"], alignment: "split" as const };
    expect(deriveSlots(b).containerAlign).toBe("space-between");
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

describe("NEUTRAL_BUNDLE and PAGE_TYPE_PREVIEWS", () => {
  it("NEUTRAL_BUNDLE is a full StyleBundle", () => {
    expect(NEUTRAL_BUNDLE.background).toBeDefined();
    expect(NEUTRAL_BUNDLE.headingScale).toBeTypeOf("number");
    expect(["centered", "left", "split"]).toContain(NEUTRAL_BUNDLE.alignment);
  });

  it("PAGE_TYPE_PREVIEWS has exactly 2 entries: landing and dashboard", () => {
    expect(Object.keys(PAGE_TYPE_PREVIEWS).sort()).toEqual(["dashboard", "landing"]);
  });

  it("every page-type preview contains an <h1>", () => {
    for (const tpl of Object.values(PAGE_TYPE_PREVIEWS)) {
      expect(tpl).toMatch(/<h1[\s>]/);
    }
  });

  it("dashboard preview contains a KPI-row marker (data-role=\"kpi\" or equivalent)", () => {
    expect(PAGE_TYPE_PREVIEWS.dashboard).toMatch(/data-role=["']kpi["']/);
  });

  it("landing preview contains a figure-role marker", () => {
    expect(PAGE_TYPE_PREVIEWS.landing).toMatch(/data-role=["']figure["']/);
  });
});

describe("OVERALL_STYLE_MOCKUPS 2D shape (landing)", () => {
  it("is keyed by page type at the top level", () => {
    expect(Object.keys(OVERALL_STYLE_MOCKUPS).sort()).toContain("landing");
  });

  it("landing column has all 6 moods", () => {
    const landing = OVERALL_STYLE_MOCKUPS.landing;
    expect(Object.keys(landing).sort()).toEqual([
      "brutalist-raw",
      "editorial-serif",
      "minimal-precise",
      "playful-rounded",
      "vivid-modern",
      "warm-technical",
    ]);
  });

  it("every landing template contains exactly one <h1>", () => {
    for (const tpl of Object.values(OVERALL_STYLE_MOCKUPS.landing)) {
      const h1Matches = tpl.match(/<h1[\s>]/g) || [];
      expect(h1Matches.length).toBe(1);
    }
  });

  it("every landing template has a body paragraph of at least 12 words", () => {
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.landing)) {
      const pMatches = [...tpl.matchAll(/<p[^>]*>([^<]+)<\/p>/g)];
      const hasLongP = pMatches.some(m => m[1].trim().split(/\s+/).length >= 12);
      expect(hasLongP, `landing/${mood} missing 12+ word paragraph`).toBe(true);
    }
  });

  it("every landing template has a figure-role element", () => {
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.landing)) {
      const hasFigure = /data-role=["']figure["']/.test(tpl)
        || /<figure[\s>]/.test(tpl)
        || /<img[\s>]/.test(tpl);
      expect(hasFigure, `landing/${mood} missing figure-role element`).toBe(true);
    }
  });

  it("every landing template uses core slots", () => {
    const required = ["{{background}}", "{{text}}", "{{accent}}", "{{fontFamily}}", "{{paddingMin}}", "{{paddingMax}}"];
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.landing)) {
      for (const slot of required) {
        expect(tpl, `landing/${mood} missing slot ${slot}`).toContain(slot);
      }
    }
  });
});

describe("OVERALL_STYLE_MOCKUPS dashboard column", () => {
  it("has all 6 moods", () => {
    expect(Object.keys(OVERALL_STYLE_MOCKUPS.dashboard || {}).sort()).toEqual([
      "brutalist-raw",
      "editorial-serif",
      "minimal-precise",
      "playful-rounded",
      "vivid-modern",
      "warm-technical",
    ]);
  });

  it("every dashboard template contains exactly one <h1>", () => {
    for (const tpl of Object.values(OVERALL_STYLE_MOCKUPS.dashboard)) {
      const h1Matches = tpl.match(/<h1[\s>]/g) || [];
      expect(h1Matches.length).toBe(1);
    }
  });

  it("every dashboard template has a body paragraph of at least 12 words", () => {
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.dashboard)) {
      const pMatches = [...tpl.matchAll(/<p[^>]*>([^<]+)<\/p>/g)];
      const hasLongP = pMatches.some(m => m[1].trim().split(/\s+/).length >= 12);
      expect(hasLongP, `dashboard/${mood} missing 12+ word paragraph`).toBe(true);
    }
  });

  it("every dashboard template has at least 3 KPI-role cells", () => {
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.dashboard)) {
      const kpiMatches = tpl.match(/data-role=["']kpi["']/g) || [];
      expect(kpiMatches.length, `dashboard/${mood} KPI count`).toBeGreaterThanOrEqual(1);
    }
  });

  it("every dashboard template uses core slots", () => {
    const required = ["{{background}}", "{{text}}", "{{accent}}", "{{fontFamily}}"];
    for (const [mood, tpl] of Object.entries(OVERALL_STYLE_MOCKUPS.dashboard)) {
      for (const slot of required) {
        expect(tpl, `dashboard/${mood} missing slot ${slot}`).toContain(slot);
      }
    }
  });
});
