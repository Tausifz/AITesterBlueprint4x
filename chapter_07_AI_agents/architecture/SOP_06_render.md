# SOP_06 — Render

**Goal:** `plan.json` → `<KEY>-test-plan.md` against the frozen template, with zero placeholders and zero guidance comments.
**Tool:** `tools/render.py`.

## Inputs
- `plan.json` (validated), template (14/10 sections in fixed order).

## Steps
1. Fill template slots from `plan.json`.
2. Strip every `<!-- guidance -->` comment.
3. Placeholder sweep: fail if any `{{` survives.
4. Emit `<KEY>-test-plan.md`.

## Edge cases
- a section with no supporting data → render `NOT IN TICKET` (never omit silently).
- markdown tables must render (no broken pipes).
- no emoji, no em dashes in the deliverable.

## Critical rule
The renderer is **pure** — same `plan.json` + template always yields the same file.
