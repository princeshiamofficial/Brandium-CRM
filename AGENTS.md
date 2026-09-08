# AGENTS.md

Welcome to the **Brandium CRM** repository.

## Repository Overview

- **Framework**: Next.js 15 (App Router) + React 19
- **Database**: MySQL (brandium_crm) / Direct Server API Route Handlers
- **Styling**: Tailwind CSS & Radix UI / Shadcn UI

## Universal AI Engineering Framework

- **Mission**: Build production-ready software using an inspect â†’ plan â†’
  implement â†’ verify workflow.
- **Core Rules**:
  - Never claim success without empirical evidence.
  - Prefer maintainable, secure, scalable solutions.
  - Preserve existing working code and maintain state resilience.
  - Validate all external input and enforce server-side authorization.
  - Run build, lint, typecheck, and tests when available.
  - Report verified, assumed, untested, and blocked items separately.
- **Completion Gate**:
  - Implementation finished & Build succeeds.
  - Relevant tests pass & Documentation updated.
  - Zero critical errors remain.

## Interaction Guidelines

- **Premium UI**: Always prioritize high-end design. Use Radix UI components,
  smooth transitions, and curated color palettes.
- **Banglish Summary**: Provide a concise summary of the work performed in
  **Banglish** (Bengali written in Latin/English script) after completing
  each task. **NEVER use direct Bengali Unicode characters (e.g., à¦¬à¦¾à¦‚à¦²à¦¾)** â€”
  always write Bengali phonetically in English letters only (e.g., "Ami kaj
  shesh korlam").
- **Summary of Actions**: After the Banglish summary, provide a clear,
  bulleted "Summary of Actions" in English to detail the specific technical
  steps taken.
- **Benefit Comparison Table**: Always provide a comparison table in
  **Banglish** (using Latin/English script, never Unicode Bengali) showing
  the **Previous State/Implementation** vs. the **Recent State/Benefits** of
  your changes at the end of each task.
- **Git Push Policy**: NEVER push code to GitHub automatically after
  completing a task. Only run `git push` when the user explicitly
  requests/commands to push to GitHub.
- **Automatic Error-Fix Rule Recording**:
  - Whenever an error, bug, or issue is resolved during a task, immediately
    document and append the exact resolution pattern & prevention rule to
    `AGENTS.md` so that future turns and tasks never repeat the same mistake.

## Code Quality & Zero-Error Formatting Rules

- **Strict Prettier & ESLint Code Formatting**:
  - Always surround Markdown headings and lists with blank lines (enforce
    `MD022` and `MD032`).
  - Always declare variables with `const` unless reassigned (enforce ESLint
    `prefer-const`).
  - Never leave double blank lines anywhere in TypeScript/TSX code files.
  - Automatically wrap long string properties, function parameters, state
    updaters, and JSX `cn(...)` calls across newlines per Prettier
    line-length rules.
  - Always include trailing commas in multiline objects, arrays, parameter
    lists, and arrow function calls.
- **Tailwind CSS Utility Standards**:
  - Prefer standard Tailwind CSS utility classes over arbitrary brackets
    wherever available.
- **Database & State Fallback Resilience**:
  - Provide fail-safe default values and demo fallback data for all queries
    and state hooks to ensure components never render empty or broken text
    lines.
- **Direct MySQL Database Persistence Policy & Automatic Schema Bootstrapping**:
  - Always save and persist all data entities (prospects, users, stages,
    services, invoices, activity logs, follow-ups, meetings, sales, etc.)
    directly into the local MySQL database (`brandium_crm`).
  - Do NOT rely on browser `localStorage` or client-side mock memory for
    primary data storage.
  - Execute all mutations and reads via server-side functions
    (`createServerFn`) connecting directly to MySQL.
  - Automatically create all database tables (`users`, `profiles`, `user_roles`,
    `services`, `stages`, `prospects`, `prospect_stage_history`, `sales`,
    `follow_ups`, `activities`, `meetings`, `opportunities`, `invoices`,
    `payments`) with `CREATE TABLE IF NOT EXISTS` schema bootstrapping during
    connection (modeled after `C:\Transfer\Running Projects\erpapp`).

## Resolved Patterns & Prevention Rules

- **Index Signature & Unknown Dynamic Data Property Access (TS4111 & TS2322)**:
  - When accessing query results or dynamic records with index signatures
    (`Record<string, unknown>`), always use bracket notation
    `record["property_name"]` instead of dot notation.
  - Cast the result explicitly using `(record["property_name"] as string)`
    or wrap with `String(...)` to ensure safe string type assignment
    without leaving `unknown` or `{}` types.

- **Markdown Bare URL / Email Format Warnings (MD034)**:
  - Enclose email addresses or bare unformatted URLs in backticks (e.g.,
    `user@example.com`) or proper angle bracket links
    (`<https://example.com>`) to satisfy markdown linter `MD034`.

- **Tailwind CSS v4 Utility Standard Conversions**:
  - Replace arbitrary bracket sizing like `min-w-[8rem]` with built-in
    Tailwind utilities like `min-w-32`.
  - Replace CSS variable bracket syntax like `max-h-[var(--name)]` with
    standard parenthetical syntax `max-h-(--name)`.
  - Replace explicit data attribute brackets like `data-[disabled]:...` with
    concise pseudo-variant syntax like `data-disabled:...`.

- **Dialog & Modal Sub-component Import Completeness**:
  - Whenever rendering nested modal components (such as `DialogHeader`,
    `DialogTitle`, `DialogDescription`, or `DialogFooter`), always verify and
    explicitly include them in the `@/components/ui/dialog` import list to
    prevent runtime `ReferenceError: DialogHeader is not defined` crashes.

- **Vite Client SPA Runtime & Node.js MySQL Direct Socket Access**:
  - In Vite client SPA mode (`vite dev`), browser JS cannot open direct TCP
    sockets to MySQL port 3306. Always route browser SQL operations through
    a Node.js Vite server middleware endpoint (`/api/mysql` configured via
    `viteMySQLPlugin` in `vite.config.ts`) using `runMySQLQuery()`, which
    executes queries inside Node.js and persists directly into local MySQL
    database `brandium_crm` visible in phpMyAdmin.

- **TanStack Start Server Function Serializability & Seroval Serialization**:
  - Server functions (`createServerFn`) require return types to be strictly serializable. Avoid returning raw `Record<string, unknown>[]` or non-plain MySQL class instances (e.g. `ResultSetHeader`, `Date` objects, `Buffer`) directly as they cause `Seroval Error (specific: 1)`. Always sanitize rows into pure primitive dictionaries (`Record<string, string | number | boolean | null>`) and normalize non-array execution headers into plain `{ affectedRows, insertId }` objects.

- **Pure Direct MySQL Database Persistence Policy**:
  - All data operations and entity mutations bypass client-side localStorage/mock stores completely and execute directly against the local MySQL database (`brandium_crm`) via Node.js `/api/mysql` endpoint and `createServerFn` server functions.

- **Supabase User Auth Profile Property Access & React Hook Memoization**:
  - `User` type from `@supabase/supabase-js` does not contain top-level `.name` property. Always access user full name via `profile?.full_name` or `user.user_metadata?.full_name`.
  - When creating computed dropdown list options inside dialog components, move raw query data resolution inside `useMemo` callbacks to prevent `react-hooks/exhaustive-deps` warnings.

- **Exact Optional Property Types Compatibility (TS2379)**:
  - When assigning objects with possible undefined fields to interfaces under `exactOptionalPropertyTypes: true`, always declare property types explicitly as `string | undefined` rather than purely optional `string` to prevent assignment incompatibility.

- **Raw SQL API Bridge Production Guardrail**:
  - Never expose a browser-callable endpoint that executes arbitrary SQL in production. Keep legacy raw SQL compatibility behind an explicit local-only flag such as `ENABLE_DEV_SQL_API=true`, return redacted database errors to clients, and route production mutations through validated TanStack Start server functions with server-only `MYSQL_*` credentials.

- **Dashboard Metric & Column List Filter Alignment**:
  - Ensure the statistical counts calculated in `dashboardMetricsQuery` match the exact boolean filter predicates used in the dashboard column category lists (`categoryLists` in `dashboard.tsx`). Specifically, `follow_up_stage` must strictly match prospects with `stage_name` containing "follow" rather than broadly matching all non-won or new prospects, preventing mismatch between top KPI summary cards and bottom category columns.

- **MySQL Table Schema Alignment & Automatic Column Migration**:
  - Ensure all database tables (`meetings`, `invoices`, `opportunities`, `payments`, `services`, `activities`) contain all entity attributes (e.g. `phone`, `location`, `meeting_type`, `meeting_date`, `meeting_time`, `due_amount`, `transaction_reference`, `icon`) defined in TypeScript models. When creating or bootstrapping schema tables, include all current entity fields and run safe column additions (`ALTER TABLE tbl ADD COLUMN IF NOT EXISTS`) to prevent runtime `Unknown column 'x' in 'field list'` SQL errors during insert/update mutations.

- **Vite Cloudflare Tunnel Host Blocking (`server.allowedHosts`)**:
  - When port forwarding via Cloudflare Tunnel (`*.trycloudflare.com`), Vite dev server blocks untrusted HTTP `Host` headers by default. Always configure `server: { allowedHosts: true }` in `vite.config.ts` so external tunnel hostnames render without `Blocked request. This host is not allowed` errors. Also point `cloudflared` directly to IPv4 `http://127.0.0.1:<port>` to avoid IPv6 `[::1]` connection refusal issues.

- **MySQL User Table Column Name Alignment (`users.name` vs `profiles.full_name`)**:
  - In local MySQL database `brandium_crm`, the user name column in table `users` is `name` (not `full_name`), whereas in table `profiles` it is `full_name`. When joining queries with `users` and `profiles`, always use `COALESCE(prof.full_name, u.name, u.email)` to avoid `Unknown column 'u.full_name' in 'field list'` SQL errors.

- **Stage Table Join Column Accuracy (`prospects.stage_id` vs non-existent `prospects.stage_name`)**:
  - In table `prospects`, stage linkage is stored strictly in `stage_id` (not `stage_name`). Never reference `p.stage_name` in `SELECT` or `ON` clauses. Always join via `LEFT JOIN stages st ON (p.stage_id = st.id OR p.stage_id = REPLACE(st.id, '-', '_') OR p.stage_id = st.name)` and use `COALESCE(st.name, p.stage_id, 'Prospect') AS stage_name` to prevent `Unknown column 'p.stage_name' in 'field list'` SQL exceptions.

- **Vite Dev MySQL Bridge Production Routing & 404 Error Prevention**:
  - In `src/lib/mysql-api.ts`, browser direct `fetch("/api/mysql")` must only execute when `import.meta.env.DEV` is `true`. In production builds or non-dev server environments where Vite dev middleware is omitted, calling `/api/mysql` results in HTTP 404 errors. Automatically auto-disable direct `/api/mysql` fetch when `import.meta.env.DEV` is `false` or when receiving HTTP 404/403 responses, falling back directly to TanStack Start server functions (`executeMySQLQueryFn`).

- **In-Memory Schema Bootstrapping Cache & Concurrency Latch**:
  - Centralized schema verification (`ensureMySQLTablesExist`) must be guarded by an in-memory lock (`isSchemaInitialized` & `initSchemaPromise`). This ensures the full table creation (`CREATE TABLE IF NOT EXISTS`), column migration (`INFORMATION_SCHEMA` $\rightarrow$ `ALTER TABLE`), and seeding routines execute safely once on server startup while eliminating all DDL latency overhead (100-300ms) on subsequent API and query requests.

- **Relational User ID Dropdown Option Matching & Dialog Pre-fill**:
  - When saving relational foreign keys (such as `assigned_artist_id` and `assigned_to`) as pure user IDs in MySQL (`prospects`), all UI dropdown `<SelectItem>` elements must use `art.id` / `ag.id` as their `value` property rather than names.
  - Dialog queries and form initialization hooks (`useEffect`) must map both `p.assigned_artist_id` and `p.assigned_to` by ID with regex fallback to legacy note tags, and user option queries (`fetchAgentOptions`, `fetchArtistOptions`) must query all active users joined with `profiles.full_name` so any assigned user ID matches and pre-selects correctly in the Radix UI Select component.

- **Real-Time Self-Healing Schema Auto-Migration (`executeMySQLQueryFn`)**:
  - Whenever an `INSERT`, `UPDATE`, or `SELECT` query fails with `Unknown column 'x' in 'field list'`, `executeMySQLQueryFn` automatically intercepts the SQL error, parses the missing column name and target table, dynamically infers the exact column data type (e.g. `TINYINT(1)`, `VARCHAR(36)`, `DECIMAL(12,2)`, `DATETIME`), executes `ALTER TABLE \`table\` ADD COLUMN \`col\` type` instantly on the database, and re-executes the original query. This guarantees zero downtime and zero schema mismatches across any environment.

- **Next.js 15 App Router & Server/Client Boundary Architecture**:
  - In Next.js App Router, client components marked with `"use client"` must NEVER directly or indirectly import Node.js native drivers (such as `mysql2`, `bcryptjs`, `fs`, `net`, `tls`).
  - Keep client-safe helpers (`generateUUID`, `getMySQLTimestamp`, `formatCrmDate`, `runMySQLQuery`) in `src/lib/mysql-client.ts` and `src/lib/mysql-api.ts`. Keep database connection pools (`getMySQLPool`, `createSingleMySQLConnection`) strictly in `src/lib/mysql-server.ts`.
  - Client components communicate with MySQL via Next.js Route Handlers (`/api/mysql`, `/api/auth/login`, `/api/upload`), ensuring complete persistence to local MySQL database `brandium_crm` with zero webpack bundling errors during `next build`.

- **Prospect Artist & Agent Assignment Separation**:
  - In `src/lib/prospects.ts`, `getProspectArtistName` must NEVER fall back to `assigned_agent_name`. If `assigned_artist_id` or `artist` is unassigned/empty, it must strictly return `"Unassigned"`.
  - In `prospectsQuery`, always join `users u_artist` and `profiles prof_artist` on `p.assigned_artist_id` to populate `assigned_artist_name` distinctly from `assigned_agent_name`.

- **Edit Modal Direct Prop Initialization & Key Remounting**:
  - In `EditProspectDialog`, pass `prospect` directly as a prop in addition to `prospectId` and mount with `key={editProspect?.id || "none"}`. This guarantees instant 0ms pre-fill of `service_id`, `assigned_artist_id`, and `assigned_to` in Radix UI Select components without async state flash or placeholder fallbacks.

- **Agent and Artist Dropdown Role Filtering**:
  - `fetchAgentOptions` must filter users with `LOWER(u.role) IN ('agent', 'admin')`, and `fetchArtistOptions` must filter users with `LOWER(u.role) = 'artist'`.
  - Always use `u.role` from table `users` (never `p.role` on `profiles`) as the `profiles` table schema only stores `id`, `full_name`, `email`, and `avatar_url`.

- **Next.js App Router Dynamic Runtime Upload Serving (`/uploads/[filename]` Route Handler)**:
  - In Next.js production mode (`next start`), files written to `public/uploads/` dynamically after `next build` are not included in Next.js's static build manifest and return 404 by default. Always create an App Router Route Handler at `src/app/uploads/[filename]/route.ts` that streams dynamic binary image files directly from the disk filesystem (`public/uploads`) with appropriate `Content-Type` and cache headers.

- **Next.js App Router Dynamic Runtime Upload Serving (`/uploads/[filename]` Route Handler)**:
  - In Next.js production mode (`next start`), files written to `public/uploads/` dynamically after `next build` are not included in Next.js's static build manifest and return 404 by default. Always create an App Router Route Handler at `src/app/uploads/[filename]/route.ts` that streams dynamic binary image files directly from the disk filesystem (`public/uploads`) with appropriate `Content-Type` and cache headers.

- **Dashboard Prospect List Service Relational Join & ScrollArea**:
  - In `src/lib/dashboard.ts`, `recentProspectsQuery` must explicitly `LEFT JOIN \`services\` srv ON (p.service_id = srv.id OR p.service_id = srv.name)`and select`COALESCE(srv.name, p.service_id) AS service_name`so service names populate rather than displaying`"No service"`.
  - In `src/app/(authenticated)/dashboard/page.tsx`, wrap category prospect column lists inside Radix `<ScrollArea className="h-125 pr-2.5">` to show 10 items comfortably per column with smooth vertical scrolling for overflow items.

- **Sales CRM Contact Card UI & Modern Typography Standardization**:
  - In `src/app/(authenticated)/prospects/page.tsx`, render prospect cards matching the Dreamstechnologies Sales CRM template with `Golos Text` typography, 40px circular profile avatars, 31px action button with clean dropdown menu (Edit, Preview/View Stage, Update Stage, Delete), email/phone/location rows with dark icons, dynamic soft pastel badges (`badge-soft-*`), quick circular communication action links (Mail, PhoneCall, WhatsApp, Website/Social), and assigned agent/artist avatar in the footer.
  - When importing external web fonts in Tailwind CSS (`src/styles.css`), always position `@import url(...)` at the very beginning of the stylesheet prior to `@import "tailwindcss"` to maintain CSS specification compliance.

- **Action Dropdown Menu Spec Standardization (Sales CRM Template)**:
  - In `src/app/(authenticated)/prospects/page.tsx`, format the action dropdown content to 160px width (`w-[160px] min-w-[160px]`), 5px border radius (`rounded-[5px]`), 4px padding (`p-1`), with box shadow (`shadow-[0_4px_4px_0_rgba(219,219,219,0.25)]`).
  - Style dropdown menu items with `px-[15px] py-[6.4px] rounded-[6px] text-[14px] font-normal leading-[21px] text-[#707070]`, paired with specific icon accent colors (Edit: `#1B84FF`, Delete: `#707070`, Preview: `#00c5fb`, Update Stage: `emerald-600`) to guarantee 100% visual match with Dreamstechnologies template.

- **Sales CRM Offcanvas Contact Form Drawer Standardization (`offcanvas_edit` & `offcanvas_add`)**:
  - In `src/components/edit-prospect-dialog.tsx` and `src/components/add-prospect-dialog.tsx`, implement slide-out drawers via Radix UI `Sheet` (`side="right"`, `w-full sm:max-w-[750px] lg:max-w-[800px]`) mirroring Bootstrap 5 `offcanvas-end` from Dreamstechnologies Sales CRM.
  - Structure forms into bordered accordion sections (`rounded-[5px] border-slate-200`) featuring `[30px]` badge headers in Brandium Green `bg-[#67B239]` and Brandium Navy `bg-[#0a2e5c]`, 80x80 dashed avatar preview with top-right trash button and Brandium Green "Upload file" button (`bg-[#67B239] hover:bg-[#5aa030]`), First Name / Last Name / Job Title / Company Name input rows (`h-[39px] rounded-[6px] text-[14px] text-[#707070]`), Email field with `Email Opt Out` toggle switch, and a sticky action footer with Cancel and Brandium Green Save Changes buttons (`bg-[#67B239] hover:bg-[#5aa030]`).

- **Brand Identity & Color Fidelity Policy**:
  - Always apply Brandium CRM's core brand color palette: Primary Navy (`#0a2e5c` / `#0b3364`) and Growth Green (`#67B239` / `#7ac142`, hover `#5aa030`) for badges, primary call-to-actions, active toggle states, and headers. Never retain external template primary colors (such as template red `#E41F07`) on brand UI elements.

- **Prospects Grid Density & Dynamic Pagination Standard**:
  - For responsive prospect card grids (1, 2, 3, or 4 columns), standard `pageSize` is 12 (replacing legacy 10 to ensure zero orphaned cards across 2, 3, and 4-column layouts).
  - Include an explicit "Show: [12] per page" Radix `Select` dropdown in the bottom pagination bar with options `12`, `24`, `36`, `48`, allowing users to adjust card density dynamically while persisting state via `useAppFilters`.

- **Prospect Creator Avatar & Name Rendering Standard**:
  - In `prospectsQuery` (`src/lib/prospects.ts`), select `creator_avatar` and `creator_name` via `COALESCE(prof_create.avatar_url, u_create.avatar_url, prof_assign.avatar_url, u_assign.avatar_url)` and `COALESCE(prof_create.full_name, u_create.name, prof_assign.full_name, u_assign.name)` joined by `p.created_by = u_create.id` to ensure every prospect retains the photo and name of the user who added it.
  - In `src/app/(authenticated)/prospects/page.tsx`, the bottom-right footer of each card renders both the creator's circular avatar image (`<img src={creatorAvatar} />`) and the creator's full name (`{creatorName}`) side-by-side with smooth initial fallback when an image is not uploaded.

- **Prospect Form Drawer Section Header Naming Standard**:
  - In `EditProspectDialog` (`src/components/edit-prospect-dialog.tsx`) and `AddProspectDialog` (`src/components/add-prospect-dialog.tsx`), the secondary accordion section housing Service selection and Notes/Requirements is titled **"Service & Notes"** (replacing the legacy "CRM & Assignment").

- **Prospect Form Phone Requirement & Email Opt-Out Simplification**:
  - In `AddProspectDialog` and `EditProspectDialog`, `phone` is a mandatory contact field. It must render with a visual red asterisk (`Phone <span className="text-[#EF1E1E]">*</span>`), have the `required` HTML attribute on its input, and be validated in `handleSubmit` (`if (!phone.trim()) { toast.error("Phone number is required."); return; }`).
  - The legacy `Email Opt Out` switch toggle and its state/imports are permanently removed from prospect creation and edit forms to streamline lead entry.


