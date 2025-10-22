import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class QwenAdapter implements AppAdapter {
  name = 'Qwen Code CLI';
  icon = 'https://qianwen.aliyun.com/favicon.ico';
  color = '#5f46e8';
  
  getPath(): string {
    return '~/.config/qwen/config.json';
  }
  
  async configExists(): Promise<boolean> {
    const configPath = this.getPath().replace('~', os.homedir());
    const configDir = path.dirname(configPath);
    return fs.existsSync(configDir);
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

