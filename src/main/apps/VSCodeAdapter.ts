import * as fs from 'fs';
import { MCPServer, MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';
import path from 'path';
import os from 'os';

export class VSCodeAdapter implements AppAdapter {
  name = 'VSCode';
  icon = 'https://code.visualstudio.com/favicon.ico';
  color = '#007acc';
  
  getPath(): string {
    return path.join(os.homedir(), 'Library/Application Support/Code/User/mcp.json');
  }
  
  async configExists(): Promise<boolean> {
    const appPath = '/Applications/Visual Studio Code.app';
    return fs.existsSync(appPath);
  }
  
  async getServers(): Promise<MCPServers> {
    const data = await FileService.readJSON(this.getPath());
    if (!data || !data.servers) {
      return {};
    }
    
    const servers: MCPServers = {};
    for (const [key, value] of Object.entries(data.servers)) {
      const vsServer = value as any;
      if (vsServer.command) {
        servers[key] = {
          command: vsServer.command,
          args: vsServer.args || [],
          env: vsServer.env,
          settings: {
            type: vsServer.type,
            url: vsServer.url,
            headers: vsServer.headers,
            gallery: vsServer.gallery,
            version: vsServer.version,
          },
        };
      } else if (vsServer.type === 'http' && vsServer.url) {
        servers[key] = {
          command: '',
          args: [],
          settings: {
            type: vsServer.type,
            url: vsServer.url,
            headers: vsServer.headers,
            gallery: vsServer.gallery,
            version: vsServer.version,
          },
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
    
    const existingServers = data.servers || {};
    const transformedServers: Record<string, any> = {};
    
    for (const [key, server] of Object.entries(servers)) {
      const isStreamingViaTransport = server.transportType && server.transportType !== 'stdio' && server.url;
      const isStreamingViaSettings = server.settings?.type === 'http' && server.settings?.url;
      
      if (isStreamingViaTransport) {
        const vsType = server.transportType === 'sse' ? 'sse' : 'http';
        transformedServers[key] = {
          type: vsType,
          url: server.url,
          ...(server.env && { env: server.env }),
        };
      } else if (isStreamingViaSettings) {
        transformedServers[key] = {
          type: server.settings!.type,
          url: server.settings!.url,
          ...(server.settings!.headers && { headers: server.settings!.headers }),
          ...(server.settings!.gallery && { gallery: server.settings!.gallery }),
          ...(server.settings!.version && { version: server.settings!.version }),
        };
      } else if (server.command) {
        transformedServers[key] = {
          command: server.command,
          args: server.args || [],
          ...(server.env && { env: server.env }),
        };
      }
    }
    
    for (const [key, value] of Object.entries(existingServers)) {
      if (!transformedServers[key]) {
        const existing = value as any;
        // Only preserve servers that McpManage does not support (and thus didn't read)
        // If it supports them (stdio or http), their absence means they were deleted.
        const isSupported = !!existing.command || (existing.type === 'http' && !!existing.url);
        
        if (!isSupported) {
          transformedServers[key] = existing;
        }
      }
    }
    
    data.servers = transformedServers;
    return await FileService.writeJSON(this.getPath(), data);
  }
}
