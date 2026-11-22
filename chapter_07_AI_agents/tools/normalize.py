from __future__ import annotations

from .adf_flatten import flatten


def normalize(raw: dict) -> dict:
    """Raw Jira issue JSON -> ticket.json (transport-agnostic contract)."""
    fields = raw.get("fields", {})
    desc_raw = fields.get("description")
    desc_md = flatten(desc_raw) if isinstance(desc_raw, dict) else (desc_raw or "")

    issuetype = (fields.get("issuetype") or {}).get("name") or ""
    status = (fields.get("status") or {}).get("name") or ""
    priority = (fields.get("priority") or {}).get("name") or ""

    # labels/components/fixVersions may be None
    labels = [x for x in (fields.get("labels") or [])]
    components = [c.get("name", "") for c in (fields.get("components") or [])]
    fix_versions = [f.get("name", "") for f in (fields.get("fixVersions") or [])]

    # Acceptance criteria: 4-strategy resolution (SOP_02). v1 = description-heading detection only.
    ac, ac_source = _extract_acceptance_criteria(fields, desc_md)

    return {
        "key": raw.get("key", ""),
        "summary": (fields.get("summary") or "").strip(),
        "description_markdown": desc_md,
        "issuetype": issuetype,
        "status": status,
        "priority": priority,
        "labels": labels,
        "components": components,
        "fix_versions": fix_versions,
        "acceptance_criteria": ac,
        "ac_source": ac_source,
        "comments": [],
        "linked_issues": [],
        "subtasks": [],
        "attachments": [],
        "parent": None,
        "epic": None,
        "sprint_end_date": None,
    }


def _extract_acceptance_criteria(fields: dict, desc_md: str) -> tuple[list[str], str]:
    """Strategy 1 (custom field) then 2 (description heading). Returns (list, source)."""
    # 1: custom field via 'names' map (if present, key containing 'acceptance'/'criteria')
    names = fields.get("names") or {}
    for field_key, human_name in names.items():
        if any(w in human_name.lower() for w in ("acceptance", "criteria", "definition of done")):
            val = fields.get(field_key)
            if val:
                return [_as_str(val)], "customfield"

    # 2: description heading — bullet list following a "criteria"/"must satisfy" heading
    lines = desc_md.splitlines()
    criteria = []
    capturing = False
    for line in lines:
        s = line.strip()
        low = s.lower()
        if s.startswith("#") or (low.startswith(("a completed", "the following", "criteria")) and ":" in s):
            if any(w in low for w in ("criteria", "must satisfy", "satisfy the following")):
                capturing = True
                continue
            else:
                capturing = False
        if capturing and s.startswith(("- ", "* ")):
            criteria.append(s[2:].strip())
    if criteria:
        return criteria, "description"

    return [], "none"


def _as_str(val) -> str:
    if isinstance(val, str):
        return val
    if isinstance(val, dict) and "content" in val:
        from .adf_flatten import flatten

        return flatten(val)
    return str(val)
