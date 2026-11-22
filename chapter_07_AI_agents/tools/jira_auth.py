from __future__ import annotations

import requests

from . import config
from .errors import JiraError


def verify() -> str:
    """Handshake: confirm credentials by reading /myself and returning the display name."""
    config.load_env()
    base = config.jira_base_url()
    email = config.jira_email()
    token = config.jira_token()

    if not base:
        raise JiraError("JIRA_BASE_URL is not set in .env")
    if not email or not token:
        raise JiraError("JIRA_EMAIL and JIRA_TOKEN are required in .env")

    try:
        resp = requests.get(
            f"{base}/rest/api/3/myself",
            auth=(email, token),
            headers={"Accept": "application/json"},
            timeout=20,
        )
    except requests.RequestException as exc:
        raise JiraError(f"Cannot reach Jira at {base}: {exc}") from exc

    if resp.status_code == 401:
        raise JiraError("Authentication failed (401): regenerate the Jira API token.")
    if resp.status_code == 403:
        raise JiraError("Authentication failed (403): account is not permitted.")
    if not resp.ok:
        # A 200 with an HTML body means the URL hit the web app, not the API.
        content_type = resp.headers.get("Content-Type", "")
        if "html" in content_type:
            raise JiraError("JIRA_BASE_URL looks wrong — it must be the bare site URL, not /browse/...")
        raise JiraError(f"Jira returned HTTP {resp.status_code} while checking auth.")

    try:
        data = resp.json()
    except ValueError as exc:
        raise JiraError("Jira returned an invalid (non-JSON) response.") from exc

    return str(data.get("displayName") or "unknown")
