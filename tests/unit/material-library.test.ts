import { describe, it, expect } from "vitest";
import { buildIndex } from "../../tddesign/material-library/build.js";
import { MaterialIndexSchema, DIMENSIONS } from "../../tddesign/schemas.js";
import type { MaterialEntry } from "../../tddesign/schemas.js";

const fakeTagger = async (id: string): Promise<MaterialEntry> => ({
  id,
  source_path: `sources/${id}/README.md`,
  tags: Object.fromEntries(
    DIMENSIONS.map((d) => [d, { value: `${id}-${d}`, rationale: "fake" }])
  ) as MaterialEntry["tags"],
});

describe("material library build", () => {
  it("tags every source and the result matches the schema", async () => {
    const sources = ["linear", "vercel", "stripe", "apple", "notion"];
    const index = await buildIndex({
      sourceIds: sources,
      tagger: fakeTagger,
      confirm: async () => true,
      sampleSize: 2,
      rng: () => 0,
    });
    expect(() => MaterialIndexSchema.parse(index)).not.toThrow();
    expect(index.entries).toHaveLength(5);
    for (const entry of index.entries) {
      for (const dim of DIMENSIONS) {
        expect(entry.tags[dim].value).toBe(`${entry.id}-${dim}`);
      }
    }
  });

  it("throws when spot-check confirmation is rejected", async () => {
    await expect(
      buildIndex({
        sourceIds: ["linear", "vercel"],
        tagger: fakeTagger,
        confirm: async () => false,
        sampleSize: 2,
        rng: () => 0,
      })
    ).rejects.toThrow(/spot[- ]check/i);
  });

  it("samples exactly sampleSize entries for spot-check", async () => {
    let shownCount = 0;
    await buildIndex({
      sourceIds: ["a", "b", "c", "d", "e", "f", "g"],
      tagger: fakeTagger,
      confirm: async (sample) => {
        shownCount = sample.length;
        return true;
      },
      sampleSize: 3,
      rng: () => 0,
    });
    expect(shownCount).toBe(3);
  });

  it("clamps sampleSize to the number of available entries", async () => {
    let shownCount = 0;
    await buildIndex({
      sourceIds: ["a", "b"],
      tagger: fakeTagger,
      confirm: async (sample) => {
        shownCount = sample.length;
        return true;
      },
      sampleSize: 10,
      rng: () => 0,
    });
    expect(shownCount).toBe(2);
  });

  it("uses default sampleSize of 5 when not provided", async () => {
    let shownCount = 0;
    await buildIndex({
      sourceIds: ["a", "b", "c", "d", "e", "f", "g", "h"],
      tagger: fakeTagger,
      confirm: async (sample) => {
        shownCount = sample.length;
        return true;
      },
      rng: () => 0,
    });
    expect(shownCount).toBe(5);
  });
});
