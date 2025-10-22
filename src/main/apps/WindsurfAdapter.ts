import * as fs from 'fs';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class WindsurfAdapter implements AppAdapter {
  name = 'Windsurf';
  icon = 'https://codeium.com/favicon.ico';
  color = '#09B6A2';
  
  getPath(): string {
    return '~/Library/Application Support/Windsurf/mcp_server_config.json';
  }
  
  async configExists(): Promise<boolean> {
    const appPath = '/Applications/Windsurf.app';
    return fs.existsSync(appPath);
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
    if (!data.mcpServers) {
      data.mcpServers = {};
    }
    data.mcpServers = {
      ...data.mcpServers,
      ...servers
    };
    return await FileService.writeJSON(this.getPath(), data);
  }
}
