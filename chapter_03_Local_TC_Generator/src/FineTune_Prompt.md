# RICEPOT Prompt - Jira AI Test Case Generator

## R - Role

Act as a Senior QA Automation Architect and Python Full-Stack Engineer. Build a production-quality Jira-to-test-case generator using Python, Streamlit, REST APIs, and LLM integrations.

## I - Instructions

Build a two-page Streamlit application:

1. **Generator:** accept a Jira ticket ID, retrieve its details, load the test-case template, generate test cases, and display the Jira details and generated plan.
2. **Settings:** configure Jira and LLM connections, save settings securely, and provide connection-test actions.

Keep UI, configuration, Jira integration, prompt construction, template loading, and LLM providers modular. Use Jira REST APIs, not web scraping. Use Ollama with Gemma 3 1B as the primary provider and Groq as an optional user-selected provider. Do not silently fall back to Groq or expose secrets.

Handle invalid configuration, missing tickets or templates, connection failures, unavailable models, and generation failures with clear UI messages. Do not expose tokens or stack traces.

## C - Context

Workflow:

```text
User enters ticket ID
  -> Fetch Jira ticket
  -> Load templates/test_case_template.txt
  -> Build the LLM prompt
  -> Generate test cases with Ollama or Groq
  -> Display the Jira details and test plan
```

Jira requires a URL, email, and API token. Supported ticket IDs include `PROJ-123`, `ABC-456`, and `TEST-101`. Ollama normally runs at `http://localhost:11434` with model `gemma3:1b`. Use a provider abstraction so more LLM providers can be added later.

## E - Example

The Generator page may look like this:

```text
Jira AI Test Case Generator
Ticket ID: [ PROJ-123 ]  [ Generate Test Cases ]

Jira Ticket: summary, description, status, priority, acceptance criteria

Generated Test Plan:
TC-001 - Verify successful password reset
Preconditions: ...
Steps: 1. ... 2. ...
Expected Result: ...
Priority: High
```

The Settings page should provide Jira URL, email, masked API token, provider, Ollama URL/model, masked Groq key/model, save, and connection-test controls. Settings must persist between sessions.

## P - Parameters

Read these values from environment variables or secure local configuration. Never invent or hard-code credentials:

```text
JIRA_URL
JIRA_EMAIL
JIRA_API_TOKEN
OLLAMA_BASE_URL
OLLAMA_MODEL
GROQ_API_KEY
GROQ_MODEL
```

Defaults:

```text
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma3:1b
```

Provide `.env.example` with placeholders only. Load `templates/test_case_template.txt` at runtime; do not embed the complete template in Python. Generated cases should include, where applicable, ID, title, objective, Jira reference, preconditions, test data, steps, expected result, priority, test type, and positive/negative classification. Cover relevant happy paths, negative paths, validation, boundaries, permissions, integrations, and acceptance criteria without inventing requirements.

## O - Output

Create a complete runnable project with this structure:

```text
jira-ai-test-generator/
├── app.py
├── pages/generator.py
├── pages/settings.py
├── services/jira_service.py
├── services/ollama_service.py
├── services/groq_service.py
├── services/test_case_generator.py
├── config/config_manager.py
├── templates/test_case_template.txt
├── utils/validators.py
├── requirements.txt
├── .env.example
└── README.md
```

Use modern, modular Python with reasonable HTTP timeouts, response validation, explicit exception handling, and no duplicated integration logic. Keep providers separate behind a common interface. Persist settings securely and never log or display secrets.

The application must run with:

```bash
pip install -r requirements.txt
streamlit run app.py
```

Acceptance criteria: both pages work; Jira retrieval works; the template is loaded dynamically; Ollama and optional Groq generation work; errors are actionable; generated cases are structured and relevant; no credentials are hard-coded; and the project runs after configuration.

## T - Tone

Be technical, concise, precise, and implementation-focused. Provide working code rather than pseudocode, state necessary assumptions, and do not claim a feature is complete unless its required files and end-to-end flow are implemented.
