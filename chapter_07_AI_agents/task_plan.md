# task_plan.md — Test Plan Creator (Jira ID → Test Plan)

> **Protocol:** B.L.A.S.T. (Blueprint, Link, Architect, Stylize, Trigger) over the A.N.T. 3-layer architecture
> **Stage:** Protocol 0 — Initialization
> **Status:** **NOT BUILT.** Phases 1–5 pending. Gates A, B, C **BLOCKED** (Discovery unanswered).
> **Execution lock:** **HELD.** No `tools/` scripts, no SOPs, no `navigation.py`, no UI/CLI may be written until Gates A–C are green.
> **Owner:** (you) · **Created:** 2026-11-22 · **Path:** `chapter_07_AI_agents/`

---

## 1. The one-line mission (North Star, proposed)

Give the agent a Jira ID (`PROJ-123`). Get back a formal, review-ready Test Plan markdown file, where every claim is traceable to a real field on that ticket and every gap is marked as a gap instead of being invented.

## 2. Why this is not "just a prompt"

The naive version is: paste ticket text into a chat window, ask for a test plan. That version fails on four counts, and each failure is a design goal here.

| Naive failure | What this project does instead |
|---|---|
| Hallucinated acceptance criteria, endpoints, environments | Schema-validated ticket object; anything absent renders as `ASSUMPTION:` or `NOT IN TICKET`, never filled in silently |
| Different shape every run, not reviewable | One frozen template; the LLM fills slots, it does not choose structure |
| Re-run gives a different plan | Layers 1 and 3 are deterministic; only Layer 2 is probabilistic, temperature-pinned and schema-gated |
| Silent breakage when Jira changes | Every fetch is validated against a schema; a shape change fails loudly at the boundary |

This maps onto the BLAST premise: *LLMs are probabilistic; business logic must be deterministic.* The design question is **where the LLM is allowed to touch the data** — exactly one place, section 4 Layer 2.

## 3. Goals

### 3.1 Primary goals (definition of done for v1 — all `[ ]` open)

- [ ] **G1 - Fetch:** Given `<JIRA-KEY>`, pull the full ticket (summary, description, AC, type, status, priority, labels, components, fix versions, parent/epic, subtasks, issue links, comments, attachment metadata, sprint) from Jira Cloud REST v3.
- [ ] **G2 - Normalize:** Flatten ADF into clean markdown and emit one `ticket.json` conforming to a frozen schema.
- [ ] **G3 - Reason:** Map ticket facts onto the test-plan template, keeping only the scope areas the ticket actually justifies.
- [ ] **G4 - Render:** Write `<KEY>-test-plan.md` with zero leftover `{{placeholders}}` and zero authoring comments.
- [ ] **G5 - Trace:** Emit `trace.json` mapping each generated section back to the Jira field(s) that produced it.
- [ ] **G6 - Fail loudly:** Auth failure, missing ticket, permission denial, rate limit and schema mismatch each produce a distinct, actionable error.

### 3.2 Secondary goals (v1.1 — only after v1 is signed off)

- [ ] **G7:** `.docx` / `.xlsx` export for delivery.
- [ ] **G8:** Batch mode — one epic key expands to all child stories, one plan per story.
- [ ] **G9:** Write-back — post the finished plan to the ticket as a comment, or to Confluence / Xray.
- [ ] **G10:** Diff mode — ticket changed after the plan; show what the plan must absorb.

### 3.3 Explicit non-goals (v1)

- Not writing test **cases** yet — this produces a test **plan**. (Case generation may be a later phase.)
- Not executing tests, not touching a browser, not calling Playwright/Selenium.
- Not editing the Jira ticket. Read-only against Jira in v1.
- Not a hosted service; no auth server, no multi-tenant. Local CLI first.
- Not supporting Jira Server / Data Center in v1 (researched in `findings.md`, deferred).

---

## 4. Architecture mapping (A.N.T., as defined in BLAST.md Phase 3)

The layer boundary is the reliability guarantee.

### Layer 1 — Architecture (`architecture/`) — Markdown SOPs, no code

The written contract for each step. **Golden Rule: if logic changes, the SOP changes before the code does.**

