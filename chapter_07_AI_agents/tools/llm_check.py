from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from tools.llm_handshake import verify  # noqa: E402
from tools.llm_handshake import LLMError  # noqa: E402


def main() -> int:
    try:
        provider = verify()
        print(f"[llm] OK — {provider}")
        return 0
    except LLMError as exc:
        print(f"[llm] FAILED — {exc}", file=sys.stderr)
        return 7


if __name__ == "__main__":
    raise SystemExit(main())
