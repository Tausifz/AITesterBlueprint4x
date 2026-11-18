---
name: resume-tailor
description: Tailor, optimize, and ATS-check an existing resume against a job description, then deliver an editable Google Doc or .docx. Use this skill whenever the user supplies a resume with a job description, job posting, JD spreadsheet, or role requirements and wants it rewritten, tailored, optimized, keyword-matched, ATS-checked, or scored — even if they simply paste a posting. It also handles resume reviews, scorecards, and rebuilds when no JD is attached.
---

# Resume Tailor

Turn a resume plus a job description into a tailored, ATS-safe, honest resume the
candidate can edit in Google Docs — with every change visible so they can approve it.

The job here is *not* to maximize keyword overlap. It is to make every genuine match
legible to a recruiter in six seconds, and to tell the candidate the truth about the
gaps rather than papering over them. A resume that wins a screen and loses the
interview has cost the candidate more than a rejection would have.

## Workflow

Follow these steps in order. Step 4 is a gate — do not skip it. For JD-based work,
the final review in Step 6 is required before delivering the resume.

### 1. Read both inputs

**Resume** — usually a PDF or .docx in `/mnt/user-data/uploads`. If its content is not
already visible in context, consult the `file-reading` and `pdf-reading` skills. Extract
every role, date, metric, tool, and claim. Note what's *missing* too: education, dates,
certifications, and unexplained gaps all matter later.

**Job description** — may arrive as pasted text, a bulleted list, a link, or a
spreadsheet. For `.xlsx`/`.csv`, consult the `xlsx` skill; JD spreadsheets typically
carry one requirement per row, sometimes with a priority or must-have column — respect
that column if present, since it tells you which gaps are fatal.

If the user gives a JD but no resume, ask for the resume — do not invent a history. If
they give a resume but no JD, skip to the review path in
`references/writing-rules.md` (Review Mode) and produce a scorecard plus a rebuilt resume.

### 2. Extract the JD's real requirements

Pull out and group:

- **Named hard skills** — specific tools, platforms, languages, certifications. These are
  the gates. Count how many times each appears and where (title and first paragraph =
  gate; buried in a nice-to-have list = soft).
- **Responsibilities** — the verbs. These become bullet openers.
- **Seniority signals** — years required, team size, scope, leadership language.
- **Domain** — the industry or problem space.
- **Recurring vocabulary** — the exact phrasing the JD reuses. Prefer *their* words over
  synonyms; ATS keyword matching is literal, and a human reader recognizes their own
  language.

### 3. Cross-reference against the resume

Build a match table. Three verdicts only:

| Verdict | Meaning |
|---|---|
| ✅ Match | Real evidence exists in the resume. May need rewording, not inventing. |
| 🟡 Partial | Adjacent or implied experience. Surfaceable — but confirm with the user before asserting it. |
| 🙈 Absent | No evidence in the resume. **Ask the candidate whether it can be added** ("should I add X?"). On an explicit yes, add it highlighted with a `[confirm ...]` placeholder; on no, leave it out. |

Adjacency is where the value is, and where the discipline is. Testing an analytics
product is genuine adjacency to "data quality." Having used a database is *not*
adjacency to a named BI platform. When unsure, mark it 🟡 and ask.

