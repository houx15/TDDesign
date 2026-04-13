import type { Check, Dimension } from "../schemas.js";
import { CheckSchema } from "../schemas.js";

interface BaseArgs {
  id: string;
  dimension: Dimension;
  rule: string;
}

export function exactCheck(args: BaseArgs & { expected: string }): Check {
  return CheckSchema.parse({ type: "exact", ...args });
}

export function rangeCheck(
  args: BaseArgs & { min: number; max: number; unit: string }
): Check {
  return CheckSchema.parse({ type: "range", ...args });
}

export function patternCheck(
  args: BaseArgs & { mode: "present" | "absent"; target: string }
): Check {
  return CheckSchema.parse({ type: "pattern", ...args });
}

export function subjectiveCheck(args: BaseArgs & { criterion: string }): Check {
  return CheckSchema.parse({ type: "subjective", ...args });
}
