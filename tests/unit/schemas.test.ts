import { describe, it, expect } from "vitest";
import {
  PreferenceVectorSchema,
  CheckSchema,
  CheckPlanSchema,
  ReportSchema,
} from "../../tddesign/schemas.js";

describe("schemas", () => {
  it("accepts a minimal preference vector", () => {
    const vector = {
      profile_name: "test",
      scope: "project",
      selections: {
        overall_style: { choice: "minimal", source_refs: ["linear"], notes: "" },
        color_direction: { choice: "mono-blue", source_refs: ["linear"], notes: "" },
        typography: { choice: "geometric-sans", source_refs: ["vercel"], notes: "" },
        component_style: { choice: "subtle", source_refs: ["linear"], notes: "" },
        layout_spacing: { choice: "spacious", source_refs: ["stripe"], notes: "" },
        detail_elements: { choice: "line-icons", source_refs: ["linear"], notes: "" },
        motion: { choice: "subtle-fast", source_refs: ["vercel"], notes: "" },
      },
      created_at: "2026-04-13T00:00:00Z",
      updated_at: "2026-04-13T00:00:00Z",
    };
    expect(() => PreferenceVectorSchema.parse(vector)).not.toThrow();
  });

  it("rejects a vector missing a dimension", () => {
    expect(() => PreferenceVectorSchema.parse({ profile_name: "x" })).toThrow();
  });

  it("accepts an exact-type check", () => {
    const check = {
      id: "color.background",
      type: "exact",
      dimension: "color_direction",
      rule: "Background color is #0F0F10",
      property: "background-color",
      expected: "#0F0F10",
    };
    expect(() => CheckSchema.parse(check)).not.toThrow();
  });

  it("rejects an exact-type check missing property", () => {
    const check = {
      id: "color.background",
      type: "exact",
      dimension: "color_direction",
      rule: "Background color is #0F0F10",
      expected: "#0F0F10",
    };
    expect(() => CheckSchema.parse(check)).toThrow();
  });

  it("accepts a range-type check", () => {
    const check = {
      id: "spacing.padding",
      type: "range",
      dimension: "layout_spacing",
      rule: "Section padding between 24 and 48 px",
      property: "padding-block",
      min: 24,
      max: 48,
      unit: "px",
    };
    expect(() => CheckSchema.parse(check)).not.toThrow();
  });

  it("rejects a range-type check missing property", () => {
    const check = {
      id: "spacing.padding",
      type: "range",
      dimension: "layout_spacing",
      rule: "Section padding between 24 and 48 px",
      min: 24,
      max: 48,
      unit: "px",
    };
    expect(() => CheckSchema.parse(check)).toThrow();
  });

  it("rejects an exact-type check with an empty property", () => {
    const check = {
      id: "color.background",
      type: "exact",
      dimension: "color_direction",
      rule: "Background color is #0F0F10",
      property: "",
      expected: "#0F0F10",
    };
    expect(() => CheckSchema.parse(check)).toThrow();
  });

  it("accepts a pattern-type check", () => {
    const check = {
      id: "detail.no_emoji",
      type: "pattern",
      dimension: "detail_elements",
      rule: "No emoji characters",
      mode: "absent",
      target: "emoji",
    };
    expect(() => CheckSchema.parse(check)).not.toThrow();
  });

  it("accepts a subjective-type check", () => {
    const check = {
      id: "atmosphere.minimal",
      type: "subjective",
      dimension: "overall_style",
      rule: "Feels minimal",
      criterion: "calm technical precision",
    };
    expect(() => CheckSchema.parse(check)).not.toThrow();
  });

  it("accepts a check plan and a report", () => {
    const plan = { task: "hero", checks: [] };
    const report = { total: 0, passed: 0, failed: 0, results: [] };
    expect(() => CheckPlanSchema.parse(plan)).not.toThrow();
    expect(() => ReportSchema.parse(report)).not.toThrow();
  });
});

describe("PreferenceVectorSchema page_type", () => {
  it("accepts a preference vector without page_type and defaults to 'landing'", () => {
    const raw = {
      profile_name: "local",
      scope: "project",
      selections: {
        overall_style:   { choice: "minimal-precise",   source_refs: ["linear"], notes: "" },
        color_direction: { choice: "mono-indigo",       source_refs: ["linear"], notes: "" },
        typography:      { choice: "geometric-sans",    source_refs: ["vercel"], notes: "" },
        component_style: { choice: "subtle-radius-minimal-shadow", source_refs: ["linear"], notes: "" },
        layout_spacing:  { choice: "dense-split",      source_refs: ["vercel"], notes: "" },
        detail_elements: { choice: "line-icons-no-emoji", source_refs: ["linear"], notes: "" },
        motion:          { choice: "subtle-fast",       source_refs: ["vercel"], notes: "" },
      },
      created_at: "2026-04-15T00:00:00.000Z",
      updated_at: "2026-04-15T00:00:00.000Z",
    };
    const parsed = PreferenceVectorSchema.parse(raw);
    expect(parsed.page_type).toBe("landing");
  });

  it("accepts page_type: 'dashboard'", () => {
    const raw = {
      profile_name: "local",
      scope: "project",
      page_type: "dashboard",
      selections: {
        overall_style:   { choice: "minimal-precise",   source_refs: ["linear"], notes: "" },
        color_direction: { choice: "mono-indigo",       source_refs: ["linear"], notes: "" },
        typography:      { choice: "geometric-sans",    source_refs: ["vercel"], notes: "" },
        component_style: { choice: "subtle-radius-minimal-shadow", source_refs: ["linear"], notes: "" },
        layout_spacing:  { choice: "dense-split",      source_refs: ["vercel"], notes: "" },
        detail_elements: { choice: "line-icons-no-emoji", source_refs: ["linear"], notes: "" },
        motion:          { choice: "subtle-fast",       source_refs: ["vercel"], notes: "" },
      },
      created_at: "2026-04-15T00:00:00.000Z",
      updated_at: "2026-04-15T00:00:00.000Z",
    };
    const parsed = PreferenceVectorSchema.parse(raw);
    expect(parsed.page_type).toBe("dashboard");
  });
});
