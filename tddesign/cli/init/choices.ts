import type { Dimension } from "../../schemas.js";
import { DIMENSIONS } from "../../schemas.js";

export const MOODS = [
  "minimal",
  "editorial",
  "playful",
  "brutalist",
  "warm-technical",
  "vivid-modern",
] as const;
export type Mood = (typeof MOODS)[number];

export type RenderKind =
  | "mood"
  | "color"
  | "type"
  | "component"
  | "layout"
  | "detail"
  | "motion";

export interface ChoiceOption {
  id: string;
  label: string;
  moodTags: Mood[];
  sourceRefs: string[];
  tokens: Record<string, string | number>;
  notesTemplate: string;
  render: RenderKind;
}

export interface DimensionChoices {
  dimension: Dimension;
  question: string;
  options: ChoiceOption[];
}

export const CHOICES: DimensionChoices[] = DIMENSIONS.map((d) => ({
  dimension: d,
  question: "",
  options: [],
}));
