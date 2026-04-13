# TDDesign v0 — Status

**Date:** 2026-04-13
**Branch merged:** `feat/tddesign-v0` → `main`
**Gates:** 72/72 tests green · 100% lines/functions/statements · 98.57% branches (≥ 95% threshold) · `tsc --noEmit` clean

## What this is

TDDesign makes UI design preferences testable. The v0 milestone proves the full loop end-to-end on fixture inputs: a hand-written preference vector flows through a composer that emits a `DESIGN.md`, a deterministic planner that derives a check plan for a given task, a Tailwind/CSS fact extractor, and a checker that reports pass/fail per check.

See `docs/SPEC.md` for the full product vision and `docs/superpowers/specs/2026-04-13-tddesign-v0-design.md` for the v0 scope.

## What's done

### Slice 0 — Scaffolding
- Node 20 + TypeScript (strict) + vitest + zod + parse5 + `tailwindcss@3.4.1` (pinned exact)
- `tddesign/schemas.ts` with zod definitions for `PreferenceVector`, `Check` (discriminated on `type`), `CheckPlan`, `Report`, `MaterialIndex`, `StyleFact`
- Coverage thresholds enforced via `vitest.config.ts` and mirrored in `.claude/tdd-guardian/config.json`

### Slice 1 — Fixtures and failing acceptance test
- `tests/fixtures/preference_vector.json` — hand-authored v0 vector
- `tests/fixtures/good_page.html` — Tailwind hero matching the vector
- `tests/fixtures/bad_page.html` — same hero with exactly three intentional violations (one per check type)
- `tests/fixtures/task.txt` — task description fed to the planner
- `tests/acceptance/pipeline.test.ts` — end-to-end test that starts red and goes green at slice 6

### Slice 2 — Material library
- 59 source DESIGN.md directories copied from `references/awesome-design-md` into `tddesign/material-library/sources/`
- `tddesign/material-library/build.ts` — `buildIndex()` with an injectable LLM tagger and a mandatory spot-check confirmer that halts if the user rejects random samples
- `tddesign/material-library/llm-tagger.ts` — prompt builder, JSON extractor, schema-validated output
- **Not yet run against a real LLM** — the interactive tagging run is deferred to a human action (see "What's not done")

### Slice 3 — Composer
- `tddesign/composer/checks.ts` — typed check generators (exact/range/pattern/subjective)
- `tddesign/composer/sections.ts` — 9-section Stitch builder with optional `### Checks` subsection
- `tddesign/composer/index.ts` — `compose(vector, library) → { designMd, checks }` emits all 9 Stitch sections and 6 v0 checks
- **v0 limitation (documented inline):** the 6 checks are hardcoded for the acceptance fixture. A notes parser (turning `"Background #0F0F10..."` into check values) is Phase 2 work.

### Slice 4 — taste-test-planner
- `tddesign/planner/index.ts` — `planChecks({ checks, task })` with a deterministic task-keyword → dimension lookup table
- Hero tasks get all dimensions; settings/form tasks exclude hero-only checks; unknown tasks pass every check through (safe default)

### Slice 5 — Tailwind + CSS checker
- `tddesign/parser/tailwind.ts` — resolves Tailwind utility classes (`bg-[#hex]`, `text-[#hex]`, `p*-N`, `rounded-*`) to concrete CSS values via `tailwindcss/defaultTheme.js`
- `tddesign/parser/html.ts` — parse5-based element walker with recursive text extraction
- `tddesign/parser/facts.ts` — combines element tree + Tailwind resolver into `StyleFact[]`
- `tddesign/checker/{exact,range,pattern,index}.ts` — per-type runners plus an aggregator; subjective checks reported as advisory passes in v0
- 23 unit tests covering Tailwind tokens, HTML walking, and check evaluation per type

### Slice 6 — Pipeline + Claude wrappers
- `tddesign/cli/taste-check.ts` — `runPipeline` composes all stages in-process; `main()` is an argv-driven CLI that validates the vector through `PreferenceVectorSchema` at the JSON boundary and exits 1 on failures
- `tests/fixtures/expected_report.json` — frozen bad-page report, asserted via `toEqual` in the acceptance test (no hand-writing drift)
- `.claude/skills/tddesign/SKILL.md`, `.claude/commands/tddesign/taste-check.md`, `.claude/agents/tddesign/{taste-test-planner,taste-checker-objective}.md` — thin Claude Code wrappers that shell into the TS CLI

