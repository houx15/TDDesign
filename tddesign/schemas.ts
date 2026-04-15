import { z } from "zod";

export const DIMENSIONS = [
  "overall_style",
  "color_direction",
  "typography",
  "component_style",
  "layout_spacing",
  "detail_elements",
  "motion",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

const SelectionSchema = z.object({
  choice: z.string(),
  source_refs: z.array(z.string()),
  notes: z.string().default(""),
});

export const PreferenceVectorSchema = z.object({
  profile_name: z.string(),
  scope: z.enum(["global", "project"]),
  page_type: z.enum(["landing", "dashboard"]).default("landing"),
  selections: z.object({
    overall_style: SelectionSchema,
    color_direction: SelectionSchema,
    typography: SelectionSchema,
    component_style: SelectionSchema,
    layout_spacing: SelectionSchema,
    detail_elements: SelectionSchema,
    motion: SelectionSchema,
  }),
  created_at: z.string(),
  updated_at: z.string(),
});
export type PreferenceVector = z.infer<typeof PreferenceVectorSchema>;

const BaseCheckFields = {
  id: z.string(),
  dimension: z.enum(DIMENSIONS),
  rule: z.string(),
};

export const CheckSchema = z.discriminatedUnion("type", [
  z.object({
    ...BaseCheckFields,
    type: z.literal("exact"),
    property: z.string().min(1),
    expected: z.string(),
  }),
  z.object({
    ...BaseCheckFields,
    type: z.literal("range"),
    property: z.string().min(1),
    min: z.number(),
    max: z.number(),
    unit: z.string(),
  }),
  z.object({
    ...BaseCheckFields,
    type: z.literal("pattern"),
    mode: z.enum(["present", "absent"]),
    target: z.string(),
  }),
  z.object({
    ...BaseCheckFields,
    type: z.literal("subjective"),
    criterion: z.string(),
  }),
]);
export type Check = z.infer<typeof CheckSchema>;

export const CheckPlanSchema = z.object({
  task: z.string(),
  checks: z.array(CheckSchema),
});
export type CheckPlan = z.infer<typeof CheckPlanSchema>;

export const CheckResultSchema = z.object({
  check_id: z.string(),
  passed: z.boolean(),
  expected: z.string().optional(),
  actual: z.string().optional(),
  message: z.string().optional(),
});
export type CheckResult = z.infer<typeof CheckResultSchema>;

export const ReportSchema = z.object({
  total: z.number(),
  passed: z.number(),
  failed: z.number(),
  results: z.array(CheckResultSchema),
});
export type Report = z.infer<typeof ReportSchema>;

const DimensionTagSchema = z.object({
  value: z.string(),
  rationale: z.string(),
});

export const MaterialEntrySchema = z.object({
  id: z.string(),
  source_path: z.string(),
  tags: z.object({
    overall_style: DimensionTagSchema,
    color_direction: DimensionTagSchema,
    typography: DimensionTagSchema,
    component_style: DimensionTagSchema,
    layout_spacing: DimensionTagSchema,
    detail_elements: DimensionTagSchema,
    motion: DimensionTagSchema,
  }),
});
export type MaterialEntry = z.infer<typeof MaterialEntrySchema>;

export const MaterialIndexSchema = z.object({
  version: z.literal(1),
  entries: z.array(MaterialEntrySchema),
});
export type MaterialIndex = z.infer<typeof MaterialIndexSchema>;

export const StyleFactSchema = z.object({
  element_id: z.string(),
  tag: z.string(),
  classes: z.array(z.string()),
  resolved: z.record(z.string(), z.string()),
  text: z.string().optional(),
});
export type StyleFact = z.infer<typeof StyleFactSchema>;
