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
  { id: "warm-sunset",   label: "Warm Sunset",   moodTags: ["warm-technical", "editorial", "playful"], sourceRefs: ["custom"], tokens: { background: "#FFF8E7", text: "#2D1B00", accent: "#FF6B1A" }, notesTemplate: "Background #FFF8E7, primary text #2D1B00, accent #FF6B1A", render: "color" },
  { id: "ocean-mist",    label: "Ocean Mist",    moodTags: ["editorial", "warm-technical"],            sourceRefs: ["custom"], tokens: { background: "#E8F4F8", text: "#0A2740", accent: "#00A3B4" }, notesTemplate: "Background #E8F4F8, primary text #0A2740, accent #00A3B4", render: "color" },
  { id: "rose-graphite", label: "Rose on Graphite", moodTags: ["vivid-modern", "minimal", "playful"], sourceRefs: ["custom"], tokens: { background: "#1F1D1D", text: "#F5EBEB", accent: "#E85D75" }, notesTemplate: "Background #1F1D1D, primary text #F5EBEB, accent #E85D75", render: "color" },
  { id: "emerald-ivory", label: "Emerald on Ivory", moodTags: ["editorial", "minimal"],                sourceRefs: ["custom"], tokens: { background: "#FDFCF3", text: "#0F2E1B", accent: "#0A7B3E" }, notesTemplate: "Background #FDFCF3, primary text #0F2E1B, accent #0A7B3E", render: "color" },
  { id: "custom", label: "Custom colors…", moodTags: ["minimal","editorial","playful","brutalist","warm-technical","vivid-modern"], sourceRefs: ["custom"], tokens: { background: "#000000", text: "#FFFFFF", accent: "#888888" }, notesTemplate: "Background #000000, primary text #FFFFFF, accent #888888", render: "color" },
];

const TYPOGRAPHY_OPTIONS: ChoiceOption[] = [
  { id: "geometric-sans",   label: "Geometric Sans",   moodTags: ["minimal", "warm-technical"],   sourceRefs: ["vercel"], tokens: { fontFamily:"Inter, system-ui, sans-serif" },           notesTemplate: "Inter geometric sans",         render: "type" },
  { id: "humanist-sans",    label: "Humanist Sans",    moodTags: ["warm-technical", "editorial"], sourceRefs: ["stripe"], tokens: { fontFamily:"'Source Sans 3', system-ui, sans-serif" }, notesTemplate: "Source Sans humanist",         render: "type" },
  { id: "editorial-serif",  label: "Editorial Serif",  moodTags: ["editorial"],                   sourceRefs: ["stripe"], tokens: { fontFamily:"Georgia, 'Times New Roman', serif" },       notesTemplate: "Georgia serif editorial",      render: "type" },
  { id: "mono-technical",   label: "Mono Technical",   moodTags: ["brutalist", "warm-technical"], sourceRefs: ["linear"], tokens: { fontFamily:"'JetBrains Mono', ui-monospace, monospace" }, notesTemplate: "JetBrains Mono monospace",   render: "type" },
];

const COMPONENT_OPTIONS: ChoiceOption[] = [
  { id: "subtle-radius-minimal-shadow", label: "Subtle Radius, Minimal Shadow", moodTags: ["minimal", "warm-technical"], sourceRefs: ["linear"], tokens: { radius: 6, shadow: "0 1px 2px rgba(0,0,0,0.06)" },             notesTemplate: "subtle radius minimal shadow", render: "component" },
  { id: "sharp-flat",                   label: "Sharp Flat",                    moodTags: ["brutalist", "editorial"],    sourceRefs: ["linear"], tokens: { radius: 0, shadow: "none" },                                    notesTemplate: "sharp flat no shadow",          render: "component" },
  { id: "soft-pillowy",                 label: "Soft Pillowy",                  moodTags: ["playful", "vivid-modern"],   sourceRefs: ["vercel"], tokens: { radius: 16, shadow: "0 8px 24px rgba(0,0,0,0.12)" },            notesTemplate: "soft pillowy generous shadow",  render: "component" },
  { id: "bordered-flat",                label: "Bordered Flat",                 moodTags: ["editorial", "minimal"],      sourceRefs: ["stripe"], tokens: { radius: 4, shadow: "none", border: "1px solid currentColor" },  notesTemplate: "bordered flat hairline",        render: "component" },
];

