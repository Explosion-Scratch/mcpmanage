export interface MCPServer {
  command: string;
  args: string[];
  env?: Record<string, string>;
  settings?: Record<string, any>;
  source?: string;
  enabled?: boolean;
}

export interface MCPServers {
  [key: string]: MCPServer;
}

export interface MCPConfig {
  mcpServers: MCPServers;
}

export interface AppConfig {
  name: string;
  icon: string;
  color: string;
  syncEnabled?: boolean;
}

export interface ParsedCommand {
  command: string;
  args: string[];
}

export type PermissionLevel = 'always_ask' | 'allow';

export interface MasterMCPServer extends MCPServer {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  enabled: boolean;
  permissions: PermissionLevel;
  apps: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MCPServerWithMetadata extends MCPServer {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  iconUrl?: string;
  permissions: PermissionLevel;
  apps: string[];
}

