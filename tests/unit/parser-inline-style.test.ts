import { describe, it, expect } from "vitest";
import { parseInlineStyle, extractFacts } from "../../tddesign/parser/facts.js";

describe("parseInlineStyle", () => {
  it("parses a flat k:v;k:v map", () => {
    expect(parseInlineStyle("background:#0F0F10; color:#FAFAFA")).toEqual({
      "background": "#0F0F10",
      "background-color": "#0F0F10",
      "color": "#FAFAFA",
    });
  });

  it("tolerates extra whitespace and trailing semicolons", () => {
    const out = parseInlineStyle("  color : red ; ");
    expect(out.color).toBe("red");
  });

  it("skips clauses without a colon", () => {
    expect(parseInlineStyle("broken; color: red")).toEqual({ color: "red" });
  });

  it("expands padding shorthand with two values", () => {
    const out = parseInlineStyle("padding: 80px 32px");
    expect(out["padding-block"]).toBe("80px");
    expect(out["padding-inline"]).toBe("32px");
    expect(out["padding-top"]).toBe("80px");
  });

  it("expands padding shorthand with one value", () => {
    const out = parseInlineStyle("padding: 24px");
    expect(out["padding-block"]).toBe("24px");
    expect(out["padding-inline"]).toBe("24px");
  });

  it("returns empty for empty input", () => {
    expect(parseInlineStyle("")).toEqual({});
    expect(parseInlineStyle("   ")).toEqual({});
  });
});

describe("extractFacts with inline style", () => {
  it("merges body inline style into resolved", () => {
    const html = '<html><body style="background:#0F0F10;color:#FAFAFA"><h1>hi</h1></body></html>';
    const facts = extractFacts(html);
    const body = facts.find((f) => f.tag === "body")!;
    expect(body.resolved["background-color"]).toBe("#0F0F10");
    expect(body.resolved.color).toBe("#FAFAFA");
  });

  it("inline style overrides tailwind class for the same key", () => {
    const html = '<html><body class="bg-[#112233]" style="background:#0F0F10"><h1>hi</h1></body></html>';
    const facts = extractFacts(html);
    const body = facts.find((f) => f.tag === "body")!;
    expect(body.resolved["background-color"]).toBe("#0F0F10");
  });

  it("section with inline padding-block grades through the range check", () => {
    const html = '<html><body><section style="padding-block:80px"><h1>hi</h1></section></body></html>';
    const facts = extractFacts(html);
    const section = facts.find((f) => f.tag === "section")!;
    expect(section.resolved["padding-block"]).toBe("80px");
  });
});
