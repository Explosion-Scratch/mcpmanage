import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { MasterMCPServer } from '../../shared/types';
import { BrowserWindow } from 'electron';

interface ActiveConnection {
  client: Client;
  transport: StdioClientTransport;
  server: MasterMCPServer;
  onStdout?: (data: string) => void;
}

export class MCPStudioService {
  private connections: Map<string, ActiveConnection> = new Map();
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  private sendLog(serverId: string, message: string) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('studio:log', serverId, message);
    }
  }

  async startServer(server: MasterMCPServer): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.connections.has(server.id)) {
        await this.stopServer(server.id);
      }

      const client = new Client({
        name: 'mcp-studio-client',
        version: '1.0.0',
      }, {
        capabilities: {}
      });

      const transport = new StdioClientTransport({
        command: server.command,
        args: server.args,
        env: server.env,
      });

      const attachProcessListeners = () => {
        const process = (transport as any)._process;
        if (!process) {
          setTimeout(attachProcessListeners, 50);
          return;
        }

        if (process.stderr) {
          process.stderr.on('data', (data: Buffer) => {
            const message = data.toString();
            if (message) {
              const lines = message.split('\n').filter(line => line.trim());
              lines.forEach(line => this.sendLog(server.id, line));
            }
          });
        }

        if (process.stdout) {
          const stdoutBuffer: string[] = [];
          process.stdout.on('data', (data: Buffer) => {
            const message = data.toString();
            stdoutBuffer.push(message);
            
            const combined = stdoutBuffer.join('');
            const lines = combined.split('\n');
            
            stdoutBuffer.length = 0;
            if (lines[lines.length - 1] !== '') {
              stdoutBuffer.push(lines.pop()!);
            }
            
            lines.forEach(line => {
              const trimmed = line.trim();
              if (trimmed && !trimmed.startsWith('{"jsonrpc"') && !trimmed.startsWith('Content-Length:')) {
                this.sendLog(server.id, line);
              }
            });
          });
        }
      };

      attachProcessListeners();

      await client.connect(transport);

      this.connections.set(server.id, {
        client,
        transport,
        server,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async stopServer(serverId: string): Promise<boolean> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      return false;
    }

    try {
      await connection.client.close();
      this.connections.delete(serverId);
      return true;
    } catch (error) {
      this.connections.delete(serverId);
      return false;
    }
  }

  async listTools(serverId: string): Promise<Tool[]> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error('Server not started');
    }

    try {
      const result = await connection.client.listTools();
      return result.tools;
    } catch (error) {
      throw new Error(
        `Failed to list tools: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async callTool(
    serverId: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<CallToolResult> {
    const connection = this.connections.get(serverId);
    if (!connection) {
      throw new Error('Server not started');
    }

    try {
      const result = await connection.client.callTool({
        name: toolName,
        arguments: args,
      });
      return result;
    } catch (error) {
      throw new Error(
        `Failed to call tool: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  isServerRunning(serverId: string): boolean {
    return this.connections.has(serverId);
  }

  stopAllServers(): void {
    for (const [serverId] of this.connections) {
      this.stopServer(serverId);
    }
  }
}

