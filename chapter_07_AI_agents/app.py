from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import streamlit as st

from tools import navigation
from tools.errors import JiraError
from tools.plan_build import PlanBuildError
from tools.schema_validator import SchemaError

st.set_page_config(page_title="Test Plan Creator", layout="wide")

st.title("🧪 Test Plan Creator")
st.caption("Jira ID → traceable test plan (B.L.A.S.T. / A.N.T.)")

key = st.text_input("Jira issue key or URL", value="AL-3", placeholder="e.g. AL-3 or https://…/browse/AL-3")

col1, col2 = st.columns(2)
run_btn = col1.button("Generate Test Plan", type="primary")
dry_btn = col2.button("Dry run (no LLM)")

if run_btn or dry_btn:
    if not key.strip():
        st.warning("Enter a Jira key first.")
    else:
        with st.spinner("Working…"):
            try:
                result = navigation.run(key.strip(), dry_run=dry_btn)
            except JiraError as exc:
                st.error(f"Jira error: {exc}")
            except SchemaError as exc:
                st.error(f"Schema error: {exc}")
            except PlanBuildError as exc:
                st.error(f"LLM error: {exc}")
            except Exception as exc:
                st.error(f"Unexpected error: {exc}")
            else:
                if dry_btn:
                    t = result["ticket"]
                    st.success(f"Dry run OK — {t['key']} ({t['issuetype']}) plannable={result['readiness']['plannable']}")
                    st.subheader("Extracted acceptance criteria")
                    st.write(t["acceptance_criteria"] or "None")
                else:
                    out = Path(result["output"])
                    st.success(f"Generated: `{out.name}`")
                    st.markdown(out.read_text(encoding="utf-8"))
