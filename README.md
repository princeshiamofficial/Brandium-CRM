# Brandium CRM

This project is Brandium CRM.

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm â€” [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Production Readiness

Brandium CRM now expects all persistent CRM data to flow through server-side MySQL access. Browser-visible `VITE_*` variables may describe non-secret host/database hints, but the database password is read only from server-side `MYSQL_PASSWORD`.

### Environment

Create server-side environment variables before running the app:

```sh
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=brandium_crm
MYSQL_CONNECTION_LIMIT=20
```

For local migration compatibility only, the legacy raw SQL bridge can be enabled with:

```sh
ENABLE_DEV_SQL_API=true
npm run dev
```

Do not enable `ENABLE_DEV_SQL_API` in production. Production code should use TanStack Start server functions, which validate inputs and keep database credentials on the server.

### Verification

Run the full local quality gate before shipping:

```sh
npm run check
```

The local dev server exposes a database health probe at `/api/health` so deployments can verify MySQL connectivity without exposing secrets.
