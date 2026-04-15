# test-site

Hand-authored pages for dogfooding the TDDesign grader against the v0
preference vector (`tests/fixtures/preference_vector.json`).

- `index.html` — realistic landing page that grades 6/6 green.
- `broken.html` — deliberate violations (wrong bg, tight hero padding, emoji).

Run the grader:

```
npx tsx tddesign/cli/taste-check.ts tests/fixtures/preference_vector.json tests/fixtures/task.txt test-site/index.html
npx tsx tddesign/cli/taste-check.ts tests/fixtures/preference_vector.json tests/fixtures/task.txt test-site/broken.html
```
