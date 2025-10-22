import { MCPConfig, MCPServer, MCPServers, ParsedCommand } from '../../shared/types';
import { AppAdapter } from '../apps/AppAdapter';

export class MCPConfigManager {
  private adapters: AppAdapter[];

  constructor(adapters: AppAdapter[]) {
    this.adapters = adapters;
  }

  getAdapters(): AppAdapter[] {
    return this.adapters;
  }

  parseCommand(command: string): ParsedCommand {
    const parts = command.trim().split(/\s+/);
    if (parts.length === 0) {
      throw new Error('Empty command');
    }
    
    return {
      command: parts[0],
      args: parts.slice(1)
    };
  }

  async readAppConfig(adapter: AppAdapter): Promise<MCPServers> {
    return await adapter.getServers();
  }

  async writeAppConfig(adapter: AppAdapter, servers: MCPServers): Promise<boolean> {
    return await adapter.setServers(servers);
  }

  async getAllServers(): Promise<Record<string, MCPServer & { apps: string[] }>> {
    const allServers: Record<string, MCPServer & { apps: string[] }> = {};
    
    for (const adapter of this.adapters) {
      const servers = await this.readAppConfig(adapter);
      
      for (const [key, server] of Object.entries(servers)) {
        if (allServers[key]) {
          if (!allServers[key].apps.includes(adapter.name)) {
            allServers[key].apps.push(adapter.name);
          }
        } else {
          allServers[key] = { ...server, apps: [adapter.name] };
        }
      }
    }
    
    return allServers;
  }

  async addServer(
    name: string,
    server: MCPServer,
    appNames?: string[]
  ): Promise<boolean> {
    const targetAdapters = appNames
      ? this.adapters.filter(adapter => appNames.includes(adapter.name))
      : this.adapters;

    let success = true;
    
    for (const adapter of targetAdapters) {
      const servers = await this.readAppConfig(adapter);
      servers[name] = server;
      
      const written = await this.writeAppConfig(adapter, servers);
      if (!written) {
        success = false;
      }
    }
    
    return success;
  }

  async updateServer(
    name: string,
    server: MCPServer,
    appNames?: string[]
  ): Promise<boolean> {
    return await this.addServer(name, server, appNames);
  }

  async removeServer(name: string, appNames?: string[]): Promise<boolean> {
    const targetAdapters = appNames
      ? this.adapters.filter(adapter => appNames.includes(adapter.name))
      : this.adapters;

    let success = true;
    
    for (const adapter of targetAdapters) {
      const servers = await this.readAppConfig(adapter);
      delete servers[name];
      
      const written = await this.writeAppConfig(adapter, servers);
      if (!written) {
        success = false;
      }
    }
    
    return success;
  }

  async toggleServer(name: string, enabled: boolean, server: MCPServer, appNames?: string[]): Promise<boolean> {
    if (enabled) {
      return await this.addServer(name, server, appNames);
    } else {
      return await this.removeServer(name, appNames);
    }
  }
}
