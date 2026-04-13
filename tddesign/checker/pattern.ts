import type { Check, CheckResult, StyleFact } from "../schemas.js";

const EMOJI_REGEX =
  /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{27BF}]/u;

export function runPattern(
  check: Extract<Check, { type: "pattern" }>,
  facts: StyleFact[]
): CheckResult {
  const present = detectPresence(check.target, facts);
  const passed = check.mode === "present" ? present : !present;
  return {
    check_id: check.id,
    passed,
    message: passed
      ? undefined
      : `Pattern ${check.mode}:${check.target} violated`,
  };
}

function detectPresence(target: string, facts: StyleFact[]): boolean {
  if (target === "emoji") {
    return facts.some((f) => f.text != null && EMOJI_REGEX.test(f.text));
  }
  return facts.some((f) => f.text != null && f.text.includes(target));
}
