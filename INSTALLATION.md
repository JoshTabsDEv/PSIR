# PSIR Management System — Installation Guide

## For End Users (Installing the built app)

### Step 1 — Locate the installer

The installer is built at:

```
psir/dist/PSIR Management System Setup 0.1.0.exe
```

### Step 2 — Run the installer

1. Double-click `PSIR Management System Setup 0.1.0.exe`
2. If **Windows SmartScreen** blocks it, click **"More info"** → **"Run anyway"** (the app is unsigned)
3. Choose your installation directory (default: `C:\Program Files\PSIR Management System`)
4. Click **Install** and wait for it to finish
5. A **"PSIR System"** shortcut will be created on your Desktop

### Step 3 — Launch the app

- Double-click the **PSIR System** desktop shortcut
- The app may take **15–30 seconds** on first launch while the embedded server starts and the database initializes

> **Note:** Your data is stored in `%APPDATA%\PSIR Management System\psir.db` and persists across app updates. To fully reset, delete that file and relaunch.

---

## For Developers (Running from source)

### Prerequisites

- [Node.js](https://nodejs.org) v20 or later
- [pnpm](https://pnpm.io) v9 or later — install with:
  ```bash
  npm install -g pnpm
  ```
- [Git](https://git-scm.com)

### Step 1 — Clone and install dependencies

```bash
git clone <repo-url>
cd psir
pnpm install
```

### Step 2 — Configure environment

Create a `.env` file in the `psir/` directory:

```env
# SQLite database — use an absolute path to avoid resolution issues
DATABASE_URL="file:C:/absolute/path/to/your/project/psir/prisma/psir.db"

# Gemini AI API Key — get one free at https://aistudio.google.com/apikey
GEMINI_API_KEY=your_api_key_here
```

> **Important:** The `DATABASE_URL` must be an **absolute path**. Relative paths can fail due to how Next.js resolves the working directory. Replace the path with the actual location of your cloned repo.

### Step 3 — Initialize the database

```bash
pnpm prisma db push
```

This creates the SQLite database file at the path set in `DATABASE_URL`. No external database server is needed.

### Step 4 — Run in development mode

```bash
# Web only — opens at http://localhost:3000
pnpm dev

# Electron desktop app — opens the desktop window
pnpm electron:dev
```

`electron:dev` starts both the Next.js dev server and Electron concurrently and waits for the server to be ready before opening the window.

### Step 5 — Build the installer

```bash
pnpm electron:build
```

This runs three steps automatically:
1. `next build` — builds the Next.js standalone server
2. `node scripts/copy-static.js` — copies static assets into the standalone bundle
3. `electron-builder --win --x64` — packages everything into an NSIS installer

Output: `dist/PSIR Management System Setup 0.1.0.exe`

---

## Project Structure (key files)

```
electron/main.js          # Electron main process — starts Next.js server, creates window
scripts/copy-static.js    # Post-build script — copies .next/static into standalone bundle
prisma/schema.prisma      # SQLite database schema
psir-seed.db              # Empty seed database bundled into installer for first-run init
.env                      # Local environment variables (not committed)
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| App won't open / Windows blocks installer | Right-click the installer → "Run as administrator", or click "More info" → "Run anyway" on SmartScreen |
| App opens but shows blank / loading screen | Wait 30 seconds on first launch for the embedded server to start |
| "Server did not start" error | Rebuild with `pnpm electron:build` — the standalone server bundle may be missing or outdated |
| Database issues (corrupt / missing data) | Delete `%APPDATA%\PSIR Management System\psir.db` and relaunch to reinitialize from seed |
| `pnpm dev` fails with Prisma error | Ensure `DATABASE_URL` in `.env` is an absolute path and `pnpm prisma db push` has been run |
| Gemini AI features not working | Check that `GEMINI_API_KEY` is set correctly in `.env` |
