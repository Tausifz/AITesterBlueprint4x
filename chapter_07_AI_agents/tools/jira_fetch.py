from __future__ import annotations

import json
import re
from pathlib import Path

import requests

from . import config
from .errors import JiraError

KEY_PATTERN = re.compile(r"^[A-Z][A-Z0-9_]+-[0-9]+$")
ROOT = Path(__file__).resolve().parents[1]
TMP_DIR = ROOT / ".tmp"


def normalize_key(value: str) -> str:
    """Accept a bare key (AL-3) or a browse URL; return the bare key."""
    raw = value.strip()
    if "/browse/" in raw:
        raw = raw.split("/browse/", 1)[1].split("?", 1)[0].strip("/")
    key = raw.upper()
    if not KEY_PATTERN.fullmatch(key):
        raise JiraError(f"Invalid Jira key: {value!r}. Expected a key like AL-3.")
    return key


def fetch(key_or_url: str, out_path: Path | None = None) -> dict:
    """Fetch one issue (raw JSON, no interpretation) and optionally write it."""
    config.load_env()
    base = config.jira_base_url()
    email = config.jira_email()
    token = config.jira_token()

    if not base or not email or not token:
        raise JiraError("JIRA_BASE_URL, JIRA_EMAIL, and JIRA_TOKEN must be set in .env")

    key = normalize_key(key_or_url)

    try:
        resp = requests.get(
            f"{base}/rest/api/3/issue/{key}",
            auth=(email, token),
            headers={"Accept": "application/json"},
            params={
                "fields": "summary,description,issuetype,status,priority,labels,components,fixVersions,parent,subtasks,issuelinks,attachment,environment",
                "expand": "renderedFields,names",
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        raise JiraError(f"Cannot reach Jira at {base}: {exc}") from exc

    if resp.status_code in {401, 403}:
        raise JiraError("Jira rejected the credentials (401/403). Regenerate the token.")
    if resp.status_code == 404:
        # Jira conflates "missing" with "no permission"; a dead token also reads as 404.
        # Disambiguate via /myself before calling it "not found".
        try:
            from . import jira_auth

            jira_auth.verify()
        except JiraError as auth_err:
            raise JiraError(f"Not found (404), but auth also failed: {auth_err}") from auth_err
        raise JiraError(f"Ticket {key} was not found, or your account lacks browse permission.")
    if not resp.ok:
        raise JiraError(f"Jira returned HTTP {resp.status_code} for {key}.")

    try:
        data = resp.json()
    except ValueError as exc:
        raise JiraError("Jira returned an invalid (non-JSON) response.") from exc

    if out_path is not None:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

    return data
