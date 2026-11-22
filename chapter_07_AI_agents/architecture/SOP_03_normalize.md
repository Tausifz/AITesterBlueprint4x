# SOP_03 — Normalize

**Goal:** raw issue JSON → `ticket.json` (transport-agnostic contract), with `description_markdown` preserving structure.
**Tool:** `tools/adf_flatten.py` (ADF → markdown), `tools/normalize.py` (raw → ticket.json).

## Inputs
- Raw issue JSON (SOP_01 output). REST gives ADF; MCP gives Markdown directly.

## Steps
1. If `description` is a `dict` with `"type": "doc"` → it is ADF → flatten to markdown (preserve headings, bullets, tables, code, panels).
2. If it is already a `str` → use as-is (MCP path).
3. Map every field into the `ticket.json` shape (see `LLM.md` §1.2).
4. `sprint_end_date`: if absent → `null` (never invent).

## Edge cases (must be tested)
- empty `description`
- tables, code blocks, nested lists, media nodes, emoji nodes
- `<renderedFields.description>` HTML is a cross-check only — strip before any LLM call.

## Critical rule
The flattener must emit **markdown**, not a text blob. Losing a bullet boundary here silently drops a requirement before the LLM ever sees it.
