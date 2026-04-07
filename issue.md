# Issue: Add Supabase + Prisma Database Persistence

## Summary

Integrate **Supabase** (PostgreSQL) as the database backend and **Prisma ORM** for type-safe database access. Use the official **`@auth/prisma-adapter`** so NextAuth manages User, Account, and Session tables automatically — this is the standard, recommended approach when using OAuth with a database.

On top of the NextAuth-managed tables, we add a custom **Transaction** table to persist parsed QRIS expenses.

## Background & Motivation

Currently, the app:
- Authenticates via Google OAuth and stores the `access_token` only in a JWT cookie.
- Fetches and parses Gmail emails **every time** the dashboard loads — slow and wasteful.
- Has zero persistence. If the user closes the tab, all data is gone.

After this change:
- NextAuth automatically handles creating User and Account records on sign-in, including storing the Google `access_token` and `refresh_token` in the `Account` table.
- Parsed QRIS transactions are saved to a `Transaction` table, so they only need to be fetched from Gmail **once**.
- The dashboard reads from the database by default; the user can trigger a "Sync" to pull new emails.

---

## Architecture Decision: Use `@auth/prisma-adapter` (Database Strategy)

This is the **standard NextAuth pattern** for OAuth apps backed by a database:

- NextAuth creates and manages the `User`, `Account`, `Session`, and `VerificationToken` tables automatically via the Prisma adapter.
- When a user signs in with Google, NextAuth creates a `User` row and an `Account` row (storing `access_token`, `refresh_token`, `expires_at`) — we don't have to write any of that logic ourselves.
- The session strategy switches from JWT to **database sessions**, meaning each `auth()` call reads the session from the DB. This is slightly slower per request but gives us server-side session control and a clean, centralized source of truth.
- To access the Gmail API, we read the `access_token` from the `Account` table in the `session` callback. If it's expired, we refresh it using Google's token endpoint and update the row — NextAuth documents this exact pattern in their "Refresh Token Rotation" guide.

---

## Database Schema

### NextAuth-Managed Tables

These four tables are **required by `@auth/prisma-adapter`** and follow the exact schema from the NextAuth Prisma adapter documentation. We do not customize them beyond what NextAuth specifies.

#### `User`
Represents a signed-in user. Automatically created by NextAuth on first Google login.
- `id` (CUID), `name`, `email` (unique), `emailVerified`, `image`, `createdAt`, `updatedAt`.
- Has many `Account`, `Session`, and `Transaction` records.

#### `Account`
Stores the OAuth provider credentials. This is where the Google `access_token`, `refresh_token`, and `expires_at` live. NextAuth populates this automatically on sign-in.
- `id` (CUID), `userId` (FK → User), `type`, `provider`, `providerAccountId`, `refresh_token`, `access_token`, `expires_at`, `token_type`, `scope`, `id_token`, `session_state`.
- `access_token`, `refresh_token`, and `id_token` should be stored as `Text` type since they can be very long strings.
- Unique constraint on `(provider, providerAccountId)`.

#### `Session`
Stores active database sessions. NextAuth creates and manages these automatically.
- `id` (CUID), `sessionToken` (unique), `userId` (FK → User), `expires`, `createdAt`, `updatedAt`.

#### `VerificationToken`
Used for email-based magic links. We won't use it now (Google-only login), but NextAuth requires it in the schema.
- `identifier`, `token`, `expires`.
- Unique constraint on `(identifier, token)`.

---

### Application Tables (Custom)

#### `Transaction`
Stores a single parsed QRIS expense. Each row corresponds to one bank notification email that was successfully parsed.

**Fields:**
- `id` — Primary key (CUID).
- `userId` — Foreign key to `User`. Cascade delete.
- `merchantName` — The merchant/store name extracted from the email (e.g., "SUPERINDO MKN QR").
- `amount` — Transaction amount in IDR, stored as **integer** (Rupiah has no sub-units; `Int` avoids floating-point issues).
- `transactionDate` — Date and time of the payment as extracted from the email.
- `source` — Enum: `MANDIRI`, `BCA_BLU`, or `UNKNOWN`.
- `gmailMessageId` — The Gmail message ID this transaction was parsed from. Used for **deduplication**.
- `rawSnippet` — (Optional) Text snippet of the original email for debugging parser accuracy.
- `createdAt` / `updatedAt` — Automatic timestamps.

**Indexes & Constraints:**
- Unique constraint on `(userId, gmailMessageId)` — prevents duplicate imports.
- Index on `(userId, transactionDate)` — fast date-sorted queries.
- Index on `(userId, source)` — fast bank filtering.

