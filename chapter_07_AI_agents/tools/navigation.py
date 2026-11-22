from __future__ import annotations

import json
from pathlib import Path

from . import jira_fetch, normalize, readiness, plan_build, render, schema_validator, trace
from .errors import JiraError

ROOT = Path(__file__).resolve().parents[1]


def run(key_or_url: str, dry_run: bool = False) -> dict:
    """The navigation layer: routes fetch -> normalize -> readiness -> build -> render -> trace.

    Exactly one step calls a model (plan_build). Everything else is deterministic.
    """
    # 1. fetch
    raw = jira_fetch.fetch(key_or_url, out_path=ROOT / ".tmp" / "raw_issue.json")

    # 2. normalize
    ticket = normalize.normalize(raw)
    schema_validator.validate_ticket(ticket)
    (ROOT / ".tmp" / "ticket.json").write_text(json.dumps(ticket, indent=2, ensure_ascii=False), encoding="utf-8")

    # 3. readiness
    check = readiness.readiness(ticket)
    if not check["plannable"]:
        raise JiraError("Ticket is too thin to plan: " + ", ".join(check["gaps"]))
    (ROOT / ".tmp" / "readiness.json").write_text(json.dumps(check, indent=2), encoding="utf-8")

    key = ticket["key"]

    if dry_run:
        return {"dry_run": True, "ticket": ticket, "readiness": check}

    # 4. build (the one LLM call)
    plan = plan_build.build(ticket)
    schema_validator.validate_plan(plan.get("test_plan", plan))
    (ROOT / ".tmp" / "plan.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")

    # 5. render
    md = render.render(plan, key)
    out = ROOT / f"{key}-test-plan.md"
    out.write_text(md, encoding="utf-8")

    # 6. trace
    trace.write_trace(ticket, plan.get("test_plan", plan), key)

    return {"dry_run": False, "output": str(out), "plan": plan}
