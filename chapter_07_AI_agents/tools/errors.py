from __future__ import annotations


class JiraError(RuntimeError):
    """A typed, user-facing Jira error. Never carries secrets."""
