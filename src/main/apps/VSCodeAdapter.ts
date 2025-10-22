import * as fs from 'fs';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class VSCodeAdapter implements AppAdapter {
  name = 'VSCode';
  icon = 'https://code.visualstudio.com/favicon.ico';
  color = '#007acc';
  
  getPath(): string {
    return '~/Library/Application Support/Code/User/globalStorage/mcp.json';
  }
  
  async configExists(): Promise<boolean> {
    const appPath = '/Applications/Visual Studio Code.app';
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
