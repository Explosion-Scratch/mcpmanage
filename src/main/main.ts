import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { MCPConfigManager } from './services/MCPConfigManager';
import { MasterServerStore } from './services/MasterServerStore';
import { MCPStudioService } from './services/MCPStudioService';
import { AppConfig, MCPServer, MasterMCPServer, PermissionLevel } from '../shared/types';
import { getAvailableAdapters, AppAdapter } from './apps';

let mainWindow: BrowserWindow | null = null;
let mcpManager: MCPConfigManager;
let masterStore: MasterServerStore;
let mcpStudioService: MCPStudioService;
let appAdapters: AppAdapter[] = [];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  }
}

app.whenReady().then(async () => {
  appAdapters = await getAvailableAdapters();
  mcpManager = new MCPConfigManager(appAdapters);
  masterStore = new MasterServerStore();
  mcpStudioService = new MCPStudioService();
  
  const appServers = await mcpManager.getAllServers();
  await masterStore.syncFromAppConfigs(appServers);
  
  setupIPCHandlers();
  createWindow();

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
    return appAdapters.map(adapter => ({
      name: adapter.name,
      icon: adapter.icon,
      color: adapter.color,
    } as AppConfig));
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
    const appServers = await mcpManager.getAllServers();
    await masterStore.syncFromAppConfigs(appServers);
    return await masterStore.getAllServers();
  });

  ipcMain.handle('get-master-servers', async () => {
    return await masterStore.getAllServers();
  });

  ipcMain.handle('update-master-server', async (_, id: string, updates: Partial<MasterMCPServer>) => {
    return await masterStore.updateServer(id, updates);
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
}

