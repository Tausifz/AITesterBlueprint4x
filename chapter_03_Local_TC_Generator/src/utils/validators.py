import re
from urllib.parse import urlparse

TICKET_PATTERN = re.compile(r"^[A-Z][A-Z0-9_]+-[0-9]+$")


def validate_ticket_key(ticket_key: str) -> str:
    value = ticket_key.strip().upper()
    if not TICKET_PATTERN.fullmatch(value):
        raise ValueError("Enter a valid Jira ticket ID such as PROJ-123.")
    return value


def validate_url(value: str, label: str) -> str:
    parsed = urlparse(value.strip())
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise ValueError(f"{label} must be a valid HTTP or HTTPS URL.")
    return value.strip().rstrip("/")


def normalize_jira_url(value: str) -> str:
    url = validate_url(value, "Jira URL")
    parsed = urlparse(url)
    path = parsed.path.split("/browse/", 1)[0].rstrip("/")
    return f"{parsed.scheme}://{parsed.netloc}{path}"
