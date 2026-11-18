# Job Tracker (Local-first Kanban)

A single-page, browser-only Kanban board for tracking job applications. No
backend, no auth, no API calls — every job lives in your browser's IndexedDB.

## Setup

```bash
npm install
npm run dev      # starts the dev server, typically http://localhost:5173
```

Production build:

```bash
npm run build    # type-checks (tsc) and bundles with Vite
npm run preview  # serves the production build locally
```

## Features

### Part 1 — the board

- Six Kanban columns: Wishlist, Applied, Follow-up, Interview, Offer Received, Rejected
- Add and edit jobs through a modal form (new jobs default to Wishlist)
- Delete with a confirmation dialog
- Cards show company, role, resume pill, time since `dateApplied` ("Not applied yet" for Wishlist), and a link icon that opens the job URL in a new tab
- Offer Received cards show the offered salary and a reply-by badge ("X days left", amber at 3 days or fewer, red "Expired" when past)
- Offer Salary and Reply-by fields appear in the form only when the status is "Offer Received"
- Strict resume dropdown: previously used names (sorted), a "None" option, and "+ Add new resume…" (validated, deduplicated, saved for future use); most recently used resume is preselected
- Live card counts in column headers; cards ordered by position within their column
- Form validation (required fields, http(s) URL, resume rules) with inline errors
- Every change is written to IndexedDB immediately and survives a page refresh
- Responsive layout with independent column scrolling, sticky headers, and horizontal scroll on narrow screens

### Part 2 — drag-and-drop, search, sort, theme, export/import

- **Drag-and-drop** with @dnd-kit: grab the grip handle on a card to reorder within a column or move it to another column (including empty ones). New positions persist immediately. Available in "Manual order" sort mode and while not searching.
- **Search**: toolbar search box filters cards across company, role, resume, and notes; columns show matching counts and a "No matching jobs" empty state.
- **Sort**: per-column display sorting — Manual order, Date applied (newest/oldest), Company (A–Z), Recently updated. Sorting is display-only and never rewrites your manual order.
- **Theme**: light/dark toggle, persisted in `localStorage`; falls back to the system preference on first visit.
- **Export**: downloads `job-tracker-export-<date>.json` containing every job.
- **Import**: picks a JSON export (or a plain array of job objects), validates each record, confirms the summary (added/updated/skipped) before merging by `id`, and reports the result with a toast.

## Tech Stack

- React 18 + TypeScript, Vite
- Tailwind CSS (v4)
- `idb` for IndexedDB (`job-tracker-db`, version 1, store `jobs`, indexed on `status` and `dateApplied`)
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` for drag-and-drop

## Important

**Data lives in this browser only; clearing site data (or using a different
browser/device) deletes it.** Use Export to keep a backup.

## Assumptions

- `dateApplied` is a calendar date; "days ago" uses calendar-day differences, and future dates display as "Today".
- A reply-by deadline of today counts as "Due today" (amber); past deadlines show "Expired" (red).
- Switching the status away from "Offer Received" in the form clears the offer salary and deadline.
- Link and delete icons are inline SVGs (no icon library).
- Delete is available both from the card (hover trash icon) and inside the edit modal.
- Changing a job's status moves it to the end of the target column.
- Dragging uses a grip handle (works on touch); dragging is disabled while searching or in a non-manual sort mode.
- Import merges by job `id` — imported records win over existing ones; invalid records are skipped and reported.
- No router, state library, or CSS framework beyond Tailwind.

## Structure

```
src/
├── db/db.ts              # idb setup + typed CRUD helpers (single and bulk writes)
├── hooks/useJobs.ts      # jobs state and mutations (add, update, delete, reorder, import)
├── hooks/useTheme.ts     # light/dark toggle persisted to localStorage
├── utils/                # date math, job builders, resume helpers, filter/sort, export/import
├── components/           # Board, Toolbar, Column, JobCard, JobFormModal, ConfirmDialog, Toast
├── types.ts              # Job, form values, reorder/import types
└── constants.ts          # column definitions, limits, storage keys
```
