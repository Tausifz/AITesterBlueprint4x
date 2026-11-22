from __future__ import annotations

import json
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]


def trace(inputs: dict, outputs: dict, ticket_key: str) -> dict:
    """Build trace.json mapping each generated section back to its source ticket fields."""
    result = {
        "ticket_key": ticket_key,
        "sections": {},
        "uncovered_requirements": [],
    }

    # Map test cases back: requirement_id -> test_case ids
    for tc in outputs.get("test_cases", []):
        req = tc.get("requirement_id", ticket_key)
        result["sections"].setdefault(req, []).append(tc.get("id"))

    return result


def write_trace(inputs: dict, outputs: dict, ticket_key: str, path: Path | None = None) -> Path:
    dest = path or (ROOT / ".tmp" / "trace.json")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(trace(inputs, outputs, ticket_key), indent=2), encoding="utf-8")
    return dest
