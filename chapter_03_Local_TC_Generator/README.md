# Jira AI Test Case Generator

A two-page Streamlit application that retrieves Jira tickets and generates QA test cases with Ollama or Groq.

## Setup

From this directory, install dependencies:

```powershell
py -m pip install -r requirements.txt
```

Configure `src/.env` with the keys shown in `.env.example`. Keep the file private and never commit it.

Start the application:

```powershell
cd src
py -m streamlit run app.py
```

The app loads `templates/TestCase_creator.md` at runtime. Ollama defaults to `gemma3:1b` at `http://localhost:11434`. Groq is used only when selected explicitly in Settings.
