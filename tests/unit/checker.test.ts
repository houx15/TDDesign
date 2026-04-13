import { describe, it, expect } from "vitest";
import { runChecker } from "../../tddesign/checker/index.js";
import type { Check, StyleFact } from "../../tddesign/schemas.js";

const facts: StyleFact[] = [
  {
    element_id: "body#0",
    tag: "body",
    classes: [],
    resolved: { "background-color": "#0F0F10", color: "#FAFAFA" },
    text: "",
  },
  {
    element_id: "section#1",
    tag: "section",
    classes: [],
    resolved: { "padding-block": "80px" },
    text: "",
  },
  {
    element_id: "h1#2",
    tag: "h1",
    classes: [],
    resolved: {},
    text: "Ship taste 🚀",
  },
];

describe("checker", () => {
  it("exact check passes when a fact matches expected value", () => {
    const check: Check = {
      id: "color.background",
      type: "exact",
      dimension: "color_direction",
      rule: "bg",
      property: "background-color",
      expected: "#0F0F10",
    };
    const report = runChecker({ task: "t", checks: [check] }, facts);
    expect(report.failed).toBe(0);
  });

  it("exact check fails when no fact carries the expected value", () => {
    const check: Check = {
      id: "color.background",
      type: "exact",
      dimension: "color_direction",
      rule: "bg",
      property: "background-color",
      expected: "#112233",
    };
    const report = runChecker({ task: "t", checks: [check] }, facts);
    expect(report.failed).toBe(1);
    expect(report.results[0].actual).toBe("#0F0F10");
  });

  it("exact check for text color uses the color property", () => {
    const check: Check = {
      id: "color.text_primary",
      type: "exact",
      dimension: "color_direction",
      rule: "text",
      property: "color",
      expected: "#FAFAFA",
    };
    const report = runChecker({ task: "t", checks: [check] }, facts);
    expect(report.failed).toBe(0);
  });

  it("range check passes for 80px within 48..96", () => {
    const check: Check = {
      id: "layout.hero_section_padding",
      type: "range",
      dimension: "layout_spacing",
      rule: "padding",
      property: "padding-block",
      min: 48,
      max: 96,
      unit: "px",
    };
    const report = runChecker({ task: "t", checks: [check] }, facts);
    expect(report.failed).toBe(0);
  });

  it("range check fails for 16px outside 48..96", () => {
    const facts16: StyleFact[] = [
      { ...facts[1], resolved: { "padding-block": "16px" } },
    ];
    const check: Check = {
      id: "layout.hero_section_padding",
      type: "range",
      dimension: "layout_spacing",
      rule: "padding",
      property: "padding-block",
      min: 48,
      max: 96,
      unit: "px",
    };
    const report = runChecker({ task: "t", checks: [check] }, facts16);
    expect(report.failed).toBe(1);
  });

  it("pattern absent fails when emoji is present in text", () => {
    const check: Check = {
      id: "detail.no_emoji",
      type: "pattern",
      dimension: "detail_elements",
      rule: "no emoji",
      mode: "absent",
      target: "emoji",
    };
    const report = runChecker({ task: "t", checks: [check] }, facts);
    expect(report.failed).toBe(1);
  });

  it("pattern absent passes when no emoji in text", () => {
    const clean = facts.map((f) => ({ ...f, text: f.text?.replace(/🚀/g, "") }));
    const check: Check = {
      id: "detail.no_emoji",
      type: "pattern",
      dimension: "detail_elements",
      rule: "no emoji",
      mode: "absent",
      target: "emoji",
    };
    const report = runChecker({ task: "t", checks: [check] }, clean);
    expect(report.failed).toBe(0);
  });

  it("pattern present passes when target text appears", () => {
    const check: Check = {
      id: "copy.has_cta",
      type: "pattern",
      dimension: "detail_elements",
      rule: "must contain Ship",
      mode: "present",
      target: "Ship",
    };
    const report = runChecker({ task: "t", checks: [check] }, facts);
    expect(report.failed).toBe(0);
  });

  it("subjective checks are reported as advisory passes", () => {
    const check: Check = {
      id: "atmosphere.minimal",
      type: "subjective",
      dimension: "overall_style",
      rule: "feels minimal",
      criterion: "calm",
    };
    const report = runChecker({ task: "t", checks: [check] }, facts);
    expect(report.failed).toBe(0);
    expect(report.results[0].message).toMatch(/advisory/i);
  });

  it("routes each exact check to its own property, not the id prefix", () => {
    const multiProp: StyleFact[] = [
      {
        element_id: "el#0",
        tag: "div",
        classes: [],
        resolved: { "background-color": "#111111", color: "#EEEEEE" },
        text: "",
      },
    ];
    const checks: Check[] = [
      {
        id: "arbitrary.one",
        type: "exact",
        dimension: "color_direction",
        rule: "bg",
        property: "background-color",
        expected: "#111111",
      },
      {
        id: "arbitrary.two",
        type: "exact",
        dimension: "color_direction",
        rule: "fg",
        property: "color",
        expected: "#EEEEEE",
      },
    ];
    const report = runChecker({ task: "t", checks }, multiProp);
    expect(report.passed).toBe(2);
    expect(report.failed).toBe(0);
  });

  it("aggregates totals correctly across multiple checks", () => {
    const checks: Check[] = [
      {
        id: "color.background",
        type: "exact",
        dimension: "color_direction",
        rule: "bg",
        property: "background-color",
        expected: "#0F0F10",
      },
      {
        id: "layout.hero_section_padding",
        type: "range",
        dimension: "layout_spacing",
        rule: "padding",
        property: "padding-block",
        min: 1000,
        max: 2000,
        unit: "px",
      },
    ];
    const report = runChecker({ task: "t", checks }, facts);
    expect(report.total).toBe(2);
    expect(report.passed).toBe(1);
    expect(report.failed).toBe(1);
  });
});