### Review and cleanup
- Independent `tdd-reviewer` audit on commit `466a7b7` surfaced:
  - a `tsc` blocker in `composer.test.ts` type narrowing — fixed
  - unvalidated CLI boundary for the preference vector — fixed (`PreferenceVectorSchema.parse`)
  - hardcoded composer with no disclosure — fixed with a v0 comment
- Accidental `references/` gitlinks removed; `references/` added to `.gitignore`

## What's not done

All of the following are explicit v0 non-goals from the spec, deferred to Phase 2+.

### Product scope
- **Interactive elicitation** — `/taste init` questionnaire with top-down dimension picking and compatibility filtering. Today you hand-author the preference vector JSON.
- **taste-refiner agent and `/taste refine`** — turning manual corrections into new check proposals.
- **Global profiles** — `/taste profiles`, `/taste switch`, `~/.config/tddesign/profiles/`.
- **`/taste show`, `/taste init`** commands from the spec's command table.
- **Hooks** — PreToolUse gate on frontend files and post-generation auto-check.
- **Subjective LLM judging** — checker currently reports subjective checks as advisory passes. Real code-based and vision-based LLM evaluation is Phase 4.
- **Vision-based checking** — headless browser rendering and screenshot analysis.
- **Codex CLI / Gemini CLI adaptation** — plugin only registers under `.claude/` today.

### Technical debt carried into Phase 2
- **Composer hardcodes its 6 checks** for the acceptance fixture. Any second fixture will produce the same checks. A notes parser (`#[0-9a-f]{6}` for hex, `"between N and M px"` for ranges, etc.) lands in Phase 2.
- **`inferProperty` id-string coupling in `checker/exact.ts` and `checker/range.ts`** — the checker maps `check.id` string prefixes to CSS properties. Fragile. Fix path: add a required `property` field to the `exact`/`range` check variants in the schema and remove `inferProperty`.
- **Planner `excludeCheckIds: ["layout.hero_section_padding"]`** — same hardcoded-id coupling as the checker. Replace with a per-dimension exclusion mechanism driven by task metadata.
- **Range schema has no `min <= max` refinement** — a misconfigured composer could emit a range check that never passes.
- **Wiring-only tests** flagged by the reviewer in `composer-checks.test.ts` and parts of `composer.test.ts` remain for now; can be pruned in a follow-up.
- **LLM auto-tag run** — `buildIndex` and `llm-tagger` are wired but no real tagging run has been performed. The v0 acceptance test uses an empty material library. To run it, wire an `LlmClient` in `tddesign/material-library/build.ts`, execute `npm run build:library`, and complete the interactive spot-check gate. `material-library/index.json` is currently gitignored by design.
- **Tailwind resolver coverage** — only `bg-[]`, `text-[]`, `p*-*`, `rounded-*` families are recognized today. `gap-*`, `mt-*`, `text-*-size`, `shadow-*`, arbitrary `px`/`rem` in other properties — all added on demand.
- **HTML parser** — Tailwind classes and inline `style=""` only. JSX/TSX `className`, CSS Modules, styled-components, Vue, Svelte are out of scope until there's a real user need.

## How to use it today

```bash
npm install
npm test                               # 72/72
npm run test:coverage                  # 100% lines/funcs/stmts, 98.57% branches
npx tsc --noEmit                       # clean

# Run the pipeline against a fixture directly:
npx tsx tddesign/cli/taste-check.ts \
  tests/fixtures/preference_vector.json \
  tests/fixtures/task.txt \
  tests/fixtures/good_page.html
# exits 0 with a JSON report, all checks passing

npx tsx tddesign/cli/taste-check.ts \
  tests/fixtures/preference_vector.json \
  tests/fixtures/task.txt \
  tests/fixtures/bad_page.html
# exits 1 with a JSON report, 3 checks failed
```

From inside Claude Code the `/taste check` command is registered under `.claude/commands/tddesign/taste-check.md` and shells out to the same CLI.

## Next milestones (suggested)

1. **Notes parser for the composer** — unblocks a second fixture, removes the biggest v0 shortcut.
2. **Schema-level `property` field on exact/range checks** — removes the `inferProperty` id-string coupling in the checker.
3. **Real LLM auto-tag run + spot-check** — populates `material-library/index.json`, enables compatibility filtering in later slices.
4. **Phase 2 subsystems:** taste-refiner, global profiles, the `/taste init` questionnaire. These are independent and can be brainstormed as separate sub-project specs.
