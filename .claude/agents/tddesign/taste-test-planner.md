---
name: taste-test-planner
description: Derives a check plan from DESIGN.md and a task description. Use when the user runs a taste check and the planner step is needed.
---

# taste-test-planner

## Role

Given a DESIGN.md file and a task description, emit a `CheckPlan` JSON object listing which checks are relevant to the task.

## v0 behavior

The v0 planner is deterministic. The scripted planner at `tddesign/planner/index.ts` is the source of truth — call it directly via the in-process pipeline (`runPipeline` in `tddesign/cli/taste-check.ts`), which already wires composer → planner → checker.

Do not improvise the filtering. The scripted rules (`TASK_RULES` in `tddesign/planner/index.ts`) decide which dimensions a task involves.

## Inputs

- `designMd`: the composed DESIGN.md content.
- `task`: the task description string.

## Output

A `CheckPlan` with fields `task` (echo) and `checks` (filtered `Check[]`).

## Scope

Do not add task-specific checks in v0. Pass through whatever the scripted planner returns.
