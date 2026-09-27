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
  - Replace arbitrary pixel values with standard utilities (e.g.,
    `max-h-[380px]` $\rightarrow$ `max-h-95`, `sm:max-h-[420px]` $\rightarrow$ `sm:max-h-105`,
    `left-[17px]` $\rightarrow$ `left-4.25`).
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

- **Prospect Card Creation Date & Time Display Standard**:
  - In `src/app/(authenticated)/prospects/page.tsx`, every prospect card displays its creation timestamp formatted with 12-hour AM/PM (e.g., `Sep 8, 2026, 7:47 PM`) directly underneath the Location row using `formatCrmDateTime(p.created_at)` from `@/lib/mysql-client` and paired with a `<CalendarIcon className="size-3.5 text-slate-800 dark:text-slate-200 shrink-0" />`.

- **Prospect Card Notes & Requirements Display Standard (Torn Paper / "Chira Kagoj" via SVG)**:
  - In `src/app/(authenticated)/prospects/page.tsx`, every prospect card displays its notes/requirements directly underneath the Creation Date & Time row and above the Soft Badges row. Notes are cleaned via `getProspectCleanNotes(p.notes)` (stripping internal `[Artist: ...]` and `[Agent: ...]` tags), styled inside an authentic ripped paper banner rendered via a precision `<svg viewBox="0 0 500 100" preserveAspectRatio="none">` path mirroring real torn paper silhouettes (ripped top and bottom edges, corner cuts, and downward tear spikes), styled with soft pastel yellow sticky note color palette (`fill-[#FEFCE8] dark:fill-[#1e1a0e] stroke-[#FDE68A]/60 dark:stroke-[#4a3f1d]`), paired with subtle amber typography (`<FileText className="size-3.5 text-amber-700 dark:text-yellow-400" /> Note:` in amber-800 / dark yellow-300), bottom paper shadow (`filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.12)]`), single-line truncated with `title={cleanNote || "No note"}` for full hover tooltip, and falls back to a muted italic `"No note"` when empty.
