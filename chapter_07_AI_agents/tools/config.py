from __future__ import annotations

import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - dev dependency
    load_dotenv = None

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / ".env"


def load_env() -> None:
    if load_dotenv is not None:
        load_dotenv(ENV_FILE, override=False)


def jira_base_url() -> str:
    return (os.getenv("JIRA_BASE_URL", "") or "").strip().rstrip("/")


def jira_email() -> str:
    return (os.getenv("JIRA_EMAIL", "") or "").strip()


def jira_token() -> str:
    return (os.getenv("JIRA_TOKEN", "") or "").strip()
