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
- **Icons**: lucide-react
- **Toasts**: sonner (`toast.success()` / `toast.error()`)
- **Dates**: date-fns

## Architecture

### Route Groups
- `(auth)/` - Login/signup pages (public)
- `(dashboard)/` - Protected pages (transactions, accounts, budgets, bills, assets, liabilities, networth, reports, settings)
- `api/` - REST API routes with `requireAuth()` protection

### Directory Structure
```
src/
  app/
    api/[resource]/route.ts          # Collection endpoints (GET, POST)
    api/[resource]/[id]/route.ts     # Item endpoints (GET, PATCH, DELETE)
    (dashboard)/[feature]/page.tsx   # Server page (thin shell with Suspense)
    (dashboard)/[feature]/new/page.tsx  # Create pages (often "use client")
  components/
    ui/                              # shadcn/ui (DO NOT MODIFY)
    layout/                          # Header, BottomNav, SideRail
    finance/                         # Shared finance components (forms, cards, dialogs)
    dashboard/                       # Dashboard-specific widgets
    [feature]/                       # Feature client components (e.g., transactions/)
  hooks/use-[feature].ts             # TanStack Query hooks per feature
  schemas/[feature].ts               # Zod schemas per feature
  types/index.ts                     # Shared TypeScript types (re-exports DB types)
  lib/
    api-client.ts                    # Typed fetch wrapper (api.get/post/patch/delete)
    auth.ts                          # requireAuth() server-side helper
    utils.ts                         # cn(), formatDateToString(), serializeDateFields()
  db/
    schema.ts                        # Drizzle table definitions + exported types
```

---

## Key Patterns

### API Routes

**Every** API route follows this exact structure:

```typescript
// src/app/api/[resource]/route.ts
import { NextResponse } from "next/server";
import { db, tableName } from "@/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { resourceSchema, resourceFilterSchema } from "@/schemas/resource";

// GET - List with filters
export async function GET(request: Request) {
  try {
    const { userId } = await requireAuth();          // 1. Auth first
    const { searchParams } = new URL(request.url);

    // 2. Parse & validate query params with Zod
    const params = resourceFilterSchema.parse({
      field: searchParams.get("field") || undefined,
      page: searchParams.get("page") || 1,
      pageSize: searchParams.get("pageSize") || 20,
    });

    // 3. Build conditions array - always filter by userId
    const conditions = [eq(tableName.userId, userId)];
    if (params.field) conditions.push(eq(tableName.field, params.field));

    // 4. Query with relations
    const data = await db.query.tableName.findMany({
      where: and(...conditions),
      with: { relation: true },
      orderBy: desc(tableName.createdAt),
      limit: params.pageSize,
      offset: (params.page - 1) * params.pageSize,
    });

    return NextResponse.json({ data, total, page, pageSize, totalPages });
  } catch (error) {
    console.error("Get resource error:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to get resource" }, { status: 500 });
  }
}

// POST - Create
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth();
    const body = await request.json();

    // Use safeParse for mutations (to return 400 with message)
    const validationResult = resourceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }
    const data = validationResult.data;

    // Verify related resources belong to user before inserting
    // e.g., verify categoryId, accountId belong to userId

    const [newItem] = await db.insert(tableName).values({
      userId,
      ...data,
      amount: String(data.amount),                  // Decimal stored as string
      date: formatDateToString(data.date),           // Dates stored as YYYY-MM-DD strings
    }).returning();

    return NextResponse.json({ data: newItem, message: "Resource created successfully" });
  } catch (error) {
    // same error handling pattern
  }
}
```

**Dynamic route** (`[id]/route.ts`) pattern:
```typescript
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { userId } = await requireAuth();
  const { id } = await params;                       // Always await params

  // Check ownership before any action
  const existing = await db.query.tableName.findFirst({
    where: and(eq(tableName.id, id), eq(tableName.userId, userId)),
  });
  if (!existing) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  // PATCH uses .partial() for optional fields
  const validationResult = resourceSchema.partial().safeParse(body);

  // Build update object dynamically
  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.field !== undefined) updateData.field = data.field;

  await db.update(tableName).set(updateData).where(eq(tableName.id, id));
}
```

