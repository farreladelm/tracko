---
name: branch-prefix
description: Determines the appropriate git branch name and prefix (feat/, fix/, chore/, etc.) based on task category following Conventional Commits.
---
# Skill: Branch Prefix Standard

Determine the type of task you are performing and use the corresponding prefix for git branches.

## Classification Guide

| Task Type | Branch Prefix | Example Branch Name |
|---|---|---|
| New feature | `feat/` | `feat/gmail-sync` |
| Bug fix | `fix/` | `fix/decode-error` |
| Refactoring | `refactor/` | `refactor/api-auth` |
| Documentation | `docs/` | `docs/readme-setup` |
| Config/Tooling | `chore/` | `chore/dep-upgrade` |
| Performance | `perf/` | `perf/db-index` |
| Testing | `test/` | `test/auth-mocks` |

## Branch Naming Rules
1. Use kebab-case for the branch name (e.g., `fix/connection-leak`).
2. Do not use uppercase letters or special characters in the branch name.
