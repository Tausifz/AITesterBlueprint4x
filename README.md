# AiTesterBluePrint 4x

A blueprint for AI tester development — practical, chapter-by-chapter projects that build real test-automation tooling with LLMs.

## Chapters

| Chapter | What it covers |
|---|---|
| 01 | LLM basics |
| 02 | Prompt engineering |
| 03 | Local test-case generator (Jira → test cases via Ollama/Groq) |
| 04 | JobkitAI |
| 05 | JobTrackerAI |
| 06 | Branding & LinkedIn skill |
| 07 | **AI agents — Test Plan Creator** (Jira ID → traceable test plan) |
| 08 | n8n |
| 09 | LangFlow |

## Chapter 7 — Test Plan Creator

A deterministic, traceable test-plan generator built on the **B.L.A.S.T.** protocol and the **A.N.T.** 3-layer architecture.

Given a Jira ID (e.g. `AL-3`), it fetches the issue, normalizes it into a single `ticket.json`, runs one schema-gated LLM call (Groq-first, Ollama fallback), and renders `<KEY>-test-plan.md` with zero fabrication.

```
python run.py AL-3            # generate a plan
python run.py --dry-run AL-3  # fetch + normalize only (skip LLM)
python run.py --health        # verify auth + LLM handshake
```

See `chapter_07_AI_agents/README.md` for full setup and architecture details.

## Chapter 8 — n8n Jira AI Agent

`chapter_08_n8n/01_Fetch_JiraTicket_AIAgent.json` is an n8n workflow that uses a chat trigger and AI agent to retrieve a Jira issue by its key. The agent is connected to a language model, conversation memory, and the Jira issue lookup tool. The schedule trigger is disabled, and the workflow is inactive by default.

Import the JSON into n8n, configure the required model and Jira credentials in n8n, then activate the workflow to use it. Keep credentials in n8n's credential store; do not add them to exported workflow files or commit them to the repository.

## Secrets

Real credentials belong in `.env` (gitignored). The committed `.env.example` files contain **placeholders only** — never commit live tokens, keys, or email addresses.

## License

TBD
