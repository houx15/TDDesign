import type { PreferenceVector, Report } from "../schemas.js";
import { MaterialIndexSchema } from "../schemas.js";
import { compose } from "../composer/index.js";
import { planChecks } from "../planner/index.js";
import { extractFacts } from "../parser/facts.js";
import { runChecker } from "../checker/index.js";

export interface PipelineInput {
  vector: PreferenceVector;
  task: string;
  html: string;
}

export interface PipelineOutput {
  designMd: string;
  report: Report;
}

const EMPTY_LIBRARY = MaterialIndexSchema.parse({ version: 1, entries: [] });

export async function runPipeline(input: PipelineInput): Promise<PipelineOutput> {
  const { designMd, checks } = compose(input.vector, EMPTY_LIBRARY);
  const plan = planChecks({ checks, task: input.task });
  const facts = extractFacts(input.html);
  const report = runChecker(plan, facts);
  return { designMd, report };
}

async function main(): Promise<void> {
  const [vectorPath, taskPath, htmlPath] = process.argv.slice(2);
  if (!vectorPath || !taskPath || !htmlPath) {
    console.error(
      "Usage: tsx tddesign/cli/taste-check.ts <vector.json> <task.txt> <page.html>"
    );
    process.exit(2);
  }
  const { readFileSync } = await import("node:fs");
  const vector = JSON.parse(readFileSync(vectorPath, "utf8"));
  const task = readFileSync(taskPath, "utf8").trim();
  const html = readFileSync(htmlPath, "utf8");
  const { report } = await runPipeline({ vector, task, html });
  console.log(JSON.stringify(report, null, 2));
  process.exit(report.failed === 0 ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
