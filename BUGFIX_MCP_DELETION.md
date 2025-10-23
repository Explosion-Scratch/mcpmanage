# Bug Fix: MCP Server Deletion Issue

## Issue Summary
MCP servers were not being correctly removed from application config files when deleted through the UI.

## Root Cause
All app adapters used a **merge strategy** in their `setServers()` method:

```typescript
data.mcpServers = {
  ...data.mcpServers,  // Existing servers
  ...servers            // New servers (with deleted server removed)
};
```

### Why This Failed

1. **Deletion Flow**:
   - `MCPConfigManager.removeServer()` reads current servers
   - Uses `delete servers[name]` to remove the server
   - Calls adapter's `setServers(servers)` with modified object

2. **The Problem**:
   - After `delete`, the property is **missing** from the object (not set to `undefined`)
   - JavaScript spread operator only overwrites properties that **exist** in the source
   - Missing properties in `servers` don't override existing ones in `data.mcpServers`
   - Result: Deleted server remains in the config file

### Example

```typescript
const original = { serverA: {...}, serverB: {...}, serverC: {...} };
const modified = { serverA: {...}, serverB: {...} };  // serverC deleted

const result = {
  ...original,  // { serverA, serverB, serverC }
  ...modified   // { serverA, serverB }
};

// Result still contains serverC! 
// { serverA, serverB, serverC }
```

## Solution
Replace merge logic with direct assignment:

```typescript
data.mcpServers = servers;
```

This ensures the entire `mcpServers` object is replaced, properly removing deleted servers.

## Files Modified

### Standard MCP Apps (Direct Replacement)
- `ClaudeAdapter.ts`
- `CursorAdapter.ts`
- `GeminiAdapter.ts`
- `QwenAdapter.ts`
- `WindsurfAdapter.ts`
- `VSCodeAdapter.ts`
- `OpencodeAdapter.ts`

### Special Cases
- **ZedAdapter.ts**: No changes needed. Uses different config structure (`context_servers`) with special logic to preserve "custom" source servers. The merge there is intentional to maintain custom servers while updating managed ones.

## Testing
To verify the fix:
1. Add an MCP server through the UI
2. Verify it appears in the app's config file
3. Delete the server through the UI
4. Verify it's completely removed from the app's config file
5. Test with multiple applications to ensure consistency

## Impact
- **Positive**: Servers now delete correctly from all application configs
- **No Breaking Changes**: Existing functionality for adding/updating servers remains unchanged
- **Side Effect**: Any other fields in the config files (outside of `mcpServers`) are now preserved as-is instead of being merged

