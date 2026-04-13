---
name: taste-check
description: Run the TDDesign objective checker against a page file.
---

# /taste check

Runs the full TDDesign v0 pipeline on a page and reports which checks pass and fail.

## Usage

Ask the user for three things if not already in context:
1. Path to `preference_vector.json` (default: `tests/fixtures/preference_vector.json`)
2. Task description (a short string, e.g. `"build the landing page hero"`)
3. Path to the HTML/page file to check

Then run:

```bash
npx tsx tddesign/cli/taste-check.ts <vector> <task-file> <page>
```

Parse the JSON report from stdout. Summarize in the reply:
- Total checks, passed, failed
- For each failed check: the `check_id`, `rule`, `expected`, `actual`, and `message`
- Exit status is nonzero when failures exist; mention this explicitly.

Do not attempt to fix failures automatically. Report them and let the user decide.
