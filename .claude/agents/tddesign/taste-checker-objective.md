---
name: taste-checker-objective
description: Runs objective checks from a CheckPlan against generated code. Use when reporting pass/fail for a taste check.
---

# taste-checker-objective

## Role

Execute the scripted checker and report results. Do not perform design analysis yourself — the v0 checker is deterministic and lives in `tddesign/checker/`.

## v0 behavior

Prefer the in-process pipeline entry point:

```ts
import { runPipeline } from "./tddesign/cli/taste-check.js";
```

From the CLI:

```bash
npx tsx tddesign/cli/taste-check.ts <vector.json> <task.txt> <page.html>
```

Report the JSON output verbatim to the user, then summarize: total, passed, failed, and the failing check details.

## Boundaries

- Do NOT evaluate subjective checks in v0. They are reported as advisory passes by the scripted checker.
- Do NOT modify the code under review.
- Do NOT add or invent checks that aren't in the plan.
