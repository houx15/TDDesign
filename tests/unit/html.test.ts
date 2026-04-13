import { describe, it, expect } from "vitest";
import { extractFacts } from "../../tddesign/parser/facts.js";

const html = `
<!doctype html>
<html><body class="bg-[#0F0F10] text-[#FAFAFA]">
  <section class="py-20 px-8"><h1>Ship taste 🚀</h1></section>
</body></html>
`;

describe("fact extraction", () => {
  it("collects body resolved background and color", () => {
    const facts = extractFacts(html);
    const body = facts.find((f) => f.tag === "body")!;
    expect(body.resolved["background-color"]).toBe("#0F0F10");
    expect(body.resolved["color"]).toBe("#FAFAFA");
  });

  it("collects section padding-block and padding-inline", () => {
    const facts = extractFacts(html);
    const section = facts.find((f) => f.tag === "section")!;
    expect(section.resolved["padding-block"]).toBe("80px");
    expect(section.resolved["padding-inline"]).toBe("32px");
  });

  it("captures text content on the heading", () => {
    const facts = extractFacts(html);
    const h1 = facts.find((f) => f.tag === "h1")!;
    expect(h1.text).toContain("🚀");
  });

  it("returns at least one fact per element", () => {
    const facts = extractFacts(html);
    const tags = facts.map((f) => f.tag);
    expect(tags).toContain("body");
    expect(tags).toContain("section");
    expect(tags).toContain("h1");
  });
});
