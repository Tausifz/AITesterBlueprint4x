from __future__ import annotations

import json
from pathlib import Path

from . import config
from .errors import JiraError

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".tmp" / "field_map.json"


def resolve_ac_field_id() -> str | None:
    """Discover the per-site AC custom field id (cached). Returns None if not found.

    Uses `expand=names` on the issue response, or /rest/api/3/field as a fallback.
    For v1 the MCP transport already maps fields; this is the REST-path helper.
    """
    if CACHE.exists():
        data = json.loads(CACHE.read_text(encoding="utf-8"))
        return data.get("ac_field_id")

    # Not cached: we don't have a standalone issue here; document the discovery approach.
    # The runtime discovery rides on the main fetch's `expand=names` (see normalize.py).
    return None


def cache_ac_field_id(ac_field_id: str) -> None:
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    CACHE.write_text(json.dumps({"ac_field_id": ac_field_id}), encoding="utf-8")
