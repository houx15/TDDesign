import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { planChecks } from "../../tddesign/planner/index.js";
import { compose } from "../../tddesign/composer/index.js";
import {
  PreferenceVectorSchema,
  MaterialIndexSchema,
} from "../../tddesign/schemas.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vector = PreferenceVectorSchema.parse(
  JSON.parse(readFileSync(join(__dirname, "../fixtures/preference_vector.json"), "utf8"))
);
const library = MaterialIndexSchema.parse({ version: 1, entries: [] });
const { checks } = compose(vector, library);

describe("planner", () => {
  it("for a hero task, includes color, layout and detail checks", () => {
    const plan = planChecks({ checks, task: "build the landing page hero" });
    const ids = plan.checks.map((c) => c.id);
    expect(ids).toContain("color.background");
    expect(ids).toContain("layout.hero_section_padding");
    expect(ids).toContain("detail.no_emoji");
  });

  it("for a settings form task, excludes hero-specific layout checks", () => {
    const plan = planChecks({ checks, task: "build a settings form" });
    const ids = plan.checks.map((c) => c.id);
    expect(ids).not.toContain("layout.hero_section_padding");
    expect(ids).toContain("color.background");
  });

  it("for an unknown task, includes every check (safe default)", () => {
    const plan = planChecks({ checks, task: "asdfqwer" });
    expect(plan.checks).toHaveLength(checks.length);
  });

  it("preserves the task string in the plan", () => {
    const plan = planChecks({ checks, task: "hero" });
    expect(plan.task).toBe("hero");
  });
});
