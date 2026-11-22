# findings.md — Research, Discoveries, Constraints

> **Project:** Jira → Test Plan Creator
> **Stage:** Protocol 0 research pass (documentation only — no API calls executed)
> **Rule:** everything is verified against a real repo artifact, or marked `UNVERIFIED` and promoted to an Open Question. **No guessing. No real secrets — placeholders only.**

---

## 1. Prior art found in this repository

The repo already solves part of this problem. Paths verified against disk (earlier passes cited `src/jira_client.py`/`src/config_store.py` — those do **not** exist; the real layout is below).

| Artifact | Real path | What it gives us |
|---|---|---|
| Working Jira client | `chapter_03_Local_TC_Generator/src/services/jira_service.py` | v3 fetch + Basic auth + naive ADF flattener + typed errors |
| Credential loader | `chapter_03_Local_TC_Generator/src/config/config_manager.py` | `.env` → frozen `AppConfig` |
| Test-case template | `chapter_03_Local_TC_Generator/templates/TestCase_creator.md` | formats + anti-hallucination rules |
| Prompt assembly | `chapter_03_Local_TC_Generator/src/services/test_case_generator.py` | ticket dict → prompt |
| LLM providers | `src/services/ollama_service.py`, `groq_service.py` | two providers behind a `Protocol` |
| Build plan | `chapter_03_Local_TC_Generator/src/plan.md` | reusable phase plan |

**Key prior-art bugs (read from code, not run):**
- `acceptance_criteria` is **hard-coded** to `"Not specified"` (`jira_service.py:60`) — no AC extraction at all.
- `_text()` ADF flattener drops **all structure** (headings, bullets, tables) — joins text nodes with spaces.
- `/myself` disambiguation already exists in `test_connection()` but isn't wired into the 404 auth path.

Why these matter: the whole project reifies fixing these — deterministic AC extraction and structure-preserving ADF flattening.

---

## 2. How we fetch data from Jira

Primary transport: **Jira Cloud REST v3 + Basic Auth (email + API token)**. Server/Data Center differences noted inline.

### Endpoint map (need → endpoint)

| What we need | Endpoint / source | Notes |
|---|---|---|
| Issue details | `GET /rest/api/3/issue/{issueIdOrKey}` | summary, description, status, priority, labels, components, fixVersions, parent/epic |
| Custom fields (incl. AC) | same issue call + `expand=names`, or `GET /rest/api/3/field` | id → human-name map |
| Readable description | `?fields=description&expand=renderedFields` | HTML cross-check of ADF |
| Linked issues | `issuelinks` field of the issue | included in main fetch |
| Subtasks | `subtasks` field of the issue | included in main fetch |
| Comments | `GET /rest/api/3/issue/{issueIdOrKey}/comment` | requirements often live here |
| Attachments | `attachment` field of the issue | metadata; download separately |
| Auth check | `GET /rest/api/3/myself` | always first; resolves 401 vs wrong URL |
| Children of epic (batch) | `GET /rest/api/3/search/jql` | token-paginated (`nextPageToken`) |

### Auth (Jira Cloud)

- Basic Auth: `-u "$JIRA_EMAIL:$JIRA_API_TOKEN"` (email + API token).
- API token created at `id.atlassian.com` → Security → API tokens.
- **Server/Data Center:** uses PAT bearer (`Authorization: Bearer $JIRA_PAT`) and `/rest/api/2/...`.

---

## 3. Curl / request examples (documentation only — do NOT run in Protocol 0)

All use placeholders. `set -a; source .env; set +a` loads `$JIRA_BASE_URL`, `$JIRA_EMAIL`, `$JIRA_API_TOKEN`.

### 3.1 Auth check (always first)
```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Accept: application/json" \
  "$JIRA_BASE_URL/rest/api/3/myself" | jq '{accountId, displayName}'
```
`401` = bad email/token; HTML login page = `JIRA_BASE_URL` points at the web app.

### 3.2 Fetch a single issue (fields + names + rendered)
```bash
KEY=PROJ-123
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Accept: application/json" -G \
  "$JIRA_BASE_URL/rest/api/3/issue/$KEY" \
  --data-urlencode 'fields=summary,description,issuetype,status,priority,labels,components,fixVersions,parent,subtasks,issuelinks,attachment,environment' \
  --data-urlencode 'expand=renderedFields,names' \
  | tee raw_issue.json
```
Why `-G --data-urlencode`: field lists contain commas/parens; hand-built query strings cause silent 400s.

