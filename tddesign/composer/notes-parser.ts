import type { Check, PreferenceVector } from "../schemas.js";
import { exactCheck, patternCheck, rangeCheck, subjectiveCheck } from "./checks.js";

interface ColorRole {
  id: string;
  rule: (hex: string) => string;
  property: string;
  // Role keyword regex. MUST have the /g flag so we can enumerate all
  // occurrences in a clause and pick the one nearest a given hex.
  keywords: RegExp;
}

const COLOR_ROLES: ColorRole[] = [
  {
    id: "color.background",
    rule: (hex) => `Background color is ${hex}`,
    property: "background-color",
    keywords: /\bbackground\b/gi,
  },
  {
    id: "color.text_primary",
    rule: (hex) => `Primary text color is ${hex}`,
    property: "color",
    // Tightened: bare "primary" (e.g. "primary button") is no longer a hit.
    keywords: /\b(primary\s+text|text\s+primary|body\s+text)\b/gi,
  },
  {
    id: "color.accent",
    rule: (hex) => `Accent color is ${hex}`,
    property: "background-color",
    keywords: /\baccent\b/gi,
  },
];

// Emit roles in this fixed order regardless of appearance order in notes.
const COLOR_EMIT_ORDER = [
  "color.background",
  "color.text_primary",
  "color.accent",
] as const;

// How many words AFTER a hex we still consider "adjacent" for the role keyword.
const ROLE_LOOKAHEAD_WORDS = 3;

function wordIndex(text: string, charIndex: number): number {
  // Count word boundaries up to charIndex.
  return text.slice(0, charIndex).split(/\s+/).filter(Boolean).length;
}

function parseColors(notes: string): Check[] {
  if (!notes.trim()) return [];
  // v0 parser: 6-digit hex only; shorthand deferred.
  const HEX_RE = /#[0-9A-Fa-f]{6}/g;
  const clauses = notes.split(/[,;]/);
  // Collected role -> { hex, clauseIdx } so we can enforce first-hex-per-role.
  const chosen = new Map<string, { hex: string; clauseIdx: number }>();

  clauses.forEach((clause, clauseIdx) => {
    const hexes = [...clause.matchAll(HEX_RE)];
    if (hexes.length === 0) return;
    // Collect all role keyword hits in this clause with their word positions.
    interface Hit {
      roleId: string;
      word: number;
    }
    const hits: Hit[] = [];
    for (const role of COLOR_ROLES) {
      // Reset lastIndex since the regex is /g and reused.
      role.keywords.lastIndex = 0;
      let km: RegExpExecArray | null;
      while ((km = role.keywords.exec(clause)) !== null) {
        hits.push({ roleId: role.id, word: wordIndex(clause, km.index) });
      }
    }
    if (hits.length === 0) return;

    for (const hex of hexes) {
      const hexWord = wordIndex(clause, hex.index!);
      // Nearest keyword: prefer one that comes BEFORE the hex (any distance),
      // otherwise allow one AFTER the hex within ROLE_LOOKAHEAD_WORDS words.
      let best: Hit | null = null;
      let bestDist = Number.POSITIVE_INFINITY;
      for (const h of hits) {
        const before = h.word <= hexWord;
        const dist = Math.abs(hexWord - h.word);
        if (!before && dist > ROLE_LOOKAHEAD_WORDS) continue;
        if (dist < bestDist) {
          best = h;
          bestDist = dist;
        }
      }
      if (!best) continue;
      if (chosen.has(best.roleId)) continue; // first-hex-per-role wins
      chosen.set(best.roleId, { hex: hex[0], clauseIdx });
    }
  });

  const checks: Check[] = [];
  for (const roleId of COLOR_EMIT_ORDER) {
    const picked = chosen.get(roleId);
    if (!picked) continue;
    const role = COLOR_ROLES.find((r) => r.id === roleId)!;
    checks.push(
      exactCheck({
        id: role.id,
        dimension: "color_direction",
        rule: role.rule(picked.hex),
        property: role.property,
        expected: picked.hex,
      })
    );
  }
  return checks;
}

function parseLayoutRanges(notes: string): Check[] {
  if (!notes.trim()) return [];
  // Clause-local: only consider ranges found in a clause that itself contains
  // the padding keyword. First matching clause wins.
  const clauses = notes.split(/[,;]/);
  let m: RegExpMatchArray | null = null;
  for (const clause of clauses) {
    if (!/\bpadding\b/i.test(clause)) continue;
    const between = clause.match(/between\s+(\d+)\s+and\s+(\d+)\s*(px|rem|em)/i);
    const dash = clause.match(/(\d+)\s*-\s*(\d+)\s*(px|rem|em)/);
    m = between ?? dash;
    if (m) break;
  }
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

const ABSENT_TARGETS: Record<string, { id: string; rule: string }> = {
  emoji: {
    id: "detail.no_emoji",
    rule: "No emoji characters anywhere in the rendered page",
  },
};

function parseDetailElements(notes: string): Check[] {
  if (!notes.trim()) return [];
  const checks: Check[] = [];
  const re = /\bNo\s+([a-z][a-z_-]*)/gi;
  let m: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((m = re.exec(notes)) !== null) {
    const target = m[1].toLowerCase();
    const spec = ABSENT_TARGETS[target];
    if (!spec) continue;
    if (seen.has(spec.id)) continue;
    seen.add(spec.id);
    checks.push(
      patternCheck({
        id: spec.id,
        dimension: "detail_elements",
        rule: spec.rule,
        mode: "absent",
        target,
      })
    );
  }
  return checks;
}

function parseOverallStyle(choice: string, notes: string): Check[] {
  // Prefer `notes` as the adjective source. When notes are empty we fall back
  // to the `choice` slug with hyphens normalized to spaces, so slug renames
  // don't silently drop this check. The slug fallback is intentionally
  // documented here because it's load-bearing for the acceptance fixture.
  const source = notes.trim().length > 0 ? notes : choice.replace(/-/g, " ");
  const haystack = source.toLowerCase();
  const hasMinimal = /\bminimal\b/.test(haystack);
  const hasPrecise = /\bprecise\b/.test(haystack);
  const hasTechnical = /\btechnical\b/.test(haystack);
  if (!hasMinimal) return [];
  if (!hasPrecise && !hasTechnical) return [];
  return [
    subjectiveCheck({
      id: "atmosphere.minimal_precise",
      dimension: "overall_style",
      rule: "Overall atmosphere feels minimal and precise",
      criterion: choice,
    }),
  ];
}

export function parsePreferenceVector(pv: PreferenceVector): Check[] {
  const sel = pv.selections;
  const checks: Check[] = [];
  checks.push(...parseColors(sel.color_direction.notes));
  checks.push(...parseLayoutRanges(sel.layout_spacing.notes));
  checks.push(...parseDetailElements(sel.detail_elements.notes));
  checks.push(...parseOverallStyle(sel.overall_style.choice, sel.overall_style.notes));
  return checks;
}
