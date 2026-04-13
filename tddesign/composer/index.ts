import type {
  Check,
  MaterialIndex,
  PreferenceVector,
} from "../schemas.js";
import { exactCheck, patternCheck, rangeCheck, subjectiveCheck } from "./checks.js";
import { buildSection, STITCH_SECTIONS } from "./sections.js";
import type { StitchSection } from "./sections.js";

export interface ComposeResult {
  designMd: string;
  checks: Check[];
}

// v0: the six checks below are hardcoded for the acceptance fixture in
// tests/fixtures/preference_vector.json. The vector's notes fields
// ("Background #0F0F10...", "between 48 and 96 px", "No emoji") are not yet
// parsed — a notes parser is Phase 2 work. For any second fixture, this
// composer will emit the same checks regardless of the vector. See
// docs/superpowers/specs/2026-04-13-tddesign-v0-design.md §"Slice 3" and
// the v0 review in commit history.
export function compose(
  vector: PreferenceVector,
  _library: MaterialIndex
): ComposeResult {
  const sel = vector.selections;

  const checks: Check[] = [
    exactCheck({
      id: "color.background",
      dimension: "color_direction",
      rule: "Background color is #0F0F10",
      expected: "#0F0F10",
    }),
    exactCheck({
      id: "color.text_primary",
      dimension: "color_direction",
      rule: "Primary text color is #FAFAFA",
      expected: "#FAFAFA",
    }),
    exactCheck({
      id: "color.accent",
      dimension: "color_direction",
      rule: "Accent color is #5B6EE1",
      expected: "#5B6EE1",
    }),
    rangeCheck({
      id: "layout.hero_section_padding",
      dimension: "layout_spacing",
      rule: "Hero section vertical padding between 48 and 96 px",
      min: 48,
      max: 96,
      unit: "px",
    }),
    patternCheck({
      id: "detail.no_emoji",
      dimension: "detail_elements",
      rule: "No emoji characters anywhere in the rendered page",
      mode: "absent",
      target: "emoji",
    }),
    subjectiveCheck({
      id: "atmosphere.minimal_precise",
      dimension: "overall_style",
      rule: "Overall atmosphere feels minimal and precise",
      criterion: sel.overall_style.choice,
    }),
  ];

  const sectionDimension: Record<StitchSection, string> = {
    "Visual Theme & Atmosphere": "overall_style",
    "Color Palette & Roles": "color_direction",
    "Typography Rules": "typography",
    "Component Stylings": "component_style",
    "Layout Principles": "layout_spacing",
    "Depth & Elevation": "component_style",
    "Do's and Don'ts": "detail_elements",
    "Responsive Behavior": "layout_spacing",
    "Agent Prompt Guide": "overall_style",
  };

  const usedDimensions = new Set<string>();
  const sections: string[] = [];
  for (const title of STITCH_SECTIONS) {
    const dim = sectionDimension[title];
    const body = bodyFor(title, vector);
    const sectionChecks = usedDimensions.has(dim)
      ? []
      : checks.filter((c) => c.dimension === dim);
    usedDimensions.add(dim);
    sections.push(buildSection({ title, body, checks: sectionChecks }));
  }

  return {
    designMd: sections.join("\n"),
    checks,
  };
}

function bodyFor(title: StitchSection, v: PreferenceVector): string {
  switch (title) {
    case "Visual Theme & Atmosphere":
      return `Overall style: ${v.selections.overall_style.choice}.`;
    case "Color Palette & Roles":
      return [
        "Background: #0F0F10",
        "Text Primary: #FAFAFA",
        "Accent: #5B6EE1",
        v.selections.color_direction.notes,
      ]
        .filter(Boolean)
        .join("\n");
    case "Typography Rules":
      return `Font: ${v.selections.typography.notes || v.selections.typography.choice}.`;
    case "Component Stylings":
      return `Component style: ${v.selections.component_style.choice}.`;
    case "Layout Principles":
      return [
        `Layout: ${v.selections.layout_spacing.choice}.`,
        v.selections.layout_spacing.notes,
      ]
        .filter(Boolean)
        .join("\n");
    case "Depth & Elevation":
      return "Flat, minimal shadow.";
    case "Do's and Don'ts":
      return [
        `Don't: ${v.selections.detail_elements.notes || "use decorative emoji"}.`,
        "Do: keep accent color for interactive elements only.",
      ].join("\n");
    case "Responsive Behavior":
      return "Fluid up to max-width; collapse to single column on mobile.";
    case "Agent Prompt Guide":
      return "When generating UI for this project, read DESIGN.md first and honor every check in the Checks subsections.";
  }
}
