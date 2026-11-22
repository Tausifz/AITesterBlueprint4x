from __future__ import annotations

from typing import Any


def flatten(adf: Any) -> str:
    """Deterministic ADF -> markdown. Preserves headings, bullets, ordered lists, tables, code, panels.

    Accepates a dict ({type: doc}) or the already-string description (MCP path returns a str).
    """
    if isinstance(adf, str):
        return adf
    if not isinstance(adf, dict):
        return ""
    return _node(adf).strip()


def _node(node: dict) -> str:
    ntype = node.get("type", "")
    content = node.get("content") or []
    text = "".join(_node(c) for c in content)

    if ntype == "doc":
        return text
    if ntype == "paragraph":
        return text + "\n\n"
    if ntype == "text":
        return node.get("text", "")
    if ntype == "heading":
        level = node.get("attrs", {}).get("level", 2)
        return f"{'#' * level} {text.strip()}\n\n"
    if ntype == "bulletList":
        return "\n".join(f"- {_node(item).strip()}" for item in content) + "\n\n"
    if ntype == "orderedList":
        out = []
        for i, item in enumerate(content, 1):
            out.append(f"{i}. {_node(item).strip()}")
        return "\n".join(out) + "\n\n"
    if ntype == "listItem":
        return " ".join(_node(c).strip() for c in content)
    if ntype == "codeBlock":
        lang = node.get("attrs", {}).get("language", "")
        return f"```{lang}\n{text}\n```\n\n"
    if ntype == "table":
        return _table(node) + "\n\n"
    if ntype == "panel":
        return text
    if ntype == "mediaSingle" or ntype == "media":
        return "_([media])_\n\n"
    if ntype == "inlineCard" or ntype == "blockCard":
        url = node.get("attrs", {}).get("url", "")
        return f"[{url}]({url})" if url else ""
    if ntype == "emoji":
        return node.get("attrs", {}).get("shortName", "")
    if ntype == "hardBreak":
        return "\n"
    if ntype == "mention":
        return f"@{node.get('attrs', {}).get('text', '')}"
    # fallback: recurse content, unknown node contributes its text
    return text


def _table(node: dict) -> str:
    rows = node.get("content", [])
    out = []
    for ri, row in enumerate(rows):
        cells = []
        for cell in row.get("content", []):
            cells.append(_node(cell).strip().replace("\n", " "))
        out.append("| " + " | ".join(cells) + " |")
        if ri == 0:
            out.append("| " + " | ".join("---" for _ in cells) + " |")
    return "\n".join(out)
