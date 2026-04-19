# Product Roadmap: From POC to Business

This document outlines the strategic features required to transition Tracko from a technical Proof of Concept (a raw data extraction tool) into a high-value, retentive, and "sticky" consumer product.

## 1. Database Persistence (Current Priority)
**The Problem:** Fetching and parsing emails live via the Gmail API on every page load is slow, inefficient, and prone to API rate limits.
**The Feature:** Implement a PostgreSQL database (using an ORM like Prisma or Drizzle). When a user logs in, only fetch **new** emails since their last sync, parse them, and store them securely in the database.
**The Value:** The dashboard loads instantly. Speed is a massive factor in user retention. It also unlocks the ability to perform complex queries (e.g., historical comparisons) without re-parsing emails.

## 2. Auto-Categorization (The "Aha!" Moment)
**The Problem:** A raw list of merchants and prices requires mental math to understand.
**The Feature:** Run parsed Merchant Names through a rule-based dictionary and/or a lightweight LLM API to auto-assign categories (e.g., `Food & Beverage`, `Groceries`, `Transportation`, `Utilities`).
**The Value:** Users instantly see where their money is going without manual tagging. "You spent Rp 800.000 on Coffee this month" provides an immediate, actionable insight.

## 3. Financial Health Dashboard (Visuals > Tables)
**The Problem:** Tables are for accountants; average consumers need visual summaries.
**The Feature:** 
- A prominent "Total Spent This Month" comparing to the previous month.
- A "Top 3 Merchants" leaderboard.
- A Pie/Donut chart breaking down spending by category.
**The Value:** Makes the app "snackable". Users can log in, glance for 5 seconds, and understand their financial health instantly.

## 4. Budgets & Limits
**The Problem:** Users want to manage the present, not just track the past.
**The Feature:** Allow users to set a monthly "QRIS Allowance" (e.g., Rp 3.000.000). Display a beautiful progress bar (Green → Yellow → Red) as they approach their limit.
**The Value:** Gives the app an active purpose and gamifies spending control.

## 5. Automated Weekly Summaries (The Retention Hook)
**The Problem:** Users forget to open apps.
**The Feature:** A weekly cron job that sends a summary email (e.g., every Sunday night): *"You spent Rp 540.000 via QRIS this week. Your top purchase was Rp 200.000 at KKV."*
**The Value:** Pushes the value directly to the user's inbox, keeping Tracko top-of-mind and driving repeat visits to the dashboard.
