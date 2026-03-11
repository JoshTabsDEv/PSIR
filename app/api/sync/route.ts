import { NextRequest, NextResponse } from 'next/server';
import { DatabaseSync } from '@/lib/sync/db-sync';
import path from 'path';

// Initialize sync service
const dbPath = process.env.DATABASE_URL?.replace('file:', '')?.replace(/\\/g, '/') || '';
const sync = new DatabaseSync(dbPath, process.cwd());

/**
 * POST /api/sync - Trigger database sync
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'sync':
        const syncResult = await sync.syncDatabase();
        return NextResponse.json(syncResult);

      case 'migrate':
        const migrationResult = await sync.runMigrations();
        return NextResponse.json(migrationResult);

      case 'backup':
        const backupPath = sync.createBackup();
        return NextResponse.json({
          success: true,
          message: 'Backup created',
          backupPath
        });

      case 'restore': {
        const { backupPath } = await request.json();
        if (!backupPath) {
          return NextResponse.json(
            { success: false, message: 'Backup path required' },
            { status: 400 }
          );
        }
        const restoreResult = sync.restoreFromBackup(backupPath);
        return NextResponse.json(restoreResult);
      }

      case 'status':
        const status = sync.getStatus();
        return NextResponse.json({ success: true, data: status });

      case 'backups':
        const backups = sync.listBackups();
        return NextResponse.json({ success: true, data: backups });

      default:
        return NextResponse.json(
          { success: false, message: 'Unknown action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[api/sync] Error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync - Get sync status
 */
export async function GET() {
  try {
    const status = sync.getStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('[api/sync] Error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
