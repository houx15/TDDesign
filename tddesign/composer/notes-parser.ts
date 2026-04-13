import type { Check, PreferenceVector } from "../schemas.js";
import { exactCheck, rangeCheck } from "./checks.js";

interface ColorRole {
  id: string;
  rule: (hex: string) => string;
  property: string;
  keywords: RegExp;
}

const COLOR_ROLES: ColorRole[] = [
  {
    id: "color.background",
    rule: (hex) => `Background color is ${hex}`,
    property: "background-color",
    keywords: /\bbackground\b/i,
  },
  {
    id: "color.text_primary",
    rule: (hex) => `Primary text color is ${hex}`,
    property: "color",
    keywords: /\b(primary\s+text|text\s+primary|primary|text)\b/i,
  },
  {
    id: "color.accent",
    rule: (hex) => `Accent color is ${hex}`,
    property: "background-color",
    keywords: /\baccent\b/i,
  },
];

function parseColors(notes: string): Check[] {
  if (!notes.trim()) return [];
  const checks: Check[] = [];
  // Match "<role words> #HEX" — split on commas/semicolons so each clause is scanned independently.
  const clauses = notes.split(/[,;]/);
  const seen = new Set<string>();
  for (const role of COLOR_ROLES) {
    for (const clause of clauses) {
      const hexMatch = clause.match(/#[0-9A-Fa-f]{6}/);
      if (!hexMatch) continue;
      if (!role.keywords.test(clause)) continue;
      if (seen.has(role.id)) continue;
      seen.add(role.id);
      checks.push(
        exactCheck({
          id: role.id,
          dimension: "color_direction",
          rule: role.rule(hexMatch[0]),
          property: role.property,
          expected: hexMatch[0],
        })
      );
      break;
    }
  }
  return checks;
}

function parseLayoutRanges(notes: string): Check[] {
  if (!notes.trim()) return [];
  if (!/\bpadding\b/i.test(notes)) return [];
  // "between N and M <unit>" or "N-M <unit>"
  const between = notes.match(/between\s+(\d+)\s+and\s+(\d+)\s*(px|rem|em)/i);
  const dash = notes.match(/(\d+)\s*-\s*(\d+)\s*(px|rem|em)/);
  const m = between ?? dash;
  if (!m) return [];
  const min = Number(m[1]);
  const max = Number(m[2]);
  const unit = m[3].toLowerCase();
  if (!(min < max)) return [];
  return [
    rangeCheck({
      id: "layout.hero_section_padding",
      dimension: "layout_spacing",
      rule: `Hero section vertical padding between ${min} and ${max} ${unit}`,
      property: "padding-block",
      min,
      max,
      unit,
    }),
  ];
}

export function parsePreferenceVector(pv: PreferenceVector): Check[] {
  const sel = pv.selections;
  const checks: Check[] = [];
  checks.push(...parseColors(sel.color_direction.notes));
  checks.push(...parseLayoutRanges(sel.layout_spacing.notes));
  return checks;
}
