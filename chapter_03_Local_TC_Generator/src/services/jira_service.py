from __future__ import annotations

from typing import Any

import requests

from config.config_manager import AppConfig
from utils.validators import validate_ticket_key, validate_url


class JiraServiceError(RuntimeError):
    pass


def _text(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return " ".join(_text(item) for item in value.get("content", []))
    if isinstance(value, list):
        return " ".join(_text(item) for item in value)
    return ""


class JiraService:
    def __init__(self, config: AppConfig) -> None:
        self.config = config

    def fetch_ticket(self, ticket_key: str) -> dict[str, str]:
        key = validate_ticket_key(ticket_key)
        if self.config.missing_jira_values():
            raise JiraServiceError("Configure JIRA_URL, JIRA_EMAIL, and JIRA_API_TOKEN before connecting.")
        try:
            base_url = validate_url(self.config.jira_url, "JIRA_URL")
            response = requests.get(
                f"{base_url}/rest/api/3/issue/{key}",
                params={"fields": "summary,description,status,priority,comment"},
                auth=(self.config.jira_email, self.config.jira_api_token),
                headers={"Accept": "application/json"},
                timeout=20,
            )
        except requests.RequestException as exc:
            raise JiraServiceError("Unable to connect to Jira. Check the URL and network connection.") from exc
        if response.status_code in {401, 403}:
            raise JiraServiceError("Jira rejected the configured credentials.")
        if response.status_code == 404:
            raise JiraServiceError(f"Jira ticket {key} was not found.")
        if not response.ok:
            raise JiraServiceError(f"Jira returned HTTP {response.status_code} while retrieving {key}.")
        try:
            fields = response.json().get("fields", {})
        except ValueError as exc:
            raise JiraServiceError("Jira returned an invalid response.") from exc
        return {
            "key": key,
            "summary": str(fields.get("summary") or "Not specified"),
            "description": _text(fields.get("description")) or "Not specified",
            "status": str((fields.get("status") or {}).get("name") or "Not specified"),
            "priority": str((fields.get("priority") or {}).get("name") or "Not specified"),
            "acceptance_criteria": "Not specified",
        }

    def test_connection(self) -> None:
        if self.config.missing_jira_values():
            raise JiraServiceError("Configure JIRA_URL, JIRA_EMAIL, and JIRA_API_TOKEN before connecting.")
        try:
            base_url = validate_url(self.config.jira_url, "JIRA_URL")
            response = requests.get(
                f"{base_url}/rest/api/3/myself",
                auth=(self.config.jira_email, self.config.jira_api_token),
                headers={"Accept": "application/json"},
                timeout=20,
            )
        except requests.RequestException as exc:
            raise JiraServiceError("Unable to connect to Jira. Check the URL and network connection.") from exc
        if response.status_code in {401, 403}:
            raise JiraServiceError("Jira rejected the configured credentials.")
        if not response.ok:
            raise JiraServiceError(f"Jira returned HTTP {response.status_code} while testing the connection.")
