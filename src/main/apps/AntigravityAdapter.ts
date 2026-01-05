import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { MCPServers } from '../../shared/types';
import { VSCodeAdapter } from './VSCodeAdapter';
import { FileService } from '../services/FileService';
import { createMcpRemoteConfig } from '../utils/packageRunner';

export class AntigravityAdapter extends VSCodeAdapter {
  name = 'Google Antigravity';
  icon = 'https://antigravity.google/favicon.ico';
  color = '#1a73e8';
  
  getPath(): string {
    return path.join(os.homedir(), '.gemini/antigravity/mcp_config.json');
  }
  
  async configExists(): Promise<boolean> {
    return fs.existsSync(this.getPath());
  }
  
  async getServers(): Promise<MCPServers> {
    const data = await FileService.readJSON(this.getPath());
    if (!data || !data.mcpServers) {
      return {};
    }
    return data.mcpServers;
  }
  
  async setServers(servers: MCPServers): Promise<boolean> {
    let data = await FileService.readJSON(this.getPath());
    if (!data) {
      data = {};
    }
    
    const transformedServers: Record<string, any> = {};
    
    for (const [key, server] of Object.entries(servers)) {
      const isStreamingViaTransport = server.transportType && server.transportType !== 'stdio' && server.url;
      const isStreamingViaSettings = server.settings?.type === 'http' && server.settings?.url;
      
      if (isStreamingViaTransport && server.url) {
        const remoteConfig = createMcpRemoteConfig(server.url, server.settings?.headers);
        transformedServers[key] = {
          command: remoteConfig.command,
          args: remoteConfig.args,
          ...(server.env && { env: server.env }),
        };
      } else if (isStreamingViaSettings) {
        const remoteConfig = createMcpRemoteConfig(server.settings!.url, server.settings?.headers);
        transformedServers[key] = {
          command: remoteConfig.command,
          args: remoteConfig.args,
          ...(server.env && { env: server.env }),
        };
      } else if (server.command) {
        transformedServers[key] = {
          command: server.command,
          args: server.args || [],
          ...(server.env && { env: server.env }),
        };
      }
    }
    
    data.mcpServers = transformedServers;
    return await FileService.writeJSON(this.getPath(), data);
  }
}

