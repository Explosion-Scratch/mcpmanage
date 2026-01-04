import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, ipcMain } from 'electron';
import liquidGlass from 'electron-liquid-glass';
import { MCPConfigManager } from './services/MCPConfigManager';
import { MasterServerStore } from './services/MasterServerStore';
import { MCPStudioService } from './services/MCPStudioService';
import { BackupService } from './services/BackupService';
import { CustomAppStore } from './services/CustomAppStore';
import { AppConfig, MCPServer, MasterMCPServer, PermissionLevel, CustomAppConfig } from '../shared/types';
import { getAvailableAdapters, AppAdapter, initCustomAppStore, CustomAppAdapter } from './apps';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWindow: BrowserWindow | null = null;
let mcpManager: MCPConfigManager;
let masterStore: MasterServerStore;
let mcpStudioService: MCPStudioService;
let backupService: BackupService;
let customAppStore: CustomAppStore;
let appAdapters: AppAdapter[] = [];
let appSyncStates: Map<string, boolean> = new Map();

function getRendererPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
  }
  return path.join(__dirname, '..', 'dist', 'index.html');
}

function getAssetsPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets');
  }
  return path.join(__dirname, '..', '..', 'src', 'renderer', 'assets');
}

function getIconPath(): string {
  if (process.platform === 'darwin') {
    if (app.isPackaged) {
      return path.join(process.resourcesPath, '..', 'Resources', 'electron.icns');
    }
    const icnsPath = path.join(__dirname, '..', '..', 'build', 'icon.icns');
    const fs = require('fs');
    if (fs.existsSync(icnsPath)) {
      return icnsPath;
    }
  }
  return path.join(getAssetsPath(), 'logo.svg');
}

function createWindow() {
  const isDev = !!process.env.FARM_DEV_SERVER_URL;
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    transparent: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 12, y: 12 },
    icon: getIconPath(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  mainWindow.setWindowButtonVisibility(true);

  if (isDev) {
    mainWindow.loadURL(process.env.FARM_DEV_SERVER_URL!);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(getRendererPath());
  }

  mainWindow.webContents.once('did-finish-load', () => {
    console.log('Window loaded');
    if (mainWindow && process.platform === 'darwin') {
      console.log('Adding glass');
      const vh = mainWindow.getNativeWindowHandle();
      console.log(vh);
      const glassId = liquidGlass.addView(vh, {
        cornerRadius: 12,
        opaque: false,
      });
      liquidGlass.unstable_setVariant(glassId, 8);
    }
  });
}

