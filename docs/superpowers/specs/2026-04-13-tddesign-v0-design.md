# TDDesign v0 — Design Spec

**Date:** 2026-04-13
**Status:** Approved for implementation planning
**Source:** `docs/SPEC.md` (full product vision), this doc (v0 scope)

## Goal

Prove the "taste is testable" loop end-to-end on fixture inputs. A single acceptance test drives the entire v0: given a hand-written preference vector and two Tailwind fixture pages, the pipeline must produce a `DESIGN.md`, derive a check plan, run the checks, and report pass on the good page and exactly-the-expected failures on the bad page.

Everything beneath the acceptance test is built via `tdd-guardian` cycles (planner → test-designer → implementer → auditor), one cycle per slice.

## Non-goals for v0

Explicitly deferred to later phases from `docs/SPEC.md`:

- Interactive elicitation (`/taste init` questionnaire). v0 uses a hand-authored fixture preference vector.
- Subjective checker (LLM-judge scoring). Spec says advisory; v0 omits entirely.
- `taste-refiner` agent and `/taste refine`.
- Hooks (PreToolUse gate, post-generation auto-check).
- Global profiles, `/taste profiles`, `/taste switch`, `/taste show`, `/taste init`.
- Compatibility matrix for the material library (empty object in v0; no filtering).
- JSX / CSS Modules / styled-components / Vue / Svelte parsers.
- Codex CLI and Gemini CLI adaptation. v0 ships under `.claude/` only.

## Acceptance test (definition of done)

**Inputs (fixtures, all committed):**

- `tests/fixtures/preference_vector.json` — hand-authored, references 2–3 sources from the material library.
- `tests/fixtures/good_page.html` — a Tailwind-based page that matches the vector.
- `tests/fixtures/bad_page.html` — the same page with exactly 3 intentional violations (one `exact` failure, one `range` failure, one `pattern` failure).
- `tests/fixtures/expected_report.json` — the exact report the checker must emit for `bad_page.html`.
- `tests/fixtures/task.txt` — the task description string fed to the planner (e.g. `"build the landing page hero"`).

**Run:**

1. Composer reads `preference_vector.json` + material library → writes `DESIGN.md` to a temp path.
2. `taste-test-planner` reads `DESIGN.md` + `task.txt` → emits `check_plan.json`.
3. `taste-checker-objective` runs `check_plan.json` against each fixture page → emits a report.

**Assertions:**

- Good page report: `failed == 0`, `passed == total`, no errors.
- Bad page report: deep-equals `expected_report.json` (same 3 check IDs failed, same expected-vs-actual values).
- Composed `DESIGN.md` contains all 9 Stitch sections and at least one `### Checks` subsection per section.

This test is written first (slice 1), goes red, and goes green at the end of slice 6. No other test gates v0 completion.

## Architecture

### Language and tooling

**Node + TypeScript** for all scripted components. Rationale: Tailwind's own `resolveConfig` is JS-native and is the only way to stay faithful to real Tailwind class→value semantics without drift; HTML parsers in the JS ecosystem (`parse5`, `node-html-parser`) are mature; single-language dep tree.

- Runtime: Node 20+
- Test runner: `vitest` (fast, TS-native, ESM-friendly)
- Deps: `tailwindcss` (for `resolveConfig`), `parse5` or `node-html-parser`, `zod` for schema validation

Agents remain markdown under `.claude/agents/tddesign/`.

### File layout

```
.claude/
  skills/tddesign/SKILL.md                 # trigger + overview
  agents/tddesign/
    taste-test-planner.md                  # DESIGN.md + task → check plan
    taste-checker-objective.md             # wraps scripted checker
  commands/tddesign/
    taste-check.md                         # /taste check command entry

tddesign/                                  # scripted TS code
  composer/
    index.ts                                # vector → DESIGN.md
    checks.ts                               # check-type generators (exact/range/pattern)
  parser/
    html.ts                                 # HTML → element tree
    tailwind.ts                             # class token → resolved style value
    facts.ts                                # element tree → style-fact list
  checker/
    index.ts                                # plan + facts → report
    exact.ts
    range.ts
    pattern.ts
  material-library/
    index.json                              # auto-tagged + spot-checked
    sources/                                # copied from references/awesome-design-md/design-md/
  cli/
    taste-check.ts                          # pipeline entry used by the command

tests/
  fixtures/
    preference_vector.json
    good_page.html
    bad_page.html
    task.txt
    expected_report.json
  acceptance/
    pipeline.test.ts                        # the acceptance test
  unit/                                     # per-module unit tests, added per slice
```

### Data flow

```
preference_vector.json ──► composer ──► DESIGN.md
                                            │
                                task.txt ───┤
                                            ▼
                                     taste-test-planner (agent)
                                            │
                                     check_plan.json
                                            │
                                HTML file ──┤
                                            ▼
                                 taste-checker-objective
                                 (agent wrapper → scripted checker)
                                            │
                                     report.json
```

### Boundaries and interfaces

Each module exposes a single pure function where possible:

- `composer.compose(vector: PreferenceVector, library: MaterialIndex): DesignMd`
- `parser.parseHtml(html: string): StyleFact[]`
- `parser.resolveTailwindClass(token: string, config: TailwindConfig): StyleValue`
- `checker.run(plan: CheckPlan, facts: StyleFact[]): Report`

Schemas for `PreferenceVector`, `MaterialIndex`, `CheckPlan`, `Report`, `StyleFact` live in `tddesign/schemas.ts` with `zod` validators. Every module boundary validates its inputs.

