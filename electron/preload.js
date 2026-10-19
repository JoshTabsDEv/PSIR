/* eslint-disable @typescript-eslint/no-require-imports */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  sync: {
    status: () => ipcRenderer.invoke('sync:status'),
    run: () => ipcRenderer.invoke('sync:run'),
    migrate: () => ipcRenderer.invoke('sync:migrate'),
    backup: () => ipcRenderer.invoke('sync:backup'),
    backups: () => ipcRenderer.invoke('sync:backups'),
    restore: (backupPath) => ipcRenderer.invoke('sync:restore', backupPath)
  },
  judgeName: {
    getState: () => ipcRenderer.invoke('judge-name:get-state'),
    save: (judgeName) => ipcRenderer.invoke('judge-name:save', judgeName),
    clear: () => ipcRenderer.invoke('judge-name:clear')
  }
});
