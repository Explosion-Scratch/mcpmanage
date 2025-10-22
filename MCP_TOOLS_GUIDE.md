# MCP Tools Configuration Guide

This guide provides configuration details for various MCP-compatible tools based on research of their implementations.

## Table of Contents
- [Zed Editor](#zed-editor)
- [Claude Desktop](#claude-desktop)
- [Cursor IDE](#cursor-ide)
- [VSCode](#vscode)
- [Gemini CLI](#gemini-cli)
- [Qwen CLI](#qwen-cli)
- [OpenCode](#opencode)

---

## Zed Editor

### Configuration Location
- macOS/Linux: `~/.config/zed/settings.json`
- Windows: `%APPDATA%\Zed\settings.json`

### Format
```json
{
  "context_servers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "value"
      },
      "source": "custom",
      "enabled": true
    }
  }
}
```

### Key Characteristics
- Uses `context_servers` instead of `mcpServers`
- Includes `source` field to indicate installation method:
  - `"custom"`: User-installed via settings
  - `"extension"`: Installed via Zed's extension system
- Has `enabled` boolean for toggling servers
- Requires `env: null` if no environment variables

### Exclusion Strategy
MCP Manager excludes servers with `source: "custom"` when reading Zed's config, as these are managed by Zed's extension system and shouldn't be displayed in the manager.

### Agent Settings
```json
{
  "agent": {
    "always_allow_tool_actions": true,
    "default_profile": "write"
  }
}
```

---

## Claude Desktop

### Configuration Location
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

### Format
```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "value"
      }
    }
  }
}
```

### Key Characteristics
- Standard MCP format
- Simple structure with `command`, `args`, and optional `env`
- No additional metadata fields
- Most widely adopted format

---

## Cursor IDE

### Configuration Location
- macOS: `~/Library/Application Support/Cursor/User/globalStorage/mcp.json`
- Windows: `%APPDATA%\Cursor\User\globalStorage\mcp.json`
- Linux: `~/.config/Cursor/User/globalStorage/mcp.json`

### Format
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name"],
      "env": {}
    }
  }
}
```

### Key Characteristics
- Uses standard MCP format
- Typically uses `npx` for package execution
- Can have project-specific configurations
- Integrates with Cursor's AI features

### Project-Specific Config
Cursor also supports `.cursor/mcp.json` for project-level servers.

---

## VSCode

### Configuration Location
- macOS: `~/Library/Application Support/Code/User/globalStorage/mcp.json`
- Windows: `%APPDATA%\Code\User\globalStorage\mcp.json`
- Linux: `~/.config/Code/User/globalStorage/mcp.json`

### Format
```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {}
    }
  }
}
```

### Key Characteristics
- Standard MCP format
- Similar structure to Cursor
- Can integrate with VSCode extensions
- Supports workspace-specific configurations

---

## Gemini CLI

### Configuration Location
- Typically: `~/.gemini/config.json` or project-specific

### Format
```json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["path/to/server.js"],
      "env": {
        "API_KEY": "value"
      },
      "transport": "stdio"
    }
  }
}
```

### Key Characteristics
- May include `transport` field specifying communication method
- Supports multiple transport types: `stdio`, `sse`, `websocket`
- CLI-focused configuration
- May support multiple MCP servers with different transports

### Example with Multiple Transports
```json
{
  "mcpServers": {
    "local-server": {
      "command": "node",
      "args": ["server.js"],
      "transport": "stdio"
    },
    "remote-server": {
      "url": "https://example.com/mcp",
      "transport": "sse",
      "apiKey": "key"
    }
  }
}
```

---

## Qwen CLI

### Configuration Location
- Similar to Gemini CLI, may vary based on installation

### Format
```json
{
  "mcpServers": {
    "server-name": {
      "command": "python",
      "args": ["-m", "mcp_server"],
      "env": {},
      "enabled": true
    }
  }
}
```

### Key Characteristics
- Fork of Gemini CLI with enhancements
- Dynamic MCP server management
- Interactive dialogs for server installation
- AI-powered installation process
- Multilingual support
- May include `enabled` field for toggling

### Dynamic Installation
Qwen CLI supports browsing and installing MCP servers interactively:
- Browse available servers
- Search by name or functionality
- AI-assisted installation
- Automatic configuration updates

---

## OpenCode

### Configuration Location
- Depends on installation method
- May use project-specific or global config

### Format
```json
{
  "mcpServers": {
    "server-name": {
      "command": "/path/to/executable",
      "args": [],
      "env": {}
    }
  }
}
```

### Key Characteristics
- May use absolute paths for executables
- Similar to standard MCP format
- Integration with AI coding workflows

---

## Common Patterns

### Standard MCP Server Structure
All MCP-compatible tools share a common base structure:

```typescript
interface MCPServer {
  command: string;        // Executable command
  args: string[];         // Command arguments
  env?: Record<string, string>;  // Environment variables
}
```

### Additional Fields by Tool

| Tool | Additional Fields | Purpose |
|------|------------------|---------|
| Zed | `source`, `enabled` | Track installation source and state |
| Gemini CLI | `transport` | Specify communication protocol |
| Qwen CLI | `enabled` | Toggle servers on/off |
| Others | `settings` | Tool-specific configuration |

---

## Migration Between Tools

### From Claude Desktop to Zed
```javascript
// Claude format
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}

