from __future__ import annotations

import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from tools import navigation  # noqa: E402
from tools.errors import JiraError  # noqa: E402
from tools.plan_build import PlanBuildError  # noqa: E402
from tools.schema_validator import SchemaError  # noqa: E402

# Exit codes (per task_plan.md Phase 5)
EXIT_OK = 0
EXIT_BAD_INPUT = 2
EXIT_AUTH = 3
EXIT_NOT_FOUND = 4
EXIT_RATE_LIMITED = 5
EXIT_SCHEMA = 6
EXIT_LLM = 7


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate a test plan from a Jira ID.")
    parser.add_argument("key", nargs="?", help="Jira issue key (e.g. AL-3) or browse URL")
    parser.add_argument("--dry-run", action="store_true", help="fetch + normalize only, skip the LLM call")
    parser.add_argument("--health", action="store_true", help="check auth/fetch/LLM handshakes and exit")
    args = parser.parse_args(argv)

    if args.health:
        return _health()
    if not args.key:
        parser.error("a Jira key is required unless --health is passed")

    try:
        result = navigation.run(args.key, dry_run=args.dry_run)
    except JiraError as exc:
        msg = str(exc).lower()
        if "401" in msg or "403" in msg or "regenerate" in msg or "denied" in msg:
            print(f"error: {exc}", file=sys.stderr)
            return EXIT_AUTH
        if "404" in msg or "not found" in msg or "permission" in msg:
            print(f"error: {exc}", file=sys.stderr)
            return EXIT_NOT_FOUND
        if "429" in msg or "rate" in msg:
            print(f"error: {exc}", file=sys.stderr)
            return EXIT_RATE_LIMITED
        print(f"error: {exc}", file=sys.stderr)
        return EXIT_BAD_INPUT
    except SchemaError as exc:
        print(f"schema error: {exc}", file=sys.stderr)
        return EXIT_SCHEMA
    except PlanBuildError as exc:
        print(f"llm error: {exc}", file=sys.stderr)
        return EXIT_LLM

    if args.dry_run:
        print(f"dry-run OK: {result['ticket']['key']} ({result['ticket']['issuetype']}) — plannable={result['readiness']['plannable']}")
    else:
        print(result["output"])
    return EXIT_OK


def _health() -> int:
    from tools import jira_auth, jira_fetch, llm_handshake
    from tools.llm_handshake import LLMError

    ok = True
    try:
        name = jira_auth.verify()
        print(f"[auth]  OK — {name}")
    except JiraError as exc:
        ok = False
        print(f"[auth]  FAILED — {exc}")
    try:
        llm_handshake.verify()
        print("[llm]   OK")
    except LLMError as exc:
        ok = False
        print(f"[llm]   FAILED — {exc}")
    return EXIT_OK if ok else EXIT_AUTH


if __name__ == "__main__":
    raise SystemExit(main())
