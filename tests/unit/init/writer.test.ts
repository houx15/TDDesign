import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { assembleVector, writeVector, type SubmitPayload } from "../../../tddesign/cli/init/writer.js";
import { CHOICES } from "../../../tddesign/cli/init/choices.js";
import { PreferenceVectorSchema } from "../../../tddesign/schemas.js";

function firstPicks() {
  return Object.fromEntries(
    CHOICES.map((d) => [d.dimension, d.options[0].id])
  ) as Record<string, string>;
}

describe("writer.assembleVector", () => {
  it("produces a schema-valid PreferenceVector from valid picks", () => {
    const v = assembleVector({ mood: "minimal", picks: firstPicks() as any });
    expect(() => PreferenceVectorSchema.parse(v)).not.toThrow();
    expect(v.profile_name).toBe("local");
    expect(v.scope).toBe("project");
    expect(v.selections.color_direction.choice).toBe(
      CHOICES.find((c) => c.dimension === "color_direction")!.options[0].id
    );
  });

  it("throws on unknown option id", () => {
    const bad = { ...firstPicks(), color_direction: "not-a-real-id" };
    expect(() =>
      assembleVector({ mood: "minimal", picks: bad as any })
    ).toThrow(/unknown option/i);
  });

  it("stamps created_at and updated_at with ISO strings", () => {
    const v = assembleVector({ mood: "minimal", picks: firstPicks() as any });
    expect(v.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(v.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("custom color_direction synthesizes notes from customTokens", () => {
    const picks = firstPicks();
    picks.color_direction = "custom";
    const v = assembleVector({
      mood: "minimal",
      picks: picks as any,
      customTokens: {
        color_direction: { background: "#112233", text: "#EEDDCC", accent: "#FF8800" },
      },
    });
    expect(v.selections.color_direction.choice).toBe("custom");
    expect(v.selections.color_direction.notes).toBe(
      "Background #112233, primary text #EEDDCC, accent #FF8800"
    );
    expect(v.selections.color_direction.source_refs).toEqual(["custom"]);
  });

  it("custom color_direction without customTokens falls back to option placeholder", () => {
    const picks = firstPicks();
    picks.color_direction = "custom";
    const v = assembleVector({ mood: "minimal", picks: picks as any });
    expect(v.selections.color_direction.notes).toContain("#000000");
  });

  it("custom color_direction rejects invalid hex", () => {
    const picks = firstPicks();
    picks.color_direction = "custom";
    expect(() =>
      assembleVector({
        mood: "minimal",
        picks: picks as any,
        customTokens: {
          color_direction: { background: "not-a-hex", text: "#FFFFFF", accent: "#000000" },
        },
      })
    ).toThrow(/invalid custom hex/i);
  });
});

describe("assembleVector page_type", () => {
  it("writes page_type: 'dashboard' when payload specifies it", () => {
    const payload: SubmitPayload = {
      pageType: "dashboard",
      mood: "minimal",
      picks: {
        overall_style: "minimal-precise",
        color_direction: "mono-indigo",
        typography: "geometric-sans",
        component_style: "subtle-radius-minimal-shadow",
        layout_spacing: "compact-dashboard",
        detail_elements: "line-icons-no-emoji",
        motion: "subtle-fast",
      },
    };
    const v = assembleVector(payload);
    expect(v.page_type).toBe("dashboard");
  });

  it("defaults to 'landing' when payload omits pageType", () => {
    const payload = {
      mood: "minimal",
      picks: {
        overall_style: "minimal-precise",
        color_direction: "mono-indigo",
        typography: "geometric-sans",
        component_style: "subtle-radius-minimal-shadow",
        layout_spacing: "airy-centered",
        detail_elements: "line-icons-no-emoji",
        motion: "subtle-fast",
      },
    } as SubmitPayload;
    const v = assembleVector(payload);
    expect(v.page_type).toBe("landing");
  });
});

describe("writer.writeVector", () => {
  let dir: string;
  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "taste-init-"));
  });
  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("writes JSON atomically and leaves no .tmp behind", async () => {
    const target = path.join(dir, "preference_vector.json");
    const v = assembleVector({ mood: "minimal", picks: firstPicks() as any });
    await writeVector(target, v);
    const raw = await fs.readFile(target, "utf8");
    expect(() => PreferenceVectorSchema.parse(JSON.parse(raw))).not.toThrow();
    const entries = await fs.readdir(dir);
    expect(entries.filter((e) => e.endsWith(".tmp"))).toEqual([]);
  });

  it("overwrites an existing file", async () => {
    const target = path.join(dir, "preference_vector.json");
    await fs.writeFile(target, "{}");
    const v = assembleVector({ mood: "minimal", picks: firstPicks() as any });
    await writeVector(target, v);
    const raw = await fs.readFile(target, "utf8");
    expect(JSON.parse(raw).profile_name).toBe("local");
  });
});
