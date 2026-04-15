import type { StyleFact } from "../schemas.js";
import { flatten, extractStyleBlockText } from "./html.js";
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

export interface CssRule {
  selectors: string[];
  declarations: Record<string, string>;
}

const SELECTOR_RE = /^[a-zA-Z#.][\w-]*$/;

export function parseStyleBlock(css: string): CssRule[] {
  if (!css) return [];
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: CssRule[] = [];
  const ruleRe = /([^{}]+)\{([^{}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = ruleRe.exec(stripped)) !== null) {
    const selectorList = m[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => SELECTOR_RE.test(s));
    if (selectorList.length === 0) continue;
    const declarations = parseInlineStyle(m[2]);
    if (Object.keys(declarations).length === 0) continue;
    rules.push({ selectors: selectorList, declarations });
  }
  return rules;
}

function matchesSelector(
  el: { tag: string; classes: string[]; id?: string },
  sel: string,
): boolean {
  if (sel.startsWith(".")) return el.classes.includes(sel.slice(1));
  if (sel.startsWith("#")) return el.id === sel.slice(1);
  return el.tag === sel.toLowerCase();
}

export function extractFacts(html: string): StyleFact[] {
  const elements = flatten(html);
  const rules = parseStyleBlock(extractStyleBlockText(html));

  return elements.map((el, i) => {
    const resolved: Record<string, string> = {};

    // 1. Tailwind class resolution (lowest precedence)
    for (const cls of el.classes) {
      const r = resolveTailwindClass(cls);
      if (r) resolved[r.property] = r.value;
    }

    // 2. Matched <style> block rules (middle precedence)
    for (const rule of rules) {
      if (rule.selectors.some((sel) => matchesSelector(el, sel))) {
        for (const [k, v] of Object.entries(rule.declarations)) resolved[k] = v;
      }
    }

    // 3. Inline style attribute (highest precedence)
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
