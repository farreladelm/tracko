# tracko Local Workspace Rules

## 1. Shell Commands Constraints
- **rtk Prefix**: Always prefix all shell commands with `rtk` (e.g., `rtk git ...`, `rtk gh ...`, `rtk .venv/bin/python ...`). Running commands without the prefix will bypass the required sandbox environment configuration.
- **No Unapproved Pushes**: NEVER push any branches, commits, or tags to the remote repository (`origin`) without explicit beforehand approval from the user.

## 2. Git Remotes Configuration
- **Primary Remote (`origin`)**: Points to the standard GitHub repository (`https://github.com/farreladelm/tracko.git`).
  - Pulls, fetches, and pushes directly to GitHub.
- **Branch Protection**: Direct commits and pushes to the `main` branch on the `origin` remote are restricted. All changes must be developed on a feature branch and merged into `main` via a Pull Request (using `gh` CLI or the GitHub web interface).

## 3. GitHub CLI `gh` Configuration
- **Interacting with the Repository**: We use the GitHub CLI (`gh`) to interact with the repository (such as managing issues, PRs, etc.) directly from the command line:
  - List issues: `gh issue list`
  - Create a new issue: `gh issue create`
  - List pull requests: `gh pr list`
  - View issue/PR details: `gh issue view <number>` or `gh pr view <number>`

## 4. Development Workflow & Git Operations (MANDATORY)
You must follow this exact sequence for all feature implementations, bug fixes, or complex tasks:
1. **Proactive Research:** Explore the codebase and run read-only checks first.
2. **Implementation & Phase Plan:** Create a detailed implementation plan and granular phase structure. Wait for explicit user approval before executing.
3. **GitHub Issue**: Create an issue using the `gh` CLI based on `.agents/skills/forgejo-issue/SKILL.md` (adapted for GitHub).
4. **Branching**: Checkout a new branch using the name and prefix determined by the `branch-prefix` skill (e.g., `feat/your-feature`, `fix/bug-name`).
5. **Phase Execution**: Stage commits sequentially for each phase. Keep a `task.md` checklist as a conversation artifact (e.g., written to the `<appDataDir>/brain/<conversation-id>/task.md` directory; never create `task.md` in the project root).
6. **Proactive Verification**: Run syntax checks and tests before user check-ins.
7. **Checkpoint**: Pause after each phase for user verification. Make checkpoint commits once approved.
8. **Changelog**: Once verified locally, update `CHANGELOG.md` under `[Unreleased]` (based on `.agents/skills/changelog/SKILL.md`) if applicable, and commit.
9. **Pull Request to Main**: Open a Pull Request from your individual feature branch into `main` using the `gh` CLI (based on `.agents/skills/pull-request/SKILL.md`).
10. **Post-Merge Sync & Pruning**: Once the PR is merged into `main`:
    - Checkout `main` locally: `rtk git checkout main`
    - Pull the merged commit: `rtk git pull origin main`
    - Delete the local feature branch: `rtk git branch -d <your-branch>`
    - Finally, check out and leave the workspace on the `main` branch:
      ```bash
      rtk git checkout main
      ```

## 5. Release Protocol (MANDATORY on main merge)

> This section governs what happens **after a PR is merged into `main`**. The user is responsible for triggering this, but the agent must be ready to execute it on request.

To release a new version while respecting remote branch protection:

1. **Create a Release Branch**:
   Checkout a new release branch from `main`:
   ```bash
   rtk git checkout main
   rtk git pull origin main
   rtk git checkout -b release/vX.Y.Z
   ```
2. **Bump the version** in `CHANGELOG.md` — rename `## [Unreleased]` to `## [x.y.z] - YYYY-MM-DD` following Semantic Versioning (refer to the `Changelog` skill: `.agents/skills/changelog/SKILL.md`):
   - `PATCH` (x.y.**Z**) → bug fixes only
   - `MINOR` (x.**Y**.0) → new features, backwards compatible
   - `MAJOR` (**X**.0.0) → breaking changes
3. **Add a fresh `## [Unreleased]` section** at the top of `CHANGELOG.md` for the next cycle.
4. **Commit & Push the Bump**:
   ```bash
   rtk git add CHANGELOG.md
   rtk git commit -m "docs: release vX.Y.Z"
   rtk git push -u origin release/vX.Y.Z
   ```
5. **Create & Merge Pull Request**:
   Create a Pull Request for `release/vX.Y.Z` to merge into `main` using the `gh` CLI. Once approved and merged, pull the changes back to local `main`:
   ```bash
   rtk git checkout main
   rtk git pull origin main
   ```
6. **Tag the Merge Commit**:
   Tag the new merge commit on `main` and push the tag to the remote:
   ```bash
   rtk git tag -a vX.Y.Z -m "Release vX.Y.Z"
   rtk git push origin vX.Y.Z
   ```
7. **Clean up**:
   Delete the local release branch:
   ```bash
   rtk git branch -d release/vX.Y.Z
   ```
8. **Confirm** with the user that the tag has been pushed successfully.

## 6. Coding Standards & Best Practices
- **Clean Code & PEP8**: Follow Python/TypeScript readability standards.
- **Mandatory Backend Testing**: Use Test-Driven Development (TDD). Create a failing test first.
- **Robust Error Handling**: Handle edge cases, validate all inputs, and return consistent errors.

## 7. Troubleshooting & Context
- **Context7 Usage**: Use the `context7` MCP server to fetch up-to-date documentation for frameworks like `python-telegram-bot`, `httpx`, `OpenAI`, etc., if details are unclear.
