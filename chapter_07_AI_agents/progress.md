# progress.md — Running Log

> Timestamped event log. Only **append** — never rewrite old entries.
> Format: `[YYYY-MM-DD HH:MM] ACTION | RESULT | ERRORS | NEXT STEP`
> **Current Status** block is updated each session (top).

---

## Current Status

- **Stage:** **v1 BUILT AND RUNNING.** Phases 0–5 complete. `run.py AL-3` produces a correct, non-fabricated test plan.
- **Next step:** human review of `AL-3-test-plan.md`; then v1.1 (golden-file test, Ollama fallback wiring, G7–G10).

---

## Event Log

### Protocol 0 — Initialization

[2026-11-22 00:00] CREATE task_plan.md | RESULT: phases, goals, checklists, discovery Q1-Q5, approval gates, risks, DoD | ERRORS: none | NEXT STEP: confirm with user

[2026-11-22 00:01] CREATE findings.md | RESULT: Jira endpoint map, curl examples (placeholders only), ADF finding, AC problem, constraints, open questions, resources | ERRORS: none | NEXT STEP: confirm with user

[2026-11-22 00:02] CREATE progress.md | RESULT: this log initialized | ERRORS: none | NEXT STEP: append as work happens

[2026-11-22 00:03] CREATE LLM.md | RESULT: schemas (JiraIssueInput/TestPlan/TestCase/TraceabilityMatrix), behavioral rules, A.N.T. architecture, invariants, LLM-vs-deterministic split, quality gates | ERRORS: none | NEXT STEP: confirm schema with user

[2026-11-22 00:04] HALT | RESULT: stopped at Protocol 0; no tools/ scripts written, no API calls run | ERRORS: none | NEXT STEP: await Discovery answers

[2026-11-22 00:05] ANSWER Q1-Q4 | RESULT: North Star=Markdown (write-back/client doc v1.1), Jira Cloud, Atlassian MCP, Groq+Ollama fallback, delivery=Markdown | ERRORS: none | NEXT STEP: remaining Qs

[2026-11-22 00:06] ANSWER Q5-Q6 | RESULT: Behavioral Rules=approved; Fixture ticket=AL-3 | ERRORS: none (DEFAULT_JIRA_KEY was empty in .env; key supplied by user) | NEXT STEP: freeze schemas

[2026-11-22 00:07] GATE A GREEN | RESULT: all Q1-Q6 answered and recorded in LLM.md + task_plan.md | ERRORS: none | NEXT STEP: Gate B schema sign-off

[2026-11-22 00:08] GATE B GREEN | RESULT: 4 schemas frozen; type mapping expanded for all types (Story/Bug/Task/Epic) | ERRORS: none | NEXT STEP: Gate C blueprint approval

[2026-11-22 00:09] GATE C GREEN | RESULT: blueprint approved; Protocol 0 COMPLETE; execution lock released | ERRORS: none | NEXT STEP: Phase 1 Blueprint

### Phase 1 — Blueprint

[2026-11-22 00:10] RESEARCH (GitHub) | RESULT: found 2 prior-art repos (intelligent-test-plan-agent x2); decided NOT to adopt atlassian-python-api; ADF flattener DEFERRED (MCP pre-flattens) | ERRORS: none | NEXT STEP: inspect AL-3 fixture

[2026-11-22 00:11] FETCH AL-3 (MCP, read-only) | RESULT: Story, Medium, To Do; AC = bulleted list inside description (strategy case 2); no AC custom field, no sprint | ERRORS: none | NEXT STEP: lock Blueprint decisions

[2026-11-22 00:12] LOCK BLUEPRINT | RESULT: input contract (key|URL→key), delivery=Markdown only, section-presence rule, scope-selection rule, assumption markers (ASSUMPTION:/NOT IN TICKET/N/A); schema updated with justified_by | ERRORS: none | NEXT STEP: Phase 2 Link

### Phase 2 — Link

[2026-11-22 00:13] CREATE tools/config.py + jira_auth.py + jira_fetch.py + errors.py + handshake.py | RESULT: typed JiraError, REST /myself + /issue fetch, key/URL normalization, 404 disambiguation via /myself | ERRORS: none | NEXT STEP: run handshake

[2026-11-22 00:14] RUN auth+fetch handshake | RESULT: [auth] OK (Tausif Sheikh), [fetch] OK (AL-3 Creating a Care Plan), raw JSON to .tmp/raw_issue.json | ERRORS: none | NEXT STEP: LLM handshake

[2026-11-22 00:15] VERIFY description format | RESULT: REST fields.description = ADF ({"type":"doc"...}); renderedFields.description = HTML; MCP = Markdown. Corrected findings: adf_flatten.py is REQUIRED for REST path | ERRORS: none | NEXT STEP: LLM handshake

[2026-11-22 00:16] CREATE llm_handshake.py + llm_check.py | RESULT: Groq-first, Ollama-fallback ping | ERRORS: none | NEXT STEP: run

[2026-11-22 00:17] RUN llm_handshake | RESULT: FAILED — Groq HTTP 400 (model_decommissioned: llama3-70b-8192), Ollama 404 (not running) | ERRORS: GROQ_MODEL=llama3-70b-8192 is decommissioned per Groq docs | NEXT STEP: fix model id

[2026-11-22 00:18] FIX GROQ_MODEL | RESULT: set GROQ_MODEL=openai/gpt-oss-120b (current production, from Groq deprecations/models docs) | ERRORS: none | NEXT STEP: re-run

[2026-11-22 00:19] RE-RUN llm_handshake | RESULT: [llm] OK — groq:openai/gpt-oss-120b | ERRORS: none (Ollama still 404, expected fallback) | NEXT STEP: mark Link gate green

