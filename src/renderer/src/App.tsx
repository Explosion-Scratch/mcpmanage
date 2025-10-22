import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  AppWindow,
  Compass,
  Beaker,
  Plus,
  Play,
  Square,
  TerminalSquare,
  CheckCircle2,
  XCircle,
  Command as CommandIcon,
  RefreshCw,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ShieldAlert,
  FileJson,
} from 'lucide-react';
import { cn } from './lib/utils';
import { Button, Input, Label, Switch, Badge, ServerIcon } from './components/ui';
import type { AppConfig, MCPServerWithMetadata, PermissionLevel } from '../../shared/types';

type Tab = 'servers' | 'apps' | 'explore' | 'studio';

export default function MCPManager() {
  const [activeTab, setActiveTab] = useState<Tab>('servers');
  const [servers, setServers] = useState<MCPServerWithMetadata[]>([]);
  const [apps, setApps] = useState<AppConfig[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const appsData = await window.electronAPI.getApps();
    const serversData = await window.electronAPI.getAllServers();
    
    setApps(Array.isArray(appsData) ? appsData.map(a => ({ ...a, enabled: true })) : []);
    
    const serversWithMeta: MCPServerWithMetadata[] = Array.isArray(serversData) 
      ? serversData.map(server => ({
          id: server.id,
          name: server.name,
          description: server.description,
          command: server.command,
          args: server.args,
          env: server.env,
          settings: server.settings,
          source: server.source,
          enabled: server.enabled,
          iconUrl: server.iconUrl,
          permissions: server.permissions,
          apps: server.apps,
        }))
      : [];
    setServers(serversWithMeta);
  };

  const toggleServerEnabled = async (id: string) => {
    const server = servers.find(s => s.id === id);
    if (!server) return;
    
    const newEnabled = !server.enabled;
    await window.electronAPI.toggleServer(id, newEnabled);
    setServers(servers.map(s => (s.id === id ? { ...s, enabled: newEnabled } : s)));
  };

  const handleAddServer = async (newServer: MCPServerWithMetadata) => {
    const success = await window.electronAPI.addServer(
      newServer.id,
      `${newServer.command} ${(newServer.args || []).join(' ')}`,
      newServer.env
    );
    if (success) {
      await loadData();
    }
  };

  const handleUpdateServer = async (updatedServer: MCPServerWithMetadata) => {
    const success = await window.electronAPI.updateServer(
      updatedServer.id,
      `${updatedServer.command} ${(updatedServer.args || []).join(' ')}`,
      updatedServer.env
    );
    if (success) {
      await loadData();
    }
  };

  const handleDeleteServer = async (id: string) => {
    const success = await window.electronAPI.removeServer(id);
    if (success) {
      await loadData();
      if (selectedServerId === id) setSelectedServerId(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white text-gray-900 font-sans overflow-hidden selection:bg-[#cce5ff]">
      <div className="w-[220px] shrink-0 bg-gray-50/80 border-r border-gray-200/50 backdrop-blur-xl flex flex-col py-4 z-10">
        <div
          className="h-6 w-full flex items-center px-4 mb-6"
          style={{ WebkitAppRegion: 'drag' } as any}
        />

        <div className="px-4 mb-4">
          <h1 className="font-semibold text-sm flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center text-white">
              <CommandIcon className="w-3.5 h-3.5" />
            </div>
            MCP Manager
          </h1>
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          <SidebarItem
            icon={Server}
            label="Manage servers"
            active={activeTab === 'servers'}
            onClick={() => {
              setActiveTab('servers');
              setSelectedServerId(null);
            }}
          />
          <SidebarItem
            icon={AppWindow}
            label="Manage apps"
            active={activeTab === 'apps'}
            onClick={() => setActiveTab('apps')}
          />
          <SidebarItem
            icon={Compass}
            label="Explore servers"
            active={activeTab === 'explore'}
            onClick={() => setActiveTab('explore')}
          />

          <div className="pt-6 pb-2 px-2">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Development
            </p>
          </div>
          <SidebarItem
            icon={Beaker}
            label="Studio"
            active={activeTab === 'studio'}
            onClick={() => setActiveTab('studio')}
          />
        </nav>

        <div className="px-4 py-2 text-xs text-gray-400 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          System Synced
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        {activeTab === 'servers' && !selectedServerId && (
          <ManageServersView
            servers={servers}
            apps={apps}
            onToggle={toggleServerEnabled}
            onSelect={setSelectedServerId}
            onAdd={handleAddServer}
            onDelete={handleDeleteServer}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'servers' && selectedServerId && (
          <ServerDetailView
            server={servers.find(s => s.id === selectedServerId)!}
            apps={apps}
            onBack={() => setSelectedServerId(null)}
            onUpdate={handleUpdateServer}
            onToggle={toggleServerEnabled}
          />
        )}
        {activeTab === 'apps' && <ManageAppsView apps={apps} onRefresh={loadData} />}
        {activeTab === 'explore' && <ExploreView />}
        {activeTab === 'studio' && <StudioView servers={servers.filter(s => s.enabled)} />}
      </div>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium rounded-md transition-all duration-150 group',
        active
          ? 'bg-gray-200/60 text-gray-900 shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 transition-colors',
          active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'
        )}
      />
      {label}
    </button>
  );
}

interface ManageServersProps {
  servers: MCPServerWithMetadata[];
  apps: AppConfig[];
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onAdd: (server: MCPServerWithMetadata) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

function ManageServersView({
  servers,
  apps,
  onToggle,
  onSelect,
  onAdd,
  onDelete,
  onRefresh,
}: ManageServersProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCmd, setNewCmd] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [jsonImport, setJsonImport] = useState('');

  useEffect(() => {
    if (!newName && newCmd.includes('@modelcontextprotocol/server-')) {
      const match = newCmd.match(/server-([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        setNewName(match[1].charAt(0).toUpperCase() + match[1].slice(1));
      }
    }
  }, [newCmd, newName]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = newCmd.trim().split(/\s+/);
    onAdd({
      id: newName.toLowerCase().replace(/\s+/g, '-'),
      name: newName,
      command: parts[0],
      args: parts.slice(1),
      iconUrl: newIcon || undefined,
      description: newDesc || undefined,
      enabled: true,
      permissions: 'always_ask',
      apps: (apps || []).map(a => a.name),
    });
    setIsAdding(false);
    setNewName('');
    setNewCmd('');
    setNewIcon('');
    setNewDesc('');
  };

  const handleMockImport = async () => {
    try {
      const parsed = JSON.parse(jsonImport);
      const importedServers: MCPServerWithMetadata[] = Object.entries(
        parsed.mcpServers || {}
      ).map(([key, val]: [string, any]) => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        command: val.command,
        args: val.args || [],
        env: val.env,
        enabled: true,
        permissions: 'always_ask' as PermissionLevel,
        apps: (apps || []).map(a => a.name),
      }));

      for (const server of importedServers) {
        await window.electronAPI.addServer(
          server.id,
          `${server.command} ${(server.args || []).join(' ')}`,
          server.env
        );
      }

      setIsImporting(false);
      setJsonImport('');
      onRefresh();
    } catch (e) {
      alert('Invalid JSON');
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <header className="h-14 shrink-0 px-6 flex items-center justify-between border-b border-gray-100">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Configured Servers</h2>
          <p className="text-xs text-gray-500">
            Manage MCP servers synced across your system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            title="Import JSON"
            onClick={() => setIsImporting(!isImporting)}
          >
            <FileJson className="w-4 h-4" />
          </Button>
          <Button
            variant={isAdding ? 'secondary' : 'primary'}
            size="sm"
            className="gap-1"
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? <XCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {isAdding ? 'Cancel' : 'Add Server'}
          </Button>
        </div>
      </header>

      {isImporting && (
        <div className="border-b border-gray-100 bg-gray-50/80 p-6 animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-medium mb-2">Import from JSON</h3>
          <p className="text-xs text-gray-500 mb-3">
            Paste a standard `mcpServers` configuration object.
          </p>
          <textarea
            className="w-full h-32 font-mono text-xs p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900/5 mb-3"
            placeholder={
              '{\n  "mcpServers": {\n    "myserver": { "command": "...", "args": [...] }\n  }\n}'
            }
            value={jsonImport}
            onChange={e => setJsonImport(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsImporting(false)} size="sm">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleMockImport}
              size="sm"
              disabled={!jsonImport.trim()}
            >
              Import
            </Button>
          </div>
        </div>
      )}

      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="border-b border-gray-100 bg-gray-50/80 p-6 animate-in slide-in-from-top-2 duration-200 grid grid-cols-2 gap-4"
        >
          <div className="col-span-2">
            <Label>Installation Command *</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <TerminalSquare className="w-4 h-4 text-gray-400" />
              </div>
              <Input
                required
                className="pl-9 font-mono text-xs"
                placeholder="npx -y @modelcontextprotocol/server-name ..."
                value={newCmd}
                onChange={e => setNewCmd(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Name *</Label>
            <Input
              required
              placeholder="e.g. Filesystem"
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
          </div>
          <div>
            <Label>Icon URL (Optional)</Label>
            <Input
              placeholder="https://..."
              value={newIcon}
              onChange={e => setNewIcon(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <Label>Description (Optional)</Label>
            <Input
              placeholder="Short description of what this server provides"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
          </div>
          <div className="col-span-2 flex justify-end pt-2">
            <Button type="submit" variant="primary" size="sm">
              Install & Add Server
            </Button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase tracking-wider font-medium text-gray-500">
              <tr>
                <th className="px-4 py-3 w-12 text-center">On</th>
                <th className="px-4 py-3">Server</th>
                <th className="px-4 py-3">Command</th>
                <th className="px-4 py-3 w-32">Apps</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {servers.map(server => (
                <tr key={server.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-center">
                    <Switch checked={server.enabled} onChange={() => onToggle(server.id)} />
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(server.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                        <ServerIcon url={server.iconUrl} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {server.name}
                          <ChevronRight className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {server.description && (
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {server.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-xs text-gray-600 max-w-[300px] truncate cursor-pointer"
                    onClick={() => onSelect(server.id)}
                  >
                    <span className="text-blue-600">{server.command}</span> {(server.args || []).join(' ')}
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(server.id)}>
                    <Badge
                      className={
                        server.enabled
                          ? 'bg-green-50 text-green-700 border border-green-100'
                          : 'bg-gray-100 text-gray-500'
                      }
                    >
                      {server.enabled ? `${(server.apps || []).length} apps` : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-red-600 hover:bg-red-50"
                        onClick={e => {
                          e.stopPropagation();
                          onDelete(server.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ServerDetailView({
  server,
  apps,
  onBack,
  onUpdate,
  onToggle,
}: {
  server: MCPServerWithMetadata;
  apps: AppConfig[];
  onBack: () => void;
  onUpdate: (s: MCPServerWithMetadata) => void;
  onToggle: (id: string) => void;
}) {
  const toggleAppInclusion = async (appName: string) => {
    const serverApps = server.apps || [];
    const isIncluded = serverApps.includes(appName);
    const newApps = isIncluded
      ? serverApps.filter(name => name !== appName)
      : [...serverApps, appName];
    
    await window.electronAPI.toggleServer(server.id, !isIncluded, [appName]);
    
    onUpdate({
      ...server,
      apps: newApps,
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 animate-in slide-in-from-right-4 duration-300">
      <header className="h-14 shrink-0 px-4 flex items-center gap-2 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-gray-500 gap-1"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4" /> Servers
        </Button>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-2 font-medium text-sm">
          <ServerIcon url={server.iconUrl} className="w-4 h-4" />
          {server.name}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8 space-y-8">
          <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex gap-6 items-start">
            <div className="w-20 h-20 rounded-[18px] bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              <ServerIcon url={server.iconUrl} className="w-10 h-10" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-gray-900">{server.name}</h1>
                  <Switch
                    checked={server.enabled}
                    onChange={() => onToggle(server.id)}
                  />
                </div>
                <p className="text-gray-500 mt-1">
                  {server.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <Label>Command</Label>
                <div className="font-mono text-xs bg-gray-900 text-gray-200 p-3 rounded-md overflow-x-auto flex items-center">
                  <span className="text-blue-400 mr-2">$</span>
                  {server.command} {(server.args || []).join(' ')}
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-3 space-y-6">
              <section>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-gray-500" />
                  Permissions
                </h3>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <div>
                      <div className="font-medium text-sm text-gray-900">Always Ask</div>
                      <div className="text-xs text-gray-500">
                        Prompt user before executing tools or accessing resources
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="perms"
                      checked={server.permissions === 'always_ask'}
                      onChange={() => onUpdate({ ...server, permissions: 'always_ask' })}
                      className="text-gray-900 focus:ring-gray-900"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="font-medium text-sm text-gray-900">Allow without asking</div>
                      <div className="text-xs text-gray-500">
                        Automatically approve all requests from this server
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="perms"
                      checked={server.permissions === 'allow'}
                      onChange={() => onUpdate({ ...server, permissions: 'allow' })}
                      className="text-gray-900 focus:ring-gray-900"
                    />
                  </label>
                </div>
              </section>
            </div>

            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-gray-500" />
                Application Sync
              </h3>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {(apps || []).map(app => {
                  const isIncluded = (server.apps || []).includes(app.name);
                  return (
                    <div
                      key={app.name}
                      className={cn(
                        'flex items-center gap-3 p-3 border-b border-gray-100 last:border-0 transition-colors cursor-pointer',
                        isIncluded ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50'
                      )}
                      onClick={() => toggleAppInclusion(app.name)}
                    >
                      <img
                        src={app.icon}
                        className={cn(
                          'w-8 h-8 rounded-md border border-gray-200/50 transition-all',
                          isIncluded ? '' : 'grayscale opacity-70'
                        )}
                        onError={e => (e.currentTarget.src = '')}
                      />
                      <div className="flex-1">
                        <div
                          className={cn(
                            'text-sm font-medium',
                            isIncluded ? 'text-gray-900' : 'text-gray-500'
                          )}
                        >
                          {app.name}
                        </div>
                      </div>
                      {isIncluded ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-500 mt-2 px-1">
                Click an application to toggle this server's availability for it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManageAppsView({ apps, onRefresh }: { apps: AppConfig[]; onRefresh: () => void }) {
  const handleSync = async () => {
    await window.electronAPI.syncServers();
    onRefresh();
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30 animate-in fade-in duration-300">
      <header className="h-14 shrink-0 px-6 flex items-center justify-between border-b border-gray-100 bg-white">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Target Applications ({(apps || []).length})
          </h2>
          <p className="text-xs text-gray-500">Manage MCP-compatible applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="gap-1" onClick={handleSync}>
            <RefreshCw className="w-3.5 h-3.5" />
            Sync All
          </Button>
          <Button variant="secondary" size="sm" className="gap-1" onClick={onRefresh}>
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Button>
        </div>
      </header>
      <div className="p-6 grid grid-cols-2 gap-4">
        {(apps || []).map(app => (
          <div
            key={app.name}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex gap-4 hover:shadow-md transition-all"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-[16px] border border-gray-200/50 flex items-center justify-center overflow-hidden bg-white shadow-sm">
                <img
                  src={app.icon}
                  alt={app.name}
                  className="w-10 h-10 object-contain"
                  onError={e =>
                    (e.currentTarget.src = 'https://placehold.co/40x40?text=' + app.name[0])
                  }
                />
              </div>
              {app.enabled && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full" />
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">{app.name}</h3>
                <Badge>Detected</Badge>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Automatically synced when changes are made
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExploreView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 animate-in fade-in duration-300">
      <Compass className="w-12 h-12 mb-4 text-gray-300" />
      <h3 className="text-lg font-medium text-gray-700">Explore Servers</h3>
      <p className="text-sm mt-2 max-w-xs text-center">
        Discover and install new MCP servers from the community registry.
      </p>
      <Button variant="secondary" className="mt-6">
        Browse Registry
      </Button>
    </div>
  );
}

interface Tool {
  name: string;
  description?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
}

function StudioView({ servers }: { servers: MCPServerWithMetadata[] }) {
  const [selectedServer, setSelectedServer] = useState<string>(servers[0]?.id || '');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [lastResult, setLastResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (selectedTool?.inputSchema) {
      const defaultArgs: Record<string, any> = {};
      if (selectedTool.inputSchema.properties) {
        for (const [key, value] of Object.entries(selectedTool.inputSchema.properties)) {
          const prop = value as any;
          if (prop.type === 'string') {
            defaultArgs[key] = prop.default || '';
          } else if (prop.type === 'number') {
            defaultArgs[key] = prop.default || 0;
          } else if (prop.type === 'boolean') {
            defaultArgs[key] = prop.default || false;
          } else if (prop.type === 'array') {
            defaultArgs[key] = [];
          } else if (prop.type === 'object') {
            defaultArgs[key] = {};
          }
        }
      }
      setToolArgs(defaultArgs);
    } else {
      setToolArgs({});
    }
    setLastResult(null);
  }, [selectedTool]);

  const handleStartStop = async () => {
    if (!isRunning) {
      setIsRunning(true);
      addLog(`[${new Date().toLocaleTimeString()}] Starting ${selectedServer} server...`);
      
      try {
        const result = await window.electronAPI.studioStartServer(selectedServer);
        
        if (result.success) {
          addLog(`[${new Date().toLocaleTimeString()}] Server started successfully.`);
          addLog(`[${new Date().toLocaleTimeString()}] Fetching tools...`);
          
          try {
            const fetchedTools = await window.electronAPI.studioListTools(selectedServer);
            setTools(fetchedTools);
            addLog(`[${new Date().toLocaleTimeString()}] Found ${fetchedTools.length} tool(s).`);
          } catch (error) {
            addLog(`[${new Date().toLocaleTimeString()}] Error fetching tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else {
          addLog(`[${new Date().toLocaleTimeString()}] Failed to start server: ${result.error || 'Unknown error'}`);
          setIsRunning(false);
        }
      } catch (error) {
        addLog(`[${new Date().toLocaleTimeString()}] Error starting server: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsRunning(false);
      }
    } else {
      const success = await window.electronAPI.studioStopServer(selectedServer);
      setIsRunning(false);
      setTools([]);
      setSelectedTool(null);
      addLog(`[${new Date().toLocaleTimeString()}] Server ${success ? 'stopped' : 'stop requested'}.`);
    }
  };

  const handleRunTool = async () => {
    if (!selectedTool || !isRunning) return;
    
    setIsExecuting(true);
    addLog(`[${new Date().toLocaleTimeString()}] Executing tool: ${selectedTool.name}`);
    
    try {
      const result = await window.electronAPI.studioCallTool(selectedServer, selectedTool.name, toolArgs);
      
      if (result.isError) {
        addLog(`[${new Date().toLocaleTimeString()}] Tool returned an error`);
        setLastResult({ error: true, data: result.content });
      } else {
        addLog(`[${new Date().toLocaleTimeString()}] Tool executed successfully`);
        setLastResult({ error: false, data: result.content });
      }
    } catch (error) {
      addLog(`[${new Date().toLocaleTimeString()}] Error calling tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLastResult({ error: true, data: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsExecuting(false);
    }
  };

  const updateToolArg = (key: string, value: any) => {
    setToolArgs(prev => ({ ...prev, [key]: value }));
  };

  const renderInputForProperty = (key: string, prop: any, required: boolean) => {
    const value = toolArgs[key] ?? '';
    
    if (prop.type === 'boolean') {
      return (
        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div>
            <Label className="text-sm font-medium">{key}</Label>
            {prop.description && (
              <p className="text-xs text-gray-500 mt-0.5">{prop.description}</p>
            )}
          </div>
          <Switch
            checked={!!value}
            onChange={() => updateToolArg(key, !value)}
          />
        </div>
      );
    }
    
    if (prop.enum) {
      return (
        <div key={key}>
          <Label>
            {key}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {prop.description && (
            <p className="text-xs text-gray-500 mb-2">{prop.description}</p>
          )}
          <select
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900/5"
            value={value}
            onChange={e => updateToolArg(key, e.target.value)}
          >
            <option value="">Select {key}</option>
            {prop.enum.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }
    
    if (prop.type === 'number' || prop.type === 'integer') {
      return (
        <div key={key}>
          <Label>
            {key}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {prop.description && (
            <p className="text-xs text-gray-500 mb-2">{prop.description}</p>
          )}
          <Input
            type="number"
            value={value}
            onChange={e => updateToolArg(key, parseFloat(e.target.value) || 0)}
            placeholder={prop.description || `Enter ${key}`}
          />
        </div>
      );
    }
    
    if (prop.type === 'array' || prop.type === 'object') {
      return (
        <div key={key}>
          <Label>
            {key}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {prop.description && (
            <p className="text-xs text-gray-500 mb-2">{prop.description}</p>
          )}
          <textarea
            className="w-full px-3 py-2 text-sm font-mono bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900/5"
            rows={3}
            value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
            onChange={e => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateToolArg(key, parsed);
              } catch {
                updateToolArg(key, e.target.value);
              }
            }}
            placeholder={`Enter ${key} as JSON`}
          />
        </div>
      );
    }
    
    return (
      <div key={key}>
        <Label>
          {key}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {prop.description && (
          <p className="text-xs text-gray-500 mb-2">{prop.description}</p>
        )}
        <Input
          type="text"
          value={value}
          onChange={e => updateToolArg(key, e.target.value)}
          placeholder={prop.description || `Enter ${key}`}
        />
      </div>
    );
  };

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const currentServer = servers.find(s => s.id === selectedServer);

  return (
    <div className="flex flex-col h-full bg-gray-50 animate-in fade-in duration-300">
      <header className="h-14 shrink-0 px-4 flex items-center gap-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Server:</span>
          <div className="relative">
            <select
              className="pl-8 pr-8 py-1.5 h-9 text-sm bg-gray-50 border border-gray-200 rounded-md appearance-none font-medium outline-none focus:ring-2 focus:ring-gray-900/5"
              value={selectedServer}
              onChange={async e => {
                const newServerId = e.target.value;
                if (isRunning) {
                  await window.electronAPI.studioStopServer(selectedServer);
                }
                setSelectedServer(newServerId);
                setIsRunning(false);
                setLogs([]);
                setTools([]);
                setSelectedTool(null);
              }}
              disabled={isRunning}
            >
              {servers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <ServerIcon url={currentServer?.iconUrl} className="w-4 h-4" />
            </div>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200 mx-2" />

        <Button
          variant={isRunning ? 'danger' : 'primary'}
          className="gap-1.5 min-w-[100px]"
          onClick={handleStartStop}
        >
          {isRunning ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          {isRunning ? 'Stop' : 'Start'}
        </Button>

        {isRunning ? (
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Running on stdio
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            Stopped
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Available Tools
            </h3>
            <Badge>{tools.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {!isRunning && (
              <div className="px-4 py-8 text-center text-sm text-gray-400 italic">
                Start server to load tools
              </div>
            )}
            {tools.map(tool => (
              <button
                key={tool.name}
                onClick={() => setSelectedTool(tool)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm flex items-center gap-2 border-l-[3px]',
                  selectedTool?.name === tool.name
                    ? 'bg-blue-50 border-blue-500 text-blue-900'
                    : 'border-transparent hover:bg-gray-50 text-gray-700'
                )}
              >
                <TerminalSquare className="w-4 h-4 opacity-70" />
                <span className="truncate font-mono text-[13px]">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-700">Parameters</span>
                {selectedTool && (
                  <span className="text-gray-400 flex items-center">
                    <ChevronRight className="w-4 h-4" />{' '}
                    <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {selectedTool.name}
                    </span>
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="primary"
                disabled={!isRunning || !selectedTool || isExecuting}
                className="gap-1"
                onClick={handleRunTool}
              >
                <Play className="w-3 h-3" /> {isExecuting ? 'Running...' : 'Run Tool'}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!selectedTool && (
                <div className="text-center text-sm text-gray-400 italic py-8">
                  Select a tool to configure parameters
                </div>
              )}
              {selectedTool && (!selectedTool.inputSchema?.properties || Object.keys(selectedTool.inputSchema.properties).length === 0) && (
                <div className="text-center text-sm text-gray-500 italic py-8">
                  This tool requires no parameters
                </div>
              )}
              {selectedTool?.inputSchema?.properties && 
                Object.entries(selectedTool.inputSchema.properties).map(([key, prop]) => {
                  const required = selectedTool.inputSchema?.required?.includes(key) || false;
                  return renderInputForProperty(key, prop, required);
                })
              }
            </div>
          </div>

          <div className="w-1/2 flex flex-col bg-white overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Response</span>
              {lastResult && (
                <button
                  onClick={() => setLastResult(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!lastResult && (
                <div className="text-center text-sm text-gray-400 italic py-8">
                  Tool response will appear here
                </div>
              )}
              {lastResult && (
                <div className={cn(
                  'rounded-lg border p-4',
                  lastResult.error 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                )}>
                  <div className="flex items-center gap-2 mb-3">
                    {lastResult.error ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-900">Error</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Success</span>
                      </>
                    )}
                  </div>
                  <div className="space-y-3">
                    {Array.isArray(lastResult.data) ? (
                      lastResult.data.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-md p-3 border border-gray-200">
                          {item.type === 'text' && (
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-2">Text Content</div>
                              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                                {item.text}
                              </pre>
                            </div>
                          )}
                          {item.type === 'resource' && (
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-2">Resource</div>
                              <div className="text-sm text-gray-800">
                                <div className="font-medium mb-1">{item.resource?.uri}</div>
                                <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">
                                  {item.resource?.text || JSON.stringify(item.resource, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          {item.type === 'image' && (
                            <div>
                              <div className="text-xs font-medium text-gray-500 mb-2">Image</div>
                              <img 
                                src={`data:${item.mimeType};base64,${item.data}`} 
                                alt="Tool result"
                                className="max-w-full h-auto rounded"
                              />
                            </div>
                          )}
                          {!['text', 'resource', 'image'].includes(item.type) && (
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                              {JSON.stringify(item, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))
                    ) : (
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-white rounded-md p-3 border border-gray-200">
                        {typeof lastResult.data === 'string' 
                          ? lastResult.data 
                          : JSON.stringify(lastResult.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-48 flex flex-col bg-gray-900 text-gray-100 border-t border-gray-200">
          <div className="px-4 py-1.5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <TerminalSquare className="w-3.5 h-3.5" /> Console
            </span>
            <button
              onClick={() => setLogs([])}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Clear
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1">
            {logs.length === 0 && <div className="text-gray-600 italic">No output yet...</div>}
            {logs.map((log, i) => (
              <div key={i} className="break-all leading-relaxed">
                <span className="text-gray-500 mr-2">{'>'}</span>
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
