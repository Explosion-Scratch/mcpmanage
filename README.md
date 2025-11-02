# MCP Manager

Electron application for managing MCP (Model Context Protocol) servers across different applications.

## Features

- **Notion-like UI**: Clean, minimal, professional interface
- **Master Server List**: Centralized storage for all MCP servers with automatic synchronization
- **Server Management**: Add, update, remove, and toggle MCP servers
- **Multi-App Sync**: Automatically sync servers across multiple applications
- **Exclusion Rules**: Filter servers based on custom criteria (e.g., exclude Zed extension-installed servers)
- **JSON Comments**: Support for commented JSON configuration files
- **Syntax Mappings**: Handle different JSON structures for different apps
- **Command Parsing**: Automatically parse bash commands
- **Studio Mode**: Test and debug MCP servers with tool inspection
- **Path Expansion**: Automatic home directory (~) expansion

## Supported Applications

- **Claude Desktop**: Standard MCP configuration
- **Zed**: Context servers with exclusion rules for extension-managed servers
- **Cursor**: Global MCP configuration
- **VSCode**: Global MCP configuration
- **Windsurf**: MCP configuration support

## Installation

```bash
bun install
```

## Development

```bash
bun run dev
```

## Build

```bash
bun run build
```

## UI Overview

### Manage Servers
- View all configured MCP servers
- Toggle servers on/off
- Add new servers with automatic command parsing
- Import servers from JSON
- Click any server to view details and configure per-app settings

### Manage Apps
- View all target applications
- See file paths and connection status
- Apps with custom syntax mappings are marked

### Studio
- Start/stop MCP servers
- View available tools
- Test tool execution
- Monitor console logs

## Architecture

### Backend Services

- **MasterServerStore**: Centralized storage for all MCP servers
  - Maintains master list in user data directory
  - Tracks server metadata (creation time, updates, app associations)
  - Automatic synchronization with app configurations
- **MCPConfigManager**: Core service for managing MCP configurations across different apps
  - Supports syntax mappings for different JSON structures
  - Handles server CRUD operations with exclusion filtering
  - Syncs changes across multiple configuration files
- **FileService**: Handles file I/O operations with path expansion and comment-aware JSON parsing
- **JSONParser**: Custom parser that strips comments from JSON files

### Configuration

Apps are configured in `src/main/data/apps.json` (supports comments):

```json
[
  {
    "name": "Claude Desktop",
    "icon": "https://www.claude.ai/favicon.ico",
    "color": "#e28743",
    "path": "~/Library/Application Support/Claude/claude_desktop_config.json"
  },
  {
    "name": "Zed",
    "icon": "https://www.zed.dev/favicon.ico",
    "color": "#606266",
    "path": "~/.config/zed/settings.json",
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
]
```

### Exclusion Rules

Exclude servers from specific apps based on criteria:

**Supported Operators:**
- `equals`: Field value must match exactly
- `not_equals`: Field value must not match
- `contains`: String field must contain the value
- `not_contains`: String field must not contain the value
- `exists`: Field must exist
- `not_exists`: Field must not exist

**Example Use Case:**
Zed excludes servers with `source: "custom"` because they're installed through Zed's extension system.

### IPC API

- `get-apps`: Get all configured applications
- `get-all-servers`: Get all MCP servers from master store
- `get-app-servers`: Get servers for a specific app
- `add-server`: Add a new MCP server
- `update-server`: Update an existing server
- `remove-server`: Remove a server
- `toggle-server`: Enable/disable a server (globally or per-app)
- `parse-command`: Parse a bash command into command and args
- `sync-servers`: Sync all servers from app configs to master store
- `get-master-servers`: Get all servers from master store
- `update-master-server`: Update server metadata in master store

## Advanced Features

For detailed information about the master server list, exclusion rules, and syncing behavior, see [FEATURES.md](./FEATURES.md).
