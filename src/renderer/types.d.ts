import { AppConfig, MCPServer, MCPServers, ParsedCommand, MasterMCPServer } from '../shared/types';

interface MCPTool {
  name: string;
  description?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

interface MCPToolResult {
  content: Array<{
    type: string;
    text?: string;
    [key: string]: any;
  }>;
  isError?: boolean;
}

declare global {
  interface Window {
    electronAPI: {
      getApps: () => Promise<AppConfig[]>;
      getAllServers: () => Promise<MasterMCPServer[]>;
      getAppServers: (appName: string) => Promise<MCPServers>;
      addServer: (name: string, command: string, env?: Record<string, string>, appNames?: string[]) => Promise<boolean>;
      updateServer: (name: string, command: string, env?: Record<string, string>, appNames?: string[]) => Promise<boolean>;
      removeServer: (name: string, appNames?: string[]) => Promise<boolean>;
      toggleServer: (name: string, enabled: boolean, appNames?: string[]) => Promise<boolean>;
      parseCommand: (command: string) => Promise<ParsedCommand>;
      syncServers: () => Promise<MasterMCPServer[]>;
      getMasterServers: () => Promise<MasterMCPServer[]>;
      updateMasterServer: (id: string, updates: Partial<MasterMCPServer>) => Promise<boolean>;
      studioStartServer: (serverId: string) => Promise<{ success: boolean; error?: string }>;
      studioStopServer: (serverId: string) => Promise<boolean>;
      studioListTools: (serverId: string) => Promise<MCPTool[]>;
      studioCallTool: (serverId: string, toolName: string, args: Record<string, unknown>) => Promise<MCPToolResult>;
      studioIsServerRunning: (serverId: string) => Promise<boolean>;
    };
  }
}

export {};