**Response shapes**:
- List: `{ data: T[], total: number, page: number, pageSize: number, totalPages: number }`
- Single: `{ data: T }`
- Mutation: `{ data: T, message: "Resource verb-ed successfully" }`
- Error: `{ error: string }` with HTTP status 400/401/404/500

---

### Zod Schemas (`src/schemas/[feature].ts`)

```typescript
import { z } from "zod";

// Create/update schema
export const resourceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "..."),
  amount: z.number({ message: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .multipleOf(0.01, "Amount can have at most 2 decimal places"),
  categoryId: z.string().uuid("Invalid category").optional().nullable(),
  date: z.coerce.date({ message: "Invalid date" }),
  isActive: z.boolean().optional(),
});

// Filter schema for GET query params (use z.coerce for strings from searchParams)
export const resourceFilterSchema = z.object({
  field: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// Export inferred types
export type ResourceFormData = z.infer<typeof resourceSchema>;
export type ResourceFilterParams = z.infer<typeof resourceFilterSchema>;
```

- Filter schemas use `z.coerce` (converts string URL params to correct types)
- Amount fields always use `.multipleOf(0.01)`
- UUID foreign keys validated with `.uuid("message")`
- `.optional().nullable()` for optional UUID foreign keys

---

### Custom Hooks (`src/hooks/use-[feature].ts`)

