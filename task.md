# Task: Fix invalid_grant & Token Refresh

## Phase 1: Test Infrastructure Setup (Vitest)
- [x] Install dependencies (`vitest`, `@types/jest`, `vite-tsconfig-paths`)
- [x] Add `test` script to `package.json`
- [x] Create `vitest.config.ts`
- [x] Verify setup with a dummy test

## Phase 2: Token Refresh Logic & Tests
- [x] Write test for token refresh listener in `tests/lib/gmail.test.ts`
- [x] Implement `.on('tokens', ...)` listener in `src/lib/gmail.ts`
- [x] Verify test passes

## Phase 3: Graceful Re-authentication Handling
- [x] Write test for `invalid_grant` error catching in `tests/lib/gmail.test.ts`
- [x] Implement error handling in `src/lib/gmail.ts` (throw `"needs_reauth"`)
- [x] Handle `"needs_reauth"` in `src/app/actions.ts`
- [x] Verify all tests pass

## Phase 4: Force Token Update on Login
- [x] Implement `signIn` callback in `src/auth.ts` to update tokens in DB
- [x] Verify re-auth flow manually by signing out and in
