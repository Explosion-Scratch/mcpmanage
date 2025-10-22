import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class QwenAdapter implements AppAdapter {
  name = 'Qwen Code CLI';
  icon = 'https://assets.alicdn.com/g/qwenweb/qwen-webui-fe/0.0.191/static/favicon.png';
  color = '#5f46e8';
  
  getPath(): string {
    return '~/.qwen/settings.json';
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

