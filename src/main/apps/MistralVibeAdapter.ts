import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as toml from 'smol-toml';
import { MCPServers } from '../../shared/types';
import { AppAdapter } from './AppAdapter';
import { FileService } from '../services/FileService';

export class MistralVibeAdapter implements AppAdapter {
  name = 'Mistral Vibe';
  icon = 'https://mistral.ai/favicon.ico';
  color = '#F3D0C1';

  getPath(): string {
    return path.join(os.homedir(), '.vibe/config.toml');
  }

  async configExists(): Promise<boolean> {
    return fs.existsSync(this.getPath());
  }

  async getServers(): Promise<MCPServers> {
    const expandedPath = this.getPath();
    if (!fs.existsSync(expandedPath)) {
      return {};
    }

    try {
      const content = await fs.promises.readFile(expandedPath, 'utf-8');
      const data = toml.parse(content) as any;
      const servers: MCPServers = {};

      if (data.mcp_servers && Array.isArray(data.mcp_servers)) {
        for (const s of data.mcp_servers) {
          if (s.name) {
            servers[s.name] = {
              command: s.command || '',
              args: s.args || [],
              env: s.env,
              settings: {
                transport: s.transport,
                url: s.url,
                headers: s.headers,
                api_key_env: s.api_key_env,
                api_key_header: s.api_key_header,
                api_key_format: s.api_key_format
              }
            };
          }
        }
      }

      return servers;
    } catch (error) {
      console.error('Error reading Mistral Vibe config:', error);
      return {};
    }
  }

  async setServers(servers: MCPServers): Promise<boolean> {
    const expandedPath = this.getPath();
    let data: any = {};

    try {
      if (fs.existsSync(expandedPath)) {
        const content = await fs.promises.readFile(expandedPath, 'utf-8');
        data = toml.parse(content);
      }

      const mcp_servers = Object.entries(servers).map(([name, server]) => {
        const mistralServer: any = {
          name,
          transport: server.settings?.transport || 'stdio',
          command: server.command,
          args: server.args,
          env: server.env
        };

        if (server.settings) {
          if (server.settings.url) mistralServer.url = server.settings.url;
          if (server.settings.headers) mistralServer.headers = server.settings.headers;
          if (server.settings.api_key_env) mistralServer.api_key_env = server.settings.api_key_env;
          if (server.settings.api_key_header) mistralServer.api_key_header = server.settings.api_key_header;
          if (server.settings.api_key_format) mistralServer.api_key_format = server.settings.api_key_format;
        }

        return mistralServer;
      });

      data.mcp_servers = mcp_servers;
      const newContent = toml.stringify(data);
      
      const dir = path.dirname(expandedPath);
      if (!fs.existsSync(dir)) {
        await fs.promises.mkdir(dir, { recursive: true });
      }
      
      await fs.promises.writeFile(expandedPath, newContent, 'utf-8');
      return true;
    } catch (error) {
      console.error('Error writing Mistral Vibe config:', error);
      return false;
    }
  }
}
