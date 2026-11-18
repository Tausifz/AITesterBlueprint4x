from __future__ import annotations

import requests

from config.config_manager import AppConfig


class GroqServiceError(RuntimeError):
    pass


class GroqProvider:
    def __init__(self, config: AppConfig) -> None:
        self.api_key = config.groq_api_key
        self.model = config.groq_model

    def test_connection(self) -> None:
        if not self.api_key or not self.model:
            raise GroqServiceError("Configure GROQ_API_KEY and GROQ_MODEL before selecting Groq.")

    def generate(self, prompt: str) -> str:
        self.test_connection()
        try:
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json={"model": self.model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2},
                timeout=180,
            )
            if response.status_code in {401, 403}:
                raise GroqServiceError("Groq rejected the configured API key.")
            response.raise_for_status()
            result = response.json()["choices"][0]["message"]["content"].strip()
        except GroqServiceError:
            raise
        except (requests.RequestException, KeyError, IndexError, TypeError, ValueError) as exc:
            raise GroqServiceError("Groq failed to generate test cases.") from exc
        if not result:
            raise GroqServiceError("Groq returned an empty response.")
        return result
