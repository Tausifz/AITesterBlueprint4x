from __future__ import annotations

import requests

from config.config_manager import AppConfig


class OllamaServiceError(RuntimeError):
    pass


class OllamaProvider:
    def __init__(self, config: AppConfig) -> None:
        self.base_url = config.ollama_base_url
        self.model = config.ollama_model

    def test_connection(self) -> None:
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            response.raise_for_status()
            models = {item.get("name") for item in response.json().get("models", [])}
        except (requests.RequestException, ValueError) as exc:
            raise OllamaServiceError("Ollama is unavailable. Start Ollama and try again.") from exc
        if self.model not in models:
            raise OllamaServiceError(f"Ollama model '{self.model}' is not available locally.")

    def generate(self, prompt: str) -> str:
        self.test_connection()
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=180,
            )
            response.raise_for_status()
            result = response.json().get("response", "").strip()
        except (requests.RequestException, ValueError) as exc:
            raise OllamaServiceError("Ollama failed to generate test cases.") from exc
        if not result:
            raise OllamaServiceError("Ollama returned an empty response.")
        return result
