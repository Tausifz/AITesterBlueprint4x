from __future__ import annotations

import json
from pathlib import Path
from typing import Any

try:
    import jsonschema
except ImportError:
    jsonschema = None

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_DIR = ROOT / "schemas"


class SchemaError(RuntimeError):
    pass


def _validate(data: Any, schema_path: Path) -> None:
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    if jsonschema is None:
        # Without jsonschema, do a minimal required-key check.
        req = schema.get("required", [])
        for key in req:
            if key not in data:
                raise SchemaError(f"missing required field: {key}")
        return
    validator = jsonschema.Draft7Validator(schema)
    errors = sorted(validator.iter_errors(data), key=lambda e: list(e.path))
    if errors:
        first = errors[0]
        raise SchemaError(f"{'.'.join(str(p) for p in first.path)}: {first.message}")


def validate_ticket(data: dict) -> None:
    _validate(data, SCHEMA_DIR / "ticket.schema.json")


def validate_plan(data: dict) -> None:
    _validate(data, SCHEMA_DIR / "plan.schema.json")
