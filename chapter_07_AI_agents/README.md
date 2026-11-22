# Test Plan Creator — Jira ID → Test Plan

Deterministic + traceable test-plan generator built on **B.L.A.S.T.** / **A.N.T.** (3-layer).

Given a Jira ID (`AL-3`), it fetches the issue, normalizes it into one `ticket.json`, runs a single schema-gated LLM call (Groq-first, Ollama fallback), and renders `<KEY>-test-plan.md` with zero fabrication.

## 60-second setup

```powershell
cd chapter_07_AI_agents
py -m pip install -r requirements.txt
# edit .env with JIRA_BASE_URL, JIRA_EMAIL, JIRA_TOKEN, GROQ_API_KEY
py run.py --health        # verify auth + LLM
py run.py AL-3            # generate the plan
py run.py --dry-run AL-3  # fetch+normalize only, skip the LLM
```

## Architecture (A.N.T.)

| Layer | Where | What |
|---|---|---|
| Architecture | `architecture/` | 6 markdown SOPs (fetch → resolve → normalize → readiness → build → render) |
| Navigation | `tools/navigation.py` | routes 7 steps; exactly **1** calls a model |
| Tools | `tools/` | deterministic Python (13 modules), 6 pure functions |

## Exit codes

`0` ok · `2` bad input · `3` auth · `4` not found · `5` rate-limited · `6` schema violation · `7` LLM failure.

## Data flow

```
Jira ID → fetch (REST/MCP) → normalize → ticket.json → readiness → build (LLM) → render → trace
```

## Secrets

Live credentials go in `.env` (gitignored). **Never** commit `.env` or `.tmp/`. See `.gitignore`.
