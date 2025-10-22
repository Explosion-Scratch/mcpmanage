import * as fs from 'fs';
import { MCPServer, MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class ZedAdapter implements AppAdapter {
  name = 'Zed';
  icon = 'https://zed.dev/favicon_black_64.png';
  color = '#606266';
  
  getPath(): string {
    return '~/.config/zed/settings.json';
  }
  
  async configExists(): Promise<boolean> {
    return fs.existsSync('/Applications/Zed.app') || 
           fs.existsSync('/Applications/Zed Preview.app');
  }
  
  async getServers(): Promise<MCPServers> {
    const data = await FileService.readJSON(this.getPath());
    if (!data || !data.context_servers) {
      return {};
    }
    
    const servers: MCPServers = {};
    for (const [key, value] of Object.entries(data.context_servers)) {
      const zedServer = value as any;
      if (zedServer.source !== 'custom') {
        servers[key] = {
          command: zedServer.command || '',
          args: zedServer.args || [],
          source: zedServer.source || 'custom',
          env: zedServer.env || undefined,
          settings: zedServer.settings || undefined,
        };
      }
    }
    
    return servers;
  }
  
  async setServers(servers: MCPServers): Promise<boolean> {
    let data = await FileService.readJSON(this.getPath());
    if (!data) {
      data = {};
    }
    
    const existingContextServers = data.context_servers || {};
    const customServers: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(existingContextServers)) {
      const server = value as any;
      if (server.source === 'custom') {
        customServers[key] = value;
      }
    }
    
    const transformedServers: Record<string, any> = {};
    for (const [key, server] of Object.entries(servers)) {
      transformedServers[key] = {
        command: server.command,
        args: server.args,
        env: server.env || null,
        settings: server.settings || undefined,
        enabled: server.enabled ?? true,
      };
    }
    
    data.context_servers = {
      ...customServers,
      ...transformedServers,
    };
    
    return await FileService.writeJSON(this.getPath(), data);
  }
}