### 3.3 Custom field discovery (id → name)
```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Accept: application/json" \
  "$JIRA_BASE_URL/rest/api/3/field" \
| jq -r '.[] | select(.name | test("(?i)acceptance|criteria|definition of done")) | "\(.id)\t\(.name)"'
```

### 3.4 Comments
```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Accept: application/json" -G \
  "$JIRA_BASE_URL/rest/api/3/issue/$KEY/comment" \
  --data-urlencode 'maxResults=50' --data-urlencode 'orderBy=-created'
```

### 3.5 Attachments (download; note `-L` for signed redirect)
```bash
curl -sL -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -o spec.pdf \
  "$JIRA_BASE_URL/rest/api/3/attachment/content/10001"
```

### 3.6 Epic children (token-paginated JQL)
```bash
curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" -H "Accept: application/json" -G \
  "$JIRA_BASE_URL/rest/api/3/search/jql" \
  --data-urlencode 'jql=parent = PROJ-1 ORDER BY created ASC' \
  --data-urlencode 'fields=summary,issuetype,status' \
  --data-urlencode 'maxResults=50'
```

---

## 4. The Acceptance Criteria problem (most important finding)

Jira Cloud has **no standard AC field**. It is one of: a per-site custom field (`customfield_1XXXX`), a heading inside `description`, bullets in a comment, or genuinely absent. The chapter-03 client hard-codes `"Not specified"`, which is the failure we must fix.

**Resolution (cheapest first, in this exact order):**
1. custom field (resolve id at runtime via `expand=names` or `/field`),
2. `description` heading,
3. comment,
4. record a gap (never invent).

The winning strategy is recorded in a trace artifact. **Never hardcode `customfield_XXXXX`.**

---

## 5. Description format finding (ADF)

Jira Cloud v3 returns `description` as **Atlassian Document Format (ADF)** — nested JSON (`doc`, `heading`, `bulletList`, `listItem`, `text`). A naive text concatenator destroys structure. Therefore:

- We need a **deterministic ADF → Markdown** converter (preserving headings, bullets, tables, code blocks).
- `expand=renderedFields` gives `.renderedFields.description` as HTML — a **cross-check only**, stripped before any LLM call.
- **Escape hatch:** v2 (`/rest/api/2/issue/{key}`) returns description as a plain wiki-markup string — useful when the flattener is overkill.

---

## 6. Constraints

- **Rate limits (Cloud):** cost-based, not a fixed request count; honour `Retry-After`, back off. Batch mode must assume throttling.
- **Pagination:** the retired `/search` used `startAt`; `/search/jql` uses a `nextPageToken`. Single-issue fetch by key is unaffected.
- **Permissions:** browse permission required; a 404 can mean missing ticket *or* no permission *or* dead token.
- **Custom field IDs:** differ per instance — never hardcode.
- **Missing acceptance criteria:** must be flagged, never invented.

---

## 7. Error taxonomy

| Status | Meaning | Agent must say | Retry? |
|---|---|---|---|
| `200` + HTML | `JIRA_BASE_URL` = web app, not API | "URL looks wrong — bare site URL" | No |
| `400` | malformed fields/JQL | echo Jira `errorMessages` | No |
| `401` | bad email/token | "Auth failed, regenerate token" | No |
| `403` | not permitted / CAPTCHA | "Cannot read this project" | No |
| `404` | missing **or** no permission **or** dead token | disambiguate via `/myself` first | No |
| `429` | rate limited | honour `Retry-After` | Yes, backoff |
| `5xx` | Jira side | retry 3× with jitter | Yes |
| timeout/DNS | network/host | "Cannot reach Jira at `<url>`" | Yes, once |

---

## 8. Transport recommendation

- **Primary:** REST v3 + Basic token (reproducible, CI-safe, curls = documentation).
- **Secondary:** Atlassian MCP (already connected; pre-digested content — a *different* shape).
- **Rule:** both must normalize into the **same `ticket.json`** — the schema is the interface.

---

## 9. Open Questions / Unknowns (never guess)

| Finding | Can't close without |
|---|---|
| Jira Cloud vs Server/DC (forks auth + API version + markup) | your instance |
| REST vs MCP transport | audience (you vs a class) |
| AC custom field id | your site |
| Real AC in description vs comments | team habit |
| Sprint end date (only honest schedule input) | a real board |
| LLM provider + ticket-body data residency | your call |

---

## 10. Candidate resources (one-line each)

