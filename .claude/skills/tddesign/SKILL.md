---
name: tddesign
description: Use when running `/taste check` or when the user asks to verify generated frontend code against a DESIGN.md spec. Makes taste testable.
---

# TDDesign

TDDesign makes design preferences testable. It composes a DESIGN.md from a preference vector, derives a check plan for the current task, and runs objective checks against generated HTML/CSS/Tailwind code.

## When to invoke

- User runs `/taste check` — invoke the `taste-check` command.
- User asks "does this page match DESIGN.md?" — invoke the `taste-check` command.

Do NOT invoke this skill for subjective design discussion. v0 runs objective checks only.

## v0 scope

- Input: `preference_vector.json`, a task string, an HTML file (Tailwind supported).
- Output: a report of passed/failed checks with expected-vs-actual per failure.
- Does NOT cover: interactive elicitation, refinement, global profiles, hooks. See `docs/SPEC.md` for the full roadmap.
