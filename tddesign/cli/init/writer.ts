import { promises as fs } from "node:fs";
import { PreferenceVectorSchema, type PreferenceVector } from "../../schemas.js";
import { CHOICES, type Mood } from "./choices.js";

export interface SubmitPayload {
  pageType?: "landing" | "dashboard";
  mood: Mood;
  picks: {
    overall_style: string;
    color_direction: string;
    typography: string;
    component_style: string;
    layout_spacing: string;
    detail_elements: string;
    motion: string;
  };
  customTokens?: {
    color_direction?: { background: string; text: string; accent: string };
  };
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export function assembleVector(payload: SubmitPayload): PreferenceVector {
  const now = new Date().toISOString();
  const selections = {} as PreferenceVector["selections"];

  for (const dim of CHOICES) {
    const chosenId = payload.picks[dim.dimension];
    const opt = dim.options.find((o) => o.id === chosenId);
    if (!opt) {
      throw new Error(
        `unknown option '${chosenId}' for dimension '${dim.dimension}'`
      );
    }
    let sourceRefs = opt.sourceRefs;
    let notes = opt.notesTemplate;
    if (
      dim.dimension === "color_direction" &&
      chosenId === "custom" &&
      payload.customTokens?.color_direction
    ) {
      const t = payload.customTokens.color_direction;
      for (const v of [t.background, t.text, t.accent]) {
        if (!HEX_RE.test(v)) {
          throw new Error(`invalid custom hex: ${v}`);
        }
      }
      sourceRefs = ["custom"];
      notes = `Background ${t.background}, primary text ${t.text}, accent ${t.accent}`;
    }
    selections[dim.dimension] = {
      choice: opt.id,
      source_refs: sourceRefs,
      notes,
    };
  }

  const vector: PreferenceVector = {
    profile_name: "local",
    scope: "project",
    page_type: payload.pageType ?? "landing",
    selections,
    created_at: now,
    updated_at: now,
  };
  return PreferenceVectorSchema.parse(vector);
}

export async function writeVector(
  targetPath: string,
  vector: PreferenceVector
): Promise<void> {
  const tmp = `${targetPath}.tmp`;
  const body = `${JSON.stringify(vector, null, 2)}\n`;
  await fs.writeFile(tmp, body, "utf8");
  await fs.rename(tmp, targetPath);
}
