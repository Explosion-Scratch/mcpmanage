import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { MasterMCPServer, TransportType } from '../../shared/types';
import { BrowserWindow } from 'electron';

interface ActiveConnection {
  client: Client;
  transport: Transport;
  server: MasterMCPServer;
  transportType: TransportType;
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

  private createTransport(server: MasterMCPServer): { transport: Transport; transportType: TransportType } {
    const transportType = server.transportType || 'stdio';

    switch (transportType) {
      case 'streamable-http': {
        if (!server.url) {
          throw new Error('URL is required for Streamable HTTP transport');
        }
        const transport = new StreamableHTTPClientTransport(new URL(server.url));
        transport.onerror = (error) => {
          this.sendLog(server.id, `[Error] ${error.message}`);
        };
        transport.onclose = () => {
          this.sendLog(server.id, '[Connection] Transport closed');
        };
        return { transport, transportType };
      }

      case 'sse': {
        if (!server.url) {
          throw new Error('URL is required for SSE transport');
        }
        const transport = new SSEClientTransport(new URL(server.url));
        transport.onerror = (error) => {
          this.sendLog(server.id, `[Error] ${error.message}`);
        };
        transport.onclose = () => {
          this.sendLog(server.id, '[Connection] Transport closed');
        };
        return { transport, transportType };
      }

      case 'stdio':
      default: {
        const transport = new StdioClientTransport({
          command: server.command,
          args: server.args,
          env: server.env,
        });
        return { transport, transportType: 'stdio' };
      }
    }
  }

  private attachStdioListeners(transport: StdioClientTransport, serverId: string) {
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
            lines.forEach(line => this.sendLog(serverId, line));
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
              this.sendLog(serverId, line);
            }
          });
        });
      }
    };

    attachProcessListeners();
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

      const { transport, transportType } = this.createTransport(server);

      if (transportType === 'stdio') {
        this.attachStdioListeners(transport as StdioClientTransport, server.id);
      } else {
        this.sendLog(server.id, `[Connection] Connecting to ${server.url} via ${transportType}...`);
      }

      await client.connect(transport);

      if (transportType !== 'stdio') {
        this.sendLog(server.id, '[Connection] Connected successfully');
      }

      this.connections.set(server.id, {
        client,
        transport,
        server,
        transportType,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.sendLog(server.id, `[Error] Failed to start: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
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
      return result as CallToolResult;
    } catch (error) {
      throw new Error(
        `Failed to call tool: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  isServerRunning(serverId: string): boolean {
    return this.connections.has(serverId);
  }

  getConnectionType(serverId: string): TransportType | null {
    const connection = this.connections.get(serverId);
    return connection ? connection.transportType : null;
  }

  stopAllServers(): void {
    for (const [serverId] of this.connections) {
      this.stopServer(serverId);
    }
  }
}