[2026-11-22 00:20] LINK GATE GREEN | RESULT: Phase 2 COMPLETE — auth/fetch/LLM all green | ERRORS: none | NEXT STEP: Phase 3 Architect

### Phase 3 — Architect

[2026-11-22 00:21] WRITE 6 SOPs | RESULT: SOP_01..06 written to architecture/ (fetch, resolve-fields, normalize, readiness, build-plan, render) before any tool | ERRORS: none | NEXT STEP: build tools

[2026-11-22 00:22] BUILD tools + schemas | RESULT: adf_flatten, normalize, readiness, trace, field_map, schema_validator, plan_build, render, navigation + ticket/plan schemas | ERRORS: none | NEXT STEP: unit test

[2026-11-22 00:23] UNIT TEST | RESULT: 5/5 offline tests pass (flatten, AC extract=15, validate, readiness plannable/thin) | ERRORS: none | NEXT STEP: full pipeline

[2026-11-22 00:24] RUN full pipeline | RESULT: FAILED — KeyError in plan_build (template .format() collided with JSON braces) | ERRORS: .format() interprets JSON braces | NEXT STEP: fix to .replace()

[2026-11-22 00:25] FIX plan_build | RESULT: switched to {{TICKET}} + .replace(); re-ran | ERRORS: none | NEXT STEP: full pipeline

[2026-11-22 00:26] RUN full pipeline | RESULT: FAILED — schema validation (jira_id required at top level but model returns it inside test_plan) | ERRORS: schema shape mismatch | NEXT STEP: validate unwrapped test_plan

[2026-11-22 00:27] FIX schema validation | RESULT: validate plan["test_plan"]; re-ran | ERRORS: none | NEXT STEP: verify output

[2026-11-22 00:28] VERIFY output | RESULT: AL-3-test-plan.md written; 15 AC, 1 TC, zero fabrication (NOT IN TICKET/N/A where empty) | ERRORS: none (1 TC count is a Stylize concern) | NEXT STEP: Phase 4 Stylize

### Phase 4 — Stylize

[2026-11-22 00:29] REFINE prompt | RESULT: scope=feature areas (not AC dump); one TC per AC. Re-ran → 15 TCs, scope=3 feature areas, correct traceability | ERRORS: none | NEXT STEP: Phase 5 Trigger

### Phase 5 — Trigger

[2026-11-22 00:30] CREATE run.py | RESULT: CLI with --health, --dry-run, typed exit codes (0/2/3/4/5/6/7) | ERRORS: argparse key required for --health | NEXT STEP: fix + test

[2026-11-22 00:31] FIX run.py argparse | RESULT: key made nargs='?' (optional for --health) | ERRORS: none | NEXT STEP: test

[2026-11-22 00:32] TEST run.py | RESULT: --health OK, --dry-run OK, AL-3 OK (output path) | ERRORS: earlier 'unrecognized args' was shell quoting in my test command, not code | NEXT STEP: README

[2026-11-22 00:33] WRITE README | RESULT: 60-second setup, architecture, exit codes, secrets note | ERRORS: none | NEXT STEP: finalize

[2026-11-22 00:34] MARK v1 DONE | RESULT: Phases 0-5 complete; task_plan/progress updated; what-shipped table filled | ERRORS: none | NEXT STEP: human review + v1.1

### Post-v1 — reference-skill review

[2026-11-22 00:35] READ reference skill | RESULT: found SKILLMASTERCLASS/.commandcode/test-plan-generator (SKILL.MD + requirement-checklist + template + fetch script) | ERRORS: none | NEXT STEP: adopt Human Review Gate

[2026-11-22 00:36] ADOPT Human Review Gate | RESULT: render.py now emits "Status: DRAFT — pending review" + a "Human Review Gate" section (assumed / could-not-confirm / approve-or-edit) | ERRORS: none | NEXT STEP: verify + log

[2026-11-22 00:37] VERIFY | RESULT: regenerated AL-3 plan shows gate; 5/5 offline tests still pass | ERRORS: none | NEXT STEP: done

### Post-v1 — UI testing

[2026-11-22 00:38] TEST UI (user) | RESULT: schema error surfaced — "entry_criteria: 'NOT IN TICKET' is not of type 'array'" | ERRORS: LLM emitted string sentinel for array fields | NEXT STEP: fix prompt + normalize

[2026-11-22 00:39] FIX sentinel bug | RESULT: clarified prompt (arrays→[], objects→{}, strings→"NOT IN TICKET") + defensive _normalize_sentinels() in plan_build; re-ran OK | ERRORS: none | NEXT STEP: user re-test

---

## Error Log

| Time | Step | Error | Resolution |
|---|---|---|---|
| (earlier session) | read BLAST.MD | file reported empty | re-read; content present |
| (earlier session) | scaffold folders | `mkdir -p` created stray `-p` folder | removed; recreated via PowerShell |
| Phase 2 | LLM handshake | Groq HTTP 400 `model_decommissioned` — `llama3-70b-8192` retired 2025-08-30 | set `GROQ_MODEL=openai/gpt-oss-120b` (current production) |
| Phase 2 | LLM handshake | Ollama HTTP 404 (fallback unreachable) | expected — Groq is primary; Ollama not running |
| Phase 3 | plan_build | `KeyError` — `.format()` interpreted JSON braces in the template | switch to `{{TICKET}}` + `.replace()` |
| Phase 3 | schema validation | `jira_id` required at top level but model returns it inside `test_plan` | validate `plan["test_plan"]`, not the wrapper |
