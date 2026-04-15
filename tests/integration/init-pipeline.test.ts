import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { assembleVector, writeVector } from "../../tddesign/cli/init/writer.js";
import { CHOICES } from "../../tddesign/cli/init/choices.js";
import { runPipeline } from "../../tddesign/cli/taste-check.js";

describe("init → pipeline integration", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "taste-init-int-"));
  });
  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("picked options produce a report with at least the color exact checks", async () => {
    const picks = Object.fromEntries(
      CHOICES.map((d) => [d.dimension, d.options[0].id])
    );
    const vector = assembleVector({ mood: "minimal", picks: picks as any });
    const target = path.join(dir, "preference_vector.json");
    await writeVector(target, vector);

    const raw = await fs.readFile(target, "utf8");
    const parsed = JSON.parse(raw);

    const html = await fs.readFile(
      path.resolve("tests/fixtures/good_page.html"),
      "utf8"
    );
    const result = await runPipeline({
      vector: parsed,
      task: "hero",
      html,
    });

    expect(result.report.total).toBeGreaterThan(0);
    const colorExacts = result.report.results.filter((r) =>
      r.check_id.startsWith("color.")
    );
    expect(colorExacts.length).toBeGreaterThanOrEqual(3);
  });
});
