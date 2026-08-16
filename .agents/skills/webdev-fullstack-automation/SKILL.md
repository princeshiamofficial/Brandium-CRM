---
name: webdev-fullstack-automation
description: >-
  Comprehensive fullstack web development automation skill for React, TanStack Start/Router,
  Vite, Node.js, and MySQL/Supabase web applications. Use when automating development workflows,
  building components, checking type safety, setting up server APIs, managing database persistence,
  or running quality assurance and auto-healing scripts.
---

# Webdev Fullstack Automation Skill

This skill provides an automated workflow and standard runbook for end-to-end full-stack web application development, testing, database persistence, and deployment verification.

---

## 1. Core Stack Architecture & Standards

- **Frontend Core**: React 19 + TanStack Router / TanStack Start + Vite.
- **Styling & UI**: Tailwind CSS v4, Radix UI components, Lucide icons, Sonner toast notifications.
- **Backend & Persistence**:
  - Direct MySQL Database (`brandium_crm` or local relational engine).
  - Server Functions (`createServerFn` from `@tanstack/react-start`) executing Node.js SQL queries via `mysql2/promise`.
  - Direct Node.js API bridge (`/api/mysql`) for synchronous browser SQL mutations and reads.
- **Type Safety**: Strict TypeScript compilation (`npx tsc --noEmit`).

---

## 2. Automated Inspection & Build Workflow

Whenever adding or modifying features across the application:

1. **Inspect Target Routes & Components**:
   - Verify route definitions in `src/routes/`.
   - Inspect data fetching hooks and query options (`useQuery`, `@tanstack/react-query`).

2. **Execute Fullstack Code Formatting & Type Checks**:
   - Run `npx tsc --noEmit` to verify type compatibility across all components, server functions, and database schemas.
   - Run `npm run lint` or `npx prettier --write .` if formatting updates are needed.

3. **Verify Dev Server Readiness**:
   - Ensure the Vite dev server is running (`npm run dev`).
   - Monitor dev server output logs to verify middleware endpoints (`/api/mysql`) and local/network URLs.

---

## 3. Database Schema & Data Entity Persistence Rulebook

- **Automatic Schema Bootstrapping**:
  - Always execute `ensureMySQLTablesExist()` inside server functions (`createServerFn`) or connection handlers.
  - Auto-create missing tables (`users`, `profiles`, `prospects`, `sales`, `meetings`, `invoices`, `activities`, etc.) using `CREATE TABLE IF NOT EXISTS`.
- **Pure Direct MySQL Persistence**:
  - Store and persist all data entities directly into the local MySQL database (`brandium_crm`).
  - Zero reliance on client-side mock storage or `localStorage` fallbacks.
  - Implement auto-healing logic for critical system records (such as default admin and agent accounts) directly in MySQL to ensure zero access lockouts.

---

## 4. UI/UX & Component Design Guidelines

- **Modern Aesthetic**: Use curated dark/light color palettes, subtle glassmorphism, responsive grid layouts, and polished typography.
- **Interactive Feedback**: Provide instant loading states, skeleton loaders, and toast notifications (`sonner`) on actions.
- **Import Completeness**: Explicitly import all Radix/Shadcn sub-components (e.g. `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`) to prevent runtime `ReferenceError` exceptions.

---

## 5. Verification & Completion Gate

Before completing any development task:
- ✅ Code builds without TypeScript errors (`npx tsc --noEmit`).
- ✅ Database queries and state updaters work seamlessly without runtime errors.
- ✅ Local server runs and serves pages correctly.
