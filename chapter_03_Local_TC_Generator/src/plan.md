# Jira AI Test Case Generator - Implementation Plan

## 1. Goal

Build a runnable two-page Streamlit application that retrieves a Jira ticket and generates structured QA test cases using a template and either Ollama or Groq.

Credentials will be read from the existing `.env` file through configuration code. The plan and source code must never contain actual credential values.

## 2. Target Structure

```text
chapter_03_Local_TC_Generator/
├── app.py
├── pages/
│   ├── generator.py
│   └── settings.py
├── services/
│   ├── jira_service.py
│   ├── ollama_service.py
│   ├── groq_service.py
│   └── test_case_generator.py
├── config/
│   └── config_manager.py
├── templates/
│   └── TestCase_creator.md
├── utils/
│   └── validators.py
├── requirements.txt
├── .env.example
├── README.md
└── plan.md
```

## 3. Configuration and Secrets

1. Create a typed configuration module using environment variables.
2. Read `JIRA_URL`, `JIRA_EMAIL`, and `JIRA_API_TOKEN` for Jira.
3. Read `OLLAMA_BASE_URL` and `OLLAMA_MODEL`, defaulting to `http://localhost:11434` and `gemma3:1b`.
4. Read `GROQ_API_KEY` and `GROQ_MODEL` only when Groq is selected.
5. Validate required values before making external requests.
6. Keep API tokens masked in Streamlit and exclude them from logs, errors, generated prompts, and source control.
7. Add `.env.example` with variable names and empty placeholders only.

## 4. Template Handling

1. Use the existing `templates/TestCase_creator.md` as the initial template source.
2. Add a template loader that resolves the path from the project root rather than the current working directory.
3. Load the template at runtime and inject Jira ticket content into a clearly defined requirements section.
4. Preserve the template's anti-hallucination rules: use only supplied requirements and mark missing information instead of inventing it.
5. If multiple template types are needed later, add an explicit template selector rather than silently choosing one.
6. Show an actionable configuration error when the template is missing or unreadable.

## 5. Jira Service

1. Validate ticket IDs such as `PROJ-123` before sending a request.
2. Call the Jira REST API with the configured URL, email, and API token.
3. Use request timeouts and validate the HTTP response.
4. Extract only useful fields such as key, summary, description, status, priority, and acceptance criteria.
5. Convert authentication, invalid URL, timeout, not-found, and server failures into safe user-facing errors.
6. Never include the API token in exception messages or logs.

## 6. LLM Provider Layer

1. Define a small common provider interface with a method that accepts the constructed prompt and returns generated text.
2. Implement `OllamaProvider` using the configured local base URL and model.
3. Check Ollama availability and model availability before generation.
4. Implement `GroqProvider` separately and require an explicit provider selection plus a configured API key.
5. Do not automatically send Jira data to Groq when Ollama fails.
6. Convert connection, authentication, model, and generation failures into safe application errors.

## 7. Test Case Generation Service

1. Combine the Jira fields and loaded template into one prompt.
2. Instruct the selected provider to generate relevant, structured test cases only from the Jira content.
3. Request coverage for happy paths, negative cases, validation, boundaries, permissions, integrations, and acceptance criteria when applicable.
4. Request fields such as test ID, title, objective, Jira reference, preconditions, test data, steps, expected result, priority, test type, and positive/negative classification.
5. Keep prompt construction out of the Streamlit pages.
6. Return displayable text or structured data with a clear error when generation fails.

## 8. Streamlit Pages

### Generator Page

1. Display a Jira ticket ID input and a Generate button.
2. Fetch and display the ticket summary, description, status, priority, and acceptance criteria.
3. Allow the user to choose the configured LLM provider.
4. Generate and display the test plan.
5. Provide a regenerate action without losing the selected ticket.
6. Display friendly errors without stack traces or secrets.

### Settings Page

1. Display Jira URL and email fields.
2. Display the Jira API token and Groq API key as password fields.
3. Display provider, Ollama URL/model, and Groq model settings.
4. Save settings using the chosen local configuration mechanism without exposing secrets.
5. Provide Test Jira Connection and Test LLM Connection actions.
6. Preserve values between sessions while keeping secrets masked.

## 9. Application Entry Point

1. Create `app.py` as the Streamlit entry point.
2. Provide navigation to Generator and Settings.
3. Initialize configuration and services through the application layer.
4. Keep page modules focused on UI and delegate integration work to services.

## 10. Dependencies and Documentation

Add only required dependencies, likely:

- `streamlit`
- `requests`
- `python-dotenv`
- `groq` or the selected Groq HTTP client

Document setup, `.env` variables, Ollama model preparation, installation, and startup in `README.md`:

```bash
pip install -r requirements.txt
streamlit run app.py
```

## 11. Validation Strategy

1. Validate configuration parsing with missing and complete environment values.
2. Test ticket ID validation and template path resolution.
3. Test Jira success, unauthorized, not-found, timeout, and invalid URL cases using mocked HTTP responses.
4. Test Ollama availability, missing model, successful generation, and failure cases.
5. Test Groq selection, missing key, and successful generation.
6. Test that exceptions never contain secrets.
7. Run the application locally with configured credentials and verify both pages.
8. Perform one real Jira retrieval and one real Ollama generation only after configuration is confirmed.

## 12. Acceptance Checklist

- [ ] Streamlit starts successfully.
- [ ] Generator and Settings pages are reachable.
- [ ] Jira credentials are loaded from configuration, not hard-coded.
- [ ] A Jira ticket can be retrieved through the REST API.
- [ ] The existing template is loaded dynamically.
- [ ] Ollama with `gemma3:1b` can generate test cases.
- [ ] Groq works only when explicitly selected and configured.
- [ ] Generated cases are structured and relevant to the Jira ticket.
- [ ] Missing configuration and integration failures show actionable messages.
- [ ] Tokens are masked and absent from logs, UI output, prompts, and source code.
- [ ] `.env.example` contains placeholders only.
- [ ] README setup instructions work from a clean environment.