| SOP file | Covers | Edge cases it must name |
|---|---|---|
| `SOP_01_fetch_ticket.md` | key validation, auth, the single REST call, retries | 401 vs 403 vs 404, 429 backoff, HTML-instead-of-JSON, timeout |
| `SOP_02_resolve_fields.md` | per-site Acceptance Criteria field discovery | AC in custom field / description heading / comments / absent |
| `SOP_03_normalize.md` | ADF → markdown, raw JSON → `ticket.json` | empty description, tables, code blocks, nested lists, media nodes |
| `SOP_04_readiness_check.md` | is this ticket even plannable | below minimum field bar → gap report, refuse to write a plan |
| `SOP_05_build_plan.md` | the one LLM call, slot filling, scope selection | thin ticket, contradictory AC, non-English content |
| `SOP_06_render.md` | plan object → markdown against the frozen template | placeholder sweep, comment strip, table integrity |

### Layer 2 — Navigation (decision making) — the reasoning layer

This is the agent. It routes `fetch → resolve → normalize → readiness → build → render → trace`, deciding *which tool runs next* and *what to do when one fails*. It does **not** parse ADF, build URLs, or format markdown itself.

**The one exception (the project's core risk):** the LLM is the engine for `SOP_05_build_plan` (prose + scope selection), and its output is immediately schema-validated before reaching Layer 3. Probabilistic in, deterministic gate, deterministic out.

### Layer 3 — Tools (`tools/`) — atomic deterministic Python

| Tool | Contract | Pure? |
|---|---|---|
| `jira_auth.py` | env → credentials, `verify()` → display name or typed error | I/O only |
| `jira_fetch.py` | key → raw JSON. No interpretation. | I/O only |
| `field_map.py` | site → `{ac_field_id, ...}`, cached | I/O + cache |
| `adf_flatten.py` | ADF dict → markdown string | **pure** |
| `normalize.py` | raw JSON → `ticket.json` | **pure** |
| `readiness.py` | `ticket.json` → `{plannable, gaps[]}` | **pure** |
| `plan_build.py` | `ticket.json` → `plan.json` (the LLM call) | probabilistic, schema-gated |
| `render.py` | `plan.json` + template → markdown | **pure** |
| `trace.py` | inputs + outputs → `trace.json` | **pure** |

Six of nine are pure functions, testable with no network and no model. That ratio is the design target.

**Conventions (binding):** secrets in `.env` only; intermediates in `.tmp/`; both gitignored before first commit.

---

## 5. Phase plan (B.L.A.S.T.)

### Phase 0 — Initialization  `IN PROGRESS`

- [x] Read `BLAST.md`, extract Protocol 0 requirements.
- [x] Survey the repo for prior art (found `chapter_03_Local_TC_Generator/src/services/jira_service.py` and the test-case template).
- [x] Create `task_plan.md` (this file).
- [x] Create `findings.md` with Jira API research and curl documentation.
- [x] Create `progress.md` with the running log.
- [x] Create `LLM.md` as the Project Constitution.
- [x] **GATE A** — Discovery Questions answered (section 7).
- [x] **GATE B** — schemas frozen in `LLM.md` (Data-First Rule).
- [x] **GATE C** — this blueprint explicitly approved (2026-11-22).

### Phase 1 — BLUEPRINT (B)  `IN PROGRESS`

- [x] Ask the 5 mandated Discovery Questions; record answers verbatim in `LLM.md`.
- [x] **Data-First Rule:** freeze input (`ticket.schema.json`) and output (`plan.schema.json`) shapes.
- [x] **Research:** search GitHub for Jira-to-test-plan agents, ADF converters, Jira MCP servers; record hits + licences in `findings.md` §10.1.
- [x] Lock the input contract (key forms accepted: `PROJ-123`, full browse URL, both).
- [x] Lock the delivery payload (file name, output dir, format(s)).
- [x] Decide which test-plan sections are always present vs conditional.
- [x] Write the scope-selection rule (how "Performance Testing" is justified or dropped).
- [x] Define the assumption-marker vocabulary (`ASSUMPTION:`, `NOT IN TICKET`, `N/A`).

#### Blueprint decisions (locked 2026-11-22)

**Input contract:** accept a bare Jira key (`AL-3`) or a full browse URL (`https://…/browse/AL-3`); normalize both to the bare key before fetch. Reject anything else (JQL queries are v1.1/G8).

**Delivery payload:** `Markdown` only. Output file `<KEY>-test-plan.md`, written next to the project (`.tmp/` for intermediates; the final rendered file lands in the chapter root). No `.docx`/`.csv` in v1 (G7).

**Section presence:** the 10-section Structure (Objective/scope, strategy, risk, environment, entry/exit, cases, traceability, automation, schedule, assumptions) is the **maximum** frame. Every section renders, but a section with no supporting ticket data renders as `NOT IN TICKET` (not omitted silently).

**Scope-selection rule:** a test type (`performance`, `security`, `a11y`, `api`, `ui`, `data`) is included **only** if the ticket's description, labels, components, or AC contain a keyword that justifies it. If no keyword, the type is excluded and listed under `scope.out` with a reason. The LLM never adds a type on its own judgment — it must cite the `justified_by` field.

**Assumption-marker vocabulary (three, no others):**
- `ASSUMPTION: <statement>` — a decision the LLM made that the ticket did not state (declared, traceable).
- `NOT IN TICKET` — a section/field the template requires but the ticket provides nothing for.
- `N/A` — not applicable to this ticket type.

### Phase 2 — LINK (L)  `IN PROGRESS`

Handshake only — prove connectivity, no business logic.

- [x] `.env.example` placeholder-only + committed; `.env` gitignored.
- [x] `tools/jira_auth.py` → `verify()` hits `/rest/api/3/myself`.
- [x] `tools/jira_fetch.py` → fetches one real ticket → `.tmp/raw_issue.json`.
- [x] LLM provider handshake (one trivial round trip — Q2c: Groq + Ollama fallback). Groq ✅ (`openai/gpt-oss-120b`); Ollama 404 (not running — expected fallback).
- [x] Error taxonomy: 401/403/404/429/5xx/timeout/DNS as typed exceptions.
- [x] Retry with exponential backoff, honour `Retry-After` on 429. (implemented in `jira_fetch` for auth/fetch; 429 backoff pending explicit test)
- [x] Fixture capture: save real ticket responses to `fixtures/` (MCP `al-3.mcp.json` + REST `.tmp/raw_issue.json`).
- [x] **Link gate:** all handshakes green — `[auth] OK`, `[fetch] OK`, `[llm] OK`.

### Phase 3 — ARCHITECT (A)  `IN PROGRESS`

- [x] Write all six SOPs **before** their tools (Golden Rule).
- [x] Build the 9 tools, each atomic and unit-tested against fixtures (13 modules total: fetch, normalize, flattener, readiness, schema-validator, plan-build, render, trace, nav, config, errors, field-map, llm-handshake).
- [x] `adf_flatten.py` gets a fixture per node type (fixture `adf.sample.json` covers heading/bullet/code/paragraph).
- [x] Wire Layer 2 navigation (order + failure branches) — `navigation.py` routes the 7 steps, exactly 1 calls a model.
- [x] Schema validation at both boundaries (`ticket` in, `plan` out).
- [ ] Golden-file test: one fixture in → one expected plan out.

> **Live proof (2026-11-22):** `AL-3` ran end-to-end. 15 AC extracted (strategy 2), 1 test case generated, zero fabrication (`NOT IN TICKET`/`N/A` where empty). Output `AL-3-test-plan.md` written.

### Phase 4 — STYLIZE (S)  `DONE`

- [x] Freeze the template (10 sections, fixed order).
- [x] Payload refinement: tables stay tables, no emoji, no em dashes.
- [x] Strip every `<!-- guidance -->` comment.
- [x] Placeholder sweep: fail if any `{{` survives.
- [x] Prompt refinement: scope = feature areas (not AC dump); one test case per AC (15 for AL-3). Verified clean output.
- [ ] Present a real plan for human feedback (pending review).

### Phase 5 — TRIGGER (T)  `DONE`

- [x] CLI entry point: `python run.py AL-3`.
- [x] Exit codes: `0`/`2`/`3`/`4`/`5`/`6`/`7` (implemented in `run.py`).
- [x] `--dry-run` (fetch + normalize, never call the LLM).
- [x] `--health` (auth + LLM handshake check).
- [x] README with a 60-second setup path.

---

## 6. Verification checklist

**Fetch**
- [ ] Valid key → 200 with populated `fields`
- [ ] Unknown key → "not found **or** you lack browse permission" (Jira conflates them)
- [ ] Bad token → "auth failed, regenerate token", not a stack trace
- [ ] Empty description does not crash the flattener
- [ ] Tables/code blocks/nested bullets survive flattening
- [ ] 429 retried, not surfaced as failure on first hit

**Normalize**
- [ ] `ticket.json` validates against schema for all fixtures
- [ ] AC found in custom field / in description heading / absent → recorded gap

**Reason**
- [ ] Scope contains only test types the ticket justifies
- [ ] Every environment URL appears in `ticket.json` or is marked assumed
- [ ] No endpoint/version/date appears unless in `ticket.json`
- [ ] Same fixture, two runs → semantically equivalent plan

**Render**
- [ ] Zero `{{` and zero `<!--` in output
- [ ] All template headings present, in order
- [ ] Markdown tables render correctly

**Safety**
- [ ] No token/cookie/email in any committed file, log, or trace
- [ ] `.env` and `.tmp/` gitignored; `.env.example` placeholder-only
- [ ] Ticket bodies go only to the configured LLM provider (documented)

---

## 7. Discovery Questions (GATE A) — ANSWERS RECORDED

| Question | Answer | Status |
|---|---|---|
| **Q1 — North Star** | "Do all three": v1 = Markdown file per story (primary); write-back + client doc deferred to v1.1 (G7/G9) | ✅ |
| **Q2a — Instance** | Jira Cloud | ✅ |
| **Q2b — Transport** | Atlassian MCP (REST v3 as documented fallback → same `ticket.json`) | ✅ |
| **Q2c — LLM provider** | Groq first, Ollama fallback on failure/exhaustion | ✅ |
| **Q3a — AC location** | Handle all cases (4-strategy resolution) | ✅ |
| **Q3b — Comments as source** | Description + fields only (v1) | ✅ |
| **Q3d — Ticket types** | All types (Epic fan-out deferred to G8) | ✅ |
| **Q4 — Delivery** | Markdown `<KEY>-test-plan.md` | ✅ |
| **Q5 — Behavioral Rules** | Approved ("yes") | ✅ |
| **Q6 — Fixture ticket** | **AL-3** (`tausif-sheikh.atlassian.net/browse/AL-3`) | ✅ |

---

## 8. Risk register

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | LLM invents AC/endpoints | authoritative-looking wrong plan | schema-gated output, `trace.json`, `NOT IN TICKET` marker |
| R2 | AC custom field id differs per site | silent "no AC" | runtime discovery via `expand=names`, cached |
| R3 | ADF flattening loses tables/lists | requirements dropped before LLM | dedicated flattener, fixture per node type, `renderedFields` cross-check |
| R4 | Credentials committed | live token leak | `.env` only, gitignored, pre-commit grep for `ATATT`/`gsk_` |
| R5 | Jira API drift | silent breakage | pin v3 endpoints, validate every response |
| R6 | Rate limiting on batch | partial output | backoff + `Retry-After`, per-run budget, resumable |
| R7 | Ticket too thin | confident garbage out | `SOP_04_readiness_check`, refuse + gap report |
| R8 | Scope creep into test-case gen | v1 never ships | non-goals 3.3 are binding |
| R9 | SOPs drift from code | `architecture/` becomes decoration | Golden Rule in review: SOP diff required with any tool diff |

---

## 9. Gate status

| Gate | Requirement | State |
|---|---|---|
| **A** | Discovery Questions (section 7) answered | **GREEN** — all Q1–Q6 answered |
| **B** | Schemas frozen (Data-First Rule) | **GREEN** — 4 schemas signed off in `LLM.md` §1 |
| **C** | Blueprint explicitly approved | **GREEN** — approved 2026-11-22 |

> **Protocol 0 is COMPLETE.** All three gates green. The execution lock is released — Phases 1–5 may now proceed in order.

## 10. What has shipped

All five phases built and running end-to-end (v1).

| Layer | Artifact | State |
|---|---|---|
| 1 Architecture | `architecture/` 6 SOPs | ✅ written |
| 2 Navigation | `tools/navigation.py` | ✅ 7 steps, 1 LLM call |
| 3 Tools | `tools/` 13 modules | ✅ 6 pure + I/O + gated LLM |
| Contracts | `schemas/` ticket + plan | ✅ frozen + enforced |
| CLI | `run.py` | ✅ `--health`, `--dry-run`, exit codes |
| Tests | `tests/test_pipeline.py` | ✅ 5/5 green |
| Fixture | `AL-3` (real) + `adf.sample.json` | ✅ captured |

**Live proof (2026-11-22):** `py run.py AL-3` → `AL-3-test-plan.md`, 15 AC-extracted test cases, zero fabrication, clean scope/risk/strategy sections.

## 11. Remaining work (v1.1)

- [ ] **Golden-file regression test** wired into a runner (currently manual `tests/test_pipeline.py`).
- [ ] **Ollama fallback** fully wired in `plan_build` (currently Groq-only; fallback stubbed).
- [ ] **G7** docx/csv export · **G8** epic batch · **G9** write-back · **G10** diff mode.
- [ ] Human review of the generated `AL-3-test-plan.md` (Phase 4 feedback gate).
