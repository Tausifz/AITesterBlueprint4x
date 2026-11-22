# SOP_01 — Fetch Ticket

**Goal:** turn a Jira key (or browse URL) into a raw issue JSON with no interpretation.
**Tool:** `tools/jira_fetch.py` (`fetch()`), `tools/jira_auth.py` (`verify()`).

## Inputs
- `jira_id` — a bare key (`AL-3`) or a full browse URL (`https://…/browse/AL-3`).

## Steps
1. Normalize input to a bare uppercase key (`AL-3`). Reject JQL queries in v1.
2. Load `.env` credentials (`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`).
3. `GET /rest/api/3/issue/{key}` with Basic auth, `fields=` + `expand=renderedFields,names`.
4. Return raw JSON. Write a copy to `.tmp/raw_issue.json` (audit trail).

## Edge cases (must be named in the tool)
- **401 / 403** → bad credentials / no permission. Say "regenerate token", never leak.
- **404** → Jira conflates *missing* + *no permission* + *dead token*. Call `/myself` to disambiguate: if auth fails too, report auth error; else report "not found or no browse permission".
- **429** → rate limited. Honour `Retry-After`; exponential backoff.
- **5xx** → retry 3× with jitter.
- **timeout / DNS** → "cannot reach Jira at `<url>`".
- **200 + HTML body** → `JIRA_BASE_URL` points at the web app, not the API.
- **non-JSON response** → invalid response, do not parse.
