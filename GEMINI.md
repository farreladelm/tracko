# Project Reference

For a full description of the application — its purpose, architecture, tech stack, and feature roadmap — see [`APP.md`](./APP.md). All agents (Senior and Junior) **must** read `APP.md` before starting any work to understand the product context.

# AI Agent Operating Guidelines

This file serves as the primary rulebook for AI agents working within the Tracko repository.

## Environment Specifications
- **Operating System:** Windows
- **Shell:** PowerShell
- **Constraint:** ALL terminal commands proposed or executed by agents MUST be compatible with Windows PowerShell. Do not use Unix-only commands (e.g., `export`, `rm -rf`, `touch`). Use valid PowerShell equivalents or package manager scripts.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript 
- **Authentication:** NextAuth.js v5 (Auth.js) with Google Provider
- **Styling:** Tailwind CSS with shadcn/ui components
- **Parsing & Validation:** Zod (used heavily alongside regex for extracting bank transaction data)
- **Email Access:** Google Gmail API (`googleapis`)

## Coding Standards & Workflows
- **Package Manager:** `npm` (e.g., `npm run dev`, `npm install`).
- **Next.js:** Prefer React Server Components. Only use `"use client"` when browser APIs, hooks, or interactivity are strictly required.
- **Aesthetics & UI:** The application is consumer-facing and requires extremely high-quality, premium visual design. Follow modern web design practices. Use smooth micro-animations, consistent color palettes, and polished component alignments. 
- **Code Quality:** Ensure strict type safety, modular structures, and clear error boundaries, especially when parsing unpredictable email HTML bodies.