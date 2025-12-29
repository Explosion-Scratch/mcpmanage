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
  isCustom?: boolean;
}

export interface CustomAppConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  configPath: string;
  configFormat: 'json' | 'toml';
  configKey: string;
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
  applyToAll?: boolean;
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
  applyToAll?: boolean;
}


