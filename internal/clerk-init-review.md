---
cursor:
  subagentId: "bc-4aecf3e4-d55b-5238-bdfc-a65f87e7fda0"
---

# Clerk `init` review — Reader

**Verdict:** Core Clerk Next.js scaffolding looks mostly correct and is **local-only (not pushed)**. Incomplete vs current quickstart: no in-app auth controls, no `@clerk/ui` shadcn theme, `.env.example` missing Clerk keys, matcher missing explicit `/__clerk/(.*)`, and Convex still uses plain `ConvexProvider` (not Clerk-linked).

## Repo / git

| Item | Value |
|------|--------|
| Local path | `/Users/luisvieira/reader` |
| Remote | `https://github.com/luisvieiragmr/reader.git` |
| Branch | `main` @ `23639b5` (matches `origin/main`) |
| Clerk pushed? | **No** — no Clerk files on GitHub; search for clerk returned 0; open PRs: none |
| Local vs remote | Working tree dirty; Clerk changes uncommitted |

Recent remote `main` commits (Oct 9): ConvexProvider prerender fix, article fetcher/headers, Queue chrome — no Clerk.

## What `clerk init` changed (local)

### Runtime / app (Clerk-relevant)

| Path | Status |
|------|--------|
| `package.json` / `package-lock.json` | Modified — `@clerk/nextjs` `^7.9.14` |
| `src/app/layout.tsx` | Modified — wraps children in `<ClerkProvider>` inside `<body>` |
| `src/proxy.ts` | **New** — `clerkMiddleware()` (correct filename for Next 16.4) |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | **New** — `<SignIn />` |
| `src/app/sign-up/[[...sign-up]]/page.tsx` | **New** — `<SignUp />` |
| `.env.local` | Keys present (names only): `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (`/sign-in`), `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (`/sign-up`), fallback redirect URLs → `/` |
| `.env.example` | **Unchanged** — Convex only; no Clerk vars documented |
| `components.json` | Present (shadcn); **no** `@clerk/ui` install or theme wiring |

### Agent / docs noise (not required for auth to run)

- `.agents/skills/clerk-*` (+ templates), `skills-lock.json`
- `.claude/skills/convex-*`, `CLAUDE.md`, `convex/_generated/ai/`, `AGENTS.md` Convex AI block (likely concurrent Convex ai-files install)

## Pass / fail checklist (vs Clerk Next.js quickstart)

| Check | Result |
|-------|--------|
| `@clerk/nextjs` installed | **Pass** |
| `ClerkProvider` in root layout (inside `<body>`) | **Pass** |
| Middleware file = `proxy.ts` on Next 16+ under `src/` | **Pass** |
| `clerkMiddleware()` exported as default | **Pass** |
| Matcher includes `/__clerk/(.*)` (or `/__clerk/:path*`) explicitly | **Fail** — only catch-all + `/(api\|trpc)(.*)`. Catch-all likely covers `/__clerk` today; current Clerk docs still require an explicit entry |
| Dedicated sign-in / sign-up routes | **Pass** |
| Visible `SignInButton` / `SignUpButton` / `UserButton` (or `<Show>`) in chrome | **Fail** — pages exist, but no header/nav controls wired into Queue UI |
| Env keys in `.env.local` | **Pass** (names confirmed; values not read) |
| `.env.example` documents `NEXT_PUBLIC_CLERK_*` (+ secret placeholder) | **Fail** |
| `components.json` → `@clerk/ui` + `appearance={{ theme: shadcn }}` + CSS import | **Fail** — shadcn present; `@clerk/ui` not installed |
| Secrets not committed / `.env*` gitignored | **Pass** (`.env*` ignored; `!.env.example`) |

### Reader-specific (beyond plain Clerk quickstart)

| Check | Result |
|-------|--------|
| Convex + Clerk (`ConvexProviderWithClerk` + `useAuth`) | **Not done** — still `ConvexProvider` only in `src/app/ConvexClientProvider.tsx` |
| Convex backend `ctx.auth` / JWT template | **Not present** |

## Recommended next fixes

1. Add explicit matcher entry in `src/proxy.ts`: `'/__clerk/(.*)'` (or `'/__clerk/:path*'`).
2. Add sign-in / sign-up / `UserButton` (via `<Show when="signed-out|signed-in">`) to existing Queue chrome — not only `/sign-in` and `/sign-up` pages.
3. Document Clerk env var **names** in `.env.example` (no real secrets).
4. Because `components.json` exists: `npm i @clerk/ui`, import `@clerk/ui/themes/shadcn.css`, set `appearance={{ theme: shadcn }}` on `ClerkProvider`.
5. When auth should gate Convex data: switch to `ConvexProviderWithClerk` + Clerk JWT for Convex; keep as a follow-up to Clerk UI init.
6. Run `npx clerk doctor`, then commit/push only the runtime Clerk files (consider excluding bulk `.agents`/`.claude` skills if the repo should stay lean).

## Overall

**Scaffold: mostly pass. Product-ready auth UX + Convex linkage: incomplete.** Safe to treat `clerk init --app app_3KY1egNZgqlmJWLGznt7vIG3PCr` as successful SDK + provider + proxy + routes + local keys; finish UI controls, matcher, env example, optional shadcn theme, then Convex auth if needed.
