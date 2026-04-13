import type { MaterialEntry, MaterialIndex } from "../schemas.js";
import { MaterialIndexSchema } from "../schemas.js";

export type Tagger = (id: string) => Promise<MaterialEntry>;
export type Confirmer = (sample: MaterialEntry[]) => Promise<boolean>;

export interface BuildOptions {
  sourceIds: string[];
  tagger: Tagger;
  confirm: Confirmer;
  sampleSize?: number;
  rng?: () => number;
}

export async function buildIndex(opts: BuildOptions): Promise<MaterialIndex> {
  const sampleSize = opts.sampleSize ?? 5;
  const rng = opts.rng ?? Math.random;

  const entries: MaterialEntry[] = [];
  for (const id of opts.sourceIds) {
    entries.push(await opts.tagger(id));
  }

  const sample = pickRandom(entries, Math.min(sampleSize, entries.length), rng);
  const approved = await opts.confirm(sample);
  if (!approved) {
    throw new Error("Material library spot-check rejected; aborting build.");
  }

  const index: MaterialIndex = { version: 1, entries };
  return MaterialIndexSchema.parse(index);
}

function pickRandom<T>(items: T[], n: number, rng: () => number): T[] {
  const copy = [...items];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
