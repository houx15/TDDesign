import type { Dimension } from "../../schemas.js";

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

const OVERALL_STYLE_OPTIONS: ChoiceOption[] = [
  { id: "minimal-precise",   label: "Minimal Precise",   moodTags: ["minimal", "warm-technical"], sourceRefs: ["linear"], tokens: { mood: "minimal" },        notesTemplate: "minimal precise clean technical",   render: "mood" },
  { id: "editorial-serif",   label: "Editorial Serif",   moodTags: ["editorial"],                 sourceRefs: ["stripe"], tokens: { mood: "editorial" },       notesTemplate: "editorial refined considered",       render: "mood" },
  { id: "playful-rounded",   label: "Playful Rounded",   moodTags: ["playful"],                   sourceRefs: ["vercel"], tokens: { mood: "playful" },         notesTemplate: "playful friendly approachable",      render: "mood" },
  { id: "brutalist-raw",     label: "Brutalist Raw",     moodTags: ["brutalist"],                 sourceRefs: ["linear"], tokens: { mood: "brutalist" },       notesTemplate: "brutalist raw unapologetic",         render: "mood" },
  { id: "warm-technical",    label: "Warm Technical",    moodTags: ["warm-technical", "minimal"], sourceRefs: ["vercel"], tokens: { mood: "warm-technical" },  notesTemplate: "warm technical inviting precise",    render: "mood" },
  { id: "vivid-modern",      label: "Vivid Modern",      moodTags: ["vivid-modern"],              sourceRefs: ["stripe"], tokens: { mood: "vivid-modern" },    notesTemplate: "vivid modern confident",             render: "mood" },
];

const COLOR_OPTIONS: ChoiceOption[] = [
  { id: "mono-indigo",    label: "Mono + Indigo",    moodTags: ["minimal", "warm-technical"],  sourceRefs: ["linear"], tokens: { background: "#0F0F10", text: "#FAFAFA", accent: "#5B6EE1" }, notesTemplate: "Background #0F0F10, primary text #FAFAFA, accent #5B6EE1", render: "color" },
  { id: "paper-black",    label: "Paper + Black",    moodTags: ["editorial", "minimal"],       sourceRefs: ["stripe"], tokens: { background: "#FFFFFF", text: "#111111", accent: "#0057FF" }, notesTemplate: "Background #FFFFFF, primary text #111111, accent #0057FF", render: "color" },
  { id: "warm-cream",     label: "Warm Cream",       moodTags: ["warm-technical", "editorial"], sourceRefs: ["stripe"], tokens: { background: "#F7F3EC", text: "#1A1A1A", accent: "#C2410C" }, notesTemplate: "Background #F7F3EC, primary text #1A1A1A, accent #C2410C", render: "color" },
  { id: "deep-forest",    label: "Deep Forest",      moodTags: ["warm-technical"],              sourceRefs: ["linear"], tokens: { background: "#0B1F14", text: "#E8F0E8", accent: "#4ADE80" }, notesTemplate: "Background #0B1F14, primary text #E8F0E8, accent #4ADE80", render: "color" },
  { id: "neon-dark",      label: "Neon Dark",        moodTags: ["vivid-modern", "playful"],     sourceRefs: ["vercel"], tokens: { background: "#0A0A0A", text: "#F5F5F5", accent: "#F472B6" }, notesTemplate: "Background #0A0A0A, primary text #F5F5F5, accent #F472B6", render: "color" },
  { id: "concrete-gray",  label: "Concrete Gray",    moodTags: ["brutalist"],                   sourceRefs: ["linear"], tokens: { background: "#D4D4D4", text: "#0A0A0A", accent: "#DC2626" }, notesTemplate: "Background #D4D4D4, primary text #0A0A0A, accent #DC2626", render: "color" },
  { id: "cobalt-ivory",   label: "Cobalt + Ivory",   moodTags: ["editorial", "vivid-modern"],   sourceRefs: ["stripe"], tokens: { background: "#FDFCF8", text: "#0B1A3A", accent: "#1E3A8A" }, notesTemplate: "Background #FDFCF8, primary text #0B1A3A, accent #1E3A8A", render: "color" },
  { id: "violet-haze",    label: "Violet Haze",      moodTags: ["vivid-modern", "playful"],     sourceRefs: ["vercel"], tokens: { background: "#1B1033", text: "#F3E8FF", accent: "#A855F7" }, notesTemplate: "Background #1B1033, primary text #F3E8FF, accent #A855F7", render: "color" },
];

const STUB_TYPOGRAPHY: ChoiceOption = {
  id: "stub", label: "stub", moodTags: ["minimal"], sourceRefs: [], tokens: {}, notesTemplate: "", render: "type",
};
const STUB_COMPONENT: ChoiceOption = {
  id: "stub", label: "stub", moodTags: ["minimal"], sourceRefs: [], tokens: {}, notesTemplate: "", render: "component",
};
const STUB_LAYOUT: ChoiceOption = {
  id: "stub", label: "stub", moodTags: ["minimal"], sourceRefs: [], tokens: {}, notesTemplate: "", render: "layout",
};
const STUB_DETAIL: ChoiceOption = {
  id: "stub", label: "stub", moodTags: ["minimal"], sourceRefs: [], tokens: {}, notesTemplate: "", render: "detail",
};
const STUB_MOTION: ChoiceOption = {
  id: "stub", label: "stub", moodTags: ["minimal"], sourceRefs: [], tokens: {}, notesTemplate: "", render: "motion",
};

export const CHOICES: DimensionChoices[] = [
  { dimension: "overall_style",   question: "Pick a mood.",              options: OVERALL_STYLE_OPTIONS },
  { dimension: "color_direction", question: "Pick a palette.",           options: COLOR_OPTIONS },
  { dimension: "typography",      question: "Pick a typographic voice.", options: [STUB_TYPOGRAPHY] },
  { dimension: "component_style", question: "Pick a component style.",   options: [STUB_COMPONENT] },
  { dimension: "layout_spacing",  question: "Pick a spacing feel.",      options: [STUB_LAYOUT] },
  { dimension: "detail_elements", question: "Pick detail treatment.",    options: [STUB_DETAIL] },
  { dimension: "motion",          question: "Pick a motion feel.",       options: [STUB_MOTION] },
];
