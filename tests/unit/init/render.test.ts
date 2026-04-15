import { describe, it, expect } from "vitest";
import { buildIndexHtml } from "../../../tddesign/cli/init/render.js";
import { CHOICES, MOODS } from "../../../tddesign/cli/init/choices.js";

describe("render.buildIndexHtml", () => {
  const html = buildIndexHtml();

  it("has a doctype and a root mount element", () => {
    expect(html).toMatch(/<!doctype html>/i);
    expect(html).toContain('id="app"');
  });

  it("includes inline CSS, not external stylesheets", () => {
    expect(html).toContain("<style>");
    expect(html).not.toContain("<link rel=\"stylesheet\"");
  });

  it("includes a client script that fetches /choices.json", () => {
    expect(html).toContain("fetch('/choices.json')");
  });

  it("includes a submit hook that POSTs to /submit", () => {
    expect(html).toContain("/submit");
  });

  it("includes a shutdown hook that POSTs to /shutdown", () => {
    expect(html).toContain("/shutdown");
  });

  it("includes every dimension id as a literal", () => {
    for (const d of CHOICES) {
      expect(html).toContain(d.dimension);
    }
  });

  it("includes every mood id as a literal", () => {
    for (const m of MOODS) {
      expect(html).toContain(m);
    }
  });

  it("embeds the custom color option id handling in the served HTML", () => {
    const html2 = buildIndexHtml();
    // The inline script branches on the 'custom' color_direction pick id.
    expect(html2).toContain("'custom'");
  });

  it("includes customTokens handling in the submit code", () => {
    const html2 = buildIndexHtml();
    expect(html2).toContain("customTokens");
  });

  it("embeds OVERALL_STYLE_MOCKUPS so the client can render the review mockup", () => {
    const overall = CHOICES.find((c) => c.dimension === "overall_style")!;
    for (const opt of overall.options) {
      // Each mood id appears at least twice: once as a CHOICES option id
      // and once as an OVERALL_STYLE_MOCKUPS key.
      const matches = html.split(opt.id).length - 1;
      expect(matches).toBeGreaterThanOrEqual(2);
    }
  });
});
