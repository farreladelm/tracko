
# Project Reference

For a full description of the application — its purpose, architecture, tech stack, and feature roadmap — see [`APP.md`](./APP.md). All agents (Senior and Junior) **must** read `APP.md` before starting any work to understand the product context.

---

# Senior-to-Junior Agent Workflow

This document outlines the standard operating procedure for orchestrating new features or tasks across architecture-level (Senior) AI Agents and implementation-level (Junior) AI Agents utilizing GitHub Issues.

## The Workflow Process

**1. Architecture & Planning (`issue.md`)**
Whenever a new feature, bug fix, or significant change is requested, the Senior Agent designs the plan:
- The Senior Agent assesses the codebase and creates a local file named `issue.md`.
- `issue.md` is populated with a high-level architectural overview, specific file paths to modify, functions to implement, structural requirements, and clear acceptance criteria.
- The instructions must be highly detailed and completely unambiguous so that a cheaper model, a junior programmer agent, or a new session that lacks the overarching context can easily execute it cleanly.

**2. User Approval & Issue Publishing**
- The User reviews the proposed `issue.md` artifact.
- Once the User explicitly approves the plan, the Senior Agent submits the file's contents to the remote GitHub repository as a live Issue.

**3. Implementation Handoff**
- The User initiates a brand new programming session with a Junior or Cheaper Agent model.
- The Junior Agent is assigned the task to read and resolve the newly created GitHub Issue.
- The Junior Agent writes the raw implementation and opens a Pull Request (PR) referencing the original Issue ticket.

**4. Review & Merge**
- The User (acting as the Product Manager/Tech Lead) assesses the Pull Request.
- If the solution meets the requirements without merge conflicts, the User merges the PR into the codebase.
- The Senior Agent can then pull the latest changes in its session to continue the overarching project roadmap.