**Absent is not a verdict of "stays absent" — it is a question.** For every JD requirement
with no evidence, ask the candidate before finalizing (e.g., "The JD wants GitLab CI and
GCP; you have Jenkins. Should I add GitLab/GCP, or is Jenkins your experience?"). Only add
what they explicitly confirm; anything added this way is highlighted and marked
`[confirm ...]` so it is auditable and can be deleted before the clean build.

### 4. Report before you write

Show the user the match table and a blunt fit estimate *before* producing the resume.
State plainly which named requirements are absent and that they will not be added.
If the absent items are the JD's headline requirements, say the role is a stretch and
say what would actually change that — usually a specific certification or a cover note
that names the gap.

This step exists because the candidate, not the assistant, decides whether to apply.
Handing over a polished document that quietly overstates their background takes that
decision away from them.

### 5. Build the first draft

Write a JSON spec and render it:

```bash
node scripts/build_resume.js spec.json --out output_resume\tausif-resume-firmname.docx
```

Run the command from `chapter_04_JobkitAI\resume-tailor`. Save the output in
`chapter_04_JobkitAI\resume-tailor\output_resume` and name it
`tausif-resume-<firmname>.docx`, lowercasing the firm name and replacing
spaces/punctuation with hyphens (for example, `tausif-resume-acme-corp.docx`). Use
the same filename stem for the document title. If the firm is not identifiable from
the JD, ask the user what firm name to use. Treat this first build as a draft; do not
deliver it yet. Keep this as the only output path: after optimization, rebuild to
this exact path, replacing the draft rather than creating another file.

Inline markup, usable in any text field:

| Markup | Renders as | Purpose |
|---|---|---|
| `==text==` | yellow highlight | a change made for this JD — lets the user audit every edit |
| `[text]` | red bold | a fact only the candidate can supply |
| `**text**` | bold | a metric or term worth anchoring the eye on |

`--clean` strips highlights, drops `note` blocks, and **refuses to build if any
`[placeholder]` remains**, printing the offenders. That guardrail is the point: it makes
it structurally hard to send out a resume with `[N]` still in it.

Schema and a complete worked example: `references/resume-json.md`.
Bullet formulas, section order, ATS rules, and the defects to fix on sight:
`references/writing-rules.md`.

For JD tailoring, the optimization second pass updates this same resume; it is not a
separate resume variant. Do not generate a second role/version unless the user asks.

### 6. Optimize and verify the draft

After building the first draft, compare it again with the **full JD and original
resume**. This second pass is mandatory for JD-based work. Its purpose is to catch
requirements the first pass missed or buried—not to create a second resume variant or
maximize keyword density.

For every must-have and preferred requirement, responsibility, seniority signal, and
recurring keyword, classify the draft against the source:

| Result | Action |
|---|---|
| Covered | Keep it if accurate and easy to find. |
| Missed evidence | If the original resume supports it, add or reposition the evidence using the JD's language where truthful. |
| Needs confirmation | If evidence is partial, implied, or needs details not in the source, ask the user before adding it. |
| Unsupported | Do not add it as fact. Ask whether the user has that experience if it materially affects the application. |

Revise the existing draft/spec, not a parallel version. Keep confirmed additions
highlighted and marked `[confirm ...]`. Never invent tools, employers, credentials,
dates, metrics, years of experience, or scope. Preserve gaps and contradictions
honestly; don't turn adjacent experience into a direct claim or round experience up.

Then recheck the complete revised resume against both inputs. Confirm each requirement
is either accurately covered or transparently left as a gap, every new claim has
source evidence or explicit confirmation, and no placeholder appears as a completed
fact. Rebuild to the exact same output path to replace the first draft, then inspect
the final document. Report what evidence was surfaced, the important remaining gaps,
and any confirmation still needed. Do not create or deliver a second optimized or
clean copy.

### 7. Deliver

Upload to Google Drive as a native Google Doc so the user can edit immediately:

```
Google Drive:create_file(
  title="tausif-resume-<firmname>",
  base64Content=<base64 of the .docx>,
  contentMimeType="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
)
```

Drive converts .docx to a Google Doc automatically — highlights and colours survive. If
the connector is unavailable, search the MCP registry and offer it; meanwhile deliver
the `chapter_04_JobkitAI\resume-tailor\output_resume\tausif-resume-<firmname>.docx`
with `present_files`, which opens in Google Docs anyway. Deliver one final file only.
If the user explicitly requests a clean copy, build it to that same output path with
`--clean --out output_resume\tausif-resume-<firmname>.docx` rather than creating an
additional file; the clean build must pass the placeholder guard.

Then close with: the Drive link, the count of highlighted changes, and the three or four
placeholders that matter most — ranked by what they do for the application, not by
where they appear in the document.

## Non-negotiables

**Never add a skill, tool, employer, date, or metric the resume does not support.**
Not in the summary, not in a skills row, not softened to "exposure to." The candidate
will be asked about it by someone who does the job for a living. The one exception is
an explicit candidate confirmation: if asked and they say "yes, I have X", add it —
highlighted and marked `[confirm ...]`, never as an unverified fact.

**Numbers come from the candidate.** Where a bullet needs a metric that isn't in the
source resume, emit a `[placeholder]` rather than a plausible-sounding figure. An
invented "reduced regression by 40%" is the single most damaging thing this skill could
produce, because it reads perfectly and cannot be defended.

**Reframing is fair; relabelling is not.** Rewriting "drive continuous improvement in
automation practices" as "drive continuous improvement initiatives that cut regression
from X to Y" is honest reframing into the JD's vocabulary. Adding a platform they have
never opened is not.

**Flag contradictions rather than smoothing them.** Mismatched locations, an award dated
before the job that granted it, a claimed year count the timeline doesn't support — a
recruiter will spot these, so surface them to the user.

**Say when the fit is poor.** A candidate who applies knowing they are a 60% match and
addresses the gap in a cover note does better than one who was told everything looked great.

## Reference files

- `references/writing-rules.md` — bullet formulas, section order and cuts, ATS
  constraints, tense and style rules, standing defects to fix, and Review Mode (no JD).
- `references/resume-json.md` — the spec schema with a full worked example.
