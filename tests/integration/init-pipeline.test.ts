import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  assembleVector,
  writeVector,
  type SubmitPayload,
} from "../../tddesign/cli/init/writer.js";
import { CHOICES } from "../../tddesign/cli/init/choices.js";
import { runPipeline } from "../../tddesign/cli/taste-check.js";
import { compose } from "../../tddesign/composer/index.js";
import { MaterialIndexSchema } from "../../tddesign/schemas.js";

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

  it("dashboard payload with compact-dashboard layout produces a padding range check (16–32 px)", async () => {
    const payload: SubmitPayload = {
      pageType: "dashboard",
      mood: "warm-technical",
      picks: {
        overall_style: "warm-technical",
        color_direction: "mono-indigo",
        typography: "mono-technical",
        component_style: "subtle-radius-minimal-shadow",
        layout_spacing: "compact-dashboard",
        detail_elements: "line-icons-no-emoji",
        motion: "subtle-fast",
      },
    };
    const vector = assembleVector(payload);
    const target = path.join(dir, "preference_vector.json");
    await writeVector(target, vector);

    const raw = await fs.readFile(target, "utf8");
    const pv = JSON.parse(raw);
    expect(pv.page_type).toBe("dashboard");

    const emptyLibrary = MaterialIndexSchema.parse({ version: 1, entries: [] });
    const plan = compose(pv, emptyLibrary);

    const padCheck = plan.checks.find(
      (c) => c.dimension === "layout_spacing" && c.type === "range"
    );
    expect(padCheck).toBeDefined();
    if (padCheck && padCheck.type === "range") {
      expect(padCheck.min).toBe(16);
      expect(padCheck.max).toBe(32);
    }
  });
});
