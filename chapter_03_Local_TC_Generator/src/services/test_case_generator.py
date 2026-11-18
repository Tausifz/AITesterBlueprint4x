from __future__ import annotations

from pathlib import Path
from typing import Protocol


class TextProvider(Protocol):
    def generate(self, prompt: str) -> str: ...


class TemplateError(RuntimeError):
    pass


class TestCaseGenerator:
    def __init__(self, provider: TextProvider, template_path: Path) -> None:
        self.provider = provider
        self.template_path = template_path

    def build_prompt(self, ticket: dict[str, str]) -> str:
        try:
            template = self.template_path.read_text(encoding="utf-8")
        except OSError as exc:
            raise TemplateError(f"Template file is missing or unreadable: {self.template_path}") from exc
        ticket_text = "\n".join(f"{key}: {value}" for key, value in ticket.items())
        return (
            f"{template}\n\n"
            "Use only the Jira information below. Do not invent requirements. "
            "Mark missing information as Not specified or Needs clarification. "
            "Generate relevant happy-path, negative, validation, boundary, and access tests.\n\n"
            f"JIRA TICKET INFORMATION\n{ticket_text}"
        )

    def generate(self, ticket: dict[str, str]) -> str:
        return self.provider.generate(self.build_prompt(ticket))
