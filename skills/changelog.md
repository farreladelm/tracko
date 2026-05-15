# Skill: Changelog Standard

> **Why this matters:** The CHANGELOG is the human-readable history of the product — not the code. It answers the question "what changed between versions?" for users, stakeholders, and your future self. It is distinct from git history, which answers "what changed in the code." Both are necessary; they serve different audiences.

This project follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format paired with [Semantic Versioning](https://semver.org/).

---

## File Location & Structure

The file is always `CHANGELOG.md` at the project root. Its structure is:

```markdown
# Changelog

All notable changes to this project will be documented in this file.
Format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.2.0] - 2026-05-08
### Added
- User authentication via OAuth2 with Google provider

### Fixed
- Cart total displaying negative value when coupon field was empty

## [1.1.0] - 2026-04-01
### Added
- Dark mode toggle in user settings
```

---

## Change Labels

Use only these six labels. Never invent new ones.

| Label | Use for |
|---|---|
| `Added` | New features or capabilities |
| `Changed` | Changes to existing behaviour |
| `Deprecated` | Features that will be removed in a future release |
| `Removed` | Features that have been removed |
| `Fixed` | Bug fixes |
| `Security` | Fixes for vulnerabilities |

---

## Writing Entries

Each entry is one line per change. Rules:

- Written in **past tense** — `Added`, `Fixed`, `Removed`, not `Add`, `Fix`, `Remove`
- Written in **user-facing language** — describe what changed from the user's perspective, not the implementation detail
- Be **specific but concise** — one line is enough if the line is clear
- Do **not** document internal refactors, test changes, or chores unless they affect the user

**Good:**
```
- Added PDF export for contact reports
- Fixed negative cart total when coupon field is left empty
- Removed legacy `/v1/weather` endpoint — migrate to `/v2/weather`
```

**Bad:**
```
- Refactored report service (internal — not user-facing)
- Updated dependencies (not user-facing)
- Fixed bug (too vague)
- add pdf export (wrong tense, lowercase)
```

---

## Updating the Changelog (Per Branch)

Run this at **Step 10** of the workflow, after all phase commits and before opening the PR:

1. Open `CHANGELOG.md`
2. Add new entries under the `## [Unreleased]` section
3. Group entries by label — only include labels that have entries
4. Base entries strictly on what was implemented in this branch — do not document unrelated changes
5. Commit as a **dedicated, separate commit**:
   ```
   docs: update CHANGELOG.md for <feature-name>
   ```

---

## Releasing a Version

Run this at **Section 5** of the workflow when the user confirms a release:

1. Rename `## [Unreleased]` to `## [x.y.z] - YYYY-MM-DD`
2. Determine the version number using Semantic Versioning:
   - `PATCH` (x.y.**Z**) → only `Fixed` or `Security` entries
   - `MINOR` (x.**Y**.0) → at least one `Added` or `Changed` entry, no breaking changes
   - `MAJOR` (**X**.0.0) → any `Removed` entry or a `BREAKING CHANGE` commit footer
3. Add a fresh `## [Unreleased]` section at the top
4. Commit:
   ```
   docs: release vX.Y.Z
   ```
5. Tag the commit and push (see Release Protocol in `GEMINI.md`)