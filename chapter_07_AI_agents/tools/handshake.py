from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tools.jira_auth import verify  # noqa: E402
from tools.jira_fetch import fetch  # noqa: E402
from tools import errors  # noqa: E402


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: python tools/handshake.py <AL-3>", file=sys.stderr)
        return 2

    # 1) auth handshake
    try:
        name = verify()
        print(f"[auth] OK — authenticated as {name}")
    except errors.JiraError as exc:
        print(f"[auth] FAILED — {exc}", file=sys.stderr)
        return 3

    # 2) fetch handshake
    try:
        data = fetch(sys.argv[1], out_path=ROOT / ".tmp" / "raw_issue.json")
        key = data.get("key")
        summary = (data.get("fields") or {}).get("summary")
        print(f"[fetch] OK — {key}: {summary}")
        return 0
    except errors.JiraError as exc:
        print(f"[fetch] FAILED — {exc}", file=sys.stderr)
        return 4


if __name__ == "__main__":
    raise SystemExit(main())
