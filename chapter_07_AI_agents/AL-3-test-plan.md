# Test Plan — AL-3

**Title:** Creating a Care Plan

> **Status:** DRAFT — pending human review. Not approved until a QA owner signs off.

## Objective & Scope
**Objective:** Ensure that Care Coordinators can create, review, and manage Care Plans that satisfy all CCHHS criteria.

**In scope:** Care Plan Management

**Out of scope:** N/A

## Test Strategy & Approach
| Type | Approach | Justified by |
|---|---|---|
| functional | Manual functional testing of the Care Plan UI and business rules | acceptance_criteria |

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Auto‑population of member data may be incomplete | M | H | Validate that all required fields are populated from the Health Risk Assessment |

## Test Environment & Data
NOT IN TICKET

## Entry & Exit Criteria
**Entry:**
NOT IN TICKET

**Exit:**
NOT IN TICKET

## Test Cases
| ID | Title | Type | Priority | Steps |
|---|---|---|---|---|
| TC-001 | Verify Care Plan contains all required sections | functional | P2 | Create a new Care Plan from a completed Health Risk Assessment → Care Plan displays Risks, Preferences, Needs, Goals, Interventions, Barriers, Strengths, Supports, and Referrals |
| TC-002 | Verify goal priority assignment | functional | P2 | Assign relative priority values to each goal in the Care Plan → Priorities are saved and displayed correctly for all goals |
| TC-003 | Verify tracking of care plan progress | functional | P2 | Update status of goals and interventions → Progress indicators reflect the updated status |
| TC-004 | Verify capture of member and coordinator signatures | functional | P2 | Complete the Care Plan and apply signatures for member and Care Coordinator → Both signatures are recorded and displayed in the Care Plan |
| TC-005 | Verify timestamping of formal reviews | functional | P2 | Perform a Care Plan review and save → Review action is timestamped in the Care Plan history |
| TC-006 | Verify Care Plan expiration after one year | functional | P2 | Create a Care Plan and advance system date to 1 year later → Care Plan is marked as expired and cannot be edited |
| TC-007 | Verify auto‑population from Health Risk Assessment | functional | P2 | Open a new Care Plan linked to a completed HRA → All relevant data from the HRA is pre‑filled in the Care Plan |
| TC-008 | Verify auto‑population of demographics and contact info | functional | P2 | Open a new Care Plan for a member → Member and Care Coordinator demographics and contact information are populated automatically |
| TC-009 | Verify goals are captured in member's own words | functional | P2 | Enter goals using the member's phrasing → Goals are stored exactly as entered without system alteration |
| TC-010 | Verify tracking and follow‑up functionality | functional | P2 | Set follow‑up dates for goals/interventions and view tracking dashboard → Dashboard displays upcoming follow‑up items correctly |
| TC-011 | Verify responsibility assignment for goals and interventions | functional | P2 | Assign responsibility (patient, coordinator, other) to each goal and intervention → Responsibility is saved and displayed for each item |
| TC-012 | Verify timestamping of Care Plan changes | functional | P2 | Modify any section of the Care Plan and save → Change is recorded with a timestamp in the version history |
| TC-013 | Verify Care Plan version availability | functional | P2 | Make multiple edits to a Care Plan → All prior versions are accessible and identifiable |
| TC-014 | Verify incorporation of Service Plan information | functional | P2 | Add Service Plan details to the Care Plan where applicable → Service Plan information appears correctly within the Care Plan |
| TC-015 | Verify Care Plan can be printed and provided to member | functional | P2 | Select the print option for a completed Care Plan → A printable version is generated and matches on‑screen content |

## Traceability
| Requirement | Test cases | Covered |
|---|---|---|
| AL-3 | TC-001, TC-002, TC-003, TC-004, TC-005, TC-006, TC-007, TC-008, TC-009, TC-010, TC-011, TC-012, TC-013, TC-014, TC-015 | True |

## Automation Candidates
N/A

## Assumptions
N/A

## Dependencies & Open Questions
**Dependencies:**
N/A

**Open questions:**
N/A

## Human Review Gate
- **I assumed:**
- (none declared)
- **I could not confirm:**
- (none)
- **Approve, or edit, before I write test cases / automation.**
