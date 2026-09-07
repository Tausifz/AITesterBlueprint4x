# VWO Login Module Test Plan and Test Cases

> **Test Plan ID:** TP-VWO-AUTH-001  
> **Application:** VWO (`https://app.vwo.com`)  
> **Module:** Authentication / Login  
> **Status:** Draft for review  
> **Execution rule:** Do not invent credentials, limits, messages, timeout values, provider configuration, or compliance controls. Mark a case **Blocked** when its dependency is unavailable.

## Contents

1. [Complete Test Plan](#1-complete-test-plan)
2. [Requirement Traceability Matrix](#2-requirement-traceability-matrix)
3. [Test Cases](#3-test-cases)
4. [Test Data Requirements](#4-test-data-requirements)
5. [Risk Matrix](#5-risk-matrix)
6. [Regression Test Suite](#6-regression-test-suite)

# 1. Complete Test Plan

## 1.1 Objective and Business Overview

Validate that registered VWO users can securely access the appropriate dashboard through email/password, Google, or enterprise SSO while receiving usable, accessible, responsive, and recoverable login behavior.

## 1.2 Scope

**In scope:** email/password login, input validation, password recovery, Google login, enterprise SSO, Remember Me, session creation and expiry, logout, role-based landing, error handling, dashboard redirection, security controls, accessibility, responsive UI, browser compatibility, analytics, availability, and login performance.

**Out of scope:** post-login feature behavior, account provisioning, identity-provider administration, password-policy design, infrastructure implementation, and compliance controls not defined by the supplied PRD.

## 1.3 Assumptions and Dependencies

| Item | Requirement |
|---|---|
| Assumptions | A valid test tenant, approved test accounts, and a defined browser/device matrix are supplied. |
| Dependencies | VWO login service, dashboard, email delivery, Google, enterprise SSO, MFA, analytics, accessibility tools, and authorized security/load environments. |
| Requirement gaps | Exact messages, password rules, timeout, Remember Me duration, rate limit, SSO provider, supported browsers, hashing algorithm, and concurrency target require confirmation. |

## 1.4 Test Strategy

| Dimension | Approach |
|---|---|
| Methodology | Risk-based, requirement-based, shift-left, exploratory, regression, and UAT-oriented testing. |
| Test levels | Component/API where available; integration for providers, email, analytics, and dashboard; system/E2E; security, accessibility, performance, and compliance assessment. |
| Test types | Positive, negative, boundary, validation, security, accessibility, responsive, compatibility, performance, and recovery. |
| Automation | Automate stable smoke, regression, API, browser, accessibility, and approved security/performance checks. |

## 1.5 Entry and Exit Criteria

**Entry:** approved PRD and UI evidence; reachable environment; test accounts and provider configurations; approved data; authorized security/load environments; analytics and evidence access.

**Exit:** applicable cases executed; Critical/High blockers resolved or accepted; security, accessibility, performance, and traceability reviews complete; blocked cases and requirement gaps documented; evidence retained for Critical and compliance cases.

## 1.6 Environment and Compatibility

- HTTPS-enabled test, staging, and authorized performance/security environments.
- Desktop and mobile viewport coverage, including touch interaction.
- Approved versions of Chrome, Edge, Firefox, and Safari. Record the exact version used.
- Screen reader, keyboard-only, high-contrast, zoom, and light/dark theme capability where supported.
- Approved standard and degraded network profiles.

## 1.7 Deliverables, Defects, Approvals, and Metrics

| Area | Definition |
|---|---|
| Deliverables | Approved plan, test cases, RTM, test data, automation results, performance/security/accessibility evidence, defect report, and execution summary. |
| Defect process | Record steps, environment, evidence, expected/actual result, severity, priority, and requirement mapping. Critical/High authentication or security defects block release unless accepted. |
| Approval matrix | QA Architect: strategy/exit; Product Owner: requirements/UAT; Security: security evidence; Accessibility: WCAG evidence; Engineering: resolution; Release Manager: go/no-go. |
| Metrics | Pass rate, blocked rate, requirement coverage, defect density, reopened defects, automation rate, login success rate, response time, availability, accessibility violations, and security findings. |
| Resources | QA Architect, functional QA, automation engineer, security tester, performance engineer, accessibility specialist, developer, Product Owner, and release manager. |

## 1.8 Regression Strategy

Run P0 smoke on every deploy, P1 authentication and provider suites on every release candidate, and the full P2 suite for major releases or authentication changes. Re-run impacted cases after fixes.

# 2. Requirement Traceability Matrix

| Requirement ID | Feature | Test Case IDs |
|---|---|---|
| REQ_LOGIN_001 | Email/password authentication | TC-AUTH-001 to TC-AUTH-012 |
| REQ_LOGIN_002 | Validation and recovery | TC-VAL-001 to TC-VAL-008 |
| REQ_LOGIN_003 | Google and enterprise SSO | TC-IDP-001 to TC-IDP-006 |
| REQ_LOGIN_004 | Remember Me and sessions | TC-SES-001 to TC-SES-008 |
| REQ_LOGIN_005 | Role-based access | TC-ROLE-001 to TC-ROLE-003 |
| REQ_LOGIN_006 | Security controls | TC-SEC-001 to TC-SEC-012 |
| REQ_LOGIN_007 | UI and responsive experience | TC-UI-001 to TC-UI-012 |
| REQ_LOGIN_008 | Accessibility | TC-ACC-001 to TC-ACC-006 |
| REQ_LOGIN_009 | Browser compatibility | TC-BRW-001 to TC-BRW-004 |
| REQ_LOGIN_010 | Performance and availability | TC-PERF-001 to TC-PERF-005 |
| REQ_LOGIN_011 | Analytics integration | TC-INT-001 to TC-INT-002 |

# 3. Test Cases

This section is the complete test-case catalog in a Jira-style test format. The detailed execution view uses one two-column table per test case, matching the supplied reference image. The left column is the Jira field and the right column contains the execution detail. Cases requiring environment-specific values must be marked **Blocked** when those values are unavailable.

**Column key:** `P0` = release blocker, `P1` = high, `P2` = medium, `P3` = low. `Critical`, `High`, `Medium`, and `Low` are severity levels. Test data values are supplied by the environment.

### Choose a Test Path

| Need to validate | Start with | Main outcome |
|---|---|---|
| Can a user sign in? | Authentication and Validation | Correct login, validation, error, and recovery behavior |
| Can a user sign in through a provider? | Identity Providers and Sessions | Correct Google, SSO, Remember Me, timeout, and logout behavior |
| Can the system resist misuse? | Security | No bypass, injection, replay, transport, or sensitive-data exposure |
| Does the page work for users? | User Interface and Accessibility | Clear, responsive, keyboard and screen-reader usable experience |
| Does it work across platforms? | Browser Compatibility | Consistent behavior in Chrome, Edge, Firefox, and Safari |
| Does it remain stable at scale? | Performance and Integration | Approved response, availability, concurrency, and analytics behavior |

### Jira Test Case Field Order

| Jira-style field | What the tester records |
|---|---|
| **Test Case ID** | Unique case key, for example `TC-PERF-003`. |
| **Requirement ID** | Requirement covered by the case. |
| **Module** | Functional area under test, for example Authentication, Security, or Performance. |
| **Summary** | One clear statement of the behavior under test. |
| **Preconditions** | Environment, account, configuration, or access required before execution. |
| **Test Steps** | Numbered actions performed in sequence. Do not combine unrelated actions in one step. |
| **Test Data** | Controlled values used during execution. Never record real secrets. |
| **Expected Result** | Observable result after completing the steps. |
| **Priority / Severity** | Business execution priority and impact if the case fails. |
| **Test Type** | Functional, negative, boundary, security, accessibility, performance, or integration classification. |

> **Jira execution rule:** Use the horizontal matrix as the searchable coverage index. Use the two-column execution table for the selected case. Keep **Test Steps** as a numbered list, for example: `1. Confirm the workload. 2. Start the profile. 3. Monitor the service. 4. Stop safely. 5. Compare the result with the SLA.`

## 3.0 Execution Workflow

1. Confirm the preconditions and test data before starting the case.
2. Record the build, browser, environment, tester, and execution date.
3. Perform the steps in order and record the observed result after each meaningful checkpoint.
4. Mark the case **Passed**, **Failed**, or **Blocked**. A missing requirement or unavailable dependency is **Blocked**, not **Passed**.
5. Attach screenshots, network evidence, logs, accessibility output, or performance results as appropriate.
6. Link any defect to the test case ID and requirement ID.

<details>
<summary><strong>3.1 Authentication and Validation</strong> - 20 cases</summary>

## 3.1 Authentication and Validation

| Test Case ID | Requirement ID | Module | Summary | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity | Test Type |
|---|---|---|---|---|---|---|---|---|---|
| TC-AUTH-001 | 001 | Authentication and Validation | Valid login | Active account | Open; enter email/password; submit | Valid credentials | User reaches relevant VWO dashboard | P0 | Critical | Positive/E2E |
| TC-AUTH-002 | 001 | Authentication and Validation | Invalid login | Login accessible | Enter invalid credentials; submit | Invalid credentials | Access denied with approved error | P0 | High | Negative |
| TC-AUTH-003 | 001 | Authentication and Validation | Empty email | Login accessible | Leave email empty; submit | Empty email | Required-field feedback appears | P1 | High | Validation |
| TC-AUTH-004 | 001 | Authentication and Validation | Empty password | Login accessible | Leave password empty; submit | Empty password | Required-field feedback appears | P1 | High | Validation |
| TC-AUTH-005 | 001 | Authentication and Validation | Both fields empty | Login accessible | Submit blank form | Empty fields | No authentication; both fields identified | P1 | High | Negative |
| TC-AUTH-006 | 001 | Authentication and Validation | Incorrect email format | Login accessible | Enter malformed email; blur/submit | `user`, `user@`, `@example.com` | Format validation appears | P1 | High | Boundary |
| TC-AUTH-007 | 001 | Authentication and Validation | Password case sensitivity | Active account | Alter password case; submit | Case-altered password | Altered case is not accepted | P1 | High | Negative/Security |
| TC-AUTH-008 | 001 | Authentication and Validation | Email whitespace | Login accessible | Add surrounding spaces; submit | Spaced valid email | Approved normalization applies safely | P1 | Medium | Boundary |
| TC-AUTH-009 | 001 | Authentication and Validation | Multiple failures | Authorized security environment | Repeat invalid attempts per plan | Invalid credentials | Configured throttling/protection activates | P0 | Critical | Security |
| TC-AUTH-010 | 001 | Authentication and Validation | Account lockout | Lockout policy and account exist | Trigger approved failure sequence | Controlled account | Configured lockout and recovery occur | P0 | Critical | Negative/Security |
| TC-AUTH-011 | 001 | Authentication and Validation | Password reset navigation | Login accessible | Select Forgot Password | Registered email | Approved recovery flow opens | P1 | High | Positive |
| TC-AUTH-012 | 001 | Authentication and Validation | Password strength | Policy configured | Enter each configured strength level | Approved passwords | Feedback matches configured policy | P1 | High | Validation |
| TC-VAL-001 | 002 | Authentication and Validation | Blur validation | Login accessible | Enter invalid value; move focus | Invalid value | Validation triggers on blur | P1 | Medium | Validation |
| TC-VAL-002 | 002 | Authentication and Validation | Submit validation | Login accessible | Enter invalid values; submit | Invalid form | Invalid fields identified clearly | P1 | Medium | Negative |
| TC-VAL-003 | 002 | Authentication and Validation | Recovery options | Failed login possible | Fail login; inspect page | Invalid credentials | Approved recovery/support path exists | P1 | High | Recovery |
| TC-VAL-004 | 002 | Authentication and Validation | Account enumeration | Authorized environment | Try registered and unregistered IDs | Controlled IDs | Messages do not expose account state | P0 | High | Security |
| TC-VAL-005 | 002 | Authentication and Validation | Input length boundary | Limits defined | Enter at and above each limit | Boundary strings | Defined boundary behavior occurs safely | P1 | Medium | Boundary |
| TC-VAL-006 | 002 | Authentication and Validation | Special characters | Login accessible | Submit approved special characters | Safe test data | Input handled safely | P1 | High | Security |
| TC-VAL-007 | 002 | Authentication and Validation | Duplicate submit | Login accessible | Double-click/press Enter repeatedly | Valid credentials | One controlled request is processed | P1 | Medium | Negative |
| TC-VAL-008 | 002 | Authentication and Validation | Loading state | Login accessible | Submit; observe processing | Valid credentials | Loading state appears; repeat submit prevented | P2 | Medium | UI |

</details>

<details>
<summary><strong>3.2 Identity Providers, Sessions, and Authorization</strong> - 17 cases</summary>

## 3.2 Identity Providers, Sessions, and Authorization

| Test Case ID | Requirement ID | Module | Summary | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity | Test Type |
|---|---|---|---|---|---|---|---|---|---|
| TC-IDP-001 | 003 | Identity Providers | Google success | Google test identity | Select Google; complete flow | Test identity | User returns authenticated to VWO | P1 | High | Integration |
| TC-IDP-002 | 003 | Identity Providers | Google cancellation | Google configured | Start flow; cancel | Cancel action | Safe return to login with feedback | P1 | Medium | Negative |
| TC-IDP-003 | 003 | Identity Providers | SSO success | Enterprise SSO configured | Select SSO; complete flow | Test SSO identity | User returns authenticated to VWO | P1 | High | Integration |
| TC-IDP-004 | 003 | Identity Providers | SSO failure/timeout | SSO configured | Trigger failed/expired response | Provider response | No access; recovery feedback appears | P1 | High | Negative |
| TC-IDP-005 | 003 | Identity Providers | Unconfigured SSO | Unconfigured tenant | Select SSO | Unconfigured tenant | Safe configuration error; no access | P1 | High | Negative |
| TC-IDP-006 | 003 | Identity Providers | Callback replay | Authorized security environment | Replay used/expired callback | Test callback | Callback rejected; no session created | P0 | Critical | Security |
| TC-SES-001 | 004 | Session Management | Remember Me on | Valid account | Select; login; repeat approved check | Valid credentials | Configured persistence occurs | P1 | High | Positive |
| TC-SES-002 | 004 | Session Management | Remember Me off | Valid account | Login without selection; revisit | Valid credentials | Non-persistent behavior occurs | P1 | Medium | Negative |
| TC-SES-003 | 004 | Session Management | Session timeout | Timeout configured | Login; wait; use protected page | Active session | Session expires as configured | P0 | Critical | Boundary |
| TC-SES-004 | 004 | Session Management | Expired redirect | Protected URL and expired session | Open protected URL | Protected URL | Redirect to login; safe return handling | P1 | High | Recovery |
| TC-SES-005 | 004 | Session Management | Logout invalidation | Active session | Logout; revisit protected URL | Active session | Session invalidated; no protected content | P0 | Critical | Security |
| TC-SES-006 | 004 | Session Management | Back after logout | Logged-out user | Press Back; refresh | Protected page | Protected data remains inaccessible | P0 | Critical | Security |
| TC-SES-007 | 004 | Session Management | Secure cookies | Authorized inspection | Login; inspect cookies | Session cookie | Secure, HttpOnly, SameSite follow policy | P0 | Critical | Security |
| TC-SES-008 | 004 | Session Management | Session performance | Performance environment | Login under approved workload | Approved workload | Creation meets approved SLA | P1 | High | Performance |
| TC-ROLE-001 | 005 | Authorization | Owner access | Owner account | Login; inspect landing/access | Account Owner | Only approved areas available | P1 | High | Role |
| TC-ROLE-002 | 005 | Authorization | Viewer access | Viewer account | Login; inspect landing/access | Viewer | Restricted areas unavailable | P1 | High | Role/Negative |
| TC-ROLE-003 | 005 | Authorization | Unauthorized URL | Low-privilege account | Open restricted URL directly | Protected URL | Access denied; no data disclosed | P0 | Critical | Security |

</details>

<details>
<summary><strong>3.3 Security</strong> - 12 cases</summary>

## 3.3 Security

| Test Case ID | Requirement ID | Module | Summary | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity | Test Type |
|---|---|---|---|---|---|---|---|---|---|
| TC-SEC-001 | 006 | Security and Compliance | SQL injection | Authorized security environment | Submit approved injection payloads | Approved payload set | No bypass or server error leak | P0 | Critical | Security |
| TC-SEC-002 | 006 | Security and Compliance | XSS | Authorized security environment | Submit encoded/script payloads | Approved payload set | Payload is not executed/reflected unsafely | P0 | Critical | Security |
| TC-SEC-003 | 006 | Security and Compliance | Auth bypass | Authorized security environment | Execute approved bypass vectors | Test vectors | No access without valid authentication | P0 | Critical | Security |
| TC-SEC-004 | 006 | Security and Compliance | Session hijacking | Authorized security environment | Reuse controlled session evidence | Test session | Replay/stolen evidence rejected | P0 | Critical | Security |
| TC-SEC-005 | 006 | Security and Compliance | HTTPS/TLS | Security environment | Open HTTP; inspect traffic | Login URL | HTTPS enforced; credentials encrypted | P0 | Critical | Security |
| TC-SEC-006 | 006 | Security and Compliance | Password masking | Login accessible | Type password; inspect field | Test password | Password masked and not unnecessarily exposed | P1 | High | Security/UI |
| TC-SEC-007 | 006 | Security and Compliance | Reset token security | Authorized reset environment | Request reset; replay/expire token | Registered email | Token protected, expires, and cannot replay | P0 | Critical | Security |
| TC-SEC-008 | 006 | Security and Compliance | Telemetry secrecy | Inspection access | Perform success/failure; inspect logs | Controlled data | Passwords/tokens absent from telemetry | P0 | Critical | Security |
| TC-SEC-009 | 006 | Security and Compliance | OWASP alignment | Authorized assessment | Run approved checklist | Checklist | Controls pass or exceptions documented | P0 | Critical | Compliance |
| TC-SEC-010 | 006 | Security and Compliance | GDPR handling | Compliance environment | Run approved data scenarios | Test identity | Applicable controls evidenced/gaps recorded | P0 | Critical | Compliance |
| TC-SEC-011 | 006 | Security and Compliance | CCPA handling | Compliance environment | Run approved data scenarios | Test identity | Applicable controls evidenced/gaps recorded | P0 | Critical | Compliance |
| TC-SEC-012 | 006 | Security and Compliance | Zero unauthorized access | Authorized assessment | Run approved attack suite | Attack suite | No successful unauthorized access in scope | P0 | Critical | Security |

</details>

<details>
<summary><strong>3.4 User Interface, Accessibility, Compatibility, Performance, and Integration</strong> - 29 cases</summary>

## 3.4 User Interface

The following domains are intentionally separated so visual, accessibility, browser, performance, and integration checks can be executed independently.

### 3.4.1 User Interface

| Test Case ID | Requirement ID | Module | Summary | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity | Test Type |
|---|---|---|---|---|---|---|---|---|---|
| TC-UI-001 | 007 | User Interface | Logo visibility | Login accessible | Open at supported sizes | Viewports | Logo visible and unclipped | P2 | Low | UI |
| TC-UI-002 | 007 | User Interface | Form alignment | Login accessible | Inspect viewport matrix | Viewports | No overlap or unexpected shift | P2 | Medium | UI |
| TC-UI-003 | 007 | User Interface | Field labels/errors | Login accessible | Inspect; enter valid/invalid data | Boundary data | Labels and states are clear | P1 | Medium | UI/Validation |
| TC-UI-004 | 007 | User Interface | Login button | Login accessible | Inspect; submit valid/invalid data | Form data | Usable; reflects processing | P1 | Medium | UI |
| TC-UI-005 | 007 | User Interface | Forgot Password link | Login accessible | Select link; use keyboard | Link action | Visible and opens recovery flow | P1 | High | UI |
| TC-UI-006 | 007 | User Interface | SSO/Google controls | Providers configured | Inspect and activate controls | Provider accounts | Correct provider launches | P1 | High | Integration |
| TC-UI-007 | 007 | User Interface | Responsive layout | Mobile/desktop available | Resize; use touch | Viewport matrix | No clipping, overlap, or horizontal scroll | P1 | High | Responsive |
| TC-UI-008 | 007 | User Interface | Auto-focus/labels | Login accessible | Load; click labels | Form fields | Approved focus and associations work | P2 | Medium | Accessibility |
| TC-UI-009 | 007 | User Interface | Theme support | Themes available | Inspect Light/Dark modes | Theme settings | Supported themes remain readable | P2 | Medium | UI |
| TC-UI-010 | 007 | User Interface | Free-trial path | Login accessible | Locate/select registration CTA | CTA action | Approved registration path opens | P2 | Low | Navigation |
| TC-UI-011 | 007 | User Interface | Dashboard redirect | Valid account | Login; inspect destination | Valid credentials | Approved dashboard/landing opens | P1 | High | Integration |
| TC-UI-012 | 007 | User Interface | Error layout | Failure possible | Trigger errors at sizes | Invalid credentials | Error fits without overlap | P2 | Medium | UI |

### 3.4.2 Accessibility

| Test Case ID | Requirement ID | Module | Summary | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity | Test Type |
|---|---|---|---|---|---|---|---|---|---|
| TC-ACC-001 | 008 | Accessibility | Keyboard login | Login accessible | Operate with keyboard only | Keyboard | All controls operable | P1 | High | Accessibility |
| TC-ACC-002 | 008 | Accessibility | Tab order | Login accessible | Tab through controls | Keyboard | Order logical; focus visible | P1 | High | Accessibility |
| TC-ACC-003 | 008 | Accessibility | Screen reader | Reader available | Navigate controls/errors | Screen reader | Names, roles, states announced | P1 | High | Accessibility |
| TC-ACC-004 | 008 | Accessibility | ARIA labels | Inspection available | Inspect accessibility tree | Controls | Accurate accessible names/relations | P1 | High | Accessibility |
| TC-ACC-005 | 008 | Accessibility | Color contrast | Contrast tool | Measure text/focus/errors | Rendered UI | Applicable WCAG 2.1 AA passes | P1 | High | Accessibility |
| TC-ACC-006 | 008 | Accessibility | High contrast/zoom | Supported OS/browser | Enable settings; use login | Accessibility settings | Readable, usable, non-overlapping | P1 | High | Accessibility |

### 3.4.3 Browser Compatibility

| Test Case ID | Requirement ID | Module | Summary | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity | Test Type |
|---|---|---|---|---|---|---|---|---|---|
| TC-BRW-001 | 009 | Browser Compatibility | Chrome | Approved Chrome | Run P0 smoke | Browser matrix | P0 flow consistent | P1 | High | Compatibility |
| TC-BRW-002 | 009 | Browser Compatibility | Edge | Approved Edge | Run P0 smoke | Browser matrix | P0 flow consistent | P1 | High | Compatibility |
| TC-BRW-003 | 009 | Browser Compatibility | Firefox | Approved Firefox | Run P0 smoke | Browser matrix | P0 flow consistent | P1 | High | Compatibility |
| TC-BRW-004 | 009 | Browser Compatibility | Safari | Approved Safari | Run P0 smoke | Browser matrix | P0 flow consistent | P1 | High | Compatibility |

### 3.4.4 Performance and Availability

| Test Case ID | Requirement ID | Module | Summary | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity | Test Type |
|---|---|---|---|---|---|---|---|---|---|
| TC-PERF-001 | 010 | Performance and Availability | Page load | SLA/network defined | Load; measure timing | Network profile | Approved load SLA met | P1 | High | Performance |
| TC-PERF-002 | 010 | Performance and Availability | Login response | Performance environment | Submit; measure response | Approved account | Approved response SLA met | P1 | High | Performance |
| TC-PERF-003 | 010 | Performance and Availability | Concurrent logins | Authorized load environment | Generate approved workload | Concurrency target | Stable service and acceptable latency | P0 | Critical | Performance |
| TC-PERF-004 | 010 | Performance and Availability | Availability | Monitoring window defined | Monitor login service | Monitoring config | Approved availability target met | P0 | Critical | Availability |
| TC-PERF-005 | 010 | Performance and Availability | Assets/CDN | Inspection/global environment | Inspect assets and regions | Approved regions | Approved optimization/CDN evidenced | P2 | Medium | Performance |

### 3.4.5 Analytics Integration

| Test Case ID | Requirement ID | Module | Summary | Preconditions | Test Steps | Test Data | Expected Result | Priority | Severity | Test Type |
|---|---|---|---|---|---|---|---|---|---|
| TC-INT-001 | 011 | Analytics Integration | Successful event | Analytics access | Complete valid login; inspect | Valid account | Approved event recorded without secrets | P2 | Medium | Integration |
| TC-INT-002 | 011 | Analytics Integration | Failed event | Analytics access | Complete failed login; inspect | Invalid credentials | Approved event recorded without secrets | P2 | Medium | Integration |

</details>

## 3.5 Detailed Jira Test Case Tables

These tables expand the highest-risk flows. Each table contains all ten requested Jira fields in a readable two-column format. The matrix above remains the complete coverage index.

### TC-AUTH-001 - Successful email/password login

| Field | Detail |
|---|---|
| Test Case ID | TC-AUTH-001 |
| Requirement | REQ_LOGIN_001 - Email/password authentication |
| Summary | Verify successful login with valid email and password |
| Priority / severity | P0 / Critical |
| Preconditions | Login environment is available; active test account exists; dashboard access is enabled. |
| Test data | Approved valid email and password. |
| Test type | Positive / End-to-end |
| Expected result | User is authenticated and reaches the approved VWO dashboard or landing page. |

**Steps**

1. Open the VWO login page.
2. Enter the approved email address.
3. Enter the approved password.
4. Select **Sign In** once.
5. Observe the loading state and final destination.

**Evidence to capture:** final URL, dashboard landing state, timestamp, build, and browser.

### TC-AUTH-002 - Invalid credentials

| Field | Detail |
|---|---|
| Test Case ID | TC-AUTH-002 |
| Requirement | REQ_LOGIN_001 - Authentication failure handling |
| Summary | Verify login failure with invalid credentials |
| Priority / severity | P0 / High |
| Preconditions | Login page is available; controlled invalid credentials are approved. |
| Test data | Invalid email/password combination. |
| Test steps | See numbered steps below. |
| Test type | Negative / Functional |
| Expected result | Authentication is denied, no protected content is shown, and approved actionable feedback appears. |

**Steps**

1. Enter the controlled invalid email.
2. Enter the controlled invalid password.
3. Select **Sign In**.
4. Confirm that the user remains unauthenticated.
5. Record the exact observed message without rewriting it.

**Evidence to capture:** validation state, response status where authorized, screenshot, and defect ID if applicable.

### TC-AUTH-005 - Empty form submission

| Field | Detail |
|---|---|
| Test Case ID | TC-AUTH-005 |
| Requirement | REQ_LOGIN_001 - Required login fields |
| Summary | Verify validation for an empty login form |
| Priority / severity | P1 / High |
| Preconditions | Login page is available. |
| Test data | No input. |
| Test steps | See numbered steps below. |
| Test type | Negative / Validation |
| Expected result | Authentication is not attempted or is rejected; both required fields are identified accessibly. |

**Steps**

1. Open or reload the login page.
2. Leave email and password empty.
3. Select **Sign In**.
4. Verify visible and accessible validation feedback.
5. Verify focus moves to the first invalid field according to the approved UX.

### TC-AUTH-009 - Repeated failed attempts

| Field | Detail |
|---|---|
| Test Case ID | TC-AUTH-009 |
| Requirement | REQ_LOGIN_001 - Brute-force protection |
| Summary | Verify protection after repeated failed login attempts |
| Priority / severity | P0 / Critical |
| Preconditions | Written security test plan and authorized security environment are available. |
| Test data | Approved invalid credentials and approved attempt profile. |
| Test steps | See numbered steps below. |
| Test type | Security / Negative |
| Expected result | Configured rate limiting, throttling, challenge, or lockout behavior activates at the approved threshold. |

**Steps**

1. Confirm the approved attempt count and pacing.
2. Submit the controlled invalid request profile.
3. Observe response behavior at each checkpoint.
4. Stop immediately if the environment shows unexpected impact outside the test scope.
5. Record the observed protection and recovery behavior.

**Evidence to capture:** request profile, timestamps, response behavior, and security-tool output.

### TC-IDP-001 - Google login

| Field | Detail |
|---|---|
| Test Case ID | TC-IDP-001 |
| Requirement | REQ_LOGIN_003 - Google authentication |
| Summary | Verify successful Google authentication |
| Priority / severity | P1 / High |
| Preconditions | Approved Google test identity and provider configuration are available. |
| Test data | Approved Google identity. |
| Test steps | See numbered steps below. |
| Test type | Positive / Integration |
| Expected result | Provider authentication succeeds and the user returns to the correct authenticated VWO destination. |

**Steps**

1. Select **Sign in with Google**.
2. Complete the provider flow with the approved test identity.
3. Approve only the permissions required by the test setup.
4. Return to VWO and verify the authenticated state.
5. Confirm the landing page and account identity.

### TC-IDP-003 - Enterprise SSO login

| Field | Detail |
|---|---|
| Test Case ID | TC-IDP-003 |
| Requirement | REQ_LOGIN_003 - Enterprise SSO |
| Summary | Verify successful enterprise SSO authentication |
| Priority / severity | P1 / High |
| Preconditions | Enterprise SSO tenant, metadata, and test identity are configured. |
| Test data | Approved SSO identity. |
| Test steps | See numbered steps below. |
| Test type | Positive / Integration |
| Expected result | SSO authentication succeeds and grants only the access mapped to the account. |

**Steps**

1. Select the enterprise SSO option.
2. Complete the configured identity-provider flow.
3. Return to VWO.
4. Verify the authenticated user and assigned landing page.
5. Verify that the session is created only once.

### TC-SES-003 - Session timeout

| Field | Detail |
|---|---|
| Test Case ID | TC-SES-003 |
| Requirement | REQ_LOGIN_004 - Session management |
| Summary | Verify configured session timeout behavior |
| Priority / severity | P0 / Critical |
| Preconditions | Configured timeout value and an authenticated test account are available. |
| Test data | Valid account; approved timeout configuration. |
| Test steps | See numbered steps below. |
| Test type | Boundary / Security |
| Expected result | The session expires according to configuration and protected content cannot be used afterward. |

**Steps**

1. Authenticate with the approved account.
2. Confirm access to a protected page.
3. Remain idle for the configured timeout period plus the approved tolerance.
4. Attempt a protected action and refresh the page.
5. Verify redirect to login and the approved expired-session behavior.

### TC-SES-005 - Logout invalidates the session

| Field | Detail |
|---|---|
| Test Case ID | TC-SES-005 |
| Requirement | REQ_LOGIN_004 - Logout and session invalidation |
| Summary | Verify logout invalidates the authenticated session |
| Priority / severity | P0 / Critical |
| Preconditions | Authenticated session exists. |
| Test data | Valid authenticated account. |
| Test steps | See numbered steps below. |
| Test type | Security / Negative |
| Expected result | Logout invalidates the session and protected content cannot be recovered with Back or refresh. |

**Steps**

1. Authenticate and open a protected page.
2. Select **Logout**.
3. Use the browser Back button.
4. Refresh the previously protected page.
5. Attempt to open the protected URL directly.

### TC-ROLE-003 - Unauthorized URL access

| Field | Detail |
|---|---|
| Test Case ID | TC-ROLE-003 |
| Requirement | REQ_LOGIN_005 - Role-based authorization |
| Summary | Verify unauthorized direct URL access is denied |
| Priority / severity | P0 / Critical |
| Preconditions | Lower-privilege test account and approved restricted URL exist. |
| Test data | Viewer or other restricted role; protected URL. |
| Test steps | See numbered steps below. |
| Test type | Security / Authorization |
| Expected result | Access is denied or safely redirected and restricted data is not disclosed. |

**Steps**

1. Authenticate as the lower-privilege role.
2. Copy the approved restricted URL into the address bar.
3. Navigate directly to the URL.
4. Inspect the response and rendered page.
5. Verify that no restricted data, API response, or navigation control is exposed.

### TC-SEC-001 - SQL injection resistance

| Field | Detail |
|---|---|
| Test Case ID | TC-SEC-001 |
| Requirement | REQ_LOGIN_006 - Authentication security |
| Summary | Verify resistance to SQL injection payloads |
| Priority / severity | P0 / Critical |
| Preconditions | Written authorization and isolated security environment exist. |
| Test data | Approved SQL injection payload set. |
| Test steps | See numbered steps below. |
| Test type | Security / Negative |
| Expected result | Payloads are handled safely; no authentication bypass or sensitive error disclosure occurs. |

**Steps**

1. Confirm the approved payload list and target scope.
2. Submit each payload in the approved input field.
3. Observe authentication, response, and error behavior.
4. Review authorized server/security evidence.
5. Record each payload outcome and any finding.

### TC-SEC-005 - HTTPS and TLS enforcement

| Field | Detail |
|---|---|
| Test Case ID | TC-SEC-005 |
| Requirement | REQ_LOGIN_006 - Transport protection |
| Summary | Verify HTTPS and TLS enforcement |
| Priority / severity | P0 / Critical |
| Preconditions | Authorized network inspection environment exists. |
| Test data | Login URL and approved inspection profile. |
| Test steps | See numbered steps below. |
| Test type | Security / Compliance |
| Expected result | HTTP is redirected or rejected, HTTPS is enforced, and credentials are never transmitted in clear text. |

**Steps**

1. Request the login page using the approved HTTP form, if available.
2. Confirm the final protocol and certificate state.
3. Submit a controlled login request.
4. Inspect authorized network evidence.
5. Verify that credentials are sent only over protected transport.

### TC-ACC-001 - Keyboard-only login

| Field | Detail |
|---|---|
| Test Case ID | TC-ACC-001 |
| Requirement | REQ_LOGIN_008 - Keyboard accessibility |
| Summary | Verify login is fully operable with a keyboard |
| Priority / severity | P1 / High |
| Preconditions | Supported browser and keyboard-only test setup are available. |
| Test data | Valid and invalid controlled inputs. |
| Test steps | See numbered steps below. |
| Test type | Accessibility / Functional |
| Expected result | Every control is reachable, focus is visible, and login/recovery can be completed without a mouse. |

**Steps**

1. Load the login page without using the mouse.
2. Move through controls with `Tab` and `Shift+Tab`.
3. Enter credentials using the keyboard.
4. Submit using the keyboard.
5. Trigger and review validation feedback using the keyboard.

### TC-PERF-003 - Concurrent login behavior

| Field | Detail |
|---|---|
| Test Case ID | TC-PERF-003 |
| Requirement | REQ_LOGIN_010 - Scalability |
| Summary | Verify concurrent login behavior under the approved workload |
| Priority / severity | P0 / Critical |
| Preconditions | Authorized load environment, workload model, concurrency target, and SLA are approved. |
| Test data | Synthetic accounts and approved workload. |
| Test steps | See numbered steps below. |
| Test type | Performance / Scalability |
| Expected result | Authentication remains stable within approved latency/error limits at the approved concurrency. |

**Steps**

1. Confirm workload, ramp-up, duration, and stop conditions.
2. Start the approved concurrent login profile.
3. Monitor response time, error rate, session creation, and service health.
4. Stop at the approved limit or immediately on an out-of-scope impact.
5. Compare results with the approved SLA and attach the report.

### TC-INT-001 - Successful login analytics

| Field | Detail |
|---|---|
| Test Case ID | TC-INT-001 |
| Requirement | REQ_LOGIN_011 - Analytics integration |
| Summary | Verify successful-login analytics event |
| Priority / severity | P2 / Medium |
| Preconditions | Authorized analytics access and event schema are available. |
| Test data | Valid test account. |
| Test steps | See numbered steps below. |
| Test type | Integration / Functional |
| Expected result | The approved success event is recorded without passwords, tokens, or prohibited personal data. |

**Steps**

1. Start with a clean test session.
2. Complete one successful login.
3. Locate the event in the approved analytics view or capture.
4. Verify event name, required attributes, timestamp, and outcome.
5. Verify sensitive values are absent.


# 4. Test Data Requirements

| Category | Required data | Control |
|---|---|---|
| Credentials | Valid, invalid, expired/locked, and role-specific accounts | Synthetic/approved identities only; no real secrets in this document. |
| Providers | Google and enterprise SSO identities for success, cancellation, timeout, and failure | Isolated approved provider tenants. |
| Recovery | Registered/unregistered emails and valid, expired, used, tampered reset tokens | Controlled mailbox; do not expose tokens in evidence. |
| Security | Approved SQLi, XSS, bypass, replay, and boundary payloads | Authorized environments only. |
| Performance | Standard network, concurrency target, monitoring period, and SLAs | Record workload and exact environment. |
| Accessibility | Screen reader, keyboard, high contrast, zoom, and contrast tools | Record tool and version. |

# 5. Risk Matrix

| Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|
| Authentication bypass/session compromise | Medium | Critical | Authorized security suite and P0 exit gate | Security/Engineering |
| Provider outage/configuration drift | Medium | High | Provider test tenants and negative paths | Integration/Engineering |
| Unspecified rules or thresholds | High | High | Raise clarification; block unsupported assertions | Product/QA |
| Accessibility failure | Medium | High | Keyboard, reader, contrast, and WCAG checks | Accessibility/QA |
| Load/performance degradation | Medium | High | Define workload/SLA and repeatable tests | Performance/Engineering |
| Browser/responsive regression | Medium | Medium | Browser matrix and release smoke | QA/Automation |
| Sensitive telemetry exposure | Low | Critical | Inspect logs/analytics and review data minimization | Security/Engineering |

# 6. Regression Test Suite

| Suite | Trigger | Included cases |
|---|---|---|
| P0 Smoke | Every deploy | TC-AUTH-001, TC-AUTH-002, TC-AUTH-005, TC-SES-003, TC-SES-005, TC-ROLE-003, TC-UI-011 |
| P1 Authentication | Every release candidate | TC-AUTH-001 to TC-AUTH-012, TC-VAL-001 to TC-VAL-008, TC-SES-001 to TC-SES-008 |
| P1 Providers | Provider/configuration change | TC-IDP-001 to TC-IDP-006, TC-UI-006 |
| P0 Security | Security/session change | TC-SEC-001 to TC-SEC-012, TC-ROLE-003 |
| P1 Accessibility | UI/framework change | TC-ACC-001 to TC-ACC-006, TC-UI-003, TC-UI-008, TC-UI-012 |
| P1 Compatibility | Browser/UI change | TC-BRW-001 to TC-BRW-004, TC-UI-007 |
| P1 Performance | API/infrastructure/release change | TC-PERF-001 to TC-PERF-005 |
| P2 Integration | Analytics/dashboard change | TC-INT-001, TC-INT-002, TC-UI-011 |

## Execution Record

| Date | Environment/build | Executed by | Passed | Failed | Blocked | Evidence/defects |
|---|---|---|---:|---:|---:|---|
| TBD | TBD | TBD | TBD | TBD | TBD | TBD |


