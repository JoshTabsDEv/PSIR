# PSIR Management System

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=24&pause=1200&center=true&vCenter=true&width=900&lines=PSIR+Management+System;Next.js+%2B+Prisma+%2B+PostgreSQL;Create%2C+Manage%2C+and+Export+PSIR+Reports" alt="Typing animation" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?logo=supabase&logoColor=white" alt="Supabase Postgres" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-Private-red" alt="License" />
</p>

Post-Sentence Investigation Report (PSIR) management app built with Next.js, Prisma, and PostgreSQL (Supabase). This branch (`web-version`) targets web deployment on Vercel. The desktop build lives on the `electron-version` branch.

## 🚀 Prerequisites

- Node.js 20+
- pnpm (recommended)
- Git
- A Supabase project (free tier is fine) or any PostgreSQL 14+ database

## 1) 📥 Clone the Repository

```bash
git clone https://github.com/JoshTabsDEv/PSIR.git
cd PSIR
git checkout web-version
```

## 2) 📦 Install Dependencies

```bash
npm i -g pnpm   # if pnpm is not installed
pnpm install    # also runs `prisma generate` via postinstall
```

## 3) 🔐 Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
GEMINI_API_KEY="your_gemini_api_key"
```

Where to find them (Supabase Dashboard -> Project Settings -> Database -> Connection string):

- `DATABASE_URL`: the **Transaction** pooler string (port 6543). Used by the app at runtime. Keep `?pgbouncer=true&connection_limit=1` on it.
- `DIRECT_URL`: the **Session** pooler string (port 5432). Used only by Prisma migrations.
- If your password contains special characters (like `@`), URL-encode them. Example: `@` becomes `%40`.
- Keep `.env.local` private; never commit secrets.

## 4) 🗄️ Apply the Database Schema

From the project root:

```bash
pnpm db:deploy      # applies prisma/migrations to the database
```

For local schema changes during development use `pnpm db:migrate` (creates a new migration).

Optional sample data:

```bash
pnpm db:seed
```

## 5) ▶️ Run the App

```bash
pnpm dev
```

Open `http://localhost:3000`.

## 6) ✅ Verify Setup Quickly

- Dashboard loads
- Reports pages load
- DB health check returns `ok: true`: `http://localhost:3000/api/db-check`
- AI endpoints work only if `GEMINI_API_KEY` is valid

## 🔐 Login & Users

All pages and API routes except the landing page and `/login` require a signed-in user. Sessions are signed cookies (HS256, 8 hours, httpOnly).

1. Set `AUTH_SECRET` in `.env.local` (and in Vercel): at least 32 random characters.
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```
2. Create your office, then the first user (both run against the database in `.env.local`):
   ```bash
   pnpm office:create -- --code TAG --name "Tagbilaran City Parole and Probation Office" --region "VII"
   pnpm user:create -- --username admin --password "ChangeMe-Strong-Pass" --name "Juan Dela Cruz" --office TAG --role ADMIN
   ```
   The office `code` appears in report numbers (`PI-TAG-2026-00001`). Re-running `user:create` with an existing username resets that user's password.
3. Sign in at `/login`.

Notes:

- Passwords are stored as bcrypt hashes (cost 12). Usernames are case-insensitive.
- Login is throttled per IP (10 failures / 15 min) in memory per server instance. Good enough for now; move to a shared store later if abuse shows up.
- Every report and user belongs to an office. `OFFICER` sees only their own office; `ADMIN` sees all offices and can filter any list with `?officeId=`.
- Report numbers are allocated per office and year inside a transaction (`report_counters`), so concurrent saves never collide.
- "Prepared by" / "Reviewed by" names are matched to office users and linked (`preparedById` / `reviewedById`) so monthly and TEV exports stay accurate even if a name is typed differently later.

## 🛡️ Administration (offices and users)

Admins get an **Administration** entry in the sidebar (`/dashboard/admin`).

- **Offices tab**: create offices (code, name, region, address), edit details, deactivate. The code is part of report numbers (`PI-TAG-2026-00001`) and cannot change.
- **Users tab**: create a user (username, full name, office, role). The app shows a one-time **set-password link** (valid 7 days). Send it to the user; they open it, set their password, and sign in. Use **Reset link** to issue a fresh link (doubles as password reset), **Edit** to change name/office/role, **Deactivate** to block sign-in.
- Admins cannot deactivate or demote themselves, nor deactivate their own office.
- Set `APP_URL` (e.g. `https://psir.vercel.app`) in Vercel if generated links should use a custom domain; otherwise the request origin is used.

The CLI scripts (`pnpm office:create`, `pnpm user:create`) still work for bootstrapping the first admin.

## ☁️ Deploy to Vercel

1. In Vercel, **Add New Project** and import the `JoshTabsDEv/PSIR` repository.
2. Set the production branch to `web-version` (Project Settings -> Git).
3. Framework preset: **Next.js**. Leave build settings on defaults. Vercel runs the `vercel-build` script, which applies migrations (`prisma migrate deploy`) and then builds.
4. Add Environment Variables (Project Settings -> Environment Variables):
   - `DATABASE_URL` (transaction pooler, port 6543)
   - `DIRECT_URL` (session pooler, port 5432)
   - `GEMINI_API_KEY`
   - `AUTH_SECRET`
5. Deploy. After the first deploy, open `/api/db-check` on the deployed URL to confirm the schema is live.

Notes:

- The dashboard refreshes its stats by polling every 30 seconds while the tab is visible. Server-Sent Events are not used because serverless functions cannot hold long-lived connections.
- The "recent judge" convenience feature is stored in the browser's `localStorage` (per browser), replacing the Electron preferences store.
- Create at least one user with `pnpm user:create` (pointed at the Supabase DB) before sharing the URL.

## 🛠️ Common Issues

### 1) `Can't reach database server`

- Recheck `DATABASE_URL` and `DIRECT_URL`
- Confirm the Supabase project is not paused (free projects pause after inactivity)

### 2) `relation "psir_reports" does not exist`

Migrations have not been applied. Run:

```bash
pnpm db:deploy
```

### 3) Prisma client errors

```bash
pnpm prisma generate
```

### 4) AI generation fails

- Verify `GEMINI_API_KEY` in `.env.local`
- Restart the dev server after changing env vars

### 5) Port already in use

```bash
pnpm dev -- -p 3001
```

## 💻 Useful Commands

```bash
pnpm dev            # Start dev server
pnpm build          # Build production app
pnpm start          # Run production build
pnpm lint           # Lint project
pnpm db:migrate     # Create and apply a new migration (dev)
pnpm db:deploy      # Apply pending migrations (prod / CI)
pnpm db:seed        # Seed sample data
pnpm prisma studio  # Open Prisma DB browser
```

## 🔀 Branch Workflow

```bash
git checkout web-version
git pull
git checkout -b feature/PSIR-xxx-short-title
```

When done:

```bash
git add .
git commit -m "feat(PSIR-xxx): short description"
git push -u origin feature/PSIR-xxx-short-title
```

Branches:

- `web-version`: web deployment (Vercel + Supabase Postgres)
- `electron-version`: Windows desktop app (Electron + SQLite)
