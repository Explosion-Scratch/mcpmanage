import { MCPServer, MCPServers } from '../../shared/types';

export interface AppAdapter {
  name: string;
  icon: string;
  color: string;
  
  getPath(): string;
  
  configExists(): Promise<boolean>;
  
  getServers(): Promise<MCPServers>;
  
  setServers(servers: MCPServers): Promise<boolean>;
}
