# `/taste init` — Local Web Questionnaire (v1) Design

**Date:** 2026-04-14
**Status:** Approved for planning
**Author:** TDDesign team

## 1. Scope & Goal

Command `npx tsx tddesign/cli/init.ts` launches a zero-dependency localhost server, opens the user's browser, walks them through all 7 preference dimensions with live-rendered HTML options, filters options by an initial "mood" answer, ends at a review screen, writes `./preference_vector.json` atomically, and shuts down.

The resulting JSON is consumable by the existing composer → planner → checker pipeline with **no schema changes**.

**Out of scope for v1:** uploading custom references, editing existing vectors, material-library integration, multi-profile support, alternate save paths, free-text notes boxes, browser e2e tests, i18n, authentication, remote hosting.

**Success criterion:** After running `init.ts`, feeding the resulting `preference_vector.json` into `taste-check.ts` against the existing fixture HTML produces a non-empty report whose checks are deterministically derivable from the user's picks.

## 2. Architecture

```
tddesign/cli/init.ts          entry: parse argv, start server, open browser, await submit, exit
tddesign/cli/init/server.ts   Node http server: GET /, GET /choices.json, POST /submit, POST /shutdown
tddesign/cli/init/choices.ts  static data: 7 dimensions × 4–8 options each
tddesign/cli/init/render.ts   build the index.html string (inline CSS, vanilla JS)
tddesign/cli/init/writer.ts   assemble PreferenceVector from payload, validate, atomic write
tddesign/cli/init/open.ts     cross-platform browser opener (darwin/linux/win32)
```

The server uses Node's built-in `http` module. No Express, no Vite, no bundler, no framework. The HTML is a single string with inline CSS and vanilla JS using `fetch`. Zero new runtime dependencies beyond what the project already ships.

## 3. Data Model

### `choices.ts` types

```ts
type Mood =
  | "minimal"
  | "editorial"
  | "playful"
  | "brutalist"
  | "warm-technical"
  | "vivid-modern";

type RenderKind =
  | "mood"
  | "color"
  | "type"
  | "component"
  | "layout"
  | "detail"
  | "motion";

interface ChoiceOption {
  id: string;                              // "mono-indigo"
  label: string;                           // "Mono + Indigo"
  moodTags: Mood[];                        // ["minimal", "warm-technical"]
  sourceRefs: string[];                    // ["linear"] → selections[dim].source_refs
  tokens: Record<string, string | number>; // dimension-specific keys
  notesTemplate: string;                   // parser-friendly canonical sentence
  render: RenderKind;
}

interface DimensionChoices {
  dimension:
    | "overall_style"
    | "color_direction"
    | "typography"
    | "component_style"
    | "layout_spacing"
    | "detail_elements"
    | "motion";
  question: string;
  options: ChoiceOption[];
}

export const CHOICES: DimensionChoices[] = [/* 7 entries */];
```

### Target option counts (v1)

| Dimension         | Count |
| ----------------- | ----: |
| overall_style     |     6 |
| color_direction   |     8 |
| typography        |     6 |
| component_style   |     6 |
| layout_spacing    |     5 |
| detail_elements   |     5 |
| motion            |     4 |
| **total**         |    40 |

### `notesTemplate` canonical forms

Each template is hand-authored to round-trip through the existing notes parser:

- `color_direction.mono-indigo`: `"Background #0F0F10, primary text #FAFAFA, accent #5B6EE1"`
- `layout_spacing.spacious-hero`: `"Section padding between 48 and 96 px"`
- `detail_elements.line-icons-no-emoji`: `"No emoji characters anywhere"`
- `overall_style.minimal-precise`: `"minimal precise clean technical"`

A unit test asserts every option's `notesTemplate` parses via `parsePreferenceVector` without errors, and that the emitted checks match the option's declared `tokens`.

## 4. User Flow

1. **Launch.** `npx tsx tddesign/cli/init.ts` starts the server on `127.0.0.1:<random-port>`, prints the URL, opens the default browser.
2. **Welcome screen.** One-line explanation + "Start" button. If `./preference_vector.json` already exists, shows a neutral warning: *"Starting init will overwrite `./preference_vector.json` on submit. Cancel to preserve."*
3. **Dimension 1 — overall_style (the root).** Renders 6 mood cards. Each card is a 300×180 mini-mockup rendered with the mood's own background/text/accent/spacing applied inline plus a 2-word label. User clicks one; selection stored client-side in memory.
4. **Dimensions 2–7 in fixed order** — color_direction → typography → component_style → layout_spacing → detail_elements → motion. Each page shows that dimension's options split into two groups:
   - **"Recommended for <mood>"** — options whose `moodTags.includes(rootMood)`.
   - **"Other options"** — the remainder.

   No hard filtering. User always sees every option. Back button goes one step; a progress bar at the top shows "N of 7".
5. **Review screen.** Grid of all 7 picks, each cell a mini-preview of the chosen tokens with an "Edit" link that jumps back to that dimension. Any picks whose `moodTags` do *not* include the root mood are flagged with a neutral notice: *"Your color pick isn't tagged for 'minimal' — is that intentional?"* Submit button label: **"Write preference_vector.json"**.
6. **Success screen.** Shows the path written and the note *"You can close this tab."* The page fires `POST /shutdown`, the server exits, and the CLI prints `✓ wrote preference_vector.json` to the terminal and returns exit code 0.

## 5. Rendering Strategy per Dimension

All rendering is static HTML/CSS — no canvas, no images, no remote font fetches.

