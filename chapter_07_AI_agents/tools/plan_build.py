from __future__ import annotations

import json
import os
import re

import requests

from . import config


class PlanBuildError(RuntimeError):
    pass


_TEMPLATE = """You are a Senior QA Test Architect. Produce a test plan from the Jira ticket below.

Rules:
- Use ONLY the ticket data. Never invent requirements, endpoints, environments, versions, or dates.
- Mark any assumption exactly as "ASSUMPTION: <statement>".
- For string fields with no ticket data, use the string "NOT IN TICKET".
- For ARRAY fields with no data, use an EMPTY ARRAY [] (never the string "NOT IN TICKET").
- For OBJECT fields with no data, use an EMPTY OBJECT {} (never the string "NOT IN TICKET").
- "scope.in" is a short list of high-level FEATURE AREAS (2-6 words each), NOT a copy of the acceptance criteria.
- Every acceptance criterion must be covered by at least one test case. If acceptance_criteria is non-empty, create one test case per criterion (or tightly-grouped cluster), and set each test case's "source_field" to "acceptance_criteria".
- Keep test cases focused and non-redundant. Do not invent extra test cases beyond what the ticket justifies.

Return strict JSON matching this shape:
{
  "test_plan": {
    "jira_id": "<key>",
    "title": "<summary>",
    "objective": "<one sentence>",
    "scope": {"in": ["<feature area>"], "out": []},
    "strategy": [{"type": "functional", "approach": "", "justified_by": ""}],
    "risk_assessment": [{"risk": "", "likelihood": "H|M|L", "impact": "H|M|L", "mitigation": ""}],
    "environment_and_data": {},
    "entry_criteria": [],
    "exit_criteria": [],
    "test_cases": [
      {"id": "TC-001", "requirement_id": "<key>", "title": "", "type": "functional", "priority": "P2", "preconditions": [], "steps": [{"action": "", "expected": ""}], "test_data": {}, "automation_candidate": false, "tags": [], "source_field": "acceptance_criteria", "assumption": null}
    ],
    "traceability": {"matrix": [{"requirement_id": "<key>", "test_case_ids": [], "covered": true}], "uncovered_requirements": []},
    "automation_backlog": [],
    "assumptions": [],
    "dependencies": [],
    "open_questions": []
  }
}

Ticket:
{{TICKET}}

Return ONLY the JSON object.
"""


def _groq_json(prompt: str) -> dict:
    key = (os.getenv("GROQ_API_KEY") or "").strip()
    model = (os.getenv("GROQ_MODEL") or "openai/gpt-oss-120b").strip()
    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
        },
        timeout=180,
    )
    if not resp.ok:
        raise PlanBuildError(f"Groq returned HTTP {resp.status_code}: {resp.text[:300]}")
    content = resp.json()["choices"][0]["message"]["content"]
    return _extract_json(content)


def _extract_json(text: str) -> dict:
    text = text.strip()
    # strip code fences if present
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    return json.loads(text)


def build(ticket: dict) -> dict:
    """ticket.json -> plan.json via one LLM call (Groq-first; Ollama fallback in v1.1)."""
    config.load_env()
    prompt = _TEMPLATE.replace("{{TICKET}}", json.dumps(ticket, indent=2, ensure_ascii=False))
    try:
        data = _groq_json(prompt)
    except Exception as exc:
        from .llm_handshake import _ollama_ping  # Ollama fallback path (not wired in v1)

        raise PlanBuildError(f"Plan build failed: {exc}") from exc
    # Wrap to the expected top-level {test_plan: ...} if the model returned it bare.
    if "test_plan" not in data:
        data = {"test_plan": data}
    return _normalize_sentinels(data)


# Fields whose schema type is array; a stray "NOT IN TICKET" here is coerced to [].
_ARRAY_FIELDS = {
    "entry_criteria", "exit_criteria", "automation_backlog", "assumptions",
    "dependencies", "open_questions",
}
_OBJECT_FIELDS = {"environment_and_data", "scope", "traceability"}


def _normalize_sentinels(plan: dict) -> dict:
    """Defensively coerce 'NOT IN TICKET' to [] / {} where the schema demands array/object.

    The model occasionally applies the string sentinel to list/object fields despite the prompt;
    this makes that mistake harmless without changing correct output.
    """
    tp = plan.get("test_plan", plan)
    for key in _ARRAY_FIELDS:
        if tp.get(key) == "NOT IN TICKET":
            tp[key] = []
    for key in _OBJECT_FIELDS:
        if tp.get(key) == "NOT IN TICKET":
            tp[key] = {}
    # test_cases and its nested arrays
    for tc in tp.get("test_cases", []):
        for nested in ("preconditions", "tags"):
            if tc.get(nested) == "NOT IN TICKET":
                tc[nested] = []
        if tc.get("test_data") == "NOT IN TICKET":
            tc["test_data"] = {}
        if tc.get("assumption") == "NOT IN TICKET":
            tc["assumption"] = None
    return plan
