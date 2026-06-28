---
name: pull-request
description: Template and checklist for submitting high-quality PRs with verification steps.
---
# Skill: Pull Request Standard

> **Why this matters:** A PR is the formal record of *what changed* and *why it is safe to merge*. A reviewer — or a future you — must be able to understand the full scope of the change, how to test it, and what risks exist without reading the code first. PRs that say "fixes stuff" are a liability. PRs that are thorough are an asset.

---

## Title Format

Follow **Conventional Commits** format exactly:

```
<type>(<scope>): <short imperative description>
```

- **type**: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`
- **scope**: the part of the system affected — `backend`, `frontend`, `auth`, `db`, `api`, `config`
- **description**: imperative mood, lowercase, no period, 72 chars max for the full line

**Good examples:**
```
feat(backend): add PDF export endpoint for contact reports
fix(frontend): resolve negative total on empty coupon input
refactor(db): normalise weather data table schema
docs: update CHANGELOG.md for v1.2.0
```

---

## Body Template

Use this exact structure every time:

```markdown
## What & Why
A 2–4 sentence summary of what this PR does and why it exists.
Link to the issue it resolves: `Closes #<issue-number>`

## Changes Made
A grouped, human-readable list of what was modified. Group by layer.
Do not just list filenames — explain what each change does.

**Backend**
- Added `POST /reports/export-pdf` endpoint in `routes/reports.py`
- Added `generate_pdf()` service function in `services/report_service.py`

**Frontend**
- Added Export button to `ReportDetailView` component
- Wired button to new API endpoint via `useExportReport` hook

**Database**
- No schema changes

## How to Test
Step-by-step instructions for manually verifying the feature works.
Be specific — include exact UI paths, API calls, or test data to use.

1. Log in as any user with report access
2. Navigate to Reports → open any report
3. Click the "Export PDF" button in the top-right toolbar
4. Verify a PDF file downloads with correct data

## Screenshots / Demo
(If frontend changes exist, attach before/after screenshots or a screen recording.
If API-only, show a sample request/response from curl or Postman.)

## Checklist
- [ ] All phases verified by user
- [ ] Static checks pass (`npx tsc --noEmit`, `python -m pytest`)
- [ ] CHANGELOG.md updated under `[Unreleased]`
- [ ] No unrelated files modified
- [ ] PR targets the correct base branch (`main`)
```

---

## Rules

- **Always link the issue.** Use `Closes #<n>` so GitHub auto-closes the issue on merge.
- **One PR per issue.** Do not bundle unrelated changes into one PR.
- **Screenshots are mandatory for any frontend change.** If the UI changed, show it.
- **The checklist must be fully checked before opening the PR.** Do not open it with unchecked boxes.
- **The base branch must always be `main`** unless the user explicitly instructs otherwise.
- **Never force-push to a PR branch** after it has been opened. Create a new commit instead.

---

## CLI Command

Create the PR description in a temporary file named `pr.md`, then execute:

```bash
tea pulls create \
  --title "feat(scope): your title here" \
  --description "$(cat pr.md)" \
  --base main \
  --head feature/your-branch-name
```

Delete `pr.md` after the PR is created.
