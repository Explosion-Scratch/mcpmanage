# MCP Manager - Features

## Overview

This document describes the features implemented in MCP Manager for managing MCP (Model Context Protocol) servers across multiple applications including Claude Desktop, Zed, Cursor, VSCode, and Windsurf.

## Application Interface

The MCP Manager provides a clean, Notion-like interface with three main sections:

### 1. Manage Servers (⌘1)
- View and manage all configured MCP servers
- Toggle servers on/off globally
- Add new servers with automatic command parsing
- Import servers from JSON configurations
- Click servers to view details and configure per-app settings

### 2. Manage Apps (⌘2)
- View all target applications
- Monitor application connection status
- Synchronize servers across applications
- View apps with custom syntax mappings

### 3. Studio (⌘3)
- Test MCP servers in a controlled environment
- Inspect available tools and parameters
- Execute tools with custom parameters
- Monitor real-time console output
- Analyze tool execution results

## Master Server List

### Purpose
A centralized storage system that maintains a master list of all MCP servers across all applications.

### Location
The master server list is stored in the user data directory:
- macOS: `~/Library/Application Support/Electron/mcp_servers.json`
- Windows: `%APPDATA%/Electron/mcp_servers.json`
- Linux: `~/.config/Electron/mcp_servers.json`

### Features
- **Automatic Synchronization**: Syncs servers from all configured applications on startup
- **Metadata Tracking**: Stores creation time, last update time, and app associations
- **Centralized Management**: Single source of truth for all MCP servers

## Exclusion Criteria

### Purpose
Allows applications to skip certain MCP servers based on defined criteria.

### Configuration
In `apps.json`, add exclusion rules to `syntax_mappings`:

```json
{
  "name": "Zed",
  "syntax_mappings": {
    "exclusions": [
      {
        "field": "source",
        "operator": "equals",
        "value": "custom"
      }
    ]
  }
}
```

### Supported Operators
- `equals`: Field value must match exactly
- `not_equals`: Field value must not match
- `contains`: String field must contain the value
- `not_contains`: String field must not contain the value
- `exists`: Field must exist
- `not_exists`: Field must not exist

### Use Cases

#### Zed Editor
Excludes servers with `source: "custom"` because these are installed through Zed's extension system.

```json
{
  "exclusions": [
    {
      "field": "source",
      "operator": "equals",
      "value": "custom"
    }
  ]
}
```

#### Custom Filtering
You can create complex filters:

```json
{
  "exclusions": [
    {
      "field": "command",
      "operator": "contains",
      "value": "deprecated"
    },
    {
      "field": "enabled",
      "operator": "equals",
      "value": false
    }
  ]
}
```

## Supported Applications

### 1. Claude Desktop
**Path**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Standard MCP configuration format
- Servers stored under `mcpServers` key
- No exclusions needed

### 2. Zed
**Path**: `~/.config/zed/settings.json`
- Servers stored under `context_servers` key
- Additional fields: `source`, `enabled`
- Excludes servers with `source: "custom"` (extension-installed)
- Custom syntax mapping required

**Configuration**:
```json
{
  "syntax_mappings": {
    "base": {
      ".mcpServers": ".context_servers"
    },
    "server": {
      "source": "custom",
      "env": null,
      "enabled": true
    },
    "exclusions": [
      {
        "field": "source",
        "operator": "equals",
        "value": "custom"
      }
    ]
  }
}
```

### 3. Cursor
**Path**: `~/Library/Application Support/Cursor/User/globalStorage/mcp.json`
- Standard MCP format
- Servers stored under `mcpServers` key
- No additional mappings needed

### 4. VSCode
**Path**: `~/Library/Application Support/Code/User/globalStorage/mcp.json`
- Standard MCP format
- Servers stored under `mcpServers` key
- No additional mappings needed

### 5. Windsurf
**Path**: `~/Library/Application Support/Windsurf/mcp_server_config.json`
- Standard MCP format
- Servers stored under `mcpServers` key
- No additional mappings needed

## New API Methods

### Frontend (Electron IPC)

#### `syncServers()`
Synchronizes all servers from application configs to the master store.

```typescript
await window.electronAPI.syncServers();
```

#### `getMasterServers()`
Retrieves all servers from the master store.

```typescript
const servers = await window.electronAPI.getMasterServers();
```

#### `updateMasterServer(id, updates)`
Updates a server in the master store.

```typescript
await window.electronAPI.updateMasterServer('server-id', {
  enabled: false,
  description: 'Updated description'
});
```

### Backend Services

#### MasterServerStore
Manages the centralized server list.

