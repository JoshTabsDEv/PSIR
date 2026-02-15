# PSIR Management System

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=24&pause=1200&center=true&vCenter=true&width=900&lines=PSIR+Management+System;Next.js+%2B+Prisma+%2B+MySQL;Create%2C+Manage%2C+and+Export+PSIR+Reports" alt="Typing animation" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/License-Private-red" alt="License" />
</p>

Post-Sentence Investigation Report (PSIR) management app built with Next.js, Prisma, and MySQL.

## 🚀 Prerequisites

Install these on the new PC first:

- Node.js 20+
- pnpm (recommended) or npm
- MySQL 8+
- Git

Optional but recommended:

- VS Code
- MySQL Workbench

## 1) 📥 Clone the Repository

Use the current repository location:

```bash
git clone https://github.com/TBRDevs/PSIR.git
cd PSIR/psir
```

If your team still uses the old remote, update it after clone:

```bash
git remote set-url origin https://github.com/TBRDevs/PSIR.git
```

## 2) 📦 Install Dependencies

If pnpm is not installed:

```bash
npm i -g pnpm
```

Install packages:

```bash
pnpm install
```

## 3) 🔐 Configure Environment Variables

Create `psir/.env.local` and set your values:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/psir_db"
GEMINI_API_KEY="your_gemini_api_key"
```

Notes:

- `DATABASE_URL` must point to an existing MySQL database.
- If your MySQL password contains special chars (like `@`), URL-encode them.
  Example: `@` becomes `%40`.
- Keep `.env.local` private; do not commit secrets.

## 4) 🗄️ Create the Database

In MySQL, create the DB if it does not exist:

```sql
CREATE DATABASE psir_db;
```

## 5) ⚙️ Initialize Prisma

From `psir/`:

```bash
npx prisma generate
npx prisma db push
```

Optional (seed sample data):

```bash
pnpm db:seed
```

## 6) ▶️ Run the App

```bash
pnpm dev
```

Open:

- `http://localhost:3000`

## 7) ✅ Verify Setup Quickly

- Dashboard loads
- Reports pages load
- DB health check works: `http://localhost:3000/api/db-check`
- AI endpoints work only if `GEMINI_API_KEY` is valid

## 🛠️ Common Issues

### 1) `Can't reach database server`

- Check MySQL service is running
- Recheck `DATABASE_URL`
- Ensure `psir_db` exists

### 2) Prisma client errors

Run:

```bash
npx prisma generate
```

### 3) AI generation fails

- Verify `GEMINI_API_KEY` in `.env.local`
- Restart dev server after changing env vars

### 4) Port already in use

Run on another port:

```bash
pnpm dev -- -p 3001
```

## 💻 Useful Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build production app
pnpm start        # Run production build
pnpm lint         # Lint project
pnpm db:seed      # Seed sample data
npx prisma studio # Open Prisma DB browser
```

## 🔀 Branch Workflow (Recommended)

```bash
git checkout dev
git pull
git checkout -b feature/PSIR-xxx-short-title
```

When done:

```bash
git add .
git commit -m "feat(PSIR-xxx): short description"
git push -u origin feature/PSIR-xxx-short-title
```

## ✨ README Notes

- Emojis are supported by GitHub Markdown (`:rocket:`, `:sparkles:`, etc.).
- The typing banner uses an SVG animation service.
- Badges are powered by Shields.io.
