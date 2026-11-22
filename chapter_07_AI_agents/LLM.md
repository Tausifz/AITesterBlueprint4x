# LLM.md — Project Constitution (schemas, rules, architecture)

> This file **replaces `gemini.md`** (the generic name in `BLAST.md`). Single source of truth — `gemini.md` is **not** a separate file.
> Holds the frozen data schemas, behavioral rules, and architectural invariants. **Nothing is coded until these are confirmed.**

---

## 1. Data Schemas (JSON)

Four schemas. Each shows input/output shape, required (`✅`) vs optional, and the Jira field mapping.

### 1.1 `JiraIssueInput` — what the system accepts

```json
{
  "jira_id": "PROJ-123",           // ✅ required
  "options": {
    "include_edge_cases": true,    // optional, default true
    "include_comments": true,      // optional, default true
    "format": "markdown"           // optional: json|markdown|csv|xray
  }
}
```

| Field | Type | Req | Notes |
|---|---|---|---|
| `jira_id` | string | ✅ | Jira key, e.g. `PROJ-123` (never a JQL query in v1) |
| `options.include_edge_cases` | bool | ❌ | default `true` |
| `options.include_comments` | bool | ❌ | default `true` (AC often lives in comments) |
| `options.format` | string | ❌ | `json`\|`markdown`\|`csv`\|`xray` |

### 1.2 Normalized intermediate (`ticket.json`) — transport-agnostic

Both REST and MCP normalize into this single shape, so nothing above the fetch layer knows which transport ran.

```json
{
  "key": "PROJ-123",
  "summary": "<v3 summary>",
  "description_markdown": "<ADF flattened to markdown>",
  "issuetype": "Story",
  "status": "<status.name>",
  "priority": "<priority.name>",
  "labels": [],
  "components": [],
  "fix_versions": [],
  "acceptance_criteria": [],
  "ac_source": "customfield|description|comment|none",
  "comments": [],
  "linked_issues": [],
  "subtasks": [],
  "attachments": [],
  "parent": null,
  "epic": null,
  "sprint_end_date": null
}
```

Rules:
- `description_markdown` is **structure-preserving** (headings/bullets/tables kept).
- `acceptance_criteria` is filled by the **4-strategy resolution** (findings §4), never hardcoded.
- `ac_source` records which strategy won, for the trace file.
- `sprint_end_date` is the only honest schedule input; if absent → `null`, never invented.

### 1.3 `TestPlan` — output payload

```json
{
  "test_plan": {
    "jira_id": "PROJ-123",
    "title": "<summary>",
    "objective": "<summary + issuetype>",
    "scope": {"in": [], "out": []},
    "strategy": [{"type": "functional|api|ui|regression|security|performance|a11y", "approach": "", "justified_by": ""}],
    "risk_assessment": [{"risk": "", "likelihood": "H|M|L", "impact": "H|M|L", "mitigation": ""}],
    "environment_and_data": {},
    "entry_criteria": [],
    "exit_criteria": [],
    "test_cases": [],
    "traceability": {"matrix": [], "uncovered_requirements": []},
    "automation_backlog": [],
    "assumptions": [],
    "dependencies": [],
    "open_questions": []
  }
}
```

### 1.4 `TestCase`

```json
{
  "id": "TC-001",                       // ✅ unique, deterministic
  "requirement_id": "PROJ-123",         // ✅ maps to Jira key (v1)
  "title": "",                          // ✅
  "type": "functional|api|ui|regression|security|performance|a11y",
  "priority": "P0|P1|P2|P3",
  "preconditions": [],
  "steps": [{"action": "", "expected": ""}],   // expected is ⚠ required-verifiable
  "test_data": {},
  "automation_candidate": true,         // default false
  "tags": [],
  "source_field": "description",        // traceability hook
  "assumption": null                    // null | "ASSUMPTION: ..."
}
```

| Jira field → schema field | deterministic rule |
|---|---|
| `summary` → `title` | 1:1 |
| `issuetype.name` → `type` | `Story`→`functional`, `Bug`→`regression`, `Task`→`functional`, `Epic`→`functional` (epic case handled by batch/scope, not by type string) |
| `components[]` → `scope.in[]` | 1:1 |
| `labels[]` → `tags[]` | 1:1 |
| AC field → `steps[]` / `preconditions[]` | 4-strategy |
| `sprint_end_date` → schedule | 1:1; absent → omit |
| `description_markdown` → `steps[].action` | markdown-preserving parser |

### 1.5 `TraceabilityMatrix`

```json
{
  "matrix": [
    {"requirement_id": "PROJ-123", "test_case_ids": ["TC-001"], "covered": true}
  ],
  "uncovered_requirements": []
}
```

Gate: every `requirement_id` must appear with `covered: true` and ≥1 `test_case_id`; otherwise it lands in `uncovered_requirements`.

---

## 2. Behavioral Rules

1. **Never invent** a requirement, endpoint, or business rule — emit `"UNKNOWN"` or an explicit gap.
2. **Mark every assumption** exactly as `ASSUMPTION: <statement>` — never a quiet gap-fill.
3. **Test-case style:** action/expected steps (Given/When/Then accepted when the user prefers it — see Discovery Q5).
4. **Priority scale:** `P0` blocker → `P3` nice-to-have (full scale in table below).
5. **Tone:** factual, concise, QA-professional; no marketing fluff.
6. **"Do Not" rules:** do not invent error codes, do not assume undocumented behavior, do not guess status codes, do not fabricate dates.
7. **Missing acceptance criteria:** run the 4-strategy resolution; if truly absent, record a gap and flag it — do **not** pretend there are none.
8. **Fewer high-value tests** over bloated redundant suites.
9. **Determinism:** same input + same Jira state = same output.