**Methods**:
- `getAllServers()`: Get all servers
- `getServer(id)`: Get single server
- `addServer(server)`: Add new server
- `updateServer(id, updates)`: Update server
- `removeServer(id)`: Remove server
- `toggleServer(id, enabled)`: Enable/disable server
- `addAppToServer(serverId, appName)`: Associate app with server
- `removeAppFromServer(serverId, appName)`: Disassociate app from server
- `syncFromAppConfigs(appServers)`: Sync from app configs

#### MCPConfigManager (Enhanced)
Handles application-specific configurations with filtering.

**New Methods**:
- `readAppConfig(app, includeExcluded)`: Read config with optional exclusion filtering
- `getAllServers(includeExcluded)`: Get all servers with optional exclusion filtering

**New Private Methods**:
- `matchesExclusion(server, criteria)`: Check if server matches exclusion rule
- `shouldExcludeServer(server, app)`: Check if server should be excluded for app

## Syncing Behavior

### On Startup
1. Application loads all configured apps from `apps.json`
2. Reads all servers from each app's configuration file
3. Syncs servers to master store
4. Merges app associations

### When Toggling a Server
1. **Global Toggle**: 
   - Updates all app configs
   - Updates master store
2. **App-Specific Toggle**:
   - Updates only specified app's config
   - Updates app association in master store
   - Removes server from master store if no apps remain

### When Adding a Server
1. Adds to specified apps (or all apps if none specified)
2. Adds to master store with app associations
3. Applies syntax mappings per app

### When Removing a Server
1. **Global Removal**:
   - Removes from all app configs
   - Removes from master store
2. **App-Specific Removal**:
   - Removes from specified app configs
   - Updates app associations in master store
   - Removes from master store if no apps remain

## Data Types

### MasterMCPServer
```typescript
interface MasterMCPServer extends MCPServer {
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
```

### ExclusionCriteria
```typescript
interface ExclusionCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'exists' | 'not_exists';
  value?: any;
}
```

### SyntaxMappings (Enhanced)
```typescript
interface SyntaxMappings {
  base?: Record<string, string>;
  server?: Record<string, any>;
  exclusions?: ExclusionCriteria[];
}
```

## UI Enhancements

### Apps View
- **Sync All Button**: Synchronizes all servers from app configs to master store
- **Exclusion Rules Display**: Shows number of exclusion rules per app
- **Custom Syntax Indicator**: Visual indicator for apps with custom syntax mappings
- **Application Detection**: Automatically detects and displays compatible applications

### Server Management
- **Real-time Toggling**: Server enable/disable now persists immediately
- **App Association Management**: Toggle server for specific apps in detail view
- **Master Store Integration**: All operations use centralized master store
- **Import from JSON**: Bulk import servers using standard mcpServers configuration format
- **Command Parsing**: Automatic parsing of bash commands into command and arguments

### Studio Mode
- **Interactive Testing**: Start/stop MCP servers for testing
- **Tool Inspection**: View available tools and their schemas
- **Parameter Configuration**: Dynamic form generation based on tool schemas
- **Console Monitoring**: Real-time console output and log viewing
- **Response Analysis**: View tool execution results with syntax highlighting

## Migration Notes

### For Existing Users
- On first launch with new version, all existing servers are automatically synced to master store
- No manual migration required
- Existing configurations remain unchanged

### For New Installations
- Master store is created automatically on first launch
- Servers detected from any configured app are added to master store
- Full synchronization happens automatically

## Technical Implementation

### File Structure
```
src/
├── main/
│   ├── services/
│   │   ├── MasterServerStore.ts    # New: Master server management
│   │   ├── MCPConfigManager.ts      # Enhanced: Exclusion filtering
│   │   └── FileService.ts
│   ├── data/
│   │   └── apps.json                # Enhanced: New apps + exclusions
│   └── main.ts                      # Enhanced: Master store integration
├── shared/
│   └── types.ts                     # Enhanced: New types
└── renderer/
    └── src/
        └── App.tsx                  # Enhanced: Master store usage
```

## Best Practices

### Adding New Applications
1. Add app configuration to `apps.json`
2. Define syntax mappings if needed
3. Add exclusion rules if applicable
4. Test sync functionality

### Creating Exclusion Rules
1. Identify unique characteristics of servers to exclude
2. Use specific field names from server objects
3. Test with `includeExcluded: true` to verify filtering
4. Document rules in app configuration

### Debugging
- Master store location: Check electron userData directory
- Enable developer tools to inspect IPC communication
- Check console for sync errors
- Verify app config paths are correct

## Future Enhancements

Potential future additions:
- Export/import master server list
- Conflict resolution for duplicate servers
- Server version tracking
- Automatic updates for MCP servers
- Custom server templates
- Backup and restore functionality
- Advanced filtering and search capabilities
- Server health monitoring


