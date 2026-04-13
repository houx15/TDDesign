import { describe, it, expect } from "vitest";
import { resolveTailwindClass } from "../../tddesign/parser/tailwind.js";
import { extractFacts } from "../../tddesign/parser/facts.js";
import { runChecker } from "../../tddesign/checker/index.js";
import { compose } from "../../tddesign/composer/index.js";
import type { Check, PreferenceVector, StyleFact } from "../../tddesign/schemas.js";
import { MaterialIndexSchema } from "../../tddesign/schemas.js";

describe("tailwind side-key branches", () => {
  it("resolves pt-2 to padding-top", () => {
    expect(resolveTailwindClass("pt-2")).toEqual({
      property: "padding-top",
      value: "8px",
    });
  });

  it("resolves pb-2 to padding-bottom", () => {
    expect(resolveTailwindClass("pb-2")).toEqual({
      property: "padding-bottom",
      value: "8px",
    });
  });

  it("resolves pl-2 to padding-left", () => {
    expect(resolveTailwindClass("pl-2")).toEqual({
      property: "padding-left",
      value: "8px",
    });
  });

  it("resolves pr-2 to padding-right", () => {
    expect(resolveTailwindClass("pr-2")).toEqual({
      property: "padding-right",
      value: "8px",
    });
  });

  it("resolves p-2 (no side) to padding shorthand", () => {
    expect(resolveTailwindClass("p-2")).toEqual({
      property: "padding",
      value: "8px",
    });
  });

  it("returns null for unknown rounded variant", () => {
    expect(resolveTailwindClass("rounded-bogus")).toBeNull();
  });

  it("resolves rounded with no suffix to the DEFAULT radius", () => {
    const r = resolveTailwindClass("rounded");
    expect(r).not.toBeNull();
    expect(r!.property).toBe("border-radius");
  });
});

describe("html parser empty-text edge cases", () => {
  it("handles empty document without throwing", () => {
    expect(() => extractFacts("")).not.toThrow();
  });

  it("handles an element with no children (text is empty)", () => {
    const facts = extractFacts("<html><body><br></body></html>");
    const br = facts.find((f) => f.tag === "br");
    expect(br?.text).toBe("");
  });
});

describe("checker exact/range property routing", () => {
  it("exact check reads the property declared on the check", () => {
    const check: Check = {
      id: "color.accent",
      type: "exact",
      dimension: "color_direction",
      rule: "accent",
      property: "background-color",
      expected: "#5B6EE1",
    };
    const facts: StyleFact[] = [
      {
        element_id: "a#0",
        tag: "a",
        classes: [],
        resolved: { "background-color": "#5B6EE1" },
        text: "",
      },
    ];
    const r = runChecker({ task: "t", checks: [check] }, facts);
    expect(r.failed).toBe(0);
  });

  it("range check reads the property declared on the check", () => {
    const check: Check = {
      id: "component.border_radius",
      type: "range",
      dimension: "component_style",
      rule: "radius",
      property: "border-radius",
      min: 4,
      max: 12,
      unit: "px",
    };
    const facts: StyleFact[] = [
      {
        element_id: "btn#0",
        tag: "button",
        classes: [],
        resolved: { "border-radius": "8px" },
        text: "",
      },
    ];
    const r = runChecker({ task: "t", checks: [check] }, facts);
    expect(r.failed).toBe(0);
  });

});

describe("composer body-for branches with empty notes", () => {
  it("renders Color/Layout sections when notes are empty", () => {
    const vector: PreferenceVector = {
      profile_name: "blank-notes",
      scope: "project",
      selections: {
        overall_style: { choice: "minimal", source_refs: [], notes: "" },
        color_direction: { choice: "mono", source_refs: [], notes: "" },
        typography: { choice: "geometric", source_refs: [], notes: "" },
        component_style: { choice: "subtle", source_refs: [], notes: "" },
        layout_spacing: { choice: "spacious", source_refs: [], notes: "" },
        detail_elements: { choice: "icons", source_refs: [], notes: "" },
        motion: { choice: "fast", source_refs: [], notes: "" },
      },
      created_at: "2026-04-13T00:00:00Z",
      updated_at: "2026-04-13T00:00:00Z",
    };
    const lib = MaterialIndexSchema.parse({ version: 1, entries: [] });
    const { designMd } = compose(vector, lib);
    expect(designMd).toContain("## Color Palette & Roles");
    expect(designMd).toContain("## Layout Principles");
    expect(designMd).not.toContain("undefined");
  });
});
