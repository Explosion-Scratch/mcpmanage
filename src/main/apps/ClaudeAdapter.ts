import * as fs from 'fs';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class ClaudeAdapter implements AppAdapter {
  name = 'Claude Desktop';
  icon = 'https://www.claude.ai/favicon.ico';
  color = '#e28743';
  
  getPath(): string {
    return '~/Library/Application Support/Claude/claude_desktop_config.json';
  }
  
  async configExists(): Promise<boolean> {
    const appPath = '/Applications/Claude.app';
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
