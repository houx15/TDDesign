import type { Check, CheckResult, StyleFact } from "../schemas.js";

export function runRange(
  check: Extract<Check, { type: "range" }>,
  facts: StyleFact[]
): CheckResult {
  const property = inferProperty(check.id);
  const raw = facts
    .map((f) => f.resolved[property])
    .filter((v): v is string => Boolean(v));
  const values = raw.map((v) => parseFloat(v)).filter((n) => !isNaN(n));
  const inRange = values.some((n) => n >= check.min && n <= check.max);
  return {
    check_id: check.id,
    passed: inRange,
    expected: `${check.min}${check.unit}..${check.max}${check.unit}`,
    actual: raw[0],
    message: inRange
      ? undefined
      : `No ${property} value falls within [${check.min}, ${check.max}]${check.unit}`,
  };
}

function inferProperty(id: string): string {
  if (id.includes("padding")) return "padding-block";
  if (id.includes("radius")) return "border-radius";
  return "padding-block";
}
