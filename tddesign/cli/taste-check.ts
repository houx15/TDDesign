import type { PreferenceVector, Report } from "../schemas.js";

export interface PipelineInput {
  vector: PreferenceVector;
  task: string;
  html: string;
}

export interface PipelineOutput {
  designMd: string;
  report: Report;
}

export async function runPipeline(_input: PipelineInput): Promise<PipelineOutput> {
  throw new Error("runPipeline not implemented");
}
