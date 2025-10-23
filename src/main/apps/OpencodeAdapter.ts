import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MCPServers, MCPServer } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class OpencodeAdapter implements AppAdapter {
  name = 'opencode CLI';
  icon = 'https://github.com/sst/opencode/blob/dev/packages/identity/avatar-dark.png?raw=true';
  color = '#6366f1';
  
  getPath(): string {
    return '~/.config/opencode/opencode.json';
  }
  
  async configExists(): Promise<boolean> {
    const configPath = this.getPath().replace('~', os.homedir());
    const configDir = path.dirname(configPath);
    return fs.existsSync(configDir);
  }
  
  async getServers(): Promise<MCPServers> {
    const data = await FileService.readJSON(this.getPath());
    if (!data || !data.mcp) {
      return {};
    }
    
    const mcpServers: MCPServers = {};
    
    for (const [name, config] of Object.entries(data.mcp)) {
      const mcpConfig = config as any;
      
      if (mcpConfig.type === 'local') {
        const server: MCPServer = {
          command: mcpConfig.command?.[0] || '',
          args: mcpConfig.command?.slice(1) || [],
          env: mcpConfig.environment || {}
        };
        mcpServers[name] = server;
      }
    }
    
    return mcpServers;
  }
  
  async setServers(servers: MCPServers): Promise<boolean> {
    let data = await FileService.readJSON(this.getPath());
    if (!data) {
      data = {
        "$schema": "https://opencode.ai/config.json"
      };
    }
    
    const newMcp: Record<string, any> = {};
    
    for (const [name, config] of Object.entries(servers)) {
      newMcp[name] = {
        type: 'local',
        command: [config.command, ...(config.args || [])],
        enabled: true
      };
      if (config.env && Object.keys(config.env).length > 0) {
        newMcp[name].environment = config.env;
      }
    }
    
    data.mcp = newMcp;
    
    return await FileService.writeJSON(this.getPath(), data);
  }
}

