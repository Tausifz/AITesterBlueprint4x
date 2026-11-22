from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

_SECTIONS = [
    ("Objective & Scope", lambda p: _objective_scope(p)),
    ("Test Strategy & Approach", lambda p: _strategy(p)),
    ("Risk Assessment", lambda p: _risk(p)),
    ("Test Environment & Data", lambda p: _env(p)),
    ("Entry & Exit Criteria", lambda p: _entry_exit(p)),
    ("Test Cases", lambda p: _cases(p)),
    ("Traceability", lambda p: _traceability(p)),
    ("Automation Candidates", lambda p: _automation(p)),
    ("Assumptions", lambda p: _assumptions(p)),
    ("Dependencies & Open Questions", lambda p: _deps(p)),
]


def render(plan: dict, key: str) -> str:
    """plan.json -> markdown, one heading block per section (pure)."""
    p = plan.get("test_plan", plan)
    lines = [
        f"# Test Plan — {p.get('jira_id', key)}",
        "",
        f"**Title:** {p.get('title', 'NOT IN TICKET')}",
        "",
        "> **Status:** DRAFT — pending human review. Not approved until a QA owner signs off.",
        "",
    ]
    for title, fn in _SECTIONS:
        lines.append(f"## {title}")
        body = fn(p)
        lines.append(body if body.strip() else "NOT IN TICKET")
        lines.append("")
    lines.append("## Human Review Gate")
    lines.append(_review_gate(p))
    lines.append("")
    text = "\n".join(lines)
    # placeholder sweep + guidance strip
    assert "{{" not in text, "unrendered placeholder found"
    text = text.replace("<!-- guidance -->", "")
    return text


def _objective_scope(p: dict) -> str:
    obj = p.get("objective", "NOT IN TICKET")
    scope = p.get("scope", {})
    in_ = ", ".join(scope.get("in", [])) or "NOT IN TICKET"
    out = ", ".join(scope.get("out", [])) or "N/A"
    return f"**Objective:** {obj}\n\n**In scope:** {in_}\n\n**Out of scope:** {out}"


def _strategy(p: dict) -> str:
    rows = p.get("strategy", [])
    if not rows:
        return ""
    lines = ["| Type | Approach | Justified by |", "|---|---|---|"]
    for s in rows:
        lines.append(f"| {s.get('type','')} | {s.get('approach','') or 'NOT IN TICKET'} | {s.get('justified_by','') or 'NOT IN TICKET'} |")
    return "\n".join(lines)


def _risk(p: dict) -> str:
    rows = p.get("risk_assessment", [])
    if not rows:
        return ""
    lines = ["| Risk | Likelihood | Impact | Mitigation |", "|---|---|---|---|"]
    for r in rows:
        lines.append(f"| {r.get('risk','')} | {r.get('likelihood','')} | {r.get('impact','')} | {r.get('mitigation','') or 'NOT IN TICKET'} |")
    return "\n".join(lines)


def _env(p: dict) -> str:
    env = p.get("environment_and_data", {})
    if not env:
        return ""
    return "\n".join(f"- {k}: {v}" for k, v in env.items())


def _entry_exit(p: dict) -> str:
    entry = p.get("entry_criteria", [])
    exit_ = p.get("exit_criteria", [])
    e = "\n".join(f"- {x}" for x in entry) or "NOT IN TICKET"
    x = "\n".join(f"- {x}" for x in exit_) or "NOT IN TICKET"
    return f"**Entry:**\n{e}\n\n**Exit:**\n{x}"


def _cases(p: dict) -> str:
    cases = p.get("test_cases", [])
    if not cases:
        return ""
    lines = ["| ID | Title | Type | Priority | Steps |", "|---|---|---|---|---|"]
    for c in cases:
        steps = "; ".join(f"{s.get('action','')} → {s.get('expected','')}" for s in c.get("steps", [])) or "NOT IN TICKET"
        lines.append(f"| {c.get('id','')} | {c.get('title','')} | {c.get('type','')} | {c.get('priority','')} | {steps} |")
    return "\n".join(lines)


def _traceability(p: dict) -> str:
    m = (p.get("traceability") or {}).get("matrix", [])
    if not m:
        return ""
    lines = ["| Requirement | Test cases | Covered |", "|---|---|---|"]
    for row in m:
        lines.append(f"| {row.get('requirement_id','')} | {', '.join(row.get('test_case_ids',[])) or 'NOT IN TICKET'} | {row.get('covered','')} |")
    return "\n".join(lines)


def _automation(p: dict) -> str:
    backlog = p.get("automation_backlog", [])
    return "\n".join(f"- {x}" for x in backlog) if backlog else "N/A"


def _assumptions(p: dict) -> str:
    a = p.get("assumptions", [])
    return "\n".join(f"- {x}" for x in a) if a else "N/A"


def _deps(p: dict) -> str:
    deps = p.get("dependencies", [])
    qs = p.get("open_questions", [])
    d = "\n".join(f"- {x}" for x in deps) or "N/A"
    q = "\n".join(f"- {x}" for x in qs) or "N/A"
    return f"**Dependencies:**\n{d}\n\n**Open questions:**\n{q}"


def _review_gate(p: dict) -> str:
    """Human Review Gate — surfaces assumptions + open questions; the plan is a draft."""
    assumptions = p.get("assumptions", [])
    open_qs = p.get("open_questions", [])
    a = "\n".join(f"- {x}" for x in assumptions) or "- (none declared)"
    q = "\n".join(f"- {x}" for x in open_qs) or "- (none)"
    out = [
        f"- **I assumed:**\n{a}",
        f"- **I could not confirm:**\n{q}",
        "- **Approve, or edit, before I write test cases / automation.**",
    ]
    return "\n".join(out)