const LAYOUT_OPTIONS: ChoiceOption[] = [
  { id: "spacious-hero",     label: "Spacious Hero",     moodTags: ["minimal", "editorial"],        sourceRefs: ["stripe"], tokens: { paddingMin: 48, paddingMax: 96 },  notesTemplate: "Section padding between 48 and 96 px",   render: "layout" },
  { id: "compact-dense",     label: "Compact Dense",     moodTags: ["warm-technical", "brutalist"], sourceRefs: ["linear"], tokens: { paddingMin: 16, paddingMax: 32 },  notesTemplate: "Section padding between 16 and 32 px",   render: "layout" },
  { id: "medium-breath",     label: "Medium Breath",     moodTags: ["warm-technical", "playful"],   sourceRefs: ["vercel"], tokens: { paddingMin: 32, paddingMax: 64 },  notesTemplate: "Section padding between 32 and 64 px",   render: "layout" },
  { id: "editorial-margins", label: "Editorial Margins", moodTags: ["editorial"],                   sourceRefs: ["stripe"], tokens: { paddingMin: 64, paddingMax: 128 }, notesTemplate: "Section padding between 64 and 128 px",  render: "layout" },
];

const DETAIL_OPTIONS: ChoiceOption[] = [
  { id: "line-icons-no-emoji",    label: "Line Icons, No Emoji",    moodTags: ["minimal", "warm-technical", "editorial"], sourceRefs: ["linear"], tokens: { iconStyle: "line" },    notesTemplate: "No emoji characters anywhere",    render: "detail" },
  { id: "filled-icons-no-emoji",  label: "Filled Icons, No Emoji",  moodTags: ["brutalist", "vivid-modern"],              sourceRefs: ["vercel"], tokens: { iconStyle: "filled" },  notesTemplate: "No emoji characters anywhere",    render: "detail" },
  { id: "emoji-welcome",          label: "Emoji Welcome",           moodTags: ["playful"],                                sourceRefs: ["vercel"], tokens: { iconStyle: "emoji" },   notesTemplate: "Emoji allowed as accent elements", render: "detail" },
  { id: "duotone-icons-no-emoji", label: "Duotone Icons, No Emoji", moodTags: ["editorial", "warm-technical"],            sourceRefs: ["stripe"], tokens: { iconStyle: "duotone" }, notesTemplate: "No emoji characters anywhere",    render: "detail" },
];

const MOTION_OPTIONS: ChoiceOption[] = [
  { id: "subtle-fast",     label: "Subtle Fast",     moodTags: ["minimal", "warm-technical"], sourceRefs: ["vercel"], tokens: { motionDurationMs:150, motionEasing:"ease-out" },                         notesTemplate: "subtle fast motion",      render: "motion" },
  { id: "considered-slow", label: "Considered Slow", moodTags: ["editorial"],                 sourceRefs: ["stripe"], tokens: { motionDurationMs:400, motionEasing:"ease-in-out" },                      notesTemplate: "considered slow motion",  render: "motion" },
  { id: "snappy-springy",  label: "Snappy Springy",  moodTags: ["playful", "vivid-modern"],   sourceRefs: ["vercel"], tokens: { motionDurationMs:220, motionEasing:"cubic-bezier(0.34,1.56,0.64,1)" },   notesTemplate: "snappy springy motion",   render: "motion" },
  { id: "none-static",     label: "None, Static",    moodTags: ["brutalist"],                 sourceRefs: ["linear"], tokens: { motionDurationMs:0, motionEasing:"linear" },                             notesTemplate: "no motion static",        render: "motion" },
];

export const CHOICES: DimensionChoices[] = [
  { dimension: "overall_style",   question: "Pick a mood.",              options: OVERALL_STYLE_OPTIONS },
  { dimension: "color_direction", question: "Pick a palette.",           options: COLOR_OPTIONS },
  { dimension: "typography",      question: "Pick a typographic voice.", options: TYPOGRAPHY_OPTIONS },
  { dimension: "component_style", question: "Pick a component style.",   options: COMPONENT_OPTIONS },
  { dimension: "layout_spacing",  question: "Pick a spacing feel.",      options: LAYOUT_OPTIONS },
  { dimension: "detail_elements", question: "Pick detail treatment.",    options: DETAIL_OPTIONS },
  { dimension: "motion",          question: "Pick a motion feel.",       options: MOTION_OPTIONS },
];
