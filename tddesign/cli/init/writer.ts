import { promises as fs } from "node:fs";
import { PreferenceVectorSchema, type PreferenceVector } from "../../schemas.js";
import { CHOICES, type Mood } from "./choices.js";

export interface SubmitPayload {
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
}

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
    selections[dim.dimension] = {
      choice: opt.id,
      source_refs: opt.sourceRefs,
      notes: opt.notesTemplate,
    };
  }

  const vector: PreferenceVector = {
    profile_name: "local",
    scope: "project",
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
