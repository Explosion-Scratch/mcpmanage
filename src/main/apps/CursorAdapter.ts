import * as fs from 'fs';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class CursorAdapter implements AppAdapter {
  name = 'Cursor';
  icon = 'https://www.cursor.com/favicon.ico';
  color = '#000000';
  
  getPath(): string {
    return '~/Library/Application Support/Cursor/User/globalStorage/mcp.json';
  }
  
  async configExists(): Promise<boolean> {
    const appPath = '/Applications/Cursor.app';
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
    data.mcpServers = servers;
    return await FileService.writeJSON(this.getPath(), data);
  }
}
