import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { MaterialEntry } from "../schemas.js";
import { DIMENSIONS, MaterialEntrySchema } from "../schemas.js";

export interface LlmClient {
  complete(prompt: string): Promise<string>;
}

export function makeLlmTagger(sourcesDir: string, client: LlmClient) {
  return async (id: string): Promise<MaterialEntry> => {
    const sourcePath = join(sourcesDir, id, "README.md");
    const content = readFileSync(sourcePath, "utf8");
    const prompt = buildPrompt(content);
    const raw = await client.complete(prompt);
    const parsed = JSON.parse(extractJson(raw));
    const entry: MaterialEntry = {
      id,
      source_path: `sources/${id}/README.md`,
      tags: parsed.tags,
    };
    return MaterialEntrySchema.parse(entry);
  };
}

function buildPrompt(content: string): string {
  return [
    "You are tagging a DESIGN.md file along seven dimensions.",
    "Dimensions: " + DIMENSIONS.join(", "),
    "For each dimension, return: value (a short lowercase-hyphenated tag) and rationale (one sentence).",
    'Respond with JSON only, shape: {"tags": {"<dimension>": {"value": "...", "rationale": "..."}}}.',
    "",
    "DESIGN.md content:",
    "---",
    content,
    "---",
  ].join("\n");
}

function extractJson(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in LLM response");
  return raw.slice(start, end + 1);
}
