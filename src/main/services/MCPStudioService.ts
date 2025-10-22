import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { MasterMCPServer } from '../../shared/types';

interface ActiveConnection {
  client: Client;
  transport: StdioClientTransport;
  server: MasterMCPServer;
}

export class MCPStudioService {
  private connections: Map<string, ActiveConnection> = new Map();

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

