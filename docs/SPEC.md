# TDDesign — Test Driven Design

## What This Is

TDDesign is a plugin/skill system for AI coding agents (Claude Code, OpenCode, Codex) that brings TDD discipline to UI design. It ensures AI-generated frontend code matches the user's design taste through structured elicitation, testable specifications, and automated verification.

The core idea: just as TDD externalizes "correctness" into executable tests before code is written, TDDesign externalizes "taste" into a testable design spec before UI is generated.

## Problem

Today, developers using AI coding agents for frontend work face a loop:

1. They describe what they want (vaguely, or via a hand-written vi/design doc)
2. AI generates UI code
3. The result is "close but not right" — wrong spacing, wrong color tone, wrong component style
4. They manually tell the AI to fix details
5. Fixes are applied, but the correction is lost — next task, same mistakes repeat

The root cause: design preferences are implicit in the developer's head, never externalized into a verifiable format. There is no regression mechanism for taste.

## Solution Overview

TDDesign has three subsystems:

1. **Taste Elicitation** — A structured questionnaire (like powerlevel10k's setup or a psychometric test) that positions the user within a known design-preference space, producing a preference vector
2. **DESIGN.md Composer** — Takes the preference vector and generates a testable DESIGN.md file with both descriptive guidance and verifiable assertions
3. **TDD Design Workflow** — An agent workflow that plans design checks per task, runs them after generation, and captures user corrections back into the spec

## Prior Art & Inputs

- **Google Stitch DESIGN.md format**: The emerging standard for agent-readable design system files. Plain markdown, 9 sections covering theme/colors/typography/components/layout/elevation/dos-donts/responsive/agent-prompts. TDDesign adopts this format as the base structure for its output.
- **VoltAgent/awesome-design-md**: Open-source collection of 55+ DESIGN.md files extracted from real websites (Linear, Stripe, Apple, Notion, Cursor, etc.). TDDesign uses these as the **素材库 (material library)** for its elicitation system — real design systems become the options users choose between.
- **xiaolai/tdd-guardian-for-claude**: A Claude Code plugin that enforces TDD via specialized subagents (planner → test-designer → implementer → auditor) with gate enforcement hooks. TDDesign adopts this architectural pattern: separate planning from checking, use assertion levels, enforce gates via hooks.

---

## Subsystem 1: Taste Elicitation

### Purpose

Quickly determine a user's design preferences through a top-down, structured selection process. Output is a **preference vector** — a structured data object capturing choices across all design dimensions.

### Design Principles

- **Judgmental, not generative**: Users select from concrete rendered options, never describe preferences in words. Judging is easier than generating.
- **Top-down funnel**: Start with overall style (highest information gain), then progressively refine into specific dimensions. Early choices constrain later options.
- **Preference aggregation**: Dimensions are not independent. Choosing a dark minimal style implies constraints on typography, spacing, component shape, etc. Many parameters are inferred from a few high-level choices, not asked individually.
- **Compatibility filtering**: At each step, options shown to the user are filtered to exclude combinations that "don't work together." This compatibility knowledge is pre-encoded.
- **Notes as escape hatch**: At every step, the user can add free-text notes ("I chose A, but I want A's spacing with more color saturation"). Notes are used during composition to fine-tune beyond what selections capture.

### Question Structure

The questionnaire has a fixed set of **dimensions** (the structure), but the **specific options** presented are dynamic — drawn from the material library and filtered by compatibility with prior choices.

#### Dimensions (ordered by dependency, parallelizable where noted)

1. **Overall Style / Atmosphere** — The highest-level aesthetic fork
   - Examples: "Minimal & precise" vs "Warm & editorial" vs "Bold & expressive" vs "Technical & dense"
   - This is the most information-dense question. A single choice here constrains 60-70% of downstream parameters.
   - Options are rendered as complete page snippets (hero section or similar), not abstract labels.

2. **Color Direction** — Palette family and background tone
   - Depends on: Overall Style
   - Examples within "Minimal & precise": "Monochrome with blue accent" vs "Warm neutrals with terracotta" vs "Cool grays with green accent"
   - Includes: light/dark mode preference, accent color role, background warmth/coolness

3. **Typography** — Font personality and hierarchy
   - Depends on: Overall Style
   - Can be parallel with Color Direction
   - Covers: serif vs sans-serif vs mixed, geometric vs humanist, weight range, letter-spacing density, heading/body contrast

4. **Component Style** — Shape language and interaction patterns
   - Depends on: Overall Style, partially on Color Direction
   - Covers: border-radius (sharp vs rounded vs pill), shadow depth (flat vs elevated vs atmospheric), border presence/absence, button style, card style, input style

5. **Layout & Spacing** — Density and breathing room
   - Depends on: Overall Style
   - Can be parallel with Component Style
   - Covers: information density, whitespace philosophy, max-width, grid approach, section rhythm

6. **Detail Elements** — Icons, emoji, decorative elements
   - Depends on: Overall Style, Component Style
   - Covers: icon style (line/filled/duotone/none), emoji usage (yes/no), dividers, decorative elements, badges/pills

7. **Motion & Animation** — Transition and feedback style
   - Largely independent, but informed by Overall Style
   - Covers: transition duration, easing curves, hover behavior, loading states, scroll behavior

#### Material Library

Options at each dimension are sourced from the **awesome-design-md** collection. Each real DESIGN.md is pre-tagged with its position on each dimension (e.g., Linear = minimal, monochrome, geometric-sans, sharp-corners, spacious, line-icons, subtle-motion). When presenting options, the system selects 2-4 DESIGN.md entries that are maximally different on the current dimension but compatible with prior choices.

A **compatibility matrix** encodes which combinations work together. This matrix is initially built by analyzing the 55+ existing DESIGN.md files (which represent real, professionally designed systems), and can be extended over time.

#### Preference Vector Output

The elicitation produces a structured object:

```
{
  "profile_name": "user-chosen-codename",
  "scope": "global" | "project",
  "selections": {
    "overall_style": { "choice": "minimal-precise", "source_refs": ["linear", "vercel"], "notes": "" },
    "color_direction": { "choice": "monochrome-blue-accent", "source_refs": ["linear"], "notes": "but warmer than Linear, more like #5B6EE1 than pure blue" },
    "typography": { "choice": "geometric-sans", "source_refs": ["vercel"], "notes": "Geist or Inter" },
    "component_style": { "choice": "subtle-radius-minimal-shadow", "source_refs": ["linear"], "notes": "" },
    "layout_spacing": { "choice": "spacious-narrow-content", "source_refs": ["stripe"], "notes": "max-width ~720px for content" },
    "detail_elements": { "choice": "line-icons-no-emoji", "source_refs": ["linear"], "notes": "" },
    "motion": { "choice": "subtle-fast", "source_refs": ["vercel"], "notes": "transitions under 200ms" }
  },
  "created_at": "...",
  "updated_at": "..."
}
```

### Global vs Project Preferences

- Users can store **multiple named global profiles** (e.g., "my-saas-dark", "client-enterprise", "side-project-playful")
- On `taste init`, the user is prompted: **Use existing global profile?** → list of named profiles → options: "Use as-is" / "View & modify" / "Start from scratch"
- After elicitation completes: **Save as?** → "New global profile (name it)" / "Replace existing global profile" / "Project-only (no global save)"
- Project-level DESIGN.md always takes precedence over global during taste check

---

## Subsystem 2: DESIGN.md Composer

### Purpose

Transform a preference vector into a complete, testable DESIGN.md file. The output follows the Google Stitch DESIGN.md format but adds a **test layer** that existing DESIGN.md files lack.

### Output Structure

The generated DESIGN.md has two interleaved layers per section:

#### Layer 1: Design Guidance (standard DESIGN.md)

Follows the Stitch format. Each section provides descriptive, natural-language design direction that AI coding agents read when generating UI. This is what makes the design "right" on first generation.

Sections (following Stitch/awesome-design-md convention):
1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings
5. Layout Principles
6. Depth & Elevation
7. Do's and Don'ts
8. Responsive Behavior
9. Agent Prompt Guide

#### Layer 2: Design Tests (TDDesign extension)

Each section includes a `### Checks` subsection containing verifiable assertions. These are what make the design "testable."

Each check item has:
- **Rule**: The specific assertion in natural language
- **Type**: `exact` | `range` | `pattern` | `subjective`
  - `exact`: Value must match precisely (e.g., font-family, specific hex color)
  - `range`: Value must fall within bounds (e.g., contrast ratio 7:1-12:1, spacing 24-32px)
  - `pattern`: Presence/absence check (e.g., "no emoji characters", "all buttons have hover state")
  - `subjective`: Requires LLM judge evaluation (e.g., "overall atmosphere feels minimal and precise")
- **Source**: Which selection/note from the preference vector generated this check

Example:

```markdown
## Color Palette & Roles

Background: #0F0F10 (near-black with slight warmth)
Text Primary: #FAFAFA
Text Secondary: rgba(250, 250, 250, 0.6)
Accent: #5B6EE1 (muted indigo)
...

### Checks

- [exact] Background color is #0F0F10
- [exact] Primary text color is #FAFAFA
- [range] Accent color saturation between 45-65 in HSL
- [range] Primary text / background contrast ratio >= 15:1
- [pattern] No colors outside the defined palette appear in the output
- [pattern] Accent color is used only for interactive elements and emphasis, not for large surfaces
- [subjective] Color palette conveys "calm technical precision" without feeling cold or sterile
```

### Composition Logic

The composer:

1. Starts from the DESIGN.md of the **primary source reference** in the preference vector (the "closest match" from the material library)
2. Applies **overrides** from selections that diverge from the primary source (e.g., user chose Linear's style but Stripe's spacing)
3. Applies **note-driven adjustments**: LLM interprets the user's free-text notes and translates them into parameter changes and additional checks
4. Generates the test layer by translating each concrete parameter into an appropriate check type
5. Adds subjective checks derived from the "Visual Theme & Atmosphere" selection

### Composition Rules

- Every `exact` or `range` parameter in the guidance layer MUST have a corresponding check in the test layer
- `Do's and Don'ts` items are converted to `pattern` checks where possible
- Notes that cannot be translated to objective checks become `subjective` checks with the note text as evaluation criteria
- The composer reports which notes it could not translate, so the user can clarify or accept

---

## Subsystem 3: TDD Design Workflow

### Purpose

Enforce design quality during development through automated checking, analogous to how tdd-guardian enforces code quality. This is the runtime component that uses the DESIGN.md during actual development.

### Architecture (modeled on tdd-guardian)

The workflow uses specialized subagents, each with a focused role:

#### Agent: taste-test-planner

**Input**: DESIGN.md + current task description (e.g., "build a settings page", "create the landing page hero")

**Output**: A **check plan** — the specific set of checks from DESIGN.md that are relevant to this task, plus any task-specific checks derived from the task description.

**How it works**:
1. Reads the full DESIGN.md
2. Reads the current task description
3. For each dimension (color, typography, components, layout, etc.), determines: "Does this task involve this dimension?"
4. For involved dimensions, pulls the relevant checks from DESIGN.md
5. May add task-specific checks not in DESIGN.md (e.g., "settings page should have clear section grouping" — derived from the task, not from the style spec)

The planner ensures no relevant check is missed, but also avoids applying irrelevant checks (don't check hero typography rules for a settings form).

#### Agent: taste-checker-objective

**Input**: Check plan (objective items only) + generated code

**Output**: Per-check pass/fail with details

**How it works**:
- Parses the generated CSS/HTML/JSX/TSX code
- For `exact` checks: extracts values and compares
- For `range` checks: extracts values and verifies bounds
- For `pattern` checks: scans for presence/absence of specified elements
- Reports: total checks, passed, failed, each failure with expected vs actual

This agent does NOT render the page. It works purely from code analysis.

#### Agent: taste-checker-subjective

**Input**: Check plan (subjective items only) + generated code (+ optionally rendered screenshot)

**Output**: Per-check score (1-10) with reasoning

**How it works**:
- Receives the subjective checks from the plan
- Analyzes the code structure to infer visual qualities (code-based inference)
- If screenshot capability is available, also analyzes the rendered output (vision-based inference)
- For each subjective check, provides:
  - Code-based score (1-10) with reasoning
  - Vision-based score (1-10) with reasoning (if available)
  - Both scores are presented independently, never merged

Subjective scores are **advisory** — they are shown to the user but do not block anything.

#### Agent: taste-refiner

**Input**: User's manual correction (what they changed and why) + current DESIGN.md

**Output**: Proposed additions/modifications to DESIGN.md

**How it works**:
1. Observes what the user changed (diff of the code)
2. Infers the design rule behind the change
3. Translates it into a new check item (choosing appropriate type: exact/range/pattern/subjective)
4. Proposes the addition to the user: "I noticed you changed padding from 16px to 24px on all section containers. Should I add this check: `[range] Section container padding >= 24px`?"
5. **Only writes to DESIGN.md after user confirmation**

This is the regression mechanism — every manual correction becomes a potential new test case.

### Workflow Sequence

```
User issues a frontend task
         │
         ▼
   taste-test-planner
   reads DESIGN.md + task
   outputs: check plan
         │
         ▼
   AI generates code
   (using DESIGN.md guidance layer as context)
         │
         ▼
   ┌─────┴─────┐
   ▼           ▼
taste-checker  taste-checker
-objective     -subjective
   │           │
   ▼           ▼
 pass/fail    scores
 per check    per check
   │           │
   └─────┬─────┘
         ▼
   Results presented to user
   (objective failures are highlighted;
    subjective scores are advisory)
         │
         ▼
   User reviews, may make manual corrections
         │
         ▼
   taste-refiner observes corrections
   proposes new checks
         │
         ▼
   User confirms/rejects proposed checks
         │
         ▼
   DESIGN.md updated (if confirmed)
```

### Gate Enforcement

Following tdd-guardian's hook pattern:

- **PreToolUse hook**: When the agent attempts to write/create frontend files (`.html`, `.css`, `.jsx`, `.tsx`, `.vue`, `.svelte`), check if a DESIGN.md exists in the project. If it does, ensure the taste-test-planner has been run for the current task. If not, prompt the user: "DESIGN.md found but no check plan for this task. Run taste check? [y/n]"
- **Post-generation hook**: After frontend code is generated, automatically run taste-checker-objective. Report results inline. Do not block, but make failures visible.
- Subjective checks are NOT run automatically (they are slower and use more tokens). They can be triggered explicitly via command.

---

## Commands

| Command | Description |
|---------|-------------|
| `/taste init` | Run the elicitation questionnaire. Produces a preference vector and generates DESIGN.md. Offers to save as global profile. |
| `/taste check` | Run the full check suite (objective + subjective) against current frontend code. |
| `/taste check --objective` | Run only objective checks. |
| `/taste check --subjective` | Run only subjective checks. |
| `/taste refine` | Analyze recent code changes, propose new checks for DESIGN.md. Requires user confirmation. |
| `/taste profiles` | List saved global profiles. |
| `/taste switch <profile-name>` | Load a different global profile and regenerate project DESIGN.md. |
| `/taste show` | Display current DESIGN.md with check summary (total checks by type, last run results). |

---

## File Structure

```
.claude/skills/tddesign/
  SKILL.md                    # Main skill definition (trigger, description)
  
.claude/agents/tddesign/
  taste-test-planner.md       # Check plan generator
  taste-checker-objective.md  # Code-based objective verification
  taste-checker-subjective.md # LLM-based subjective evaluation
  taste-refiner.md            # Correction → check proposal

.claude/commands/tddesign/
  taste-init.md               # /taste init command
  taste-check.md              # /taste check command
  taste-refine.md             # /taste refine command
  taste-profiles.md           # /taste profiles command
  taste-switch.md             # /taste switch command
  taste-show.md               # /taste show command

.claude/hooks/tddesign/
  pretool_design_guard.js     # PreToolUse hook for frontend files
  post_generation_check.js    # Post-generation auto-check

~/.config/tddesign/
  profiles/                   # Global taste profiles
    my-saas-dark.json         # Named preference vectors
    client-enterprise.json
    ...
  material-library/           # Cached/indexed DESIGN.md collection
    index.json                # Dimension tags per source
    compatibility.json        # Compatibility matrix
    sources/                  # Raw DESIGN.md files from awesome-design-md

<project-root>/
  DESIGN.md                   # Project-level design spec (generated, testable)
```

---

## Implementation Phases

### Phase 1: MVP — The Full Loop

The MVP must deliver the complete core experience end-to-end. A user who has never used TDDesign should be able to go from zero to working design-tested code in one session. Anything less does not validate the idea.

MVP includes:

- **Plugin scaffolding**: Set up as a Claude Code plugin with skill, agents, commands, hooks
- **Material library**: Parse awesome-design-md DESIGN.md files, extract and tag each one along the 7 dimensions, build initial compatibility matrix
- **Taste elicitation (`/taste init`)**: The full questionnaire flow — top-down dimension-by-dimension selection with compatibility filtering, notes capture at each step, preference vector output
- **DESIGN.md composer**: Transform preference vector into a testable DESIGN.md (guidance layer + checks layer)
- **taste-test-planner agent**: Read DESIGN.md + task description, derive the relevant check plan for the current task
- **taste-checker-objective agent**: Parse generated CSS/HTML/JSX, run exact/range/pattern checks, report pass/fail per check
- **taste-checker-subjective agent**: Code-based inference for subjective checks, report scores with reasoning per check
- **`/taste check` command**: Run both objective and subjective checks, present results
- **Basic workflow integration**: DESIGN.md is loaded as context when generating frontend code, check results are presented after generation

At this point, the loop works: elicitate → generate DESIGN.md → develop with it → check → see scores. This is the minimum that proves whether the concept has value.

### Phase 2: Refinement & Persistence

- Implement taste-refiner agent: diff analysis → check proposal → user confirmation → DESIGN.md update
- Implement `/taste refine` command
- Implement global profile storage (`~/.config/tddesign/profiles/`)
- Implement `/taste profiles`, `/taste switch`
- Project vs global preference management (use as-is / view & modify / start from scratch)

At this point, taste accumulates across sessions and projects. The regression mechanism is active.

### Phase 3: Hooks & Automation

- Implement PreToolUse hook for frontend file detection
- Implement post-generation auto-check (objective checks run automatically, results shown inline)
- Integrate with tdd-guardian if present (design checks as an additional gate alongside code tests)

At this point, checking is automatic — the developer doesn't need to remember to run `/taste check`.

### Phase 4: Vision-Based Checking

- Add screenshot rendering capability (headless browser)
- Implement vision-based subjective checking as a second signal alongside code-based inference
- Both scores presented independently per subjective check

### Phase 5: Cross-Agent Compatibility

- Adapt skill/command format for OpenCode, Codex CLI
- Ensure DESIGN.md format works with Google Stitch, Cursor, and other agents that support design system files
- Material library updates: track new entries in awesome-design-md, re-index

---

## Key Design Decisions & Rationale

**Why selections, not descriptions?**
People can judge ("I prefer A over B") far more easily and accurately than they can generate ("describe your ideal design"). This is the powerlevel10k insight. It also produces structured, machine-actionable data rather than ambiguous natural language.

**Why a fixed dimension structure with dynamic content?**
The dimensions (style, color, type, components, layout, details, motion) are universal to web design. But the specific options within each dimension depend on what came before (compatibility) and what's available in the material library. Fixed structure ensures completeness; dynamic content ensures relevance.

**Why two check layers (objective + subjective)?**
Some design qualities are precisely measurable (color values, spacing, font names) and some are not (atmosphere, balance, rhythm). Collapsing them into one system would either lose precision (everything becomes subjective) or lose coverage (only test what's measurable). Keeping them separate with explicit types lets the user know exactly how much of their spec is machine-verifiable vs advisory.

**Why not merge scores?**
A composite "design quality score" would be misleading. A page can score 100% on objective checks (all colors correct, all spacing correct) and still feel wrong (bad visual rhythm, unclear hierarchy). Independent scores per dimension let the user make their own judgment about what matters.

**Why require user confirmation for refinements?**
Not every manual correction represents a permanent preference. Sometimes you adjust something for a specific page context. The user is the only one who knows whether a correction is "always do this" or "just this time." Automatic write-back would pollute the spec with one-off decisions.

**Why adopt the Stitch DESIGN.md format?**
It's becoming a cross-tool standard. DESIGN.md files are already consumed by Claude Code, Cursor, Stitch, and other agents. Generating in this format means TDDesign's output is immediately useful even without TDDesign's checking infrastructure — it's just a better DESIGN.md.

---

## Open Questions

1. **Compatibility matrix construction**: How much can be automated by analyzing existing DESIGN.md files vs how much needs manual curation? Initial approach: automate a first pass, then curate.

2. **Material library size**: 55+ sources is a good start but may not cover all taste space adequately. What's the minimum viable number for good elicitation coverage? Do we need to generate synthetic DESIGN.md variants to fill gaps?

3. **Objective check extraction from code**: Different frontend frameworks (React, Vue, Svelte, plain HTML/CSS) structure their styles differently. Inline styles, CSS modules, Tailwind classes, styled-components — the checker needs to handle all of these. Phase 1 should pick one or two (likely Tailwind + plain CSS) and expand.

4. **Vision-based subjective checking**: Rendering screenshots in a CI/headless environment adds significant complexity. Is code-based inference good enough for most cases? Should vision-based be "nice to have" or "essential"?

5. **Elicitation question count**: The goal is minimum viable questions for maximum information gain. Needs empirical testing — how many questions does it take to produce a DESIGN.md that the user is >80% satisfied with on first generation?
