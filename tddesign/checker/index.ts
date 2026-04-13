import type { CheckPlan, Report, StyleFact, CheckResult } from "../schemas.js";
import { runExact } from "./exact.js";
import { runRange } from "./range.js";
import { runPattern } from "./pattern.js";

export function runChecker(plan: CheckPlan, facts: StyleFact[]): Report {
  const results: CheckResult[] = plan.checks.map((c) => {
    switch (c.type) {
      case "exact":
        return runExact(c, facts);
      case "range":
        return runRange(c, facts);
      case "pattern":
        return runPattern(c, facts);
      case "subjective":
        return {
          check_id: c.id,
          passed: true,
          message: "advisory (subjective check not evaluated in v0)",
        };
    }
  });
  const passed = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
  };
}
