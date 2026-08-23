# AGENTS.md

<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

Welcome to the **Brandium CRM** repository.

## Repository Overview

- **Framework**: TanStack Router + Vite (React)
- **Database**: MySQL (brandium_crm) / Direct Server Functions & API Bridge
- **Styling**: Tailwind CSS & Radix UI / Shadcn UI

## Universal AI Engineering Framework

- **Mission**: Build production-ready software using an inspect → plan →
  implement → verify workflow.
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
  each task. **NEVER use direct Bengali Unicode characters (e.g., বাংলা)** —
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

- **TanStack Start Server Function Serializability (`createServerFn`)**:
  - Server functions (`createServerFn`) require return types to be strictly serializable. Avoid returning `Record<string, unknown>[]` directly as `unknown` fails serialization constraints. Use explicit primitive record types like `Record<string, string | number | boolean | null>[]` or typed interface arrays.

- **Pure Direct MySQL Database Persistence Policy**:
  - All data operations and entity mutations bypass client-side localStorage/mock stores completely and execute directly against the local MySQL database (`brandium_crm`) via Node.js `/api/mysql` endpoint and `createServerFn` server functions.

- **Supabase User Auth Profile Property Access & React Hook Memoization**:
  - `User` type from `@supabase/supabase-js` does not contain top-level `.name` property. Always access user full name via `profile?.full_name` or `user.user_metadata?.full_name`.
  - When creating computed dropdown list options inside dialog components, move raw query data resolution inside `useMemo` callbacks to prevent `react-hooks/exhaustive-deps` warnings.

- **Exact Optional Property Types Compatibility (TS2379)**:
  - When assigning objects with possible undefined fields to interfaces under `exactOptionalPropertyTypes: true`, always declare property types explicitly as `string | undefined` rather than purely optional `string` to prevent assignment incompatibility.
