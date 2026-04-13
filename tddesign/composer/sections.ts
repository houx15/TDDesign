import type { Check } from "../schemas.js";

export const STITCH_SECTIONS = [
  "Visual Theme & Atmosphere",
  "Color Palette & Roles",
  "Typography Rules",
  "Component Stylings",
  "Layout Principles",
  "Depth & Elevation",
  "Do's and Don'ts",
  "Responsive Behavior",
  "Agent Prompt Guide",
] as const;
export type StitchSection = (typeof STITCH_SECTIONS)[number];

export interface SectionInput {
  title: StitchSection;
  body: string;
  checks: Check[];
}

export function buildSection(input: SectionInput): string {
  const lines: string[] = [];
  lines.push(`## ${input.title}`);
  lines.push("");
  lines.push(input.body.trim());
  lines.push("");
  if (input.checks.length > 0) {
    lines.push("### Checks");
    lines.push("");
    for (const c of input.checks) {
      lines.push(`- [${c.type}] ${c.rule}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}
