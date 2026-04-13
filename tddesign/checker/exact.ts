import type { Check, CheckResult, StyleFact } from "../schemas.js";

export function runExact(
  check: Extract<Check, { type: "exact" }>,
  facts: StyleFact[]
): CheckResult {
  const property = inferProperty(check.id);
  const actuals = facts
    .map((f) => f.resolved[property])
    .filter((v): v is string => Boolean(v));
  const passed = actuals.some(
    (v) => v.toLowerCase() === check.expected.toLowerCase()
  );
  return {
    check_id: check.id,
    passed,
    expected: check.expected,
    actual: actuals[0],
    message: passed ? undefined : `No element has ${property}=${check.expected}`,
  };
}

function inferProperty(id: string): string {
  if (id.startsWith("color.background")) return "background-color";
  if (id.startsWith("color.text")) return "color";
  if (id.startsWith("color.accent")) return "background-color";
  return "background-color";
}
