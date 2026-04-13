import { describe, it, expect } from "vitest";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { makeLlmTagger } from "../../tddesign/material-library/llm-tagger.js";
import { DIMENSIONS } from "../../tddesign/schemas.js";

function makeFakeSourcesDir(): string {
  const root = mkdtempSync(join(tmpdir(), "tddesign-llm-tagger-"));
  mkdirSync(join(root, "linear"));
  writeFileSync(join(root, "linear", "README.md"), "# Linear\nMinimal precise design system.\n");
  return root;
}

const validTagsJson = JSON.stringify({
  tags: Object.fromEntries(
    DIMENSIONS.map((d) => [d, { value: `linear-${d}`, rationale: "fake" }])
  ),
});

describe("llm tagger", () => {
  it("tags a source file by reading its README and parsing the LLM JSON", async () => {
    const dir = makeFakeSourcesDir();
    const client = { complete: async () => validTagsJson };
    const tagger = makeLlmTagger(dir, client);
    const entry = await tagger("linear");
    expect(entry.id).toBe("linear");
    expect(entry.source_path).toBe("sources/linear/README.md");
    for (const dim of DIMENSIONS) {
      expect(entry.tags[dim].value).toBe(`linear-${dim}`);
    }
  });

  it("extracts JSON even when the model wraps it in chatter", async () => {
    const dir = makeFakeSourcesDir();
    const client = {
      complete: async () => `Sure! Here you go:\n${validTagsJson}\nThanks.`,
    };
    const tagger = makeLlmTagger(dir, client);
    const entry = await tagger("linear");
    expect(entry.tags.overall_style.value).toBe("linear-overall_style");
  });

  it("throws when the model returns no JSON object", async () => {
    const dir = makeFakeSourcesDir();
    const client = { complete: async () => "no json here" };
    const tagger = makeLlmTagger(dir, client);
    await expect(tagger("linear")).rejects.toThrow(/JSON/);
  });

  it("throws when parsed tags fail schema validation", async () => {
    const dir = makeFakeSourcesDir();
    const client = {
      complete: async () => JSON.stringify({ tags: { overall_style: { value: "x" } } }),
    };
    const tagger = makeLlmTagger(dir, client);
    await expect(tagger("linear")).rejects.toThrow();
  });
});
