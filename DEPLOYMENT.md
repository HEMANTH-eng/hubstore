# HubStore Production Deployment & PostgreSQL Migration Manual

This guide outlines the production deployment strategy for **HubStore**, including zero-downtime database migration to PostgreSQL, Docker containerization, and hosting on cloud platforms (Vercel, Railway, AWS, or GCP).

---

## 1. Architecture Overview

- **Frontend & App Server**: Next.js 16 (App Router) + React 19 + Tailwind CSS.
- **Database**: PostgreSQL (Production) / SQLite (Zero-friction local dev).
- **ORM & Migrations**: Prisma ORM 6.
- **State & Store**: Zustand (Cart, Wishlist, Local persistence).
- **Container**: Multi-stage lightweight Alpine Docker image (`node:20-alpine`).
- **Payments**: Razorpay (UPI, Cards, Netbanking) & Stripe (International).

---

## 2. PostgreSQL Database Setup & Migration

HubStore includes dedicated dual Prisma schemas:
- `prisma/schema.sqlite.prisma` for local testing without external dependencies.
- `prisma/schema.postgresql.prisma` for high-throughput production PostgreSQL with native SQL enums, indexed foreign keys, and connection pooling.

### Step 1: Switch Prisma Datasource
Run the included database switch script:
```bash
npm run db:use:postgres
```
This automatically updates `prisma/schema.prisma` and regenerates the Prisma client for PostgreSQL.

### Step 2: Configure Production Environment Variables
Set your `DATABASE_URL` in `.env` or your cloud provider's secrets manager:
```env
DATABASE_URL="postgresql://hubstore_user:strongpassword@your-postgres-host.rds.amazonaws.com:5432/hubstore?schema=public&connection_limit=20"
```

### Step 3: Push Schema & Seed Initial Production Data
```bash
# Push schema tables, relations, and enums
npm run db:push

# Seed catalog, demo credentials, verified reviews, and coupons
npm run db:seed
```

*(To switch back to local SQLite at any time, run `npm run db:use:sqlite`)*.

---

## 3. Production Environment Checklist (`.env.production`)

Ensure these environment variables are provided in your production hosting dashboard:

| Variable | Description | Example / Note |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | `production` |
| `NEXT_PUBLIC_APP_URL` | Public site domain | `https://hubstore.in` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `SESSION_SECRET` | 32+ char cryptographic string | `openssl rand -hex 32` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Production Razorpay Key | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Secret Razorpay API Key | Server-side only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| Stripe Publishable Key | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe Secret API Key | Server-side only |

---

## 4. Docker Container Deployment

HubStore includes an optimized multi-stage `Dockerfile` and `.dockerignore`.

### Build & Run Container Locally
```bash
# 1. Build image
docker build -t hubstore:latest .

# 2. Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e SESSION_SECRET="your-session-secret" \
  hubstore:latest
```

### Deploy to Cloud Platforms

#### Option A: Vercel (Recommended for Serverless)
1. Push repository to GitHub or GitLab.
2. Import project in Vercel Dashboard.
3. Configure Environment Variables (`DATABASE_URL`, `SESSION_SECRET`, etc.).
4. Add PostgreSQL storage via **Vercel Postgres** or **Neon / Supabase**.
5. Set Build Command: `npx prisma generate && next build`.
6. Deploy!

#### Option B: Railway / Render (Full Container & PostgreSQL)
1. Create a new Project in Railway or Render.
2. Provision a **PostgreSQL** database service.
3. Add a **Web Service** pointing to this repository.
4. Set Build Command: `npm run db:use:postgres && npm run db:push && npm run build`.
5. Set Start Command: `npm start`.

---

## 5. Automated Health & E2E Verification

Before releasing any production deployment, execute the full Playwright E2E suite:
```bash
npm test
```
All 7 integration suites test:
1. Storefront homepage hero, deals banner, and live query search.
2. Product Catalog faceted filters and inventory display.
3. Product Details Page, variant selector, and Add-to-Cart.
4. Slide-out Cart Drawer with promo coupon validation (`WELCOME50`).
5. Multi-step Checkout with saved customer addresses.
6. Admin Command Center KPI metrics and real-time revenue analytics.
7. Admin Product Creation Studio and Coupon Management console.
