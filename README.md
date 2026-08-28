# Brandium CRM

Brandium CRM is a full-featured Customer Relationship Management web application built with **Next.js 15 App Router**, **React 19**, **Tailwind CSS**, and **MySQL**.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI & Components**: Tailwind CSS, Radix UI, Lucide Icons
- **Database**: Local MySQL (`brandium_crm`) via dedicated server API route handlers

## Getting Started

### Prerequisites

- Node.js (v18.17+ or v20+)
- MySQL (Running on port 3306 with database `brandium_crm`)

### Installation

```sh
npm install
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Environment Configuration

Create a `.env` file in the root directory:

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=brandium_crm
MYSQL_CONNECTION_LIMIT=20
MYSQL_TIMEZONE=+06:00
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts

- `npm run dev`: Start Next.js development server
- `npm run build`: Build production application
- `npm run start`: Start production server
- `npm run typecheck`: Run TypeScript type verification
- `npm run lint`: Run ESLint checks
