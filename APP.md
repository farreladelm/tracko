# Tracko — QRIS Expense Tracker

## Overview

**Tracko** is a SaaS web application that helps Indonesian users automatically track their QRIS (Quick Response Code Indonesian Standard) payment expenses. QRIS is a unified QR payment system widely adopted across Indonesia, integrated into most mobile banking and e-wallet apps.

The core idea is simple: when a user makes a QRIS payment, their bank (e.g., Mandiri, BLU by BCA Digital) sends a transaction notification email. Tracko connects to the user's Gmail account, reads those notification emails, extracts the relevant transaction data, and presents it in a clean, organized dashboard.

## Problem

- Indonesian users make dozens of QRIS payments per month but have no easy, centralized way to track and review those expenses.
- Transaction histories are scattered across multiple banking apps and e-wallet platforms.
- Manually logging expenses is tedious and error-prone.

## Solution

Tracko automates expense tracking by:
1. **Connecting** to the user's Gmail via Google OAuth (requesting `gmail.readonly` permission).
2. **Scanning** for transaction notification emails from supported banks.
3. **Extracting** key data: **Merchant Name**, **Amount (Rp)**, and **Transaction Date**.
4. **Displaying** the data in a beautiful, filterable dashboard with export capabilities.

## Supported Banks (MVP)

| Bank | Sender Email | Notes |
|------|-------------|-------|
| Bank Mandiri | `no-reply@mandiri.co.id` | Sends HTML email receipts for QRIS payments |
| BLU by BCA Digital | `blu@bcadigital.co.id` | Sends HTML email receipts for QRIS payments |

> More banks will be added post-MVP based on user demand.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Authentication | NextAuth.js v5 (Auth.js) with Google Provider |
| Email Access | Google Gmail API (`googleapis` Node.js client) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix primitives + Tailwind) |
| Validation | Zod |

## Key Features (MVP)

- **Google OAuth Sign-In** — Users sign in with their Google account; the app requests read-only Gmail access.
- **Automatic Email Parsing** — The app fetches bank notification emails and extracts transaction details using regex-based parsers.
- **Expense Dashboard** — A clean table view showing all extracted QRIS transactions (Date, Merchant, Amount, Bank Source).
- **CSV Export** — Users can download their expense data as a `.csv` file for personal use or further analysis.

## Key Features (Post-MVP Roadmap)

- **Database Persistence** — Store transactions in PostgreSQL via Prisma so data doesn't need to be re-fetched every session.
- **Background Sync** — Periodically poll Gmail (or use Google Pub/Sub webhooks) to keep data up-to-date automatically.
- **Analytics & Charts** — Visualize spending trends, category breakdowns, and monthly summaries.
- **Multi-Bank Support** — Expand parsing support to more Indonesian banks (BNI, BRI, DANA, GoPay, OVO, etc.).
- **Budget Alerts** — Notify users when they approach or exceed spending thresholds.

## Architecture (Simplified)

```
User → Google OAuth → NextAuth v5 (JWT with access_token)
                            ↓
                    Gmail API (googleapis)
                            ↓
                   Fetch bank emails (IMAP search)
                            ↓
                   Parse HTML body (Regex + Zod)
                            ↓
                   Dashboard UI (shadcn/ui Table)
                            ↓
                   Export to CSV (client-side download)
```

## File Structure (MVP)

```
src/
├── auth.ts                          # NextAuth v5 config (Google + Gmail scope)
├── app/
│   ├── page.tsx                     # Landing / Sign-in page
│   ├── dashboard/
│   │   └── page.tsx                 # Main expense dashboard
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts         # Auth.js route handler
├── lib/
│   ├── gmail.ts                     # Gmail API fetching utility
│   └── parsers.ts                   # Email parsing engine (Regex + Zod)
└── components/
    └── ui/                          # shadcn/ui components (button, table, card)
```
