import type { StyleFact } from "../schemas.js";
import { flatten } from "./html.js";
import { resolveTailwindClass } from "./tailwind.js";

export function extractFacts(html: string): StyleFact[] {
  const elements = flatten(html);
  return elements.map((el, i) => {
    const resolved: Record<string, string> = {};
    for (const cls of el.classes) {
      const r = resolveTailwindClass(cls);
      if (r) resolved[r.property] = r.value;
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
