import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface SyncMetadata {
  version: number;
  lastSyncTime: number;
  lastModified: number;
  hash: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  version: number;
  timestamp: number;
}

const SYNC_DIR = process.env.SYNC_DIR || path.join(process.cwd(), '.sync');
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(process.cwd(), '.backups');
const METADATA_FILE = path.join(SYNC_DIR, 'metadata.json');

export class DatabaseSync {
  private dbPath: string;
  private appRoot: string;

  constructor(dbPath: string, appRoot: string = process.cwd()) {
    this.dbPath = dbPath;
    this.appRoot = appRoot;
    this.ensureDirectories();
  }

  private ensureDirectories() {
    [SYNC_DIR, BACKUP_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Run Prisma migrations (db push)
   */
  async runMigrations(): Promise<SyncResult> {
    try {
      console.log('[sync] Running prisma db push...');
      execSync('pnpm prisma db push --skip-generate', {
        cwd: this.appRoot,
        stdio: 'inherit',
        env: { ...process.env, SKIP_ENV_VALIDATION: 'true' }
      });
      console.log('[sync] Migrations completed successfully');
      return {
        success: true,
        message: 'Migrations completed',
        version: this.getMetadata().version,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('[sync] Migration failed:', error);
      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        version: 0,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Create a backup of the database before syncing
   */
  createBackup(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `psir-${timestamp}.db`);

    if (fs.existsSync(this.dbPath)) {
      fs.copyFileSync(this.dbPath, backupPath);
      console.log(`[sync] Backup created: ${backupPath}`);
    }

    return backupPath;
  }

  /**
   * Get current metadata
   */
  private getMetadata(): SyncMetadata {
    if (fs.existsSync(METADATA_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(METADATA_FILE, 'utf-8'));
      } catch {
        return this.createDefaultMetadata();
      }
    }
    return this.createDefaultMetadata();
  }

  /**
   * Create default metadata
   */
  private createDefaultMetadata(): SyncMetadata {
    return {
      version: 0,
      lastSyncTime: 0,
      lastModified: 0,
      hash: ''
    };
  }

  /**
   * Update metadata after sync
   */
  private updateMetadata(metadata: SyncMetadata) {
    fs.writeFileSync(METADATA_FILE, JSON.stringify(metadata, null, 2));
  }

  /**
   * Calculate file hash (simple timestamp + size based)
   */
  private getFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return '';
    const stats = fs.statSync(filePath);
    return `${stats.mtimeMs}-${stats.size}`;
  }

  /**
   * Sync database: check for changes and merge
   */
  async syncDatabase(): Promise<SyncResult> {
    try {
      const metadata = this.getMetadata();
      const currentHash = this.getFileHash(this.dbPath);

      // If database hasn't changed, no sync needed
      if (currentHash === metadata.hash && Date.now() - metadata.lastSyncTime < 60000) {
        return {
          success: true,
          message: 'Database already in sync',
          version: metadata.version,
          timestamp: Date.now()
        };
      }

      // Create backup before sync
      this.createBackup();

      // Run migrations
      const migrationResult = await this.runMigrations();
      if (!migrationResult.success) {
        throw new Error(migrationResult.message);
      }

      // Update metadata
      const newMetadata: SyncMetadata = {
        version: metadata.version + 1,
        lastSyncTime: Date.now(),
        lastModified: Date.now(),
        hash: this.getFileHash(this.dbPath)
      };
      this.updateMetadata(newMetadata);

      return {
        success: true,
        message: 'Database synced successfully',
        version: newMetadata.version,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('[sync] Sync failed:', error);
      return {
        success: false,
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        version: this.getMetadata().version,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get sync status
   */
  getStatus() {
    const metadata = this.getMetadata();
    const dbStats = fs.existsSync(this.dbPath) ? fs.statSync(this.dbPath) : null;

    return {
      lastSyncTime: metadata.lastSyncTime,
      lastModified: metadata.lastModified,
      currentVersion: metadata.version,
      databaseSize: dbStats?.size || 0,
      databaseExists: !!dbStats,
      isSynced: metadata.hash === this.getFileHash(this.dbPath)
    };
  }

  /**
   * List all backups
   */
  listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];

    return fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('psir-') && f.endsWith('.db'))
      .map(f => {
        const filePath = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          path: filePath,
          size: stats.size,
          createdAt: stats.birthtime
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(backupPath: string): SyncResult {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup not found: ${backupPath}`);
      }

      // Create safety backup of current db
      this.createBackup();

      // Restore
      fs.copyFileSync(backupPath, this.dbPath);
      console.log(`[sync] Restored from backup: ${backupPath}`);

      // Update metadata
      const metadata = this.getMetadata();
      metadata.lastModified = Date.now();
      this.updateMetadata(metadata);

      return {
        success: true,
        message: 'Restored from backup',
        version: metadata.version,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('[sync] Restore failed:', error);
      return {
        success: false,
        message: `Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        version: 0,
        timestamp: Date.now()
      };
    }
  }
}
