# Tracko - QRIS Expense Tracker

Tracko is a SaaS web application that automates tracking for Indonesian QRIS (Quick Response Code Indonesian Standard) payment expenses by parsing transaction notification emails from Gmail.

## Project Overview

- **Purpose**: Automatically extract merchant, amount, and date from bank notification emails to provide a centralized financial dashboard.
- **Key Technologies**:
    - **Framework**: Next.js (App Router)
    - **Language**: TypeScript
    - **Authentication**: NextAuth.js v5 (Auth.js) with Google Provider (`gmail.readonly` scope)
    - **Database**: PostgreSQL with Prisma ORM
    - **Email Access**: Google Gmail API (`googleapis`)
    - **Styling**: Tailwind CSS & shadcn/ui
    - **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js & npm/yarn/pnpm/bun
- PostgreSQL database
- Google Cloud Project with Gmail API enabled and OAuth2 credentials

### Environment Variables
Create a `.env` file based on the requirements in `src/auth.ts` and `prisma.config.ts`:
- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: Secret for NextAuth
- `AUTH_GOOGLE_ID`: Google OAuth Client ID
- `AUTH_GOOGLE_SECRET`: Google OAuth Client Secret

### Installation & Development
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm run start
```

### Database Management
```bash
npx prisma generate  # Run after schema changes
npx prisma db push   # Sync schema to DB (development)
npm run studio       # Open Prisma Studio on port 5555
```

## Project Architecture

### Data Flow
1. **Auth**: User signs in via Google OAuth. Tokens are stored in the `Account` table.
2. **Fetch**: `src/lib/gmail.ts` searches for emails from `no-reply@mandiri.co.id` or `blu@bcadigital.co.id` with the query "QRIS".
3. **Parse**: `src/lib/parsers.ts` uses regex to extract transaction data from HTML/text email bodies.
4. **Store**: Parsed transactions are saved to the `Transaction` table in PostgreSQL.
5. **Dashboard**: Server actions like `getSummary` aggregate data for the UI.

### Key Directories
- `src/app`: Next.js App Router pages and Server Actions.
- `src/components`: UI components (React + Tailwind).
- `src/lib`: Core logic for Gmail integration, parsing, and database client.
- `prisma`: Database schema and migrations.

## Development Conventions

- **Type Safety**: Use Zod schemas (`src/lib/parsers.ts`, `src/app/actions/dashboard/get-summary.ts`) for data validation and inferred types.
- **Server Actions**: Preferred for data fetching and mutations within the dashboard (`src/app/actions/`).
- **Database**: Use the singleton prisma client from `src/lib/db.ts`.
- **Parsing**: All bank-specific regex logic should reside in `src/lib/parsers.ts`.
- **Linting**: Run `npm run lint` (ESLint) to ensure code quality.

---

## AI Agent Instructional Context & Workflow

This section outlines the strict operational guidelines, conventions, and workflows that all AI agents must follow when contributing to the Tracko project.

> **Product Context Note:** For application-specific architecture, capabilities, and product definitions, please refer strictly to `APP.md` and `features.md`.

### Available Skills Reference

| Skill | Purpose | File Path |
| :--- | :--- | :--- |
| **Commit Message** | Standards for writing logical, structured commit messages following Conventional Commits. | `skills/commit-message.md` |
| **GitHub Issue** | Standard template and requirements for creating clear, actionable issues. | `skills/github-issue.md` |
| **Pull Request** | Template and checklist for submitting high-quality PRs with verification steps. | `skills/pull-request.md` |
| **Changelog** | Rules for updating `CHANGELOG.md` with user-facing changes per version. | `skills/changelog.md` |

### 1. Development Workflow & Git Operations (MANDATORY)

You must follow this exact sequence for all feature implementations, bug fixes, or complex tasks:

1. **Proactive Research:** Before drafting any plans, proactively explore the codebase and run read-only checks to understand the current architecture. Resolve uncertainties yourself unless absolutely necessary so there are no open questions by the time the plan is created.

2. **Implementation & Phase Plan:** Do not begin direct execution. Create a detailed implementation plan. Alongside the technical details, you **must explicitly map out a granular phase structure** (e.g., Phase 1: DB Migration, Phase 2: Backend Logic, Phase 3: Frontend UI). You must present both the technical plan and the phase structure to the user, and **wait for explicit user approval of both** before moving forward.

3. **GitHub Issue:** **Only after** the implementation plan and phase structure are both verified and approved by the user, create a GitHub issue. Read `skills/github-issue.md` for the full standard before writing anything. Use the `gh` CLI to create the issue from a temporary `issue.md` file, then delete the file.

4. **Branching:** Immediately checkout a new, descriptively named branch:
   ```bash
   git checkout -b feature/your-feature-name
   # or: fix/your-fix-name | chore/your-chore-name | docs/your-docs-name
   ```

5. **Phase Execution (Coding):** Execute code changes strictly for the current phase only. Maintain a local `task.md` checklist to stay focused and track progress.

6. **Proactive Verification:** Before asking the user to verify a phase, independently verify your own code by running static checks or running automated test suites.

7. **User Verification (HARD STOP):** Pause after executing **each phase** and ask the user to visually/functionally verify the changes locally. You **MUST NOT run any `git commit` commands** until the user has explicitly verified and approved the phase. Making assumptions about approval is strictly prohibited.

8. **Focused Phase Commit:** Commit **immediately after** the phase is validated by the user. Do not wait until the end of all phases to commit. Read `skills/commit-message.md` for the full standard before writing any commit message.

9. **Iterative Loop:** If more phases exist in the approved plan, return to **Step 5** for the next phase. Repeat until all phases are complete.

10. **Changelog Update (MANDATORY before PR):** After all phases are complete and committed, read `skills/changelog.md` and update `CHANGELOG.md` accordingly. Commit the update as a dedicated commit before proceeding. **Do NOT open the PR until this commit exists.**

11. **Pull Request:** Upon completing all phases, the changelog update, and receiving final user approval, read `skills/pull-request.md` for the full standard before writing anything. Use the `gh` CLI to open the PR from a temporary `pr.md` file, then delete the file.

### 2. Strict Scope Adherence

- **Forbidden Actions:** Do not modify components, styles, or logic that were not explicitly mentioned in the user's request. Unrelated refactoring or "bonus" improvements are strictly forbidden to ensure predictable and controlled repository behavior.

### 3. Coding Standards & Best Practices

When writing or refactoring code for this project, you must act as a Senior Engineer and adhere to the following principles:

- **Write Clean & Maintainable Code:** Code must be readable, modular, and easy for humans to understand. Use descriptive variable/function names.
- **Follow Standard Best Practices:** Adhere to language-specific standard formatting (e.g., ESLint rules for TypeScript). Keep a strict separation of concerns (e.g., keep business logic separate from routing/UI logic).
- **Mandatory Backend Testing:** Whenever writing or modifying backend functionality, you must use Test-Driven Development (TDD). Build the test first for the feature to be developed, and make sure it fails. 
- **State Tracking:** For complex tasks, maintain a local `task.md` checklist artifact to explicitly tick off completed sub-tasks so you do not lose context mid-phase.
- **Design for Scalability:** Prefer simplicity over unnecessary abstractions, but ensure the architecture can be extended easily in the future without major rewrites.
- **Robust Error Handling:** Never ignore edge cases. Validate all inputs, handle errors gracefully, and return consistent, meaningful error messages/structures.
- **Think Before You Code:** Always outline a clear plan, understand the existing architecture, and clarify requirements before diving into implementation. Avoid jumping straight into coding without structure.
- **Security & Performance:** Be mindful of database queries (avoid N+1 patterns), indexing, input validation, and asynchronous logic where I/O blocking could occur.

### 4. Troubleshooting & Context

- **Documentation:** If library-specific behavior is unclear, refer to official documentation for Next.js, Prisma, Auth.js, and Tailwind CSS.

### 5. Release Protocol (MANDATORY on main merge)

When the user confirms a release is ready, read `skills/changelog.md` for versioning rules, then:

1. **Bump the version** in `CHANGELOG.md` — rename `## [Unreleased]` to `## [x.y.z] - YYYY-MM-DD` following Semantic Versioning.
2. **Add a fresh `## [Unreleased]` section** at the top for the next cycle.
3. Commit the version bump: `docs: release vX.Y.Z`
4. Tag the commit:
   ```bash
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin vX.Y.Z
   ```
5. Confirm with the user that the tag has been pushed.
