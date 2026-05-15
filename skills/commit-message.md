# Skill: Commit Message Standard

> **Why this matters:** Commits are the permanent, line-by-line history of the project. A good commit message tells a future reader — or a future you — *what* changed and *why*, without having to read the diff. Vague messages like `fix bug` or `update stuff` make debugging, reverting, and reviewing history significantly harder. Every commit message is a form of documentation.

This project follows the **Conventional Commits** specification. The format is:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

---

## Type (Mandatory)

Choose the one that best describes the **intent** of the change, not the mechanism.

| Type | When to use |
|---|---|
| `feat` | Introducing a new feature or capability visible to the user |
| `fix` | Correcting a bug or unintended behaviour |
| `refactor` | Restructuring existing code without changing behaviour or adding features |
| `test` | Adding or updating tests only — no production code changes |
| `docs` | Changes to documentation only (CHANGELOG, README, comments, agent.md) |
| `chore` | Maintenance tasks: dependency updates, config changes, tooling, scripts |
| `style` | Formatting only — whitespace, indentation, semicolons (no logic changes) |
| `perf` | A change that improves performance without altering behaviour |

**Do not invent new types.** If unsure, pick the closest match from the table above.

---

## Scope (Strongly Recommended)

Identifies which part of the system was changed. Use one of these consistent scopes:

| Scope | Covers |
|---|---|
| `backend` | FastAPI routes, services, models, utilities |
| `frontend` | React components, hooks, pages, styles |
| `db` | Database migrations, schema changes, seeds |
| `auth` | Authentication and authorisation logic |
| `api` | API contracts, serializers, request/response schemas |
| `config` | Environment variables, settings files, deployment config |
| `test` | Test files, fixtures, test utilities |

Omit scope only for project-wide changes that don't belong to one layer (e.g., `docs: update README`).

---

## Subject Line

- Written in **imperative mood** — say `add`, `fix`, `remove`, not `added`, `fixed`, `removed`
- **Lowercase** — never capitalise the first word
- **No period** at the end
- **72 characters maximum** for the entire first line (type + scope + subject)
- Be **specific** — describe the actual change, not the category of change

**Good:**
```
feat(backend): add PDF export endpoint for contact reports
fix(frontend): resolve cart total showing negative on empty coupon
refactor(db): normalise weather_data table to remove duplicate columns
chore(config): upgrade FastAPI to 0.111.0
test(backend): add unit tests for report generation service
docs: update CHANGELOG.md for export feature
```

**Bad — and why:**
```
feat: update backend          ← too vague, says nothing about what changed
fix: bug fix                  ← completely uninformative
feat(frontend): Added button  ← wrong tense, should be imperative
FEAT(BACKEND): Add thing.     ← wrong case, has a period
refactor: clean up some stuff ← "some stuff" is not a description
```

---

## Body (When to Write One)

A body is **optional** for simple changes but **mandatory** when:

- The subject alone doesn't explain *why* the change was made
- You are fixing a subtle bug whose cause needs documenting
- You are making a deliberate architectural or design decision
- The commit is a `refactor` or `perf` change where the reasoning matters

**Rules:**
- Leave a **blank line** between the subject and the body — required by the Git spec
- Explain **why**, not what. The diff already shows what changed
- Wrap lines at **72 characters**

**Example:**
```
fix(backend): prevent division by zero in weather aggregation

The aggregation query failed silently when a station reported zero
readings in a given hour. The result was a ZeroDivisionError that
was swallowed by the generic exception handler, returning stale data
to the frontend instead of an error.

Added a guard clause to skip aggregation for zero-reading windows
and return an explicit null in the API response instead.
```

---

## Footer

Use the footer for two purposes only:

**1. Closing a GitHub issue:**
```
Closes #42
```

**2. Declaring a breaking change** (triggers a MAJOR version bump):
```
BREAKING CHANGE: removed support for legacy `/v1/weather` endpoint.
Clients must migrate to `/v2/weather`. See migration guide in README.
```

Both can appear in the same footer, separated by a blank line.

---

## One Commit = One Logical Change

Each commit must represent **one self-contained, logical unit of work**. This is the most important rule.

- Do not bundle unrelated changes into one commit — even if they are small
- Do not commit half-finished work — every commit must leave the codebase in a working state
- Do not use `git add .` blindly — stage only the files that belong to the current logical change

**Why:** A focused commit can be reverted cleanly. A commit that mixes five changes cannot be safely reverted without losing unrelated work.

---

## Quick Reference

```
# Minimal (subject only)
feat(frontend): add dark mode toggle to settings page

# With body (complex or non-obvious change)
fix(backend): handle missing timezone in weather ingestion

Station records from older sensors omit the timezone field entirely.
The previous parser assumed UTC, which caused a 3-hour offset error
for AEST stations. Now defaults to UTC only when field is absent,
and logs a warning for observability.

# With footer (closes issue)
feat(auth): add OAuth2 login via Google

Closes #17

# With breaking change
refactor(api): rename all snake_case params to camelCase

BREAKING CHANGE: all API request parameters are now camelCase.
Clients sending snake_case params must update before next release.
```