import { useState, useCallback } from 'react';

interface SyncStatus {
  lastSyncTime: number;
  lastModified: number;
  currentVersion: number;
  databaseSize: number;
  databaseExists: boolean;
  isSynced: boolean;
}

interface Backup {
  name: string;
  path: string;
  size: number;
  createdAt: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  version?: number;
  timestamp?: number;
}

const getElectronAPI = () => {
  if (typeof window !== 'undefined' && 'electron' in window) {
    return (window as any).electron;
  }
  return null;
};

export function useSync() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const electron = getElectronAPI();

  const getStatus = useCallback(async () => {
    if (!electron) return null;
    setIsLoading(true);
    try {
      const result = await electron.sync.status();
      if (result.success && result.data) {
        setStatus(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to get status');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get status';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [electron]);

  const runSync = useCallback(async () => {
    if (!electron) return null;
    setIsLoading(true);
    try {
      const result = await electron.sync.run();
      if (result.success) {
        setError(null);
        await getStatus();
      } else {
        setError(result.message || 'Sync failed');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [electron, getStatus]);

  const runMigrate = useCallback(async () => {
    if (!electron) return null;
    setIsLoading(true);
    try {
      const result = await electron.sync.migrate();
      if (result.success) {
        setError(null);
        await getStatus();
      } else {
        setError(result.message || 'Migration failed');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Migration failed';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [electron, getStatus]);

  const createBackup = useCallback(async () => {
    if (!electron) return null;
    setIsLoading(true);
    try {
      const result = await electron.sync.backup();
      if (result.success) {
        setError(null);
        await listBackups();
      } else {
        setError(result.message || 'Backup failed');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Backup failed';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [electron]);

  const listBackups = useCallback(async () => {
    if (!electron) return null;
    setIsLoading(true);
    try {
      const result = await electron.sync.backups();
      if (result.success && result.data) {
        setBackups(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to list backups');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list backups';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, [electron]);

  const restoreBackup = useCallback(
    async (backupPath: string) => {
      if (!electron) return null;
      setIsLoading(true);
      try {
        const result = await electron.sync.restore(backupPath);
        if (result.success) {
          setError(null);
          await getStatus();
        } else {
          setError(result.message || 'Restore failed');
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Restore failed';
        setError(message);
        return { success: false, message };
      } finally {
        setIsLoading(false);
      }
    },
    [electron, getStatus]
  );

  return {
    status,
    backups,
    isLoading,
    error,
    getStatus,
    runSync,
    runMigrate,
    createBackup,
    listBackups,
    restoreBackup
  };
}
