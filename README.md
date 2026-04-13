# TDDesign

> Make taste testable.

TDDesign is a Claude Code plugin that brings TDD discipline to UI design. It turns implicit design preferences into a verifiable `DESIGN.md` spec with machine-checkable assertions, so AI-generated frontend code can be automatically graded against your taste.

**Status:** v0 milestone complete. End-to-end pipeline working on fixture inputs. See [`docs/STATUS-v0.md`](docs/STATUS-v0.md) for what's done and what's not.

## The problem

Today, working with AI coding agents on frontend looks like this:

1. You describe what you want — vaguely, or through a hand-written doc.
2. The AI generates UI code.
3. The result is "close but not right" — wrong spacing, wrong color tone, wrong component style.
4. You correct it.
5. The correction is lost. Next task, same mistakes.

Design preferences live in your head and never get externalized into a format you can regress against. There is no test suite for taste.

## The idea

TDDesign externalizes taste into a two-layer `DESIGN.md` file:

1. **Guidance layer** — standard Stitch-format descriptive prose (colors, typography, component styles, layout, do's and don'ts) that AI agents read when generating code.
2. **Test layer** — per-section `### Checks` subsections with machine-verifiable assertions (exact values, ranges, pattern presence/absence, subjective LLM-judge criteria).

Every manual correction you make becomes a candidate for a new check. Every future AI generation is graded against the whole set.

## v0 pipeline

```
preference_vector.json ──► composer ──► DESIGN.md
                                          │
                                 task ────┤
                                          ▼
                                   taste-test-planner
                                          │
                                    check plan
                                          │
                              HTML file ──┤
                                          ▼
                                taste-checker-objective
                                          │
                                  pass / fail report
```

- **Composer** (`tddesign/composer/`) — turns a preference vector into a `DESIGN.md` with all 9 Stitch sections and a testable checks layer.
- **taste-test-planner** (`tddesign/planner/`) — deterministic task-keyword → dimension filter. Given a task like `"build the landing page hero"`, it emits the subset of checks relevant to that task.
- **Tailwind + CSS checker** (`tddesign/parser/` and `tddesign/checker/`) — parses HTML, resolves Tailwind utility classes via `tailwindcss/defaultTheme`, extracts style facts, runs `exact` / `range` / `pattern` checks from the plan, and emits a structured report.
- **Material library** (`tddesign/material-library/`) — 59 reference `DESIGN.md` files from [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md), tagged along seven dimensions by an LLM with a mandatory human spot-check gate.

## Quick start

```bash
npm install
npm test
```

Run the pipeline against the fixtures:

```bash
# Good page — all checks pass, exit 0
npx tsx tddesign/cli/taste-check.ts \
  tests/fixtures/preference_vector.json \
  tests/fixtures/task.txt \
  tests/fixtures/good_page.html

# Bad page — three checks fail, exit 1
npx tsx tddesign/cli/taste-check.ts \
  tests/fixtures/preference_vector.json \
  tests/fixtures/task.txt \
  tests/fixtures/bad_page.html
```

From inside Claude Code the `/taste check` command is the entry point.

## Architecture

```
tddesign/
  schemas.ts              # zod schemas for every cross-module type
  composer/               # preference vector → DESIGN.md
  planner/                # DESIGN.md + task → check plan
  parser/                 # HTML + Tailwind → StyleFact[]
  checker/                # check plan + facts → report
  material-library/       # 59 tagged reference design systems
  cli/taste-check.ts      # in-process pipeline + argv CLI

tests/
  fixtures/               # hand-authored inputs and frozen expected outputs
  acceptance/             # one end-to-end test that drove the whole v0
  unit/                   # per-module TDD tests

.claude/
  skills/tddesign/        # skill trigger
  commands/tddesign/      # /taste check
  agents/tddesign/        # taste-test-planner, taste-checker-objective
  tdd-guardian/config.json# strict TDD gates (100% lines/funcs/stmts, ≥95% branches)

docs/
  SPEC.md                              # full product vision across all phases
  STATUS-v0.md                         # what's done, what's not
  superpowers/specs/                   # design specs per milestone
  superpowers/plans/                   # implementation plans per milestone
```

## Roadmap

v0 is the minimum that proves "taste is testable" on fixture inputs. Everything below is explicitly deferred from the v0 acceptance criteria — see `docs/SPEC.md` for the full vision and `docs/STATUS-v0.md` for the current technical debt.

- **Phase 2 — Elicitation and refinement.** `/taste init` questionnaire with top-down dimension picking and compatibility filtering; `taste-refiner` agent that turns manual corrections into check proposals; global preference profiles.
- **Phase 3 — Hooks and automation.** PreToolUse gate on frontend files; post-generation auto-check so `/taste check` runs without being asked.
- **Phase 4 — Subjective and vision-based checking.** LLM-judge evaluation for subjective criteria; headless browser rendering for vision-based grading.
- **Phase 5 — Cross-agent compatibility.** OpenCode, Codex CLI, Gemini CLI; maintenance of the material library as the upstream collection grows.

## Built on

- [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md) — the 59 reference design systems in the material library
- [Google Stitch DESIGN.md format](https://stitch.withgoogle.com/) — the section structure the composer emits
- [xiaolai/tdd-guardian-for-claude](https://github.com/xiaolai/tdd-guardian-for-claude) — the TDD enforcement pattern this plugin's own code is built with

## License

TBD.
