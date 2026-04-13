import type { Check, CheckPlan, Dimension } from "../schemas.js";
import { CheckPlanSchema } from "../schemas.js";

interface TaskRule {
  keywords: RegExp;
  dimensions: Dimension[];
  excludeCheckIds?: string[];
}

const TASK_RULES: TaskRule[] = [
  {
    keywords: /\b(hero|landing|marketing)\b/i,
    dimensions: [
      "overall_style",
      "color_direction",
      "typography",
      "component_style",
      "layout_spacing",
      "detail_elements",
      "motion",
    ],
  },
  {
    keywords: /\b(settings|form|config)\b/i,
    dimensions: [
      "overall_style",
      "color_direction",
      "typography",
      "component_style",
      "detail_elements",
    ],
    excludeCheckIds: ["layout.hero_section_padding"],
  },
];

export interface PlanInput {
  checks: Check[];
  task: string;
}

export function planChecks(input: PlanInput): CheckPlan {
  const rule = TASK_RULES.find((r) => r.keywords.test(input.task));
  let selected: Check[];
  if (!rule) {
    selected = input.checks;
  } else {
    const dims = new Set(rule.dimensions);
    const exclude = new Set(rule.excludeCheckIds ?? []);
    selected = input.checks.filter(
      (c) => dims.has(c.dimension) && !exclude.has(c.id)
    );
  }
  return CheckPlanSchema.parse({ task: input.task, checks: selected });
}
