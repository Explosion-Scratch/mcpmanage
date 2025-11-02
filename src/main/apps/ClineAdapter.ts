import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class ClineAdapter implements AppAdapter {
  name = 'Cline';
  icon = 'https://raw.githubusercontent.com/cline/cline/refs/heads/main/docs/assets/robot_panel_light.png';
  color = '#edab49';
  
  private getConfigPaths(): string[] {
    const homeDir = os.homedir();
    return [
      path.join(homeDir, 'Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'),
      path.join(homeDir, 'Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'),
      path.join(homeDir, 'Library/Application Support/VSCodium/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'),
    ];
  }
  
  private findExistingPath(): string | null {
    for (const configPath of this.getConfigPaths()) {
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }
    return null;
  }
  
  getPath(): string {
    const existingPath = this.findExistingPath();
    if (existingPath) {
      return existingPath;
    }
    return this.getConfigPaths()[0];
  }
  
  async configExists(): Promise<boolean> {
    return this.findExistingPath() !== null;
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


