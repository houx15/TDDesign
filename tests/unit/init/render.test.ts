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
});
