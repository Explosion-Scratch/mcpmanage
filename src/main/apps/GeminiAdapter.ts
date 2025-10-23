import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class GeminiAdapter implements AppAdapter {
  name = 'Gemini CLI';
  icon = 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png';
  color = '#4285f4';
  
  getPath(): string {
    return '~/.gemini/settings.json';
  }
  
  async configExists(): Promise<boolean> {
    const configPath = this.getPath().replace('~', os.homedir());
    return fs.existsSync(configPath);
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
