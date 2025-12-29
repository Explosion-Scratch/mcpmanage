import * as fs from 'fs';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';
import path from 'path';
import os from 'os';

export class AntigravityAdapter implements AppAdapter {
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
    data.mcpServers = servers;
    return await FileService.writeJSON(this.getPath(), data);
  }
}
