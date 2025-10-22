import { app } from 'electron';
import * as path from 'path';
import { FileService } from './FileService';
import { MasterMCPServer, MCPServer, PermissionLevel } from '../../shared/types';

export class MasterServerStore {
  private storePath: string;
  private servers: Map<string, MasterMCPServer> = new Map();
  private initialized: Promise<void>;

  constructor() {
    this.storePath = path.join(app.getPath('userData'), 'mcp_servers.json');
    this.initialized = this.initializeStore();
  }

  private async initializeStore(): Promise<void> {
    await FileService.ensureFile(this.storePath, { servers: [] });
    await this.load();
  }

  private async load(): Promise<void> {
    const data = await FileService.readJSON(this.storePath);
    if (data && data.servers) {
      this.servers.clear();
      for (const server of data.servers) {
        this.servers.set(server.id, server);
      }
    }
  }

  private async save(): Promise<boolean> {
    const data = {
      servers: Array.from(this.servers.values()),
      lastUpdated: Date.now()
    };
    return await FileService.writeJSON(this.storePath, data);
  }

  async getAllServers(): Promise<MasterMCPServer[]> {
    await this.initialized;
    return Array.from(this.servers.values());
  }

  async getServer(id: string): Promise<MasterMCPServer | undefined> {
    await this.initialized;
    return this.servers.get(id);
  }

  async addServer(server: Omit<MasterMCPServer, 'createdAt' | 'updatedAt'>): Promise<boolean> {
    await this.initialized;
    const now = Date.now();
    const newServer: MasterMCPServer = {
      ...server,
      createdAt: now,
      updatedAt: now
    };
    this.servers.set(server.id, newServer);
    return await this.save();
  }

  async updateServer(id: string, updates: Partial<MasterMCPServer>): Promise<boolean> {
    await this.initialized;
    const existing = this.servers.get(id);
    if (!existing) return false;

    const updated: MasterMCPServer = {
      ...existing,
      ...updates,
      id,
      updatedAt: Date.now()
    };
    this.servers.set(id, updated);
    return await this.save();
  }

  async removeServer(id: string): Promise<boolean> {
    await this.initialized;
    if (!this.servers.has(id)) return false;
    this.servers.delete(id);
    return await this.save();
  }

  async toggleServer(id: string, enabled: boolean): Promise<boolean> {
    return await this.updateServer(id, { enabled });
  }

  async addAppToServer(serverId: string, appName: string): Promise<boolean> {
    await this.initialized;
    const server = this.servers.get(serverId);
    if (!server) return false;

    if (!server.apps.includes(appName)) {
      server.apps.push(appName);
      server.updatedAt = Date.now();
      return await this.save();
    }
    return true;
  }

  async removeAppFromServer(serverId: string, appName: string): Promise<boolean> {
    await this.initialized;
    const server = this.servers.get(serverId);
    if (!server) return false;

    const index = server.apps.indexOf(appName);
    if (index !== -1) {
      server.apps.splice(index, 1);
      server.updatedAt = Date.now();
      return await this.save();
    }
    return true;
  }

  async syncFromAppConfigs(appServers: Record<string, MCPServer & { apps: string[] }>): Promise<void> {
    await this.initialized;
    for (const [id, serverData] of Object.entries(appServers)) {
      const existing = this.servers.get(id);
      
      if (!existing) {
        const now = Date.now();
        const newServer: MasterMCPServer = {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          command: serverData.command,
          args: serverData.args,
          env: serverData.env,
          settings: serverData.settings,
          source: serverData.source,
          enabled: serverData.enabled ?? true,
          permissions: 'always_ask',
          apps: serverData.apps,
          iconUrl: undefined,
          description: undefined,
          createdAt: now,
          updatedAt: now
        };
        this.servers.set(id, newServer);
        await this.save();
      } else {
        const existingApps = Array.isArray(existing.apps) ? existing.apps : [];
        const mergedApps = Array.from(new Set([...existingApps, ...serverData.apps]));
        if (mergedApps.length !== existingApps.length || 
            JSON.stringify(mergedApps.sort()) !== JSON.stringify(existingApps.sort())) {
          const updated: MasterMCPServer = {
            ...existing,
            apps: mergedApps,
            updatedAt: Date.now()
          };
          this.servers.set(id, updated);
          await this.save();
        }
      }
    }
  }
}

