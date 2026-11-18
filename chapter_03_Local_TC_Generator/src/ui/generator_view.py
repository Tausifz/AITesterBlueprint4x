from __future__ import annotations

from pathlib import Path

import streamlit as st

from config.config_manager import AppConfig
from services.groq_service import GroqProvider
from services.jira_service import JiraService
from services.ollama_service import OllamaProvider
from services.test_case_generator import TestCaseGenerator

TEMPLATE_PATH = Path(__file__).resolve().parents[2] / "templates" / "TestCase_creator.md"


def render(config: AppConfig) -> None:
    st.title("Jira AI Test Case Generator")
    st.caption("Retrieve a Jira requirement and turn it into focused, executable test cases.")
    ticket_key = st.text_input("Jira ticket ID", placeholder="PROJ-123")
    provider_name = st.selectbox("LLM provider", ["Ollama", "Groq"], index=0 if config.provider.lower() == "ollama" else 1)
    if st.button("Generate test cases", type="primary", use_container_width=True):
        if not ticket_key.strip():
            st.warning("Enter a Jira ticket ID first.")
            return
        with st.status("Fetching Jira ticket and generating test cases...", expanded=False) as status:
            try:
                ticket = JiraService(config).fetch_ticket(ticket_key)
                st.session_state["ticket"] = ticket
                provider = OllamaProvider(config) if provider_name == "Ollama" else GroqProvider(config)
                st.session_state["generated_tests"] = TestCaseGenerator(provider, TEMPLATE_PATH).generate(ticket)
                status.update(label="Test cases generated", state="complete")
            except (ValueError, RuntimeError) as exc:
                status.update(label="Generation failed", state="error")
                st.error(str(exc))
    ticket = st.session_state.get("ticket")
    if ticket:
        st.subheader(f"Jira Ticket: {ticket['key']}")
        st.write(f"**Summary:** {ticket['summary']}")
        st.write(f"**Status:** {ticket['status']}  |  **Priority:** {ticket['priority']}")
        with st.expander("Description and acceptance criteria", expanded=True):
            st.write(ticket["description"])
            st.write(f"**Acceptance criteria:** {ticket['acceptance_criteria']}")
    if st.session_state.get("generated_tests"):
        st.subheader("Generated Test Plan")
        st.markdown(st.session_state["generated_tests"])
