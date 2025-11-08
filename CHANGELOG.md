# Changelog

## Latest Update

### 🔧 Fixed: Disabled Apps Visibility
- **Issue**: When turning off an app (e.g., Opencode CLI), it still appeared in the Application Sync section of server details and in the servers list
- **Solution**: 
  - Apps with sync disabled are now filtered out from display in both the Application Sync section and servers list
  - The underlying data is preserved - when you re-enable an app, all its server associations are restored
  - Sync state data is always fetched fresh to ensure accurate display

### ✨ New Features

#### App Logo System
- Created a unified SVG logo for MCP Manager
- Logo appears in:
  - Sidebar header (6x6 size)
  - About page (24x24 size)
  - Gradient design with geometric pattern representing MCP protocol
- Fallback handling if logo fails to load

#### About Page
- Beautiful centered layout with app logo
- Displays version number (1.0.0)
- Links to @Explosion-Scratch on GitHub
- ESC key support to return to main view

#### Export/Import System
- **Export**: Download complete app data as ZIP file
  - Includes mcp.json with server configurations
  - Includes app-data.json with metadata and sync states
  - Includes all app backups
  - Filename includes export date
- **Import**: Import app data from ZIP
  - Restore complete application state
  - Accessible via clickable link in Import section

#### App Details Modal
- Click any app in Manage Apps view to see details
- Shows:
  - All MCP servers applied to that app
  - Backup settings (formatted JSON)
  - Current settings (formatted JSON)
- Click outside or press X to close

### 🎨 UI Improvements
- Apps in servers list are now sorted alphabetically
- Fixed double confirmation when toggling app sync off
- Enhanced logo styling with gradient
- Consistent filtering of disabled apps across all views

### 🔌 Backend Enhancements
- New IPC handlers:
  - `get-app-backup`: Retrieve backup config for an app
  - `get-app-current-config`: Get current settings for an app
  - `get-app-applied-servers`: Get list of servers applied to an app
  - `export-app-data`: Export complete app data as ZIP
  - `import-app-data-zip`: Import app data from ZIP file
- Updated `get-apps` to include `syncEnabled` property
- Installed `adm-zip` package for ZIP handling

### 📁 File Structure
```
src/renderer/public/
  └── assets/
      └── logo.svg          # App logo (source of truth)
```

### 🔍 Technical Details

**Disabled Apps Logic**:
- When an app is disabled:
  - `syncEnabled` is set to `false` in app sync states
  - App config is restored from backup
  - No new syncs occur for that app
  - App is filtered from UI display
- When an app is re-enabled:
  - `syncEnabled` is set to `true`
  - All server associations are preserved
  - Syncing resumes

**Fresh Data Guarantee**:
- Server detail view fetches fresh sync states on mount
- States are refetched when apps list changes
- Display filtering uses the fresh state data

### 🎯 Data Preservation
Important: Even when apps are disabled/hidden from UI:
- Server associations are preserved in the data layer
- When you re-enable an app, all its servers are still there
- This allows toggling sync on/off without losing configuration

