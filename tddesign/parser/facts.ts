import type { StyleFact } from "../schemas.js";
import { flatten } from "./html.js";
import { resolveTailwindClass } from "./tailwind.js";

function expandShorthand(key: string, value: string): Record<string, string> {
  const out: Record<string, string> = { [key]: value };
  if (key === "background") out["background-color"] = value;
  if (key === "padding") {
    const parts = value.split(/\s+/).filter(Boolean);
    const y = parts[0];
    const x = parts.length > 1 ? parts[1] : parts[0];
    out["padding-block"] = y;
    out["padding-inline"] = x;
    out["padding-top"] = y;
    out["padding-bottom"] = y;
    out["padding-left"] = x;
    out["padding-right"] = x;
  }
  return out;
}

export function parseInlineStyle(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  const clauses = raw.split(";");
  for (const clause of clauses) {
    const trimmed = clause.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim().toLowerCase();
    const value = trimmed.slice(idx + 1).trim();
    if (!key) continue;
    const expanded = expandShorthand(key, value);
    for (const [k, v] of Object.entries(expanded)) out[k] = v;
  }
  return out;
}

export function extractFacts(html: string): StyleFact[] {
  const elements = flatten(html);

  return elements.map((el, i) => {
    const resolved: Record<string, string> = {};

    // 1. Tailwind class resolution (lowest precedence)
    for (const cls of el.classes) {
      const r = resolveTailwindClass(cls);
      if (r) resolved[r.property] = r.value;
    }

    // 2. Inline style attribute (highest precedence)
    if (el.style) {
      const inline = parseInlineStyle(el.style);
      for (const [k, v] of Object.entries(inline)) resolved[k] = v;
    }

    return {
      element_id: `${el.tag}#${i}`,
      tag: el.tag,
      classes: el.classes,
      resolved,
      text: el.text,
    };
  });
}
