# Rongin Libas API

The NestJS backend serves both the customer storefront and the admin frontend from one API and PostgreSQL database. Customer and admin endpoints use the `/api/v1` prefix; Swagger documentation is available at `/api/docs`.

## Requirements

- Node.js supported by the installed NestJS toolchain
- PostgreSQL

## Configure and run

```bash
npm install
cp .env.example .env
```

Set `DATABASE_URL` to the existing `rongin_libas` PostgreSQL database. Replace the development JWT secrets before exposing the service, and configure `WEB_FRONTEND_URL` and `ADMIN_FRONTEND_URL` for the deployed frontends.

```bash
npm run start:dev
```

The API defaults to `http://localhost:4000/api/v1`; Swagger is at `http://localhost:4000/api/docs`.

## Database migration

The customer storefront migration is additive and is required before using the new customer, cart, wishlist, guest checkout, review, tracking, and newsletter endpoints. Back up the database and review the SQL and deployment plan before applying it to an existing environment.

```bash
npx prisma migrate deploy
npx prisma generate
```

Do not use `prisma migrate reset` against an existing database. The migration adds columns and tables, makes `orders.customerId` nullable for guest checkout, and normalizes duplicate default-address flags before adding its partial unique index. Prisma's schema does not model PostgreSQL partial unique indexes directly.

## Integrations and environment

See `.env.example` for required database/JWT configuration and optional SMTP/payment settings. Password-reset delivery requires SMTP variables. Online payment providers are intentionally unavailable until verified provider adapters are configured; checkout must not report an online payment as successful. Cash on delivery remains available.

## Checks

```bash
npm run build
npm run lint
npm test
```

## Production

Build with `npm run build` and start the compiled service with `npm run start:prod`. Apply pending migrations with `prisma migrate deploy` as a controlled deployment step, after backing up and verifying the target database.
