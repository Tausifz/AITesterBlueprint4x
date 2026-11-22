# SOP_05 — Build Plan

**Goal:** `ticket.json` → `plan.json` via exactly ONE LLM call (prose + scope selection), schema-gated immediately.
**Tool:** `tools/plan_build.py`.

## Inputs
- `ticket.json` (post-readiness), frozen template, LLM provider (Groq-first, Ollama fallback).

## Steps
1. Construct one prompt that maps ticket facts onto the 10-section structure.
2. Call the LLM (temperature-pinned low).
3. Validate output against `plan.schema.json`; if invalid, retry once, then fail loudly.

## Scope-selection rule (locked in Blueprint)
A test `type` is included **only** if the ticket's description/labels/components/AC justify it (cite `justified_by`). Otherwise it is excluded and listed in `scope.out` with a reason. The LLM never adds a type on its own judgment.

## Edge cases
- thin ticket (should not reach here — SOP_04 gates it)
- contradictory AC
- non-English content
- oversized description (trim/paginate before the call)

## Critical rule
The LLM is the **only** probabilistic step, and its output is immediately gated by a deterministic schema validator.