app.whenReady().then(async () => {
  customAppStore = new CustomAppStore();
  initCustomAppStore(customAppStore);
  appAdapters = await getAvailableAdapters();
  mcpManager = new MCPConfigManager(appAdapters);
  masterStore = new MasterServerStore();
  mcpStudioService = new MCPStudioService();
  backupService = new BackupService();
  
  // Create backups for all apps on first detection
  for (const adapter of appAdapters) {
    const configExists = await adapter.configExists();
    if (configExists) {
      const servers = await mcpManager.readAppConfig(adapter);
      await backupService.createBackup(adapter.name, servers);
      appSyncStates.set(adapter.name, true); // Sync is enabled by default
    }
  }
  
  const appServers = await mcpManager.getAllServers();
  await masterStore.syncFromAppConfigs(appServers);
  
  setupIPCHandlers();
  createWindow();
  
  if (mainWindow) {
    mcpStudioService.setMainWindow(mainWindow);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (mcpStudioService) {
    mcpStudioService.stopAllServers();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function setupIPCHandlers() {
  ipcMain.handle('get-apps', async () => {
    return appAdapters.map(adapter => {
      const isCustom = 'isCustom' in adapter && (adapter as any).isCustom === true;
      return {
        name: adapter.name,
        icon: adapter.icon,
        color: adapter.color,
        syncEnabled: appSyncStates.get(adapter.name) ?? true,
        isCustom,
      } as AppConfig;
    });
  });

  ipcMain.handle('get-all-servers', async () => {
    return await masterStore.getAllServers();
  });

  ipcMain.handle('get-app-servers', async (_, appName: string) => {
    const adapter = appAdapters.find(a => a.name === appName);
    if (!adapter) {
      throw new Error(`App not found: ${appName}`);
    }
    return await mcpManager.readAppConfig(adapter);
  });

  ipcMain.handle('add-server', async (_, name: string, command: string, env?: Record<string, string>, appNames?: string[]) => {
    const parsed = mcpManager.parseCommand(command);
    const server: MCPServer = {
      command: parsed.command,
      args: parsed.args,
      ...(env && { env })
    };
    
    const targetApps = appNames || mcpManager.getAdapters().map(a => a.name);
    const success = await mcpManager.addServer(name, server, appNames);
    
    if (success) {
      await masterStore.addServer({
        id: name,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        command: parsed.command,
        args: parsed.args,
        env,
        enabled: true,
        permissions: 'always_ask',
        apps: targetApps
      });
    }
    
    return success;
  });

  ipcMain.handle('update-server', async (_, name: string, command: string, env?: Record<string, string>, appNames?: string[]) => {
    const parsed = mcpManager.parseCommand(command);
    const server: MCPServer = {
      command: parsed.command,
      args: parsed.args,
      ...(env && { env })
    };
    
    const success = await mcpManager.updateServer(name, server, appNames);
    
    if (success) {
      await masterStore.updateServer(name, {
        command: parsed.command,
        args: parsed.args,
        env,
        apps: appNames
      });
    }
    
    return success;
  });

  ipcMain.handle('remove-server', async (_, name: string, appNames?: string[]) => {
    const success = await mcpManager.removeServer(name, appNames);
    
    if (success) {
      if (!appNames) {
        await masterStore.removeServer(name);
      } else {
        for (const appName of appNames) {
          await masterStore.removeAppFromServer(name, appName);
        }
        
        const server = await masterStore.getServer(name);
        if (server && server.apps.length === 0) {
          await masterStore.removeServer(name);
        }
      }
    }
    
    return success;
  });

  ipcMain.handle('toggle-server', async (_, name: string, enabled: boolean, appNames?: string[]) => {
    const masterServer = await masterStore.getServer(name);
    if (!masterServer) {
      return false;
    }
    
    const server: MCPServer = {
      command: masterServer.command,
      args: masterServer.args,
      env: masterServer.env,
      settings: masterServer.settings,
      enabled: enabled
    };
    
    const success = await mcpManager.toggleServer(name, enabled, server, appNames);
    
    if (success) {
      if (!appNames) {
        await masterStore.toggleServer(name, enabled);
      } else if (enabled) {
        for (const appName of appNames) {
          await masterStore.addAppToServer(name, appName);
        }
      } else {
        for (const appName of appNames) {
          await masterStore.removeAppFromServer(name, appName);
        }
      }
    }
    
    return success;
  });

  ipcMain.handle('parse-command', async (_, command: string) => {
    return mcpManager.parseCommand(command);
  });

  ipcMain.handle('sync-servers', async () => {
    const allServers = await masterStore.getAllServers();
    for (const server of allServers) {
      if (server.applyToAll && server.enabled) {
        const syncedApps = appAdapters
          .filter(a => appSyncStates.get(a.name) ?? true)
          .map(a => a.name);
        
        for (const appName of syncedApps) {
          const adapter = appAdapters.find(a => a.name === appName);
          if (adapter) {
            const appConfig = await mcpManager.readAppConfig(adapter);
            appConfig[server.id] = {
              command: server.command,
              args: server.args,
              env: server.env,
              settings: server.settings,
              enabled: true
            };
            await mcpManager.writeAppConfig(adapter, appConfig);
          }
        }
      }
    }
    
    return allServers;
  });

  ipcMain.handle('get-master-servers', async () => {
    return await masterStore.getAllServers();
  });

  ipcMain.handle('update-master-server', async (_, id: string, updates: Partial<MasterMCPServer>) => {
    const result = await masterStore.updateServer(id, updates);
    
    if (result && updates.applyToAll !== undefined) {
      const server = await masterStore.getServer(id);
      if (server) {
        const syncedApps = appAdapters
          .filter(a => appSyncStates.get(a.name) ?? true)
          .map(a => a.name);
        
        if (updates.applyToAll && server.enabled) {
          for (const appName of syncedApps) {
            const adapter = appAdapters.find(a => a.name === appName);
            if (adapter) {
              const appConfig = await mcpManager.readAppConfig(adapter);
              appConfig[server.id] = {
                command: server.command,
                args: server.args,
                env: server.env,
                settings: server.settings,
                enabled: true
              };
              await mcpManager.writeAppConfig(adapter, appConfig);
            }
          }
        }
      }
    }
    
    return result;
  });

  ipcMain.handle('studio:start-server', async (_, serverId: string) => {
    const server = await masterStore.getServer(serverId);
    if (!server) {
      return { success: false, error: 'Server not found' };
    }
    return await mcpStudioService.startServer(server);
  });

  ipcMain.handle('studio:stop-server', async (_, serverId: string) => {
    return await mcpStudioService.stopServer(serverId);
  });

  ipcMain.handle('studio:list-tools', async (_, serverId: string) => {
    try {
      return await mcpStudioService.listTools(serverId);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to list tools');
    }
  });

  ipcMain.handle('studio:call-tool', async (_, serverId: string, toolName: string, args: Record<string, unknown>) => {
    try {
      return await mcpStudioService.callTool(serverId, toolName, args);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to call tool');
    }
  });

  ipcMain.handle('studio:is-server-running', async (_, serverId: string) => {
    return mcpStudioService.isServerRunning(serverId);
  });
  
  // App sync management
  ipcMain.handle('get-app-sync-state', async (_, appName: string) => {
    return appSyncStates.get(appName) ?? true;
  });
  
  ipcMain.handle('toggle-app-sync', async (_, appName: string, enabled: boolean) => {
    const adapter = appAdapters.find(a => a.name === appName);
    if (!adapter) {
      throw new Error(`App not found: ${appName}`);
    }
    
    if (!enabled) {
      // Restore from backup
      const backup = await backupService.getBackup(appName);
      if (backup) {
        await mcpManager.writeAppConfig(adapter, backup);
      }
    }
    
    appSyncStates.set(appName, enabled);
    return true;
  });
  
  ipcMain.handle('has-app-backup', async (_, appName: string) => {
    return await backupService.hasBackup(appName);
  });

  ipcMain.handle('get-app-backup', async (_, appName: string) => {
    return await backupService.getBackup(appName);
  });

  ipcMain.handle('get-app-current-config', async (_, appName: string) => {
    const adapter = appAdapters.find(a => a.name === appName);
    if (!adapter) {
      throw new Error(`App not found: ${appName}`);
    }
    return await mcpManager.readAppConfig(adapter);
  });

  ipcMain.handle('get-app-applied-servers', async (_, appName: string) => {
    const allServers = await masterStore.getAllServers();
    return allServers.filter(s => s.applyToAll || s.apps.includes(appName));
  });

  ipcMain.handle('export-app-data', async () => {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip();
    
    const masterServers = await masterStore.getAllServers();
    const mcpServers: any = {};
    masterServers.forEach(server => {
      mcpServers[server.id] = {
        command: server.command,
        args: server.args,
        ...(server.env && { env: server.env }),
      };
    });
    
    zip.addFile('mcp.json', Buffer.from(JSON.stringify({ mcpServers }, null, 2)));
    
    const appData = {
      apps: appAdapters.map(a => ({
        name: a.name,
        icon: a.icon,
        color: a.color,
        syncEnabled: appSyncStates.get(a.name) ?? true,
      })),
      masterServers: masterServers,
      version: app.getVersion(),
      exportDate: new Date().toISOString(),
    };
    zip.addFile('app-data.json', Buffer.from(JSON.stringify(appData, null, 2)));
    
    for (const adapter of appAdapters) {
      const backup = await backupService.getBackup(adapter.name);
      if (backup) {
        zip.addFile(
          `backups/${adapter.name}.json`, 
          Buffer.from(JSON.stringify({ config: backup }, null, 2))
        );
      }
    }
    
    return zip.toBuffer();
  });

  ipcMain.handle('import-app-data-zip', async (_, zipBuffer: Buffer) => {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(zipBuffer);
    
    const appDataEntry = zip.getEntry('app-data.json');
    if (appDataEntry) {
      const appData = JSON.parse(appDataEntry.getData().toString('utf8'));
      
      if (appData.masterServers) {
        for (const server of appData.masterServers) {
          await masterStore.addServer(server);
        }
      }
      
      if (appData.apps) {
        for (const appInfo of appData.apps) {
          appSyncStates.set(appInfo.name, appInfo.syncEnabled ?? true);
        }
      }
    }
    
    const backupEntries = zip.getEntries().filter((e: any) => e.entryName.startsWith('backups/'));
    for (const entry of backupEntries) {
      const appName = entry.entryName.replace('backups/', '').replace('.json', '');
      const backupData = JSON.parse(entry.getData().toString('utf8'));
      if (backupData.config) {
        await backupService.createBackup(appName, backupData.config);
      }
    }
    
    return true;
  });

  ipcMain.handle('get-custom-apps', async () => {
    return await customAppStore.getAllApps();
  });

  ipcMain.handle('add-custom-app', async (_, customApp: CustomAppConfig) => {
    const success = await customAppStore.addApp(customApp);
    if (success) {
      const adapter = new CustomAppAdapter(customApp);
      appAdapters.push(adapter);
      mcpManager = new MCPConfigManager(appAdapters);
    }
    return success;
  });

  ipcMain.handle('remove-custom-app', async (_, id: string) => {
    const customApp = await customAppStore.getApp(id);
    if (customApp) {
      const success = await customAppStore.removeApp(id);
      if (success) {
        appAdapters = appAdapters.filter(a => a.name !== customApp.name);
        mcpManager = new MCPConfigManager(appAdapters);
      }
      return success;
    }
    return false;
  });
}

