# crm-bot Local Workspace Rules

## 1. Shell Commands Constraints
- **rtk Prefix**: Always prefix all shell commands with `rtk` (e.g., `rtk git ...`, `rtk tea ...`, `rtk .venv/bin/python ...`). Running commands without the prefix will bypass the required sandbox environment configuration.
- **No Unapproved Pushes**: NEVER push any branches, commits, or tags to any remote repository (`origin` or `github`) without explicit beforehand approval from the user.

## 2. Git Remotes Configuration
- **Primary Remote (`origin`)**: Points to the company's self-hosted Forgejo instance (`ssh://git@git.terrawx.com:2222/farreladelm/crm-bot.git`).
  - Pulls/fetches exclusively from the company repo.
  - Pushes automatically to both the company repo and the GitHub mirror (`https://github.com/farreladelm/terra-weather-crm-bot.git`).
- **GitHub Remote (`github`)**: A standalone remote pointing to the GitHub mirror.
- **Upstream**: The local `main` branch tracks `origin/main` (which points to the company's Forgejo repository).
- **Branch Protection**: Direct commits and pushes to the `main` branch on the `origin` remote are restricted. All changes must be developed on a feature branch and merged into `main` via a Pull Request (using `tea` CLI or the Forgejo web interface).

## 3. Forgejo / Gitea `tea` CLI Configuration
- **Default Login**: Configured under the name `company` pointing to `https://git.terrawx.com` using the user token.
- **Custom SSH Port Alignment**: The company remote uses port `2222` for SSH. To ensure the `tea` CLI successfully auto-detects repository context in this directory, `ssh_host` in `~/.config/tea/config.yml` must be configured with the port number:
  ```yaml
  ssh_host: git.terrawx.com:2222
  ```
  If `tea` commands fail with `Error: The target couldn't be found`, verify that the custom port is included in the `ssh_host` property in the `tea` configuration.
- **Interacting with the Repository**: We use the `tea` CLI to interact with the company repository (such as managing issues, PRs, etc.) directly from the command line:
  - List issues: `tea issues`
  - Create a new issue: `tea issue create`
  - List pull requests: `tea pulls`
  - Show repository details: `tea repo farreladelm/crm-bot`

## 4. Development Workflow & Git Operations (MANDATORY)
You must follow this exact sequence for all feature implementations, bug fixes, or complex tasks:
1. **Proactive Research:** Explore the codebase and run read-only checks first.
2. **Implementation & Phase Plan:** Create a detailed implementation plan and granular phase structure. Wait for explicit user approval before executing.
3. **Forgejo Issue:** Create an issue using the `tea` CLI based on `.agents/skills/forgejo-issue/SKILL.md`.
4. **Branching**: Checkout a new feature branch (`feature/your-feature`).
5. **Phase Execution**: Stage commits sequentially for each phase. Keep a local `task.md` checklist (never commit `task.md`).
6. **Proactive Verification**: Run syntax checks and tests before user check-ins.
7. **Checkpoint**: Pause after each phase for user verification. Make checkpoint commits once approved.
8. **Merge to Staging & Deploy**: Once the feature branch is complete and verified locally:
   - Switch to your local `staging` branch, merge your feature branch, and push to origin:
     ```bash
     rtk git checkout staging
     rtk git merge feature/your-feature
     rtk git push origin staging
     ```
   - This automatically triggers the GitHub Actions workflow to deploy the changes to the test server.
9. **Staging Verification**: Test and verify the feature's behavior on the test server.
10. **Changelog**: Once verified on the test server, switch back to the feature branch, update `CHANGELOG.md` under `[Unreleased]` (based on `.agents/skills/changelog/SKILL.md`), and commit.
11. **Pull Request to Main**: Open a Pull Request from your individual `feature/your-feature` branch into `main` using the `tea` CLI (based on `.agents/skills/pull-request/SKILL.md`). This keeps the PR diff clean and isolated.
12. **Post-Merge Sync & Pruning**: Once the PR is merged into `main`:
    - Checkout `main` locally: `rtk git checkout main`
    - Pull the merged commit: `rtk git pull origin main`
    - Push to `origin` to sync the GitHub mirror: `rtk git push origin main`
    - Delete the local feature branch: `rtk git branch -d feature/your-feature`
    - Sync `staging` with the updated `main` branch to keep histories aligned:
      ```bash
      rtk git checkout staging
      rtk git pull origin staging
      rtk git merge main
      rtk git push origin staging
      ```
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
   Create a Pull Request for `release/vX.Y.Z` to merge into `main`. Once approved and merged, pull the changes back to local `main`:
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
- **Clean Code & PEP8**: Follow Python readability standards.
- **Mandatory Backend Testing**: Use Test-Driven Development (TDD). Create a failing test first. Run tests using `python -m pytest` from the root directory (once test suites are configured).
- **Robust Error Handling**: Handle edge cases, validate all inputs, and return consistent errors.

## 7. Troubleshooting & Context
- **Context7 Usage**: Use the `context7` MCP server to fetch up-to-date documentation for frameworks like `python-telegram-bot`, `httpx`, `OpenAI`, etc., if details are unclear.
