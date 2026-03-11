// electron/main.js — Electron main process for PSIR Management System
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const { fork, execSync } = require('child_process');
const http = require('http');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = 3000;
const HOST = 'localhost';

let mainWindow = null;
let serverProcess = null;
let dbPath = null;

// ── Utilities ──────────────────────────────────────────────────────────────

function waitForServer(url, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    function poll() {
      http.get(url, (res) => {
        res.resume();
        resolve();
      }).on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Server did not start within ${timeoutMs}ms`));
          return;
        }
        setTimeout(poll, 300);
      });
    }

    poll();
  });
}

// Find the Prisma query engine binary (handles both npm and pnpm layouts)
function findPrismaEngine(searchRoot) {
  const engineName = 'query_engine-windows.dll.node';

  function search(dir, depth) {
    if (depth > 10) return null;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return null;
    }
    for (const entry of entries) {
      if (entry.isFile() && entry.name === engineName) {
        return path.join(dir, entry.name);
      }
      if (entry.isDirectory()) {
        const result = search(path.join(dir, entry.name), depth + 1);
        if (result) return result;
      }
    }
    return null;
  }

  return search(path.join(searchRoot, 'node_modules'), 0);
}

// ── Database Init ──────────────────────────────────────────────────────────

function ensureDatabase(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.log('[electron] No existing database found at:', dbPath);
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    // Copy seed database (empty schema) from bundled resources
    const seedDb = path.join(process.resourcesPath, 'psir-seed.db');
    if (fs.existsSync(seedDb)) {
      fs.copyFileSync(seedDb, dbPath);
      console.log('[electron] Database initialized from seed:', dbPath);
    } else {
      console.warn('[electron] No seed database found. Prisma will create schema on first connect.');
    }
  } else {
    console.log('[electron] Existing database found at:', dbPath);
  }
}

// Run Prisma migrations in background (don't block app startup)
function runMigrationsAsync(appRoot) {
  try {
    console.log('[electron] Starting prisma db push (background)...');
    const { spawn } = require('child_process');

    const proc = spawn('npx', ['prisma', 'db', 'push', '--skip-generate'], {
      cwd: appRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        SKIP_ENV_VALIDATION: 'true',
        DATABASE_URL: `file:${dbPath.replace(/\\/g, '/')}`
      },
      detached: false
    });

    proc.on('error', (err) => {
      console.warn('[electron] Migration process error:', err.message);
    });

    proc.on('exit', (code) => {
      if (code === 0) {
        console.log('[electron] Migrations completed');
      } else {
        console.warn('[electron] Migration exited with code:', code);
      }
    });

    // Don't wait for migrations — app starts immediately
  } catch (error) {
    console.error('[electron] Could not start migrations:', error.message);
  }
}

// ── Server Startup ─────────────────────────────────────────────────────────

async function startNextServer() {
  // .next/standalone is declared asarUnpack so it lives on real disk at
  // resources/app.asar.unpacked — child_process.fork() cannot read from
  // inside an ASAR archive, so we must use the unpacked path.
  const standaloneDir = path.join(
    process.resourcesPath, 'app.asar.unpacked', '.next', 'standalone'
  );
  const serverScript = path.join(standaloneDir, 'server.js');

  if (!fs.existsSync(serverScript)) {
    throw new Error(
      `Next.js standalone server not found at:\n${serverScript}\n\nRun "pnpm electron:build" to build first.`
    );
  }

  // Database lives in user's AppData so it persists across app updates
  const userData = app.getPath('userData');
  dbPath = path.join(userData, 'psir.db');
  ensureDatabase(dbPath);

  // Run migrations in background (don't block app startup)
  // Standalone dir contains prisma/ folder (copied by copy-static.js)
  runMigrationsAsync(standaloneDir);

  // Find the Prisma engine (works with both npm flat layout and pnpm nested layout)
  const enginePath = findPrismaEngine(standaloneDir);
  if (!enginePath) {
    console.warn('[electron] Prisma engine not found — Prisma will use auto-discovery');
  } else {
    console.log('[electron] Prisma engine:', enginePath);
  }

  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(PORT),
    HOSTNAME: HOST,
    DATABASE_URL: `file:${dbPath.replace(/\\/g, '/')}`,
    PRISMA_TELEMETRY_INFORMATION: '0',
  };

  if (enginePath) {
    env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
  }

  console.log('[electron] Starting Next.js server...');
  console.log('[electron] Database:', `file:${dbPath}`);

  serverProcess = fork(serverScript, [], {
    env,
    // cwd must be standalone dir so process.cwd() resolves templates/ correctly
    cwd: standaloneDir,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });

  serverProcess.stdout?.on('data', (d) => process.stdout.write(`[next] ${d}`));
  serverProcess.stderr?.on('data', (d) => process.stderr.write(`[next] ${d}`));

  serverProcess.on('error', (err) => {
    console.error('[electron] Server process error:', err);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`[electron] Server exited: code=${code} signal=${signal}`);
    serverProcess = null;
  });

  await waitForServer(`http://${HOST}:${PORT}/api/db-check`);
  console.log('[electron] Next.js server is ready.');
}

// ── IPC Handlers ────────────────────────────────────────────────────────────

ipcMain.handle('sync:status', async () => {
  try {
    const response = await fetch(`http://${HOST}:${PORT}/api/sync`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ipc] Sync status error:', error);
    return { success: false, message: 'Failed to get sync status' };
  }
});

ipcMain.handle('sync:run', async () => {
  try {
    const response = await fetch(`http://${HOST}:${PORT}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'sync' })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ipc] Sync run error:', error);
    return { success: false, message: 'Sync failed' };
  }
});

ipcMain.handle('sync:migrate', async () => {
  try {
    const response = await fetch(`http://${HOST}:${PORT}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'migrate' })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ipc] Migration error:', error);
    return { success: false, message: 'Migration failed' };
  }
});

ipcMain.handle('sync:backup', async () => {
  try {
    const response = await fetch(`http://${HOST}:${PORT}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'backup' })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ipc] Backup error:', error);
    return { success: false, message: 'Backup failed' };
  }
});

ipcMain.handle('sync:backups', async () => {
  try {
    const response = await fetch(`http://${HOST}:${PORT}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'backups' })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ipc] List backups error:', error);
    return { success: false, message: 'Failed to list backups' };
  }
});

ipcMain.handle('sync:restore', async (event, backupPath) => {
  try {
    const response = await fetch(`http://${HOST}:${PORT}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'restore', backupPath })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ipc] Restore error:', error);
    return { success: false, message: 'Restore failed' };
  }
});

// ── Window ─────────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'PSIR Management System',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const url = isDev
    ? `http://localhost:${PORT}/dashboard`
    : `http://${HOST}:${PORT}/dashboard`;

  mainWindow.loadURL(url);

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url: openUrl }) => {
    const isLocal = openUrl.startsWith(`http://localhost:`) ||
                    openUrl.startsWith(`http://${HOST}:`);
    if (!isLocal) {
      shell.openExternal(openUrl);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── App Lifecycle ───────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    if (isDev) {
      console.log('[electron] Dev mode — connecting to http://localhost:3000');
    } else {
      await startNextServer();
    }
    createWindow();
  } catch (err) {
    console.error('[electron] Startup failed:', err);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('will-quit', () => {
  if (serverProcess) {
    console.log('[electron] Stopping server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
