from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tools import adf_flatten, normalize, readiness, schema_validator  # noqa: E402

FIX = ROOT / "fixtures"


def test_adf_flatten_preserves_structure():
    raw = json.loads((FIX / "adf.sample.json").read_text(encoding="utf-8"))
    md = adf_flatten.flatten(raw)
    assert "- Rejects blank password" in md
    assert "- Accepts valid password" in md
    assert "## Acceptance Criteria" in md
    assert "```python" in md
    assert "print('ok')" in md


def test_normalize_extracts_ac_from_description():
    raw = json.loads(Path(ROOT / ".tmp" / "raw_issue.json").read_text(encoding="utf-8"))
    ticket = normalize.normalize(raw)
    assert ticket["ac_source"] == "description"
    assert len(ticket["acceptance_criteria"]) == 15


def test_ticket_validates():
    raw = json.loads(Path(ROOT / ".tmp" / "raw_issue.json").read_text(encoding="utf-8"))
    ticket = normalize.normalize(raw)
    schema_validator.validate_ticket(ticket)  # should not raise


def test_readiness_plannable():
    ticket = {"summary": "x", "description_markdown": "y", "issuetype": "Story"}
    assert readiness.readiness(ticket)["plannable"] is True


def test_readiness_thin_ticket():
    ticket = {"summary": "", "description_markdown": "", "issuetype": ""}
    r = readiness.readiness(ticket)
    assert r["plannable"] is False
    assert len(r["gaps"]) == 3


if __name__ == "__main__":
    tests = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    passed = 0
    for t in tests:
        try:
            t()
            print(f"PASS {t.__name__}")
            passed += 1
        except Exception as exc:
            print(f"FAIL {t.__name__}: {exc}")
    print(f"\n{passed}/{len(tests)} passed")
    sys.exit(0 if passed == len(tests) else 1)