- **Projects Page Card Grid Layout Standard**:
  - On `/projects` (`src/app/(authenticated)/projects/page.tsx`), projects are presented in a responsive multi-column card grid (`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) replacing the legacy horizontal Kanban board.
  - Each project card features:
    - Top: Project Code badge, business title, and 3-dot dropdown action menu (View Details, Edit Project, Advance Stage, Delete).
    - Middle: Contact person, phone, email, creation date, stage soft badge (with dynamic color indicator), and service badge.
    - Footer: Assigned team member avatars and names (Artist & Agent overlapping avatar badges) and quick "Details" button.
  - Search and filter controls allow instant live filtering by text, stage, and assigned artist.

- **Dreamstechnologies Sales CRM Projects Page Reference Standard (`media_1789243032328.png` / `projects.html`)**:
  - In `src/app/(authenticated)/projects/page.tsx`, the Projects page strictly mirrors the Dreamstechnologies Sales CRM template and reference image:
    - **Header**: `Projects` title with soft red counter badge `125` (`bg-[#FEE2E2] text-[#EF1E1E] rounded-md px-2 py-0.5 text-xs font-semibold`) and Export dropdown (`ti ti-package-export`).
    - **Filter & Action Toolbar**: Clean row without outer card container:
      - Left: Filter button (`ti ti-filter` + chevron) opening a popover with Pipeline Stage, Priority, Artist dropdowns and Reset button, followed by Search input with leading `ti ti-search` icon and placeholder `Search`.
      - Right: Brandium Growth Green `+ Add New Project` button (`bg-[#67B239] hover:bg-[#5aa030] text-white`).
    - **Card Design (100% Reference Image Match)**:
      - Typography & Font: `font-['Golos_Text',sans-serif]`, padding `p-5`, border radius `rounded-[12px]`, subtle border `border border-slate-200/90`, shadow `shadow-[0_4px_4px_0_rgba(219,219,219,0.25)]`.
      - Row 1: Priority soft badge with dot (`● High` in `bg-[#FDE8E8] text-[#EF1E1E]`, Medium in `#FFF4E6`/`#FF9F43`, Low in `#E8F9ED`/`#28C76F`), Active badge (`bg-[#16A34A] text-white`), and golden star favorite icon (`ti ti-star-filled text-[#F59E0B] text-[17px]`).
      - Row 2: Light info box (`bg-[#F8F9FA] rounded-[8px] p-2.5 mb-3.5`), 40px circular logo avatar with vibrant SVG logos, project title (`font-semibold text-[14px] text-[#1F2020]`), service subtitle (`text-[12px] text-[#707070]`), and 30px 3-dots action button opening full management dropdown.
      - Row 3: 2-line truncated description (`Kofejob is a freelancers marketplace where you can post projects & get instant help.` or notes).
      - Row 4: 3 metadata rows styled with `text-[13px] text-[#707070] mb-2`:
        - Project ID: `ti ti-forbid-2` `Project ID : #12145`
        - Value: `ti ti-report-money` `Value : $03,50,000`
        - Due Date: `ti ti-calendar-exclamation` `Due Date : 15 Oct 2023`
      - Row 5: Overlapping assigned team avatars (Artist and Agent) resolved dynamically by user ID (`usersMap.get(project.assigned_artist_id)` / `agent_id`), paired with 32px circular Project Creator avatar on the right resolved by user ID (`created_by`), replacing legacy static mock counters and decorative badges.
      - Row 6 (Footer): `border-t border-[#F1F5F9] pt-3` with Total Hours badge (`bg-[#EBF5FF] text-[#2563EB] rounded-[5px] px-2.5 py-1 text-[12px] font-medium` with `ti ti-clock-stop` `Total Hours : 100` / `80` / `75`) and communication counters: WeChat (`ti ti-brand-wechat` `02`) and Subtasks (`ti ti-subtask` `04`).
    - **Slide-Out Offcanvas Drawer (`offcanvas_add` & `offcanvas_edit`)**:
      - Slide-out Radix UI `Sheet` (`side="right"`, `w-full sm:max-w-[750px] lg:max-w-[800px]`, `bg-[#f8f9fa] dark:bg-slate-950`) divided into accordion cards with Brandium Green `#67B239` and Navy `#0a2e5c` badge headers: Basic Information, Stage & Financials, and Team Assignment & Specifications with sticky action footer.

- **Tabler Icons Local Hosting & Cross-Origin Font Blocking Prevention**:
  - Remote CDN / external template stylesheets (`crms.dreamstechnologies.com`) block webfonts (`.woff2`, `.woff`, `.ttf`) in modern browsers due to missing `Access-Control-Allow-Origin` CORS headers, rendering icons as blank squares.
  - Always host Tabler Icons locally in `public/tabler-icons/` (`tabler-icons.min.css` and `fonts/tabler-icons.woff2`), link it directly in `RootLayout` via `<link rel="stylesheet" href="/tabler-icons/tabler-icons.min.css" />`, and include explicit aliases for `.ti-star-filled:before` (`\eb2e`) and `.ti-square-rounded-plus-filled:before` (`\f63f`).

- **Workspace Scratch File Cleanup & Tailwind v4 Unknown At-Rule Inspection**:
  - Never retain temporary migration/fetch helper scripts (`.cjs`, `.js`) in workspace project root or `scratch/` folders inside the codebase; always remove them upon task completion to keep linter diagnostics 100% clean.

- **Prospect Stage History Vertical Tracking Timeline & Note Array Standard**:
  - In `src/components/view-stage-dialog.tsx`, prospect stage transitions are presented as a sleek, vertical logistics/tracking style timeline matching modern delivery/audit tracking interfaces:
    - **Date Column (Left)**: Renders short date (e.g. `10-26`, `09-26` via `format(new Date(item.date), "MM-dd")`). Topmost / active transition displays highlighted in purple (`text-purple-600 dark:text-purple-400 font-semibold`), while previous transitions render in neutral slate (`text-slate-400 dark:text-slate-500 font-normal`).
    - **Timeline Track & Node (Middle)**: A continuous dashed line (`border-l-2 border-dashed border-slate-200 dark:border-slate-800`) connects all steps. Topmost / latest step renders a glowing purple circular node with outer halo ring (`size-4 bg-purple-600 ring-4 ring-purple-100 dark:ring-purple-950/70 shadow-xs`), while completed/earlier steps render clean solid slate dots (`size-3 bg-slate-400 dark:bg-slate-500`).
    - **Stage Title & Time (Right Header)**: Topmost step title is styled in `text-purple-700 dark:text-purple-300 font-semibold`, while previous stages render in `text-slate-800 dark:text-slate-200 font-medium`. Time is right-aligned in `text-slate-400 font-normal` (`HH:mm`).
    - **Note Array Rendering (`parseNotesToArray`)**: Automatically parses single-string, multiline, bulleted, and JSON notes into a clean `string[]` array. Each note item is rendered as a clean description line (`text-slate-400 dark:text-slate-400 text-sm leading-relaxed`) underneath the title, with subtle actor attribution (`by [Name]`).
    - **Descending Chronological Order**: Timeline entries are sorted newest at the top (Index 0) down to initial prospect creation at the bottom.
  - In `src/lib/stages.ts`, `stageHistoryQuery` joins `users` and `profiles` tables on `psh.changed_by` to deliver `changed_by_name` and `changed_by_avatar` dynamically from MySQL.
  - Tailwind CSS v4 custom directives (`@source`, `@custom-variant`, `@theme`) trigger IDE CSS language server warnings by default. Configure `"css.lint.unknownAtRules": "ignore"` in `.vscode/settings.json` to silence false positive warnings.

- **Projects Assigned Team Members & Creator Avatar by User ID Standard**:
  - On `/projects` (`src/app/(authenticated)/projects/page.tsx`), Row 5 dynamically resolves both:
    - **Assigned Team Members** (Left): Looks up `project.assigned_artist_id` and `project.assigned_agent_id` via `usersMap` to display genuine user avatars (or colored initials) with role-specific tooltips (`Artist: [Name]`, `Agent: [Name]`). Eliminates static dummy counters (`+04`/`+05`).
    - **Project Creator Avatar** (Right): Replaces the arbitrary decorative company icon with a 32px circular avatar of whoever created/added the project (`created_by`), resolved by user ID via `usersMap` and MySQL database joins (`users u_creator` & `profiles prof_creator`).
  - Automatically migrates table `projects` with `ADD COLUMN created_by VARCHAR(36) NULL` and persists `created_by: user.id` upon project creation via `ProjectOffcanvasDrawer`.

- **Projects Brand Color UI Standardization**:
  - Primary call-to-actions on `/projects` (`src/app/(authenticated)/projects/page.tsx`), specifically the `+ Add New Project` button, strictly use Brandium Growth Green (`bg-[#67B239] hover:bg-[#5aa030] text-white`).
  - Active filter indicators and interactive reset links follow the same brand palette (`bg-[#67B239]`, `text-[#67B239] hover:text-[#5aa030]`), and the header project counter badge renders in soft green (`bg-[#67B239]/15 text-[#55962e] dark:bg-[#67B239]/25 dark:text-[#7ac142]`) ensuring complete visual alignment with the Brandium CRM design system.

- **Color Hut / Radix Alert Delete Confirmation Dialog Specification**:
  - Across CRM entity deletion dialogs (e.g. `ProjectsPage` in `src/app/(authenticated)/projects/page.tsx` and `DeleteProspectDialog` in `src/components/delete-prospect-dialog.tsx`), implement the exact dialog layout, color, and CSS specifications:
    - **Container**: `w-full max-w-[512px] bg-[#EEEFF2] dark:bg-slate-900 border border-[#E1E7EF] dark:border-slate-800 rounded-[12px] p-6 shadow-lg gap-4 text-slate-900 dark:text-slate-100` (`box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)`).
    - **Header**: Left-aligned (`flex flex-col space-y-2 text-left sm:text-left`).
      - Title: `text-lg font-semibold flex items-center gap-2 text-[#0f1729] dark:text-slate-100` with Lucide `TriangleAlert` (`size-6 text-[#dc2626] stroke-[2]`).
      - Text: `"Are you absolutely sure?"`
      - Subtitle: `text-sm text-[#94a3b8] dark:text-slate-400 text-left mt-2 leading-5` -> `"This action cannot be undone. This will permanently delete the [entity] for \"[Name]\"."` with `font-semibold text-[#94a3b8] dark:text-slate-300` for the entity title/name.
    - **Footer**: `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-0` (or `gap-2`).
      - **Cancel Button**: `h-10 px-4 py-2 mt-2 sm:mt-0 bg-[#EEEFF2] dark:bg-slate-800 border border-[#E1E7EF] dark:border-slate-700 text-[#0f1729] dark:text-slate-200 hover:bg-[#E1E7EF]/80 dark:hover:bg-slate-700 rounded-[10px] text-sm font-medium shadow-none cursor-pointer`.
      - **Delete Button**: `h-10 px-4 py-2 bg-[#dc2626] hover:bg-[#dc2626]/90 text-[#fafafa] rounded-[10px] text-sm font-medium shadow-none cursor-pointer border-0` with label `"Yes, delete [entity]"`.

- **Projects Prospect Integration & Auto-Fill Standard**:
  - In `ProjectOffcanvasDrawer` (`src/app/(authenticated)/projects/page.tsx`), project creation integrates a dedicated **Select Prospect / Lead** selector at the top of Basic Information.
  - Selecting a prospect automatically populates `client_name`, `client_phone`, `client_email`, `service_id`, `assigned_artist_id`, `assigned_agent_id`, `notes`, auto-suggests project title, links `prospect_id` in the database, and provides fallback to custom projects when unlinked.

- **ERPAPP Add/Edit Project Dialog UI Standard (`ProjectFormDialog`)**:
  - In `src/app/(authenticated)/projects/page.tsx`, the Add/Edit Project interface uses a centered modal dialog (`Dialog`) strictly mirroring the layout, dimensions, UX conventions, and aesthetics of ERPAPP's `create-order-dialog.tsx` and `edit-order-dialog.tsx`:
    - **Modal Container**: `<DialogContent className="w-[95vw] sm:w-full max-w-[95vw] sm:max-w-lg md:max-w-xl lg:max-w-3xl xl:max-w-4xl max-h-[92vh] sm:max-h-[90vh] p-3.5 sm:p-6 overflow-hidden flex flex-col">`.
    - **Header**: Compact `DialogHeader` (`pb-1 sm:pb-2 pr-8 sm:pr-0`), `DialogTitle` (`text-base sm:text-lg`) showing "Create New Project" or `Edit Project: <span className="font-normal">{title}</span>`, and `DialogDescription` (`text-xs sm:text-sm`).
    - **Scrollable Form Body**: `<div className="grid gap-3 sm:gap-4 py-2 sm:py-4 max-h-[68vh] sm:max-h-[70vh] overflow-y-auto overflow-x-hidden w-full max-w-full min-w-0 pr-1 sm:pr-2 custom-scrollbar">`.
    - **Prospect / Lead Quick Autofill (Create Mode)**: Minimal search combobox at the top showing company logo/avatar and business name only (`show business name & logo only`). Selecting automatically populates Client Name, Phone, Email, Service Category, Assigned Artist, and Account Agent with an active "✓ Autofilled from lead" indicator.
    - **Row 1**: Project Code & Project Name / Title (grid-cols-1 sm:grid-cols-2).
    - **Row 2**: Client / Company Name & Phone Number (grid-cols-1 sm:grid-cols-2).
    - **Row 3**: Client Email, Delivery Date (Calendar popover with `CalendarDays` icon), and interactive ERPAPP 5-star Priority Rating component (supporting half and full amber stars synced with High/Medium/Low priority).
    - **Row 4 & 5**: Service Category, Production Stage, Responsible Artist, and Account Agent selectors.
    - **Row 6**: Total Budget, Advance / Paid Amount, and Progress % inputs.
    - **ERPAPP Financial Summary Box**: Compact summary card (`p-3.5 sm:p-4 border rounded-md bg-muted/30 space-y-2`) displaying Total Budget, Advance / Paid Amount, production completion progress bar, and Remaining Due amount (highlighted in rose for positive due or emerald for zero balance).
    - **Footer**: `DialogFooter` (`pt-3 sm:pt-4 border-t flex flex-col-reverse sm:flex-row gap-2 sm:gap-0`) with Cancel (`variant="outline"`) and Brandium Growth Green submit button (`bg-[#67B239] hover:bg-[#5aa030] text-white`) featuring a `Loader2` spinning indicator during mutation saving.

- **ERPAPP Order Items Table Standard for Project Dialog (`Order Items *`)**:
  - In `src/app/(authenticated)/projects/page.tsx`, the single `Service Category` dropdown is transformed into an itemized *_"Order Items *"*_ table mirroring ERPAPP's `create-order-dialog.tsx`:
    - **Header**: Section label `Order Items *`.
    - **Table Columns**:
      - `Service *` (width ~45%): Dropdown populated with services from the database and creative models (`Select service...`).
      - `Quantity *` (width ~15%): Numeric input defaulting to `1`, minimum `1`.
      - `Charge *` (width ~20%): Number input for item unit charge / price (`placeholder="0"`).
      - `Total Price` (width ~15%, text-right): Real-time calculated line item total price (`৳${quantity * charge}`) or `N/A`.
      - Delete action button (width ~5%): Red `Trash2` button (`text-rose-500`) to remove item rows.
    - **Add Another Item**: `+ Add Another Item` button with `PlusCircle` icon.
    - **Auto-Sync Budget**: Entering item charges and quantities automatically calculates line totals and seamlessly syncs with `budget` if empty or 0.
    - **Persistence**: Order item collection is safely serialized and persisted into `project.notes` with `[Items: ...]` tag while syncing `orderItems[0].model` with `service_id` for backward database compatibility.
    - **Form Flow Simplification**: The redundant middle row containing `Production Stage`, `Responsible Artist`, and `Account Agent` dropdowns is removed from the dialog form per user request, flowing cleanly directly from the `Order Items *` table into the Financials Grid and Financial Summary box.

- **Projects Card Data Accuracy & Presentation Standardization**:
  - In `src/app/(authenticated)/projects/page.tsx`:
    - **Project Notes Priority & Prospect Fallback**: In Row 3 of each project card, strictly display the actual project notes (`cleanNotes`), stripping internal `[Items: ...]` JSON payloads and tag markers. When standalone project notes are empty or only contained serialized order items, fallback dynamically to the linked prospect's notes (`project.prospect_notes` joined in `projectsQuery`). Row 3 strictly displays clean project notes or a muted `"No project notes provided."` fallback, completely eliminating the redundant `Items: ...` fallback (since items are already summarized in the footer `{count} Item` badge and service subtitle).
    - **Currency & Budget Formatting**: Format project value with Bangladeshi Taka `৳` (`৳{formatProjectValue(project.budget)}`) without foreign `$` dollar signs or artificial leading zeros.
    - **Dynamic Stage Soft Badges**: Replace static solid green badges with dynamic soft color palettes via `getProjectStageBadgeStyle(stage_name)` (e.g. indigo for CR Clearance, sky blue for On Design, amber for CO Clearance, rose for On Hold, emerald for Delivered).
    - **Due Date Resilience**: When `deadline` is null, display `"Not set"` instead of legacy template default dates.
    - **Card Footer Real Data**: Replace dummy static metrics (`Total Hours : 100`, `WeChat : 02`, `Subtasks : 04`) with genuine project metrics: real production completion progress badge (`Progress : {progress}%`), dynamic outstanding due badge (`Due : ৳...`) or emerald `Paid` badge, and order items count badge (`{count} Items` with `ti ti-box` icon).
    - **Dynamic Client Logo**: Display client/prospect business logo in the 40px avatar via `project.prospect_logo_url` with dynamic fallback to creative geometric agency logos.

- **Payment History Table in Project / Order Dialog Standard**:
  - In `src/app/(authenticated)/projects/page.tsx` within `ProjectFormDialog`, render an interactive **Payment History** table directly above `Special Client Discount` and below `<Separator className="my-4" />` whenever `existingAdvancePayments.length > 0`:
    - Displays `Date`, `Amount` (formatted BDT currency), `Method` (badge), `Reference/Notes`, and `Actions`.
    - Double-click or click `Pencil` allows inline editing of amount, payment method dropdown, and notes with `Check` and `X` action buttons.
    - `Trash2` action button allows removing individual payment records with instant recalculation of total advance paid and amount due in Order Summary.
    - When existing payments exist, the advance payment input label dynamically switches to `"New Advance Payment"`, and entering a new payment seamlessly appends to the payment collection upon saving.
    - Automatically parses payment history from `project.notes` (`[Payments: [...]]`) with graceful fallback to single legacy advance payment (`project.paid_amount`) and cleans technical tags from the user's notes field.

- **Exact Optional Property Types Compatibility (TS2379 & sonner toast)**:
  - In interfaces like `ExistingPaymentRecord` or `AdvancePaymentRecord`, always declare optional properties as `field?: type | undefined` to satisfy `exactOptionalPropertyTypes: true`.
  - When importing `toast` from `sonner`, ensure it is only imported once per file to avoid TS2300 duplicate identifier errors.

- **Native Multi-Installment Advance Payment Persistence (`projects.advance_payments` JSON Column)**:
  - Table `projects` in MySQL stores multi-installment advance payments directly in dedicated column `advance_payments LONGTEXT NULL`.
  - Schema bootstrapping in `src/lib/auth.functions.ts` automatically provisions and maintains `{ table: "projects", column: "advance_payments", def: "LONGTEXT NULL" }`.
  - TypeScript interface `AdvancePaymentRecord` in `src/lib/projects.ts` standardizes payment installments across the application:
    `{ id: string; amount: number; date: string; paymentMethod: string; notes?: string | null | undefined; recordedByUserId?: string | null | undefined; recordedByUserName?: string | null | undefined; documentUrl?: string | null | undefined; status?: "Pending" | "Approved" | "Declined" | undefined; }`.
  - In `projectsQuery` and `/projects/[invoiceid]/page.tsx`, queries select `prj.advance_payments` directly with layered fallback parsing: first `project.advance_payments`, second `[Payments: [...]]` tag in `notes`, and third single legacy `paid_amount`.
  - In `useSaveProjectMutation`, mutations persist `advance_payments: payload.advance_payments ? JSON.stringify(payload.advance_payments) : null` in both `UPDATE` and `INSERT` SQL statements, while syncing the total sum into `paid_amount`.
  - In `ProjectFormDialog`, `parseProjectPayments` loads existing installments into the interactive editable Payment History table, and `handleSubmit` adds new payments and updates `advance_payments` seamlessly.

- **ERPAPP 100% Identical Payment Section & Order Summary Standard**:
  - In `src/app/(authenticated)/projects/page.tsx` within `ProjectFormDialog`, the payment and order summary section strictly matches ERPAPP's `edit-order-dialog.tsx` (lines 970-1219):
    - **Separator**: Clean horizontal separator `<Separator className="my-4" />`.
    - **Row 1 - Discounts & Shipping**: Grid `grid grid-cols-1 md:grid-cols-2 gap-4`:
      - Left: `Special Client Discount` input with `Percent` icon inside (`pl-7`).
      - Right: `Shipping Charge` numeric input (`min="0" step="0.01" placeholder="0"`).
    - **Row 2 - Payment History Table** (renders when `existingAdvancePayments.length > 0`):
      - Header: `<ReceiptText className="mr-2 h-5 w-5 text-primary/80" />Payment History`.
      - Styled table (`border rounded-md overflow-hidden bg-background`):
        - Column widths: `Date` (w-[180px]), `Amount` (w-[140px]), `Method`, `Reference/Notes`, and `Actions` (w-[90px] text-right).
        - Date rendered via `formatDateForDialogInput(p.date)` using `format(date, "PPP")` (e.g. "Sep 15th, 2026").
        - Amount rendered via `formatCurrencyBdt(p.amount)`.
        - Method and Notes rendered as plain text (no badges).
        - Inline editing on double click or pencil click with focused amount input (`amountInputRef`), select dropdown for payment method, input for reference/notes, and green check (`Check`) / muted cancel (`X`) buttons.
        - Delete trash button (`group-hover:opacity-100`) sets `paymentToDelete` triggering the ERPAPP `AlertDialog` confirmation ("This action will permanently delete the payment of {amount} made on {date}.").
    - **Row 3 - Adjustment / Advance Payment Input** (`mt-4 border-t border-border pt-4`):
      - Label: `{existingAdvancePayments.length > 0 ? "Adjustment Payment" : "Advance Payment"}`.
      - Input: `Amount (BDT)` with step 0.01.
      - When an amount is entered (`isAdvancePaymentEntered`):
        - `Payment Method *` with search combobox popover (`Popover`, `Command`, `CommandInput`, `CommandList`, `Check`, `ChevronsUpDown`).
        - "Specify Other Method *" input when "Other" is selected.
        - `Reference/Notes *` input (`placeholder="Reference or Transaction ID"`).
    - **Row 4 - Order Summary Box** (`p-4 border rounded-md bg-muted/40 space-y-2 mt-4`):
      - `Order Items Total:`, `Gift Value:` (when any), `Discount:` (`- BDT ...` in text-destructive), `Net Payable:`, `Shipping Charge:` (`+ BDT ...`), `Total Paid:` (`- BDT ...` with top dashed border in text-green-600), and `Amount Due:` (`BDT ...` in text-base font-bold text-primary).
- **Persistent Payment History Section & Eager State Initialization Standard**:
  - In both `ProjectFormDialog` (Edit Order Dialog) and `ProjectDetailModal` (View Details Modal), Payment History is always rendered in the UI with a persistent header and counter (`Payment History (n)`).
  - When no advance payments exist yet, it displays a friendly dashed placeholder (`No payment history recorded yet. Add an advance payment below.`) instead of hiding the entire section.
  - All modal payment states (`existingAdvancePayments`, `totalExistingAdvancePaid`, `specialClientDiscount`, `shippingCharge`, `orderNotes`) are eagerly initialized directly from `project` props via lazy `useState` callbacks, combined with dynamic `key` remounting on the dialog container to guarantee 0ms instant display without depending on asynchronous `useEffect` re-render cycles.
  - In `parseProjectPayments`, supports both parsed array, raw JSON string (`typeof advancePayments === "string"`), multiple legacy note tags (`[Payment: Method, Ref: Ref]`), and legacy `paid_amount` fallbacks.

- **Order Notes Payment Tag Sanitization & Redundant Injection Prevention**:
  - Technical payment tags (`[Payment: ...]`, `[Payments: ...]`) must NEVER be injected into the `Order Notes (Optional)` textarea or saved into the `notes` column, as all installment payments are natively stored in the dedicated MySQL column `projects.advance_payments`.
  - In `handleSubmit` in `src/app/(authenticated)/projects/page.tsx`, `notesPayload` must only combine cleaned order notes (`cleanProjectNotes(orderNotes)`), `[Discount: ...]`, `[Shipping: ...]`, and `[Items: ...]`, completely omitting any `[Payment: ...]` or `[Payments: ...]` injection.
  - In `cleanProjectNotes`, use `[Payments?:\s*\[[\s\S]*?\]\]` and `[Payments?:\s*[^\]]+\]` with `gis` flags to sanitize any legacy tags from existing database records, ensuring the user's notes textarea displays only clean, human-readable creative instructions.

- **Over-Amount Detection & Toast-Only Notification Standard**:
  - In `ProjectFormDialog` (both Create and Edit Order dialogs in `src/app/(authenticated)/projects/page.tsx`), total payments (`totalAdvanceAfterNew = totalExistingAdvancePaid + newAdvanceAmount`) must never exceed the order's grand total (`netPayable + shippingCharge`).
  - **Clean Dialog UI (No Intrusive Inline Red Clutter)**:
    - Never render inline red warning badges, red text paragraphs, or red borders inside the dialog form or Order Summary (`Total Paid` remains cleanly formatted in standard green text).
  - **Toast-Driven Warning Feedback**:
    - When an over-amount occurs (`isAdvPaymentOver`), trigger an informative Sonner toast alert (`toast.error("Advance Payment Limit Exceeded", { id: "advance-over-amount", description: ... })`) detailing the exact overpaid difference and grand total.
    - Automatically dismiss the toast via `toast.dismiss("advance-over-amount")` as soon as the amount is corrected or when the dialog closes.
    - On blur of the advance payment input or when attempting to save with an over-amount, block submission in `handleSubmit` and show the over-amount error toast immediately.
    - Also enforce boundary validation for `Special Client Discount` (cannot exceed `orderItemsTotal`) and inline payment edits in the Payment History table via Sonner toast alerts.

- **Project Form Order Items Service Resolution Standard**:
  - In `ProjectFormDialog` (`src/app/(authenticated)/projects/page.tsx`), the `Service *` selector inside `Order Items *` must strictly display and select real Brandium CRM services (`TVC`, `Graphics Design`, `Product Photography`, `Logo Design`, `Video Ads`, etc.) from the `services` table.
  - Never populate `modelOptions` with hardcoded print-shop models (such as `"Design Charge"`, `"Menu Book"`, or `"Pizza Box"`).
  - When editing a project, dynamically resolve its actual service from `project.service_name`, linked prospect (`prospect_id`), or system `services` map, automatically sanitizing any legacy dummy items so the combobox immediately shows the client's genuine service (e.g. `TVC` for `color hut`).
  - In `projectsQuery` (`src/lib/projects.ts`), join `services` on both `(prj.service_id = srv.id OR prj.service_id = srv.name)` and fallback to `p.service_id` to guarantee `service_name` is always accurately populated across views.

- **Project Card Direct Navigation & Detail Modal Removal Standard**:
  - In `src/app/(authenticated)/projects/page.tsx`, removed the legacy redundant `ProjectDetailModal` popup.
  - Clicking a project card, project title, or selecting "View Details" from the 3-dot dropdown now navigates directly to the dedicated full project & invoice page (`/projects/${project.project_code || project.id}`) via Next.js `useRouter`.
  - Eliminates intermediate popups, close button badge overlaps, and provides a seamless fullscreen project overview.

- **Next.js Dev Server `.next` Cache Invalidation During Concurrent Production Build (`ENOENT: routes-manifest.json`)**:
  - Running `npm run build` (`next build`) while a Next.js development server (`next dev`) is concurrently active in the background overwrites and deletes dev cache manifests (`.next/routes-manifest.json` and in-memory Webpack chunks like `./[chunkId].js`), causing the running dev server to return `500 Internal Server Error` on subsequent HTTP requests.
  - **Prevention / Resolution**: Always restart the background dev server process after running a production build or avoid running concurrent `next build` commands against the same `.next` directory to keep hot module replacement (HMR) and route manifests intact.

- **Project Invoice Status Header Card Standard (`/projects/[invoiceid]`)**:
  - In `src/app/(authenticated)/projects/[invoiceid]/page.tsx`, embedded the ERPAPP Status Header Card matching the user's HTML specification directly above the main invoice card.
  - Features the circular SVG Lottie status icon, dynamic stage color badge (using `resolveProjectStageColor(project.status)`), and relative update timestamp (`Last status update: {formatRelativeTime(project.updated_at || project.created_at)} by {creator_name}`).
  - Formatted with `print:hidden` so it renders seamlessly on screen while keeping invoice printouts and PDF downloads 100% clean.
  - Aligned table `prospects` address column to `p.address` (avoiding invalid `p.location`).

- **Project Order Status History Timeline Section Standard (`/projects/[invoiceid]`)**:
  - In `src/app/(authenticated)/projects/[invoiceid]/page.tsx`, implemented the authentic ERPAPP Status History card section (`text-card-foreground shadow-2xl border border-border/40 bg-card hover:shadow-primary/10 rounded-xl`) placed below the invoice card with `print:hidden`.
  - Displays the timeline of order progress with dynamic left border line (`border-l-2 border-zinc-400 dark:border-zinc-600`), circular status icons with contrasting badge backgrounds and rings, stage titles, formatted dates, changer names, and update notes.
  - Supports proof image detection with inline "View Proof Image" action button and image preview modal dialog.
  - Backed by local MySQL `prospect_stage_history` queries joined with `stages`, `profiles`, and `users` with fallback demo entries ensuring resilient display.

- **Project Real Status History Database Persistence & Elimination of Fake Future Stages**:
  - In `brandium_crm` MySQL database, table `projects` contains `status_history LONGTEXT NULL` storing serialized JSON entries for each stage advancement (`id`, `status`, `timestamp`, `changedByUserName`, `notes`, `proofUrl`).
  - In `src/app/(authenticated)/projects/[invoiceid]/page.tsx`, `statusHistoryList` dynamically prioritizes `project.status_history`, followed by `prospect_stage_history`, and falls back to `buildRealProjectHistory(project)` which dynamically slices the chronological stages up to `project.status`. This completely eliminates hardcoded dummy stages (e.g., showing `Logistics` or `Delivered` on projects that are only at `CO Clearance` or `On Design`).
  - In `src/lib/projects.ts`, `useUpdateProjectStatusMutation` appends a new chronological entry to `projects.status_history` on every stage mutation, and invalidates both `crm-projects-with-stages` and `project-invoice-details` query caches.

- **Brandium Invoice Background Letterhead Integration Standard (`brandium_invoice_bg.jpg`)**:
  - In `src/app/(authenticated)/projects/[invoiceid]/page.tsx`, the primary invoice card container (`.invoice-page`) renders the official `public/brandium_invoice_bg.jpg` letterhead background using `backgroundImage: "url('/brandium_invoice_bg.jpg')"`, `backgroundSize: "100% 100%"`, `backgroundRepeat: "no-repeat"`, and `backgroundPosition: "center top"`.
  - Includes a dark theme overlay (`hidden dark:block absolute inset-0 bg-slate-950/80 pointer-events-none print:hidden`) and `relative z-10` content wrapper, preserving pristine contrast and readability in both dark and light modes.
  - Table containers use `bg-background/85 backdrop-blur-xs` allowing the branding curves and textures to shine through gracefully.
  - Configured `@media print { .invoice-page { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }` in `src/styles.css` and removed `print:bg-transparent` so paper prints and PDF exports retain the full-resolution letterhead background.

- **Tailwind CSS v4 Utility Class Optimization & Formatting Standards**:
  - Replace arbitrary bracket sizing like `h-[30px]` with standard Tailwind scale `h-7.5` (4px basis).
  - Replace arbitrary margin brackets like `ml-[44px]` and `sm:ml-[56px]` with `ml-11` and `sm:ml-14`.
  - Replace arbitrary rem positions like `-left-[2.25rem]` and `sm:-left-[2.625rem]` with standard fractional/integer utilities `-left-9` and `sm:-left-10.5`.
  - Replace CSS transform degree brackets like `-rotate-[20deg]` with `rotate-[-20deg]`.
  - Prefer standard utility `shrink-0` instead of legacy `flex-shrink-0`.
- **runMySQLQuery API Response Unpacking Standard**:
  - In `src/lib/mysql-api.ts`, `runMySQLQuery<T>()` returns `{ success: boolean; data?: T; error?: string }` (modeled as an API response wrapper). Always unpack query rows via `const res = await runMySQLQuery<Record<string, unknown>[]>(sql, params); const rows = (res.data || []) as Record<string, unknown>[];` rather than assuming `runMySQLQuery` returns a bare array directly.

- **Qualified Leads, Follow Up, and Expenses Architecture Standard**:
  - **Qualified Leads** (`/qualified-leads`): Fetches vetted prospects where `is_qualified = 1` or stage contains `qualif`, `opportunity`, or `meeting`. Features KPI cards, dynamic contact cards with Golos Text, communication shortcuts, and fast qualification toggle.
  - **Follow Up** (`/follow-up`): Unifies `/follow-up` and `/follow-ups` routes so both singular and plural endpoints resolve cleanly.
  - **Expenses** (`/expenses`): Backed by MySQL table `expenses` with schema bootstrapping in `ensureMySQLTablesExist()`, KPI spend metrics (monthly, all-time, transaction count, top category), and full Add/Edit/Delete lifecycle with Radix Alert confirmation.
- **Fixed A4 Invoice Sizing & Print Layout Standard**:
  - In `src/app/(authenticated)/projects/[invoiceid]/page.tsx` and `src/styles.css`, invoice cards utilizing full-bleed A4 letterhead backgrounds (such as `/brandium_invoice_bg.jpg`) must have fixed A4 dimensions (`width: 210mm; min-height: 297mm; max-width: 210mm;`).
  - Wrap the invoice card in `<div className="w-full overflow-x-auto py-2 sm:py-4 flex justify-center print:p-0 print:overflow-visible print:block">` to ensure horizontal scrollability and perfect aspect ratio preservation across smaller mobile screens without clipping or stretching.
  - Set specific letterhead clearances: top padding `pt-[38mm]` to protect the header logo and artwork banner, and bottom padding `pb-[30mm]` to keep invoice totals and signatures above the footer contact details.
  - Structure inner content with `flex-1 flex flex-col justify-between` so that the bottom financial summary box anchors professionally toward the base of the A4 sheet.
  - In `@media print`, enforce `@page { size: A4 portrait; margin: 0; }` with `html, body { width: 210mm !important; height: 297mm !important; margin: 0 !important; }` and `.invoice-page { width: 210mm !important; height: 297mm !important; page-break-inside: avoid !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }` for pixel-perfect PDF export and printer output.
- **Project Invoice Page Real Data Query & Multi-Layer Identifier Fallback (`/projects/[invoiceid]`)**:
  - In `src/app/(authenticated)/projects/[invoiceid]/page.tsx`, `queryFn` executes a 3-tier database lookup directly against MySQL database `brandium_crm`:
    1. Direct match on `prj.project_code = ? OR prj.id = ? OR prj.prospect_id = ? OR prj.project_code = CONCAT('PRJ-', ?) OR REPLACE(prj.project_code, 'PRJ-', '') = ? OR prj.project_code LIKE CONCAT('%', ?, '%')` joined with `prospects`, `services`, `users`, and `profiles`.
    2. Prospect table match if the parameter corresponds to an existing prospect without a dedicated `projects` row yet (`p.id = ? OR p.phone = ? OR p.email = ?`).
    3. Automatic fallback to the latest active project from table `projects` (`ORDER BY prj.updated_at DESC, prj.created_at DESC LIMIT 1`), guaranteeing authentic database records render even when visiting demo or placeholder URLs (such as `/projects/12145` or `/projects/id`).
  - Strict TypeScript interface `ProjectRecord` ensures all project attributes (`prospect_id`, `advance_payments`, `updated_at`, `status_history`) are strongly typed without `Record<string, unknown>` property errors.
  - In `prospect_stage_history` queries, select `psh.note AS note` (aligning with the single `note` column in table schema) rather than `COALESCE(psh.note, psh.notes)`.
- **Order Items Table Unit Price Input & Real-Time Calculation Standard (`ProjectFormDialog`)**:
  - In `src/app/(authenticated)/projects/page.tsx`, the `Order Items *` table in `ProjectFormDialog` must include an explicit **Unit Price \*** input column between `Quantity *` and `Total Price`:
    - Columns: `Service *` (w-[45%]), `Quantity *` (w-[15%]), `Unit Price *` (w-[18%]), `Total Price` (w-[18%]), and Delete action (w-[4%]).
    - Input: `<Input id={`unitPrice-${item.id}`} type="number" min="0" step="0.01" placeholder="0" required ... />` bound to `item.unitPrice`.
    - In `handleItemChange`, handle `field === "unitPrice"` by updating `updatedItem.unitPrice` and immediately re-calculating `updatedItem.lineItemTotalPrice = quantity * unitPrice`.
- **Node.js Heap Memory Allocation & Next.js OOM Prevention (`--max-old-space-size=4096`)**:
  - When compiling extensive Next.js App Router route modules in development mode on Windows, Node.js can exceed default 32-bit/64-bit semi-space heap limits (~800MB - 1.4GB) and trigger `RangeError: Failed to allocate memory` or `FATAL ERROR: Committing semi space failed. Allocation failed - JavaScript heap out of memory`.
  - Always allocate at least 4GB (4096MB) heap space in `package.json` scripts (`"dev": "node --max-old-space-size=4096 ./node_modules/next/dist/bin/next dev"` and `"build": "node --max-old-space-size=4096 ./node_modules/next/dist/bin/next build"`) to ensure seamless compilation across all dynamic route chunks without crashes.

- **Prospects 7-Card Pipeline Summary Cards Standard**:
  - In `src/app/(authenticated)/prospects/page.tsx` and `src/lib/prospects.ts`, summary cards represent the 7 core pipeline stages displayed in a responsive grid (`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7`):
    1. **All**: `stats.data?.totalProspects`, purple scheme (`pastelPurple`), resets stage and text filters when clicked.
    2. **Prospect**: `stats.data?.prospectCount`, sky blue scheme (`pastelBlue`), filters to prospect/new lead stage when clicked.
    3. **Qualified**: `stats.data?.qualifiedLeads`, teal scheme (`pastelTeal`), filters to qualified leads when clicked.
    4. **Follow-Up**: `stats.data?.followUps`, amber scheme (`pastelYellow`), filters to follow-up stage when clicked.
    5. **Meeting**: `stats.data?.meetingCount`, indigo scheme (`pastelIndigo`), filters to meeting stage when clicked.
    6. **Won**: `stats.data?.salesWon`, emerald scheme (`pastelEmerald`), filters to sales won stage when clicked.
    7. **Lost/DNP**: `stats.data?.lostDnpCount`, peach scheme (`pastelPeach`), filters to lost, DNP, or unreachable stages when clicked.
  - The local `StatCard` preserves the exact visual aesthetic: circular 36-44px icon container, bold number count, label, hint subtext, faint rotated watermark icon in the bottom right, and smooth hover elevation (`hover:scale-[1.02]`).

- **Phantom Git Submodule Resolution & Agent Skill Integration**:
  - When a skill folder (e.g. `.agents/skills/ui-ux-pro-max`) was previously added as an unmapped gitlink (mode `160000`) without `.gitmodules`, git commands fail with `fatal: no submodule mapping found in .gitmodules for path '...'` or `fatal: Pathspec '...' is in submodule`.
  - Always clear the stale cached gitlink using `git rm --cached <path>` and add the files directly with `git add <path>` so the skill files and data tables (`data/`, `scripts/`, `references/`) are tracked cleanly as native workspace files.
  - Exclude Python bytecode (`__pycache__/`, `*.pyc`) in `.gitignore` to prevent generated execution artifacts from cluttering the working tree.
- **Prospects Page Dual View (Grid / Table), Dynamic Sorting & Export Standards**:
  - In `src/app/(authenticated)/prospects/page.tsx` and `src/lib/prospects.ts`, the prospects pipeline supports dual layout modes:
    - **Grid View**: Visually rich Dreamstechnologies card layout featuring avatars, torn paper notes, communication buttons, stage badges, and creator attribution.
    - **Table View**: High-density scanning table using Radix `<Table>` with contact details, business, phone/email links, service badge, stage badge with color dot, 1-click qualification status toggle, creator attribution, date, and 3-dot dropdown actions.
  - **Dynamic Sorting**: `sortBy` parameter supports `newest` (`created_at DESC`), `oldest` (`created_at ASC`), `name_asc` (`contact_name ASC`), `name_desc` (`contact_name DESC`), and `updated` (`updated_at DESC`).
  - **Service Filter & Dark Mode**: Service select filter connects directly to active database services (`servicesQueryOptions`). All input and select elements enforce clean dark mode backgrounds (`dark:bg-slate-900 dark:border-slate-800`).
  - **Actionable Empty State**: Per UI/UX Pro Max guidelines, empty states render a centered SearchX icon, clear explanation, a "Reset All Filters" action button, and a primary "Add Prospect" action button.
  - **1-Click Qualification**: Both card and table views provide a 1-click toggle to mark/unmark prospects as Qualified (`is_qualified = 1`), with soft emerald badges (`Star` icon) and instant cache invalidation for `prospects`, `prospects-stats`, and `qualified-leads`.
- **Prospect Card Clickable Stage Badge & Streamlined Action Menu Standard**:
  - In `src/app/(authenticated)/prospects/page.tsx`, stage badges on both card and table views are interactive `<button>` elements with `onClick` directly triggering `setStageTarget(...)` to open the `ChangeStageDialog` modal instantly without requiring menu navigation.
  - The 3-dot dropdown action menu is streamlined to only include core actions: **Edit** (`EditProspectDialog`), **Stage History** (`ViewStageDialog`), and **Delete** (`AlertDialog`), removing redundant duplicate stage triggers.
  - Stage history modal (`ViewStageDialog`) features a clean vertical timeline with parsed note arrays, 12-hour AM/PM timestamps, and zero redundant outer boxes.

## Agent skills



### Issue tracker

Issues are tracked using local Markdown files under `.scratch/` and GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout with root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.
