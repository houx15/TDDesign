import { describe, it, expect } from "vitest";
import { extractFacts } from "../../tddesign/parser/facts.js";

describe("extractFacts with <style> block", () => {
  it("applies tag-selector rules from a style block", () => {
    const html = `
      <html>
      <head><style>body { background:#0F0F10; color:#FAFAFA }</style></head>
      <body><h1>hi</h1></body>
      </html>
    `;
    const facts = extractFacts(html);
    const body = facts.find((f) => f.tag === "body")!;
    expect(body.resolved["background-color"]).toBe("#0F0F10");
    expect(body.resolved.color).toBe("#FAFAFA");
  });

  it("applies class-selector rules", () => {
    const html = `
      <html>
      <head><style>.hero { padding: 80px 32px }</style></head>
      <body><section class="hero"><h1>hi</h1></section></body>
      </html>
    `;
    const facts = extractFacts(html);
    const hero = facts.find((f) => f.tag === "section")!;
    expect(hero.resolved["padding-block"]).toBe("80px");
  });

  it("applies id-selector rules", () => {
    const html = `
      <html>
      <head><style>#main { color:#FAFAFA }</style></head>
      <body><section id="main"><h1>hi</h1></section></body>
      </html>
    `;
    const facts = extractFacts(html);
    const main = facts.find((f) => f.tag === "section")!;
    expect(main.resolved.color).toBe("#FAFAFA");
  });

  it("comma-separated selectors all match", () => {
    const html = `
      <html>
      <head><style>h1, h2 { color:#5B6EE1 }</style></head>
      <body><h1>x</h1><h2>y</h2></body>
      </html>
    `;
    const facts = extractFacts(html);
    expect(facts.find((f) => f.tag === "h1")!.resolved.color).toBe("#5B6EE1");
    expect(facts.find((f) => f.tag === "h2")!.resolved.color).toBe("#5B6EE1");
  });

  it("inline style overrides style-block rule", () => {
    const html = `
      <html>
      <head><style>body { background:#111111 }</style></head>
      <body style="background:#0F0F10"><h1>hi</h1></body>
      </html>
    `;
    const facts = extractFacts(html);
    const body = facts.find((f) => f.tag === "body")!;
    expect(body.resolved["background-color"]).toBe("#0F0F10");
  });

  it("ignores unsupported selectors (e.g. descendant)", () => {
    const html = `
      <html>
      <head><style>div p { color:red }</style></head>
      <body><div><p>x</p></div></body>
      </html>
    `;
    const facts = extractFacts(html);
    const p = facts.find((f) => f.tag === "p")!;
    expect(p.resolved.color).toBeUndefined();
  });

  it("strips /* comments */", () => {
    const html = `
      <html>
      <head><style>/* brand */ body { color:#FAFAFA } /* end */</style></head>
      <body><h1>hi</h1></body>
      </html>
    `;
    const facts = extractFacts(html);
    expect(facts.find((f) => f.tag === "body")!.resolved.color).toBe("#FAFAFA");
  });
});
