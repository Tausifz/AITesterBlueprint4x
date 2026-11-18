from __future__ import annotations

import os
from dataclasses import dataclass, replace
from pathlib import Path

from utils.validators import normalize_jira_url

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

SRC_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = SRC_DIR / ".env"


@dataclass(frozen=True)
class AppConfig:
    jira_url: str = ""
    jira_email: str = ""
    jira_api_token: str = ""
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "gemma3:1b"
    groq_api_key: str = ""
    groq_model: str = ""
    provider: str = "Ollama"

    def missing_jira_values(self) -> list[str]:
        return [name for name, value in (("JIRA_URL", self.jira_url), ("JIRA_EMAIL", self.jira_email), ("JIRA_API_TOKEN", self.jira_api_token)) if not value]


def load_config() -> AppConfig:
    if load_dotenv is not None:
        load_dotenv(ENV_FILE, override=False)
    return AppConfig(
        jira_url=normalize_jira_url(os.getenv("JIRA_URL", "").strip()) if os.getenv("JIRA_URL", "").strip() else "",
        jira_email=os.getenv("JIRA_EMAIL", "").strip(),
        jira_api_token=os.getenv("JIRA_API_TOKEN", "").strip(),
        ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").strip().rstrip("/"),
        ollama_model=os.getenv("OLLAMA_MODEL", "gemma3:1b").strip(),
        groq_api_key=os.getenv("GROQ_API_KEY", "").strip(),
        groq_model=os.getenv("GROQ_MODEL", "").strip(),
        provider=os.getenv("LLM_PROVIDER", "Ollama").strip() or "Ollama",
    )


def save_config(config: AppConfig) -> None:
    values = {
        "JIRA_URL": config.jira_url,
        "JIRA_EMAIL": config.jira_email,
        "JIRA_API_TOKEN": config.jira_api_token,
        "OLLAMA_BASE_URL": config.ollama_base_url,
        "OLLAMA_MODEL": config.ollama_model,
        "GROQ_API_KEY": config.groq_api_key,
        "GROQ_MODEL": config.groq_model,
        "LLM_PROVIDER": config.provider,
    }
    ENV_FILE.write_text("\n".join(f"{key}={value}" for key, value in values.items()) + "\n", encoding="utf-8")
    for key, value in values.items():
        os.environ[key] = value


def with_values(config: AppConfig, **values: str) -> AppConfig:
    return replace(config, **values)
