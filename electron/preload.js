const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sync: {
    status: () => ipcRenderer.invoke('sync:status'),
    run: () => ipcRenderer.invoke('sync:run'),
    migrate: () => ipcRenderer.invoke('sync:migrate'),
    backup: () => ipcRenderer.invoke('sync:backup'),
    backups: () => ipcRenderer.invoke('sync:backups'),
    restore: (backupPath) => ipcRenderer.invoke('sync:restore', backupPath)
  }
});
