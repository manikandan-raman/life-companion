# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Finance PWA (Progressive Web App) for tracking expenses, budgets, bills, assets, liabilities, and net worth. Built with Next.js App Router, TypeScript, and a mobile-first dark UI. Currency is Indian Rupee (₹) with 50/30/20 budget rule (Needs/Wants/Savings).

## Commands

```bash
# Development
yarn dev              # Start dev server (port 3000)
yarn build            # Production build - ALWAYS run after completing work
yarn lint             # Run ESLint

# Database (Drizzle ORM + PostgreSQL)
yarn db:generate      # Generate migration files from schema changes
yarn db:migrate       # Apply migrations
yarn db:push          # Push schema directly (dev only, no migration file)
yarn db:studio        # Open Drizzle Studio GUI
yarn db:fresh         # Reset + migrate + seed (full refresh)
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript (strict)
- **Database**: PostgreSQL with Drizzle ORM (`src/db/schema.ts`)
- **UI**: Tailwind CSS v4 + shadcn/ui (new-york style in `src/components/ui/`)
- **State**: TanStack Query for server state, custom hooks in `src/hooks/`
- **Forms**: React Hook Form + Zod (schemas in `src/schemas/`)
- **Auth**: JWT in HTTP-only cookies via `requireAuth()` from `@/lib/auth`
- **PWA**: Serwist for service workers

## Architecture

### Route Groups
- `(auth)/` - Login/signup pages (public)
- `(dashboard)/` - Protected pages (transactions, accounts, budgets, bills, assets, liabilities, networth, reports, settings)
- `api/` - REST API routes with `requireAuth()` protection

### Key Patterns

**API Routes** (`src/app/api/[resource]/route.ts`):
```typescript
import { requireAuth } from "@/lib/auth";
const { userId } = await requireAuth();  // Throws if unauthorized
```

**Client Components** - Add `"use client"` when using hooks, events, or browser APIs.

**Imports** - Use `@/` path alias (points to `src/`).

**Styling** - Use `cn()` from `@/lib/utils` for conditional classes.

**Database Queries**:
```typescript
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
await db.query.transactions.findMany({ where: eq(transactions.userId, userId) });
```

**Mutations** - Invalidate related queries after mutations:
```typescript
queryClient.invalidateQueries({ queryKey: ["transactions"] });
```

### Database Schema

Core tables: `users`, `accounts`, `categories`, `sub_categories`, `transactions`, `tags`, `monthly_budgets`, `budget_items`, `recurring_bills`, `bill_payments`, `assets`, `asset_valuations`, `liabilities`, `liability_payments`, `networth_snapshots`

Money fields use `decimal(15, 2)`. UUIDs for primary keys. Cascade deletes on foreign keys.

### Component Organization
- `components/ui/` - shadcn/ui components (do not modify directly)
- `components/layout/` - Navigation (bottom-nav, side-rail, header)
- `components/[feature]/` - Feature-specific components (transactions, budgets, etc.)

## Verification

**Run `yarn build` after completing any task.** This catches TypeScript errors and ensures the app compiles.

Checklist:
- `yarn build` passes
- API routes use `requireAuth()` for protected endpoints
- Client components have `"use client"` directive
- Imports use `@/` alias
