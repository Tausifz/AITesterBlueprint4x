from __future__ import annotations

import os
import requests

from . import config
from .errors import JiraError


class LLMError(RuntimeError):
    pass


def _groq_ping() -> str:
    key = (os.getenv("GROQ_API_KEY") or "").strip()
    model = (os.getenv("GROQ_MODEL") or "llama3-70b-8192").strip()
    if not key:
        raise LLMError("GROQ_API_KEY is not set in .env")
    try:
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={
                "model": model,
                "messages": [{"role": "user", "content": "Reply with the single word: ok"}],
                "max_tokens": 5,
                "temperature": 0,
            },
            timeout=30,
        )
    except requests.RequestException as exc:
        raise LLMError(f"Groq unreachable: {exc}") from exc
    if resp.status_code in {401, 403}:
        raise LLMError("Groq rejected the API key (401/403).")
    if not resp.ok:
        raise LLMError(f"Groq returned HTTP {resp.status_code}.")
    return "groq:" + model


def _ollama_ping() -> str:
    base = (os.getenv("OLLAMA_BASE_URL") or "http://localhost:11434").strip().rstrip("/")
    model = (os.getenv("OLLAMA_MODEL") or "gemma3:1b").strip()
    try:
        resp = requests.post(
            f"{base}/api/generate",
            json={"model": model, "prompt": "Reply with the single word: ok", "stream": False},
            timeout=30,
        )
    except requests.RequestException as exc:
        raise LLMError(f"Ollama unreachable: {exc}") from exc
    if resp.status_code != 200:
        raise LLMError(f"Ollama returned HTTP {resp.status_code}.")
    return "ollama:" + model


def verify() -> str:
    """Handshake: prefer Groq, fall back to Ollama (Q2c)."""
    config.load_env()
    errors = []
    for fn in (_groq_ping, _ollama_ping):
        try:
            return fn()
        except LLMError as exc:
            errors.append(str(exc))
    raise LLMError("No LLM provider available: " + " | ".join(errors))