- **overall_style / mood** — 300×180 card showing a hero-like layout (headline + 2 lines of body + a button) styled with the mood's own tokens.
- **color_direction** — 3 side-by-side 80×80 swatches (bg / text / accent) with hex labels below.
- **typography** — "The quick brown fox" at 32px + "Body text sample" at 16px in the option's actual font family, with a web-safe fallback.
- **component_style** — a real `<button>` and a real `<div>` card with the option's radius/shadow/border applied.
- **layout_spacing** — a mini hero mockup (bg + title + subtitle + cta) with the option's actual padding; a caption below reads e.g. *"padding: 48–96 px"*.
- **detail_elements** — a small list of inline-SVG line-icon stubs, or an explicit "No emoji" label for absent-style options.
- **motion** — a button whose hover transition uses the option's actual duration and easing; label reads *"hover me"*. Motion is recorded in the JSON but has no parser extractor in v1.

## 6. Server Contract

| Route            | Method | Request               | Response                                                  |
| ---------------- | ------ | --------------------- | --------------------------------------------------------- |
| `/`              | GET    | —                     | `text/html` (the SPA, ~200 lines)                         |
| `/choices.json`  | GET    | —                     | `application/json` (serialized `CHOICES`)                 |
| `/submit`        | POST   | `{mood, picks}`       | `200 {ok:true, path}` on success, `400 {error}` on invalid body |
| `/shutdown`      | POST   | —                     | `200 {ok:true}` then `process.exit(0)` on next tick       |

**Payload shape for `/submit`:**

```ts
interface SubmitPayload {
  mood: Mood;
  picks: {
    overall_style: string;
    color_direction: string;
    typography: string;
    component_style: string;
    layout_spacing: string;
    detail_elements: string;
    motion: string;
  };
}
```

**Server-side assembly:** For each dimension, look up the chosen option by id, then build a `PreferenceVector.selections[dim]` entry as `{choice: option.id, source_refs: option.sourceRefs, notes: option.notesTemplate}`. Stamp `profile_name: "local"`, `scope: "project"`, `created_at`/`updated_at` with `new Date().toISOString()`. Validate via `PreferenceVectorSchema.parse`. On validation failure, return `400` with the zod issue list.

**Atomic write:** write to `./preference_vector.json.tmp`, `fs.rename` to final path. No partial files visible if the process dies mid-write.

## 7. Error Handling

- **Port already in use.** Retry on a new random port up to 10 times; if all fail, exit with a clear message.
- **Browser fails to open.** The CLI still prints the URL so the user can copy-paste it manually. Server keeps running.
- **User closes tab before submit.** Server has a 15-minute inactivity timeout; on timeout, prints *"no submission received"* and exits with code 1.
- **POST /submit body invalid.** Server responds `400` with a zod error list. SPA shows an inline banner on the review screen. User stays put; picks are preserved.
- **File write fails** (EACCES, ENOSPC, etc.). Server responds `500` with the error message. Atomic rename ensures no partial file is left behind. User sees the error in the browser; CLI exits nonzero on shutdown.
- **Existing `preference_vector.json`.** Not an error. Warned at the welcome screen and silently overwritten on submit after an explicit user click.

## 8. Testing Strategy

### Unit tests (vitest)

- **`choices.test.ts`**
  - Every option's `notesTemplate` round-trips through `parsePreferenceVector` without zod errors.
  - Every option's declared `tokens` are consistent with the checks emitted from its `notesTemplate`.
  - Every dimension has ≥ 4 options.
  - Every option has ≥ 1 `moodTag`.
- **`writer.test.ts`**
  - Given a valid `{mood, picks}` payload, assembles a `PreferenceVector` that passes `PreferenceVectorSchema.parse`.
  - Writes atomically (asserts no `.tmp` file left behind on success).
  - Rejects a payload referencing an unknown option id.
- **`server.test.ts`** (uses Node `http.request` against an in-process server)
  - `GET /` returns 200 with an HTML body containing all 7 dimension labels.
  - `GET /choices.json` returns 200 with a body that parses as the `CHOICES` shape.
  - `POST /submit` with a good payload returns 200 and produces the file on disk.
  - `POST /submit` with a bad payload returns 400 and does not touch the filesystem.
  - `POST /shutdown` returns 200 and the process exits shortly after.

### Integration test

- **`init-pipeline.test.ts`** — takes a hard-coded `{mood, picks}` payload, calls the writer directly to produce a `preference_vector.json` in a temp dir, then feeds that JSON into the existing `runPipeline` with the fixture HTML, and asserts the resulting report contains the checks derivable from the picked options (e.g., a color exact check for the picked palette's background).

### Not tested in v1

- Actual browser rendering / visual fidelity (manual verification during development).
- Cross-platform `open.ts` behavior (manual verification on macOS; linux/win32 are best-effort).

## 9. Taste-Testable Invariant

After `init.ts` writes the file, the resulting `preference_vector.json` produces checks that are deterministically derivable from the picked options. This means **`choices.ts` *is* the source of truth** for what gets graded, round-tripping through the notes parser verbatim. The integration test locks this invariant.

## 10. Commit Sequence (preview for planning phase)

1. `choices.ts` with all ~40 options + unit tests asserting parser round-trip.
2. `writer.ts` + tests.
3. `server.ts` with `GET /choices.json` and `POST /submit`, no HTML yet.
4. `render.ts` with the welcome screen and the mood (dimension 1) screen.
5. Dimension pages 2–7 (batched into one or two commits).
6. Review screen with edit links and compatibility notices.
7. Success screen + `POST /shutdown` flow.
8. `init.ts` entry point + `open.ts` cross-platform opener.
9. `init-pipeline.test.ts` end-to-end integration test.

Each commit lands with green tests and green typecheck. No commit depends on code that hasn't landed yet.
