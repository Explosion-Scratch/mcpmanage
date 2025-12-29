import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as toml from 'smol-toml';
import { MCPServers, CustomAppConfig } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class CustomAppAdapter implements AppAdapter {
  name: string;
  icon: string;
  color: string;
  isCustom: boolean = true;
  
  private config: CustomAppConfig;
  
  constructor(config: CustomAppConfig) {
    this.config = config;
    this.name = config.name;
    this.icon = config.icon || 'ph:puzzle-piece-light';
    this.color = config.color || '#888888';
  }
  
  getPath(): string {
    return this.config.configPath.replace(/^~/, os.homedir());
  }
  
  async configExists(): Promise<boolean> {
    return true;
  }
  
  async getServers(): Promise<MCPServers> {
    const expandedPath = this.getPath();
    if (!fs.existsSync(expandedPath)) {
      return {};
    }

    try {
      if (this.config.configFormat === 'toml') {
        const content = await fs.promises.readFile(expandedPath, 'utf-8');
        const data = toml.parse(content) as any;
        return this.extractServers(data);
      } else {
        const data = await FileService.readJSON(expandedPath);
        return this.extractServers(data);
      }
    } catch (error) {
      console.error(`Error reading ${this.name} config:`, error);
      return {};
    }
  }
  
  private extractServers(data: any): MCPServers {
    if (!data) return {};
    
    const keyPath = this.config.configKey.split('.');
    let current = data;
    for (const key of keyPath) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return {};
      }
    }
    
    if (!current || typeof current !== 'object') return {};
    
    if (Array.isArray(current)) {
      const servers: MCPServers = {};
      for (const s of current) {
        if (s.name) {
          servers[s.name] = {
            command: s.command || '',
            args: s.args || [],
            env: s.env,
            settings: s,
          };
        }
      }
      return servers;
    }
    
    const servers: MCPServers = {};
    for (const [key, value] of Object.entries(current)) {
      const serverData = value as any;
      servers[key] = {
        command: serverData.command || '',
        args: serverData.args || [],
        env: serverData.env,
        settings: serverData.settings || serverData,
      };
    }
    return servers;
  }
  
  async setServers(servers: MCPServers): Promise<boolean> {
    const expandedPath = this.getPath();
    
    try {
      let data: any = {};
      
      if (fs.existsSync(expandedPath)) {
        if (this.config.configFormat === 'toml') {
          const content = await fs.promises.readFile(expandedPath, 'utf-8');
          data = toml.parse(content);
        } else {
          data = await FileService.readJSON(expandedPath) || {};
        }
      }
      
      const keyPath = this.config.configKey.split('.');
      let current = data;
      for (let i = 0; i < keyPath.length - 1; i++) {
        const key = keyPath[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }
      
      const finalKey = keyPath[keyPath.length - 1];
      const transformedServers: Record<string, any> = {};
      
      for (const [key, server] of Object.entries(servers)) {
        transformedServers[key] = {
          command: server.command,
          args: server.args || [],
          ...(server.env && { env: server.env }),
        };
      }
      
      current[finalKey] = transformedServers;
      
      const dir = path.dirname(expandedPath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      
      if (this.config.configFormat === 'toml') {
        const content = toml.stringify(data);
        await fs.promises.writeFile(expandedPath, content, 'utf-8');
      } else {
        await FileService.writeJSON(expandedPath, data);
      }
      
      return true;
    } catch (error) {
      console.error(`Error writing ${this.name} config:`, error);
      return false;
    }
  }
}