```typescript
"use client";  // Required on all hook files

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { serializeDateFields } from "@/lib/utils";
import type { ResourceWithRelations, PaginatedResponse } from "@/types";

// Form values type for mutations (defined in the hook file)
export interface ResourceFormValues {
  name: string;
  amount: number;
  date: Date;
}

// List hook - options object pattern
export function useResources(options: { month?: number; year?: number } = {}) {
  const { month, year } = options;

  return useQuery({
    queryKey: ["resources", { month, year }],      // Always include filters in key
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (month) params.month = month;
      if (year) params.year = year;
      return api.get<PaginatedResponse<ResourceWithRelations>>("/api/resources", { params });
    },
  });
}

// Single item hook - enabled only when id present
export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: ["resources", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const response = await api.get<{ data: ResourceWithRelations }>(`/api/resources/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Mutation hooks - invalidate related queries on success
export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ResourceFormValues) => {
      const serialized = serializeDateFields(data, ["date"]);  // Serialize Date fields
      return api.post<{ data: ResourceWithRelations; message: string }>("/api/resources", serialized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });   // Invalidate related
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ResourceFormValues> }) => {
      const serialized = serializeDateFields(data, ["date"]);
      return api.patch<{ data: ResourceWithRelations; message: string }>(`/api/resources/${id}`, serialized);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      api.delete<{ message: string }>(`/api/resources/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}
```

**Query key conventions**:
- List: `["resource"]` or `["resource", { filters }]`
- Single: `["resource", id]`
- Nested: `["resource", "grouped", { filters }]`

---

### React Components

**Server page** (thin shell — no business logic):
```typescript
// src/app/(dashboard)/[feature]/page.tsx
import { Suspense } from "react";
import { FeatureClient } from "@/components/feature/feature-client";
import { Skeleton } from "@/components/ui/skeleton";

function FeatureSkeleton() {
  return <div className="..."><Skeleton className="..." /></div>;
}

export default function FeaturePage() {
  return (
    <Suspense fallback={<FeatureSkeleton />}>
      <FeatureClient />
    </Suspense>
  );
}
```

**Feature client component** (all interactivity):
```typescript
"use client";
// src/components/[feature]/feature-client.tsx

export function FeatureClient() {
  return (
    <div className="min-h-screen">
      <Header title="Feature" />
      <div className="px-4 py-6 md:px-6 space-y-5 max-w-4xl mx-auto">
        {/* content */}
      </div>
      {/* Mobile FAB */}
      <Link href="/feature/new" className="md:hidden">
        <Button className="fixed right-4 bottom-24 h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
```

**Form component**:
```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { featureSchema } from "@/schemas/feature";

type FormValues = z.infer<typeof featureSchema>;

interface FeatureFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function FeatureForm({ defaultValues, onSubmit, isLoading, submitLabel = "Save" }: FeatureFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(featureSchema),
    defaultValues: { ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="field">Field</Label>
        <Input id="field" className={cn(errors.field && "border-destructive")} {...register("field")} />
        {errors.field && <p className="text-sm text-destructive">{errors.field.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : submitLabel}
      </Button>
    </form>
  );
}
```

**Calling mutation from a page**:
```typescript
const createResource = useCreateResource();

const handleSubmit = async (data: ResourceFormValues) => {
  try {
    await createResource.mutateAsync(data);
    toast.success("Resource created successfully");
    router.push("/resources");
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Failed to create resource");
  }
};

// Pass to form
<FeatureForm onSubmit={handleSubmit} isLoading={createResource.isPending} />
```

---

### Types (`src/types/index.ts`)

- DB primitive types re-exported from `@/db/schema`
- Extended types: `XxxWithRelations extends Xxx { relation: Type | null }`
- API shapes: `ApiResponse<T>` and `PaginatedResponse<T>` (used everywhere)
- Form types suffixed `FormData` or defined as `FormValues` in the hook file
- Filter types suffixed `Filters`
- UI label maps: `THING_LABELS: Record<ThingType, string>`

---

### Database Queries

```typescript
import { db } from "@/db";
import { tableName } from "@/db";          // Named table exports from @/db (index)
import { eq, and, desc, asc, gte, lte, ilike, or, sql, inArray } from "drizzle-orm";

// Query with relations
await db.query.tableName.findMany({
  where: and(eq(tableName.userId, userId), eq(tableName.field, value)),
  with: { relation: true, nested: { with: { deep: true } } },
  orderBy: [desc(tableName.date), desc(tableName.createdAt)],
  limit: pageSize,
  offset: (page - 1) * pageSize,
});

// Insert + return
const [newRow] = await db.insert(tableName).values({ userId, ...data }).returning();

// Update
await db.update(tableName).set({ field: value, updatedAt: new Date() }).where(eq(tableName.id, id));

// Delete
await db.delete(tableName).where(eq(tableName.id, id));

// Count
const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(tableName).where(and(...conditions));
```

**Rules**:
- Always filter by `userId` (every query scopes to authenticated user)
- Dates stored as `YYYY-MM-DD` strings using `formatDateToString(date)`
- Money amounts stored as strings: `String(data.amount)` (DB type: `decimal(15, 2)`)
- Always `updatedAt: new Date()` in update objects
- Always verify foreign key resources belong to `userId` before inserting/updating

---

### Styling Patterns

```typescript
// Conditional classes
import { cn } from "@/lib/utils";
<div className={cn("base-class", condition && "conditional-class", errors.field && "border-destructive")} />

// Layout containers
<div className="min-h-screen">                                    {/* Page root */}
<div className="px-4 py-6 md:px-6 space-y-5 max-w-4xl mx-auto"> {/* Content area */}
<div className="grid grid-cols-2 gap-4">                          {/* Two-column form fields */}
<div className="flex flex-col sm:flex-row gap-3">                 {/* Responsive filter bar */}

// Sticky header (from Header component)
"sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50"

// Cards
<Card className="border-dashed border-2">  // Empty state cards
<CardContent className="py-12 text-center"> // Empty state content

// Mobile FAB position (above bottom nav)
"fixed right-4 bottom-24 h-14 w-14 rounded-full shadow-lg"

// Loading skeletons
<Skeleton className="h-20 rounded-xl" />

// Error text
<p className="text-sm text-destructive">{error.message}</p>

// Custom color tokens (defined in CSS)
// text-income (green), text-destructive (red), text-primary, text-muted-foreground
// bg-income/5, bg-destructive/5, border-income/10 (opacity variants)
```

---

### Currency Formatting

```typescript
// Simple display (no decimals)
`₹${amount.toLocaleString("en-IN")}`

// Full Intl format (used in dashboard)
new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
}).format(value)

// Amount input fields - always prefix ₹ with absolute positioning
<div className="relative">
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
  <Input type="number" inputMode="decimal" step="0.01" className="pl-8" {...register("amount", { valueAsNumber: true })} />
</div>
```

---

### Date Handling

```typescript
import { formatDateToString, serializeDateFields } from "@/lib/utils";
import { startOfMonth, endOfMonth, format } from "date-fns";

// Store in DB (local timezone, avoids UTC shift)
formatDateToString(date)                    // → "2026-03-02"

// Serialize dates before API calls
serializeDateFields(data, ["date", "startDate"])  // Converts Date → "YYYY-MM-DD" in object

// Month ranges (used in most list queries)
const startDate = startOfMonth(currentDate);
const endDate = endOfMonth(currentDate);

// Display in UI
format(date, "PPP")                         // → "March 2, 2026"

// Date picker (Calendar + Popover pattern from transaction-form.tsx)
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="single" selected={date} onSelect={(d) => d && setValue("date", d)} initialFocus />
  </PopoverContent>
</Popover>
```

---

### API Client Usage

```typescript
import { api } from "@/lib/api-client";

// GET with query params
api.get<ResponseType>("/api/resource", { params: { month: 3, year: 2026 } })

// POST/PATCH/DELETE
api.post<{ data: T; message: string }>("/api/resource", bodyData)
api.patch<{ data: T; message: string }>(`/api/resource/${id}`, bodyData)
api.delete<{ message: string }>(`/api/resource/${id}`)

// Errors thrown as ApiError (status + message) — caught in mutation error handlers
```

---

### Database Schema

Core tables: `users`, `accounts`, `categories`, `sub_categories`, `transactions`, `tags`, `transaction_tags`, `monthly_budgets`, `budget_items`, `recurring_bills`, `bill_payments`, `assets`, `asset_valuations`, `liabilities`, `liability_payments`, `networth_snapshots`

**DB conventions**:
- UUID primary keys: `uuid("id").defaultRandom().primaryKey()`
- Timestamps: `timestamp("created_at").defaultNow().notNull()`
- Money: `decimal("amount", { precision: 15, scale: 2 })`
- Dates: `date("transaction_date")` (stored as YYYY-MM-DD string)
- Cascade deletes on all `userId` foreign keys
- Enums defined with `pgEnum` and exported (re-exported from `@/types`)
- camelCase in TS, snake_case in DB column names

**Transaction types** (the 50/30/20 model):
`income` | `needs` | `wants` | `savings` | `investments`

---

### Component Organization
- `components/ui/` - shadcn/ui (do not modify directly)
- `components/layout/` - Navigation (bottom-nav, side-rail, header)
- `components/finance/` - Shared finance components (forms, cards, dialogs used across features)
- `components/dashboard/` - Dashboard-specific widgets
- `components/[feature]/` - Feature-specific client components (e.g., `transactions/transactions-client.tsx`)

---

## Verification

**Run `yarn build` after completing any task.** This catches TypeScript errors and ensures the app compiles.

Checklist:
- `yarn build` passes
- API routes use `requireAuth()` as first statement in every handler
- Dynamic route handlers `await params` before destructuring
- Client components have `"use client"` directive (hooks, `useState`, event handlers)
- Imports use `@/` alias (never relative paths like `../../`)
- Date fields use `formatDateToString()` for DB storage and `serializeDateFields()` for API calls
- Amount fields stored as `String(amount)` in DB
- Ownership verified (resource belongs to `userId`) before mutating
- `updatedAt: new Date()` included in all update objects
- Related queries invalidated in mutation `onSuccess` callbacks
