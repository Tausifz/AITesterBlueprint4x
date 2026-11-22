# SOP_04 — Readiness Check

**Goal:** decide whether a ticket is plannable; refuse to write a plan from a too-thin ticket.
**Tool:** `tools/readiness.py`.

## Inputs
- `ticket.json` (SOP_03 output).

## Output
- `{ plannable: bool, gaps: [] }`.

## Minimum bar (all required to be plannable)
- non-empty `summary`
- non-empty `description_markdown`
- a resolved `issuetype`

## Rule
- Below the bar → return a **gap report**, do NOT build a plan. This is by design: a thin ticket yields garbage-out, which is worse than no plan.

## Edge cases
- empty description but rich comments → still not plannable in v1 (comments are out of scope, Q3b).
- unknown issuetype → still plannable (generic `functional` fallback), but note it.