**Enum: `TransactionSource`** — `MANDIRI`, `BCA_BLU`, `UNKNOWN`.

#### `SyncLog` (Suggested)
Tracks the last Gmail sync per user to enable incremental syncing.

**Fields:**
- `id` (CUID), `userId` (FK → User, unique), `lastSyncAt`, `lastGmailHistoryId` (optional).

---

## Files to Create

### `prisma/schema.prisma`
Define all models: the four NextAuth tables (User, Account, Session, VerificationToken) following the exact schema from the NextAuth Prisma adapter docs, plus our custom Transaction table and TransactionSource enum. Optionally include SyncLog. Use `postgresql` as the datasource with both `url` (pooled) and `directUrl` (direct) for Supabase.

### `src/lib/prisma.ts`
Singleton Prisma Client instance. Cache on `globalThis` to prevent connection exhaustion during Next.js hot-reload in development. This is the standard Next.js + Prisma pattern documented by both Prisma and NextAuth.

---

## Files to Modify

### `src/auth.ts`
- Import and use `PrismaAdapter(prisma)` as the adapter.
- Remove the manual JWT token-saving logic (the adapter handles storing `access_token` in the `Account` table).
- Update the `session` callback: with a database adapter, the callback receives `{ session, user }` instead of `{ session, token }`. To expose the `access_token` to our app, query the `Account` table for the user's Google account and attach it to the session.
- Add token refresh logic in the `session` callback: check if `account.expires_at` has passed, and if so, call Google's `https://oauth2.googleapis.com/token` endpoint with the stored `refresh_token` to get a fresh `access_token`. Update the `Account` row with the new token. This follows the NextAuth "Refresh Token Rotation" guide.
- Keep the Google provider config as-is (with `access_type: "offline"` and `gmail.readonly` scope).

### `src/lib/gmail.ts`
- After parsing emails, save them to the `Transaction` table via Prisma. Use `createMany` with `skipDuplicates` or catch unique constraint errors so re-syncing doesn't create duplicates.
- Pass the Gmail `message.id` as `gmailMessageId` for each transaction.
- Add a new function (e.g., `getSavedTransactions(userId)`) that reads from the database. The dashboard should call this by default.
- The existing `fetchRecentReceipts` function becomes a "sync" function that fetches from Gmail AND persists to DB.

### `.env.local` / `.env.example`
Add two new environment variables:
- `DATABASE_URL` — Supabase **pooled** connection string (port 6543, with `?pgbouncer=true`).
- `DIRECT_URL` — Supabase **direct** connection string (port 5432). Required by Prisma for migrations since PgBouncer doesn't support DDL commands.

---

## Dependencies to Install

- `prisma` — CLI for schema management and code generation.
- `@prisma/client` — Generated type-safe query client.
- `@auth/prisma-adapter` — Official NextAuth adapter that wires up User/Account/Session persistence automatically.

---

## User Flow After This Change

1. User visits the app → clicks "Sign In with Google".
2. NextAuth handles the OAuth flow and automatically creates a `User` row and an `Account` row (with `access_token` + `refresh_token`) in Supabase.
3. A database session is created. On subsequent `auth()` calls, the session is read from the DB.
4. User lands on the dashboard → the app queries the `Transaction` table for existing data (fast DB read).
5. User clicks "Sync Now" → the app reads `access_token` from the `Account` table, calls Gmail API, parses new emails, saves new transactions to DB, and refreshes the table.
6. If the `access_token` has expired, the app automatically refreshes it using the stored `refresh_token` and updates the `Account` row.
7. Next visit — transactions are already persisted. No Gmail API call needed unless the user syncs again.

---

## Acceptance Criteria

- [ ] `prisma/schema.prisma` exists with all NextAuth models (User, Account, Session, VerificationToken) plus Transaction and TransactionSource enum.
- [ ] `npx prisma generate` runs without errors.
- [ ] `npx prisma db push` successfully creates all tables in Supabase.
- [ ] `src/auth.ts` uses `PrismaAdapter(prisma)` and the Google OAuth flow still works.
- [ ] After signing in, User and Account rows are created in Supabase automatically.
- [ ] The `Account` table stores the Google `access_token` and `refresh_token`.
- [ ] Token refresh works: if the `access_token` expires, it is refreshed and updated in the `Account` table.
- [ ] Parsed transactions are saved to the `Transaction` table with correct data.
- [ ] Syncing the same emails twice does not create duplicate rows (enforced by unique constraint on `userId + gmailMessageId`).
- [ ] The dashboard reads from the database by default.
- [ ] The app compiles and runs without errors (`npm run dev`).
