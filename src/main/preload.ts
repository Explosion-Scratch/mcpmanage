import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getApps: () => ipcRenderer.invoke('get-apps'),
  getAllServers: () => ipcRenderer.invoke('get-all-servers'),
  getAppServers: (appName: string) => ipcRenderer.invoke('get-app-servers', appName),
  addServer: (name: string, command: string, env?: Record<string, string>, appNames?: string[]) =>
    ipcRenderer.invoke('add-server', name, command, env, appNames),
  updateServer: (name: string, command: string, env?: Record<string, string>, appNames?: string[]) =>
    ipcRenderer.invoke('update-server', name, command, env, appNames),
  removeServer: (name: string, appNames?: string[]) =>
    ipcRenderer.invoke('remove-server', name, appNames),
  toggleServer: (name: string, enabled: boolean, appNames?: string[]) =>
    ipcRenderer.invoke('toggle-server', name, enabled, appNames),
  parseCommand: (command: string) => ipcRenderer.invoke('parse-command', command),
  syncServers: () => ipcRenderer.invoke('sync-servers'),
  getMasterServers: () => ipcRenderer.invoke('get-master-servers'),
  updateMasterServer: (id: string, updates: any) => ipcRenderer.invoke('update-master-server', id, updates),
  studioStartServer: (serverId: string) => ipcRenderer.invoke('studio:start-server', serverId),
  studioStopServer: (serverId: string) => ipcRenderer.invoke('studio:stop-server', serverId),
  studioListTools: (serverId: string) => ipcRenderer.invoke('studio:list-tools', serverId),
  studioCallTool: (serverId: string, toolName: string, args: Record<string, unknown>) =>
    ipcRenderer.invoke('studio:call-tool', serverId, toolName, args),
  studioIsServerRunning: (serverId: string) => ipcRenderer.invoke('studio:is-server-running', serverId),
  onStudioLog: (callback: (serverId: string, message: string) => void) => {
    const subscription = (_event: any, serverId: string, message: string) => callback(serverId, message);
    ipcRenderer.on('studio:log', subscription);
    return () => ipcRenderer.removeListener('studio:log', subscription);
  },
  getAppSyncState: (appName: string) => ipcRenderer.invoke('get-app-sync-state', appName),
  toggleAppSync: (appName: string, enabled: boolean) => ipcRenderer.invoke('toggle-app-sync', appName, enabled),
  hasAppBackup: (appName: string) => ipcRenderer.invoke('has-app-backup', appName),
  getAppBackup: (appName: string) => ipcRenderer.invoke('get-app-backup', appName),
  getAppCurrentConfig: (appName: string) => ipcRenderer.invoke('get-app-current-config', appName),
  getAppAppliedServers: (appName: string) => ipcRenderer.invoke('get-app-applied-servers', appName),
  exportAppData: () => ipcRenderer.invoke('export-app-data'),
  importAppDataZip: (zipBuffer: ArrayBuffer) => ipcRenderer.invoke('import-app-data-zip', Buffer.from(zipBuffer)),
});

