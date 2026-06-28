---
name: forgejo-issue
description: Standard template and requirements for creating clear, actionable issues on Gitea/Forgejo.
---
# Skill: Forgejo Issue Standard

> **Why this matters:** An Issue is the single source of truth for *why* a change is being made. It must be written before any code is touched. A well-written issue gives context to anyone reading the repo about the problem being solved, not just the solution.

---

## Title Format

```
[Type] Short, imperative description of the problem or goal
```

- **Type** must be one of: `[Feature]`, `[Bug]`, `[Chore]`, `[Docs]`, `[Refactor]`
- Write in **imperative mood** — describe what the issue *does*, not what you *did* (e.g., `Add debug mode to LLM` not `Added debug mode`)
- Keep the entire title under 72 characters
- Be specific — `[Bug] Fix parallel tool calls throwing 400 bad request` is good. `[Bug] Fix LLM bug` is not.

---

## Body Template

Use this exact structure every time:

```markdown
## Summary
A 2–4 sentence plain-English description of the problem or feature request.
Explain the **why** — what user pain, broken behaviour, or business need drives this?

## Acceptance Criteria
A checklist of conditions that must ALL be true for this issue to be considered done.
Written from a user/product perspective, not a technical one.

- [ ] User can do X
- [ ] System responds with Y when Z happens
- [ ] Error state is handled gracefully

## Technical Notes
Implementation details, constraints, or architectural decisions the developer must know.
Include: relevant files, API endpoints, or design patterns to follow.

## Phase Breakdown
Derived from the approved implementation plan. List each phase as a task.

- [ ] Phase 1: ...
- [ ] Phase 2: ...
- [ ] Phase 3: ...

## References
- Link to related issues, PRs, or external docs (if any)
- `Closes #<issue-number>` if this resolves another issue
```

---

## Rules

- **Acceptance Criteria are non-negotiable.** Every issue must have them. They are what the user verifies at each phase stop.
- **One issue = one cohesive unit of work.** Do not mix multiple features into one issue.
- **Technical Notes must reference actual files/modules** from the codebase.
- **Never write the issue in past tense.** It describes work that is yet to be done.

---

## CLI Command

Create the issue description in a temporary file named `issue.md`, then execute:

```bash
tea issues create \
  --title "[Type] Your title here" \
  --description "$(cat issue.md)" \
  --labels "feature"   # or: bug, chore, documentation, refactor
```

Valid labels: `feature`, `bug`, `chore`, `documentation`, `refactor`. Use the closest match. Delete `issue.md` after the issue is created.
