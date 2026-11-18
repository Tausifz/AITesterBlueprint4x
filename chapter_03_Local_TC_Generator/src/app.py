from __future__ import annotations

import streamlit as st

from config.config_manager import load_config
from ui import generator_view, settings_view

st.set_page_config(page_title="Jira AI Test Case Generator", layout="wide")

if "config" not in st.session_state:
    st.session_state["config"] = load_config()

config = st.session_state["config"]
with st.sidebar:
    st.title("Jira Test Builder")
    page = st.radio("Navigate", ["Generator", "Settings"], label_visibility="collapsed")

if page == "Generator":
    generator_view.render(config)
else:
    st.session_state["config"] = settings_view.render(config)