### Priority / severity scales

| Priority | Meaning |
|---|---|
| P0 | Blocker — ship-stopping |
| P1 | Critical |
| P2 | Major (workaround) |
| P3 | Minor / nice-to-have |

| Severity (bugs only) | Meaning |
|---|---|
| S0 | Critical (crash/data loss/security) |
| S1 | High (major broken) |
| S2 | Medium (impaired) |
| S3 | Low / cosmetic |

---

## 3. Architecture (A.N.T. 3-layer)

```
[ Layer 1 ] Architecture  →  architecture/  (markdown SOPs: techniques, risk scoring, entry/exit, edge cases)
[ Layer 2 ] Navigation    →  reasoning layer (routes requirement → SOP; never does complex work itself)
[ Layer 3 ] Tools         →  tools/         (deterministic Python scripts; atomic & testable)
```

### Planned folder structure

```
chapter_07_AI_agents/
├── architecture/    # SOPs (Layer 1)
├── tools/           # deterministic scripts (Layer 3)
├── schemas/         # JSON schema definitions (validation)
├── fixtures/        # sample Jira payloads + expected outputs
├── tests/           # test the tools
├── pages/           # (optional) UI / delivery
├── assets/          # static resources
├── .tmp/            # intermediates (gitignored)
├── .env             # secrets (gitignored)
├── task_plan.md
├── findings.md
├── progress.md
└── LLM.md           # this constitution
```

### Data flow

```
Jira ID → fetch (REST/MCP) → normalize → ticket.json
       → analyze requirements → design tests → validate (schema + gates)
       → export (format chosen in Discovery)
```

---

## 4. Architectural Invariants

1. **SOP before code (Golden Rule):** logic change → update `architecture/` SOP first.
2. **Data-first:** schema frozen before any tool.
3. **Secrets only in `.env`** — never in logs, prompts, errors, or source.
4. **Intermediates only in `.tmp/`** — never checked in.
5. **Schema is the interface:** both transports normalize to one `ticket.json`.
6. **Deterministic core:** business logic in `tools/`, not in the LLM's head.
7. **Read-only on Jira.**
8. **Reliability/coverage over speed.**

---

## 5. LLM vs. deterministic code

| Concern | Where it lives | Why |
|---|---|---|
| Fetch + normalize + ADF flatten | **deterministic `tools/`** | same input → same output; testable |
| Schema validation, dup detection, traceability | **deterministic `tools/`** (JSON-schema validators) | these are gates, not opinions |
| Requirement interpretation + test design | **LLM (Navigation layer)** | genuinely probabilistic work |
| Risk scoring / priority | **deterministic SOP rules** where formulaic; LLM only for the qualitative write-up | keep scoring reproducible |

**Rule:** the LLM proposes; the `tools/` layer verifies. A generated plan must **pass the quality gates** (next section) before it is accepted.

---

## 6. Quality Gates (a plan must pass before Stylize)

- [ ] Every requirement has ≥1 test case; no orphan test cases.
- [ ] Each test has clear, verifiable expected results.
- [ ] Positive, negative, boundary, and error-handling cases present.
- [ ] No duplicates; priorities justified by risk.

---

## 7. Discovery Answers (recorded verbatim — GATE A)

| Q | Answer |
|---|---|
| **Q1 — North Star** | "Do all three" — v1 = review-ready Markdown file per story (primary). Write-back (Jira/Confluence) and client-facing doc are v1.1 (G7/G9). |
| **Q2a — Instance** | **Jira Cloud** (`*.atlassian.net`): REST v3, Basic Auth (email + API token), ADF description. |
| **Q2b — Transport** | **Atlassian MCP** (already connected in this session). REST v3 remains the documented fallback that normalizes to the same `ticket.json`. |
| **Q2c — LLM provider** | **Groq AND Ollama** — use Groq first, fall back to Ollama if Groq fails or is exhausted. (Not "either permanently"; runtime fallback.) |
| **Q3a — AC location** | **Handle all cases** — 4-strategy resolution: custom field → description heading → comments → gap. |
| **Q3b — Comments as source** | **Description + fields only** for v1 (comments are NOT requirements in v1). |
| **Q3d — Ticket types** | **All types** (Story, Bug, Task, Epic). Epic fan-out is deferred to G8 (batch mode). |
| **Q4 — Delivery** | **Markdown** (`<KEY>-test-plan.md`). |
| **Q5 — Behavioral Rules** | **Approved** ("yes"). |
| **Q6 — Fixture ticket** | **AL-3** (`https://tausif-sheikh.atlassian.net/browse/AL-3`). |

## 8. Freeze status

- **Gate A (Discovery):** ✅ GREEN — all Q1–Q6 answered, recorded in §7.
- **Gate B (Schemas):** ✅ GREEN — the four schemas in §1 are frozen.
- **Gate C (Blueprint):** ✅ GREEN — `task_plan.md` approved 2026-11-22.

**Protocol 0 is COMPLETE.** Gates A + B + C are green; the execution lock is released. Phase 1 (Blueprint) may begin.