| Resource | Why it's relevant |
|---|---|
| Jira REST API docs (`developer.atlassian.com/cloud/jira/platform/rest/v3/`) | authoritative endpoint/field reference |
| IEEE 829 / ISO 29119 | canonical test-plan / test-documentation structure |
| OWASP | security test design (auth/authz, top-10) |
| WCAG | accessibility test design |
| Jira ADF → Markdown converters (to research on GitHub, licence-checked) | saves rebuilding the highest-effort pure function (`adf_flatten.py`) |
| `atlassian-python-api` / `jira` clients | build-vs-adopt for the fetch layer |
| JSON-schema-constrained LLM output libraries | the deterministic gate between reasoning and tools |

### 10.1 GitHub prior-art search (Phase 1 §4) — RUN 2026-11-22

Two directly relevant open-source projects found (licence to be confirmed before any copy):

- **sachinpratap001/intelligent-test-plan-agent** — AI test-plan generator that pulls Jira ticket data + LLM analysis against a customizable template. Prompt-structure + scope-selection reference. (Licence: TBD — check before reuse.)
- **marudhanalakshmi/Intelligent-Test-Plan-AI-Agent** — same category (Jira + LLM + template). Secondary reference.

**Library decision (build-vs-adopt):** for the fetch layer, the relevant Python option is **`atlassian-python-api`** (official-ish, auto-detects Cloud vs Server, handles pagination/auth). *Decision:* **do not adopt** for v1 — we already have a proven in-repo `jira_service.py` and a connected MCP tool; adding a heavy client now violates "fewer dependencies, deterministic core." Revisit only if REST becomes the primary transport instead of MCP.

**ADF converter decision:** our v1 *primary* transport is **MCP** (which returns `description` as clean Markdown — confirmed on `AL-3`), but the **REST path returns raw ADF** (verified: `fields.description` = `{"type":"doc","version":1,...}`). Therefore `adf_flatten.py` remains a **required** Phase 3 tool for the REST transport, not fully deferred — it is simply not on the *MCP-primary* hot path. Both transports must normalize to the same `ticket.json`; the flattener is what makes REST do that.

---

## 11. Live fixture observation (`AL-3`, read 2026-11-22 via MCP)

Real evidence that confirms/corrects several assumptions:

- **Type:** `Story` (id `10007`).
- **Priority:** `Medium`; **status:** `To Do`; assignee and reporter are populated.
- **Description:** returned as **clean Markdown** by the MCP tool (no raw ADF). The MCP transport pre-flattens — which removes the v1 ADF problem entirely for the primary path.
- **Acceptance Criteria:** **not** a separate custom field. They are a **bulleted list inside the description**, under the heading "A completed Care Plan must satisfy the following CCHHS criteria:". This is AC-strategy **case 2** (description heading) — the 4-strategy design is validated against a real ticket.
- **Labels / components / fixVersions / sprint_end_date:** absent on this ticket (labels `[]`, no sprint). Confirms "sprint_end_date → omit, never invent" is the right rule.
- **Custom fields:** only `Rank` present (no AC custom field). So AC is **not** in a `customfield_*` on this board.

This `AL-3` response is the first real fixture candidate — it should be saved as `fixtures/al-3.mcp.json` in Phase 2 (Link) as offline test data.

---

## 12. Reference skill (found in `SKILLMASTERCLASS/.commandcode/test-plan-generator`)

A second, independent test-plan-generator artifact exists outside this repo. It is a Command Code **Skill** (`SKILL.MD` + `references/` + `scripts/`) with the same goal. Read it as design prior art:

| Asset | Value it provides |
|---|---|
| `SKILL.MD` | A 4-step workflow (fetch → gap-analyze → draft → human review) and an explicit "never mark final" guardrail |
| `references/requirement-checklist.md` | A thorough gap-analysis checklist: functional / data / NFR (perf, security, a11y, i18n) / cross-cutting / clarity — every ⚠️/❌ becomes a question for the author |
| `references/test-plan-template.md` | A 6-section plan + `HUMAN REVIEW GATE` (assumed / could-not-confirm / approve-or-edit) |
| `scripts/fetch_jira.sh` | A curl+jq REST fetch — confirms our v3 endpoint and Basic-auth choices |

**Adopted into our build (v1):** the **Human Review Gate** — output now starts `Status: DRAFT — pending human review` and ends with an `assumptions`/`open_questions` sign-off block. This is consistent with our BR-2 (never fabricate) and BR-9 (declare assumptions).

**Deferred (not adopted yet):** the full gap-analysis checklist section — you chose "review gate only" for now; the checklist remains a candidate for v1.1.
