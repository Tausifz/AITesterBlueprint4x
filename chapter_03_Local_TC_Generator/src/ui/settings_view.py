from __future__ import annotations

import streamlit as st

from config.config_manager import AppConfig, save_config, with_values
from services.groq_service import GroqProvider
from services.jira_service import JiraService
from services.ollama_service import OllamaProvider
from utils.validators import normalize_jira_url, validate_url


def render(config: AppConfig) -> AppConfig:
    st.title("Settings")
    st.caption("Configuration is stored in the local .env file. Secrets remain masked in this interface.")
    with st.form("settings_form"):
        st.subheader("Jira")
        jira_url = st.text_input("Jira URL", value=config.jira_url)
        jira_email = st.text_input("Jira email", value=config.jira_email)
        jira_api_token = st.text_input("Jira API token", value=config.jira_api_token, type="password")
        st.subheader("LLM")
        provider = st.selectbox("Provider", ["Ollama", "Groq"], index=0 if config.provider.lower() == "ollama" else 1)
        ollama_url = st.text_input("Ollama URL", value=config.ollama_base_url)
        ollama_model = st.text_input("Ollama model", value=config.ollama_model)
        groq_api_key = st.text_input("Groq API key", value=config.groq_api_key, type="password")
        groq_model = st.text_input("Groq model", value=config.groq_model)
        submitted = st.form_submit_button("Save settings", type="primary")
    if submitted:
        try:
            updated = with_values(config, jira_url=normalize_jira_url(jira_url), jira_email=jira_email.strip(), jira_api_token=jira_api_token.strip(), ollama_base_url=validate_url(ollama_url, "Ollama URL"), ollama_model=ollama_model.strip(), groq_api_key=groq_api_key.strip(), groq_model=groq_model.strip(), provider=provider)
            save_config(updated)
            st.session_state["config"] = updated
            st.success("Settings saved.")
            config = updated
        except ValueError as exc:
            st.error(str(exc))
    st.subheader("Connection tests")
    col_jira, col_llm = st.columns(2)
    with col_jira:
        if st.button("Test Jira connection", use_container_width=True):
            try:
                JiraService(config).test_connection()
                st.success("Jira connection succeeded.")
            except RuntimeError as exc:
                st.error(str(exc))
    with col_llm:
        if st.button("Test LLM connection", use_container_width=True):
            try:
                provider_service = OllamaProvider(config) if config.provider.lower() == "ollama" else GroqProvider(config)
                provider_service.test_connection()
                st.success(f"{config.provider} configuration is ready.")
            except RuntimeError as exc:
                st.error(str(exc))
    return config
