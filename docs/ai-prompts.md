# AI Prompts — Employee Salary Management System

This document records the prompts used with Cursor during development, what worked well, and what required correction.

## Initial build prompt (full specification)

**Prompt (summary):** Build a production-quality Employee Salary Management System for an Incubyte assessment — FastAPI + React, TDD, 12-commit strategy, seed script, insights dashboard, explicit out-of-scope items, and documentation first.

**What worked:**
- Providing the full folder structure upfront produced a scaffold that matched the spec closely.
- Explicit commit message order enforced incremental, reviewable history (before squash to single commit for GitHub push).
- Listing out-of-scope items with reasoning prevented scope creep (auth, payroll, audit trail).
- Naming exact test cases (`create valid`, `filter by country`, `pagination`, insights min/max/avg) led directly to pytest coverage.

**What needed correction:**
- **Deployment:** Plan defaulted to Docker Compose; user chose manual setup only (Option C). Plan updated before execution.
- **Search wording:** Spec said "client-side search" but 10k employees require server-side search — implemented debounced API search and documented the rationale.
- **npm / Python PATH:** Build environment lacked `npm` and `python` on PATH; used `py -3` launcher and hand-scaffolded frontend when `npm create vite` failed.
- **Git push 403:** Cached Windows credentials for wrong GitHub account (`harshitcn` vs `harshitjain0701`); fixed by clearing Credential Manager entries and setting remote URL with correct username.

---

## Plan iteration prompts

**Prompt:** "execute the plan"

**What worked:** Switching from Plan mode to Agent mode with a pre-approved plan allowed uninterrupted implementation of all 12 commits.

**Prompt:** "C" (deployment option)

**What worked:** Short option letter correctly interpreted as manual deployment, no Docker — plan file updated without re-discussion.

---

## Git reinitialize prompt

**Prompt:** Reinitialize git, use `harshitjain0701@gmail.com`, push to `https://github.com/harshitjain0701/salary-management.git`, squash to single commit.

**What worked:**
- Squashing to one commit for a clean assessment submission.
- Local-only `git config user.email` preserved global Codeninjas identity.

**What needed correction:**
- Push failed until GitHub credentials for the personal account were restored (see above).

---

## Feature extension prompt (Sections A, B, C)

**Prompt:** Add salary distribution, top earners, department summary, CSV export, salary band badges, and documentation artifacts (`ai-prompts.md`, `tradeoffs.md`, `seed-performance.md`).

**What worked:**
- Referencing "Step 3", "data model", "Step 8" mapped cleanly to existing codebase layers.
- Percentile-based bands reused across insights and employee list without schema migration.

**Design choices made during implementation:**
- p25/p75 via Python `statistics.quantiles` on grouped salaries — SQLite lacks native percentile functions.
- CSV export via `StreamingResponse` generator to avoid loading all rows in memory.
- Colored badges in table: amber / green / blue for below / within / above band.

---

## Tips for future Cursor sessions on this repo

1. **Run tests after each layer:** `cd backend && py -3 -m pytest -v`
2. **Seed before UI demo:** `py -3 seed/seed.py --count 100`
3. **Keep docs in sync** when adding endpoints — update `docs/architecture.md` API table and `README.md` curl examples.
4. **State PATH issues early** if Node/Python aren't on PATH in the agent shell.
