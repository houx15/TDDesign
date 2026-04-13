import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runPipeline } from "../../tddesign/cli/taste-check.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixtures = (name: string) => join(__dirname, "../fixtures", name);

describe("end-to-end pipeline", () => {
  const vector = JSON.parse(readFileSync(fixtures("preference_vector.json"), "utf8"));
  const task = readFileSync(fixtures("task.txt"), "utf8").trim();
  const goodHtml = readFileSync(fixtures("good_page.html"), "utf8");
  const badHtml = readFileSync(fixtures("bad_page.html"), "utf8");

  it("passes all objective checks on the good page", async () => {
    const { report } = await runPipeline({ vector, task, html: goodHtml });
    expect(report.failed).toBe(0);
    expect(report.passed).toBeGreaterThan(0);
  });

  it("fails exactly the three expected checks on the bad page", async () => {
    const { report } = await runPipeline({ vector, task, html: badHtml });
    const failedIds = report.results.filter((r) => !r.passed).map((r) => r.check_id).sort();
    expect(failedIds).toEqual(
      ["color.background", "detail.no_emoji", "layout.hero_section_padding"].sort()
    );
  });

  it("emits a DESIGN.md containing all 9 Stitch sections", async () => {
    const { designMd } = await runPipeline({ vector, task, html: goodHtml });
    const required = [
      "Visual Theme & Atmosphere",
      "Color Palette & Roles",
      "Typography Rules",
      "Component Stylings",
      "Layout Principles",
      "Depth & Elevation",
      "Do's and Don'ts",
      "Responsive Behavior",
      "Agent Prompt Guide",
    ];
    for (const section of required) {
      expect(designMd).toContain(section);
    }
  });
});
