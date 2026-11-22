from __future__ import annotations


def readiness(ticket: dict) -> dict:
    """ticket.json -> {plannable, gaps}. Pure.

    Minimum bar (SOP_04): non-empty summary, non-empty description, resolved issuetype.
    """
    gaps = []
    if not (ticket.get("summary") or "").strip():
        gaps.append("missing summary")
    if not (ticket.get("description_markdown") or "").strip():
        gaps.append("missing description")
    if not (ticket.get("issuetype") or "").strip():
        gaps.append("missing issuetype")

    return {"plannable": not gaps, "gaps": gaps}
