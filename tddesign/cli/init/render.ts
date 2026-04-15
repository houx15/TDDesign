import { CHOICES } from "./choices.js";

export function buildIndexHtml(): string {
  const questions = CHOICES.map((d) => `<section>${d.question}</section>`).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><title>taste init</title></head><body>${questions}</body></html>`;
}