// Zed format
{
  "context_servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem"],
      "source": "custom",
      "env": null,
      "enabled": true
    }
  }
}
```

### From Gemini CLI to Cursor
```javascript
// Gemini format
{
  "mcpServers": {
    "server": {
      "command": "node",
      "args": ["server.js"],
      "transport": "stdio"
    }
  }
}

// Cursor format (transport removed)
{
  "mcpServers": {
    "server": {
      "command": "node",
      "args": ["server.js"],
      "env": {}
    }
  }
}
```

---

## Best Practices

### 1. Environment Variables
Always use environment variables for sensitive data:
```json
{
  "env": {
    "API_KEY": "${API_KEY}",
    "SECRET": "${SECRET}"
  }
}
```

### 2. Path Resolution
Use absolute paths or well-known executables:
```json
{
  "command": "node",  // Good: relies on PATH
  "command": "/usr/local/bin/node"  // Good: absolute path
}
```

### 3. Argument Formatting
Keep arguments clean and properly escaped:
```json
{
  "args": [
    "-y",
    "@modelcontextprotocol/server-name",
    "--option",
    "value"
  ]
}
```

### 4. Testing Configurations
Always test new MCP server configurations:
1. Verify command is accessible
2. Check environment variables are set
3. Test server initialization
4. Verify tool availability

---

## Troubleshooting

### Server Not Loading
1. Check command path is correct
2. Verify all required arguments
3. Ensure environment variables are set
4. Check file permissions
5. Review application logs

### Excluded Servers
If a server doesn't appear in MCP Manager:
1. Check if it matches exclusion criteria
2. Verify the `source` field (for Zed)
3. Look for custom metadata fields
4. Check master store sync status

### Sync Issues
1. Run manual sync from Apps view
2. Check file paths are correct
3. Verify JSON syntax is valid
4. Review exclusion rules

---

## Resources

### Official Documentation
- [MCP Specification](https://modelcontextprotocol.io/)
- [Zed MCP Docs](https://zed.dev/docs/ai/mcp)
- [Claude Desktop MCP](https://claude.ai/docs/mcp)

### Community Resources
- MCP Server Registry
- GitHub repositories
- Community forums

---

## Contributing

To add support for a new MCP tool:

1. Research the tool's configuration format
2. Determine configuration file location
3. Identify unique fields and requirements
4. Add app configuration to `apps.json`
5. Define syntax mappings if needed
6. Add exclusion rules if applicable
7. Test thoroughly
8. Document the configuration format


