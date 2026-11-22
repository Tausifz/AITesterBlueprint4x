# SOP_02 — Resolve Fields (Acceptance Criteria)

**Goal:** locate Acceptance Criteria on a per-site basis, never hardcode a `customfield_*` id.
**Tool:** `tools/field_map.py`.

## Inputs
- Raw issue JSON (from SOP_01), plus `expand=names` map.

## Strategy (4-way, in order — cheapest first)
1. **Custom field:** use `expand=names` to find any field whose human name matches `acceptance|criteria|definition of done`. If found, read that field's value.
2. **Description heading:** a bulleted list under a heading containing "criteria" / "must satisfy" inside `description`.
3. **Comment:** (v1 uses description+fields only, per Q3b — so this is **not** exercised in v1, but the branch is named for v1.1).
4. **Gap:** record `ac_source: "none"` and an explicit gap — never invent.

## Output
- `acceptance_criteria: []` and `ac_source: customfield|description|comment|none`.

## Edge cases
- AC in a custom field whose id differs per site → resolve at runtime, cache result.
- AC genuinely absent → `ac_source: none` + gap (do NOT report "no AC" silently as if it were fact).
- AC split across description and comment → prefer the higher-priority strategy that yields data.
