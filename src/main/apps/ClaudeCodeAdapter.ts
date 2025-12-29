import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

/**
 * Adapter for Claude Code CLI (https://claude.ai/code)
 * 
 * Claude Code CLI is installed via: npm install -g @anthropic-ai/claude-code
 * MCP servers are configured in ~/.claude.json under the "mcpServers" field.
 * 
 * Config file locations:
 * - Global user config: ~/.claude.json
 * - Project-specific: .mcp.json (at project root)
 * - Settings: ~/.claude/settings.json
 * 
 * This adapter manages the global user configuration.
 */
export class ClaudeCodeAdapter implements AppAdapter {
  name = 'Claude Code';
  icon = 'https://claude.ai/favicon.ico';
  color = '#d97706';
  
  getPath(): string {
    return path.join(os.homedir(), '.claude.json');
  }
  
  async configExists(): Promise<boolean> {
    const configPath = this.getPath();
    if (!fs.existsSync(configPath)) {
      return false;
    }
    
    const data = await FileService.readJSON(configPath);
    return data !== null;
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