## Slices (tdd-guardian cycles)

Each slice is one tdd-guardian run: planner → test-designer → implementer → auditor. A slice merges only when its audit passes.

### Slice 1 — Fixtures + failing acceptance test

- Hand-author `preference_vector.json` referencing 2–3 real sources (e.g. Linear, Vercel).
- Hand-author `good_page.html` as a Tailwind landing-page hero matching the vector.
- Hand-author `bad_page.html` as `good_page.html` with exactly 3 violations: one wrong hex color (exact), one out-of-range padding (range), and one emoji character where the vector forbids emoji (pattern).
- Hand-author `expected_report.json` with the 3 expected failures.
- Scaffold `tddesign/cli/taste-check.ts` as a stub that throws.
- Write `tests/acceptance/pipeline.test.ts`. Run `vitest`. Confirm it fails red for the right reason.

**Exit:** red acceptance test is committed and reproducible.

### Slice 2 — Material library auto-tag + spot-check gate

- Script `tddesign/material-library/build.ts`: for each file in `references/awesome-design-md/design-md/`, ask Claude to emit dimension tags (`overall_style`, `color_direction`, `typography`, `component_style`, `layout_spacing`, `detail_elements`, `motion`) plus a one-sentence rationale per dimension.
- Write results to `material-library/index.json`.
- Copy source files into `tddesign/material-library/sources/`.
- **Hard gate:** after auto-tagging, the slice halts and surfaces 5 randomly-sampled entries with their tags and rationales. The user must confirm or correct each entry. Corrections are written back to `index.json`. Slice is not complete until the user has signed off on the sample.
- Unit tests: schema validation of `index.json`, coverage check (every source file appears, every entry has all 7 dimensions tagged).

**Exit:** validated `index.json` + user sign-off recorded in slice audit.

### Slice 3 — Composer

- Implement `composer.compose(vector, library)` → `DesignMd` string.
- Logic: resolve primary `source_refs` from library, copy its structure as the base, apply overrides from other `source_refs` per dimension, translate notes into `subjective` checks.
- Generate the `### Checks` subsection per Stitch section. Every concrete parameter in the guidance layer must produce at least one machine-verifiable check.
- Unit tests: `exact` check generation for color/font values, `range` check generation for spacing and contrast, `pattern` check generation for "no emoji" and "accent only on interactive elements", note→subjective passthrough, missing-source error path.

**Exit:** composer unit tests green; acceptance test still red (no planner/checker yet).

### Slice 4 — taste-test-planner

- Agent markdown at `.claude/agents/tddesign/taste-test-planner.md`.
- Input contract: path to `DESIGN.md` + task string. Output contract: `check_plan.json` matching the `CheckPlan` schema.
- Behavior: read all checks from `DESIGN.md`, include checks whose dimension is relevant to the task, exclude irrelevant ones. Task-specific checks may be added but are not required for v0.
- Dimension-relevance rules for v0 are explicit and simple (lookup table: keywords in task → dimensions). No clever inference.
- Unit tests: "hero" task includes typography + color + layout; "settings form" task excludes hero-only layout checks; unknown task includes everything (safe default).

**Exit:** planner unit tests green.

### Slice 5 — Tailwind + CSS checker

- `parser/tailwind.ts`: use `tailwindcss/resolveConfig` against Tailwind's default theme to map class tokens to concrete values. Support at least: `bg-*`, `text-*`, `p-*`, `px-*`, `py-*`, `m-*`, `rounded-*`, `font-*`, `shadow-*`, `border-*`, `gap-*`.
- `parser/html.ts`: parse HTML, walk the tree, collect `StyleFact` entries (one per element with resolved styles from both class tokens and inline `style=""`).
- `checker/`: run each check type against the fact list. `exact` compares resolved values. `range` parses numeric values with units. `pattern` scans facts and text content.
- Unit tests per Tailwind class family; unit tests per check type with hand-built fact lists; integration test parsing `good_page.html` and asserting the extracted facts.

**Exit:** checker unit tests green; running the checker directly against fixtures produces the expected report, but the agent wrapper and command are not yet wired.

### Slice 6 — `/taste check` command wiring

- `.claude/commands/tddesign/taste-check.md` + `.claude/agents/tddesign/taste-checker-objective.md`: thin orchestrators that shell out to `tddesign/cli/taste-check.ts`.
- `tddesign/cli/taste-check.ts`: reads vector, calls composer, invokes planner (agent), calls checker, prints report.
- Acceptance test goes green.

**Exit:** `tests/acceptance/pipeline.test.ts` passes; `v0` milestone complete.

## Risks and mitigations

- **Tailwind resolver surprises.** `resolveConfig` output shapes have changed across major versions. Mitigation: pin `tailwindcss` exact version in `package.json`; unit-test the resolver wrapper against fixed expected values so a version bump breaks tests loudly.
- **Auto-tag quality.** LLM tags may be wrong in subtle ways. Mitigation: the spot-check gate is mandatory and non-skippable; 5 random samples is the floor, the user may request more.
- **Agent non-determinism in the planner.** A stochastic planner makes the acceptance test flaky. Mitigation: the planner's dimension-relevance rules are a deterministic lookup table in v0; the agent's job is to apply the table, not to improvise.
- **Fixture brittleness.** Hand-authoring `expected_report.json` is tedious and error-prone. Mitigation: generate it once by running the checker against `bad_page.html` after slice 5, then commit and freeze.

## Open questions for implementation planning

None blocking. Deferred product questions live in `docs/SPEC.md` §Open Questions and are out of scope for v0.
