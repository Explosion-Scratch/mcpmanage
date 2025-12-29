import React, { useState, useEffect, useRef } from 'react';
import {
  Server,
  AppWindow,
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
  Pencil,
  Download,
  Upload,
  Info,
  X,
} from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/github.css';
import { cn } from './lib/utils';
import { Button, Input, Label, Switch, Badge, ServerIcon, IconPicker } from './components/ui';
import type { AppConfig, MCPServerWithMetadata, PermissionLevel } from '../../shared/types';

hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);

type Tab = 'servers' | 'apps' | 'studio' | 'about';

function SyntaxHighlightedText({ text }: { text: string }) {
  const [highlightedHtml, setHighlightedHtml] = useState('');

  useEffect(() => {
    let isJson = false;
    try {
      JSON.parse(text);
      isJson = true;
    } catch (e) {
      isJson = false;
    }

    const language = isJson ? 'json' : 'markdown';
    const highlighted = hljs.highlight(text, { language }).value;
    setHighlightedHtml(highlighted);
  }, [text]);

  return (
    <pre className="text-sm whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto bg-[var(--bg-code)] backdrop-blur-sm text-[var(--text-primary)] p-3 rounded-md border border-[var(--border-secondary)]">
      <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
    </pre>
  );
}

export default function MCPManager() {
  const [activeTab, setActiveTab] = useState<Tab>('servers');
  const [servers, setServers] = useState<MCPServerWithMetadata[]>([]);
  const [apps, setApps] = useState<AppConfig[]>([]);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('servers');
          setSelectedServerId(null);
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('apps');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('studio');
        }
      } else if (e.key === 'Escape') {
        if (selectedServerId) {
          e.preventDefault();
          setSelectedServerId(null);
        } else if (activeTab === 'about') {
          e.preventDefault();
          setActiveTab('servers');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedServerId, activeTab]);

  const loadData = async () => {
    const appsData = await window.electronAPI.getApps();
    const serversData = await window.electronAPI.getAllServers();
    
    setApps(Array.isArray(appsData) ? appsData : []);
    
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
          applyToAll: server.applyToAll,
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
    const success = await window.electronAPI.updateMasterServer(
      updatedServer.id,
      {
        name: updatedServer.name,
        description: updatedServer.description,
        iconUrl: updatedServer.iconUrl,
        command: updatedServer.command,
        args: updatedServer.args,
        env: updatedServer.env,
        permissions: updatedServer.permissions,
        apps: updatedServer.apps,
        applyToAll: updatedServer.applyToAll,
      }
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
    <div className="flex h-screen w-full min-w-[800px] bg-transparent text-[var(--text-primary)] font-sans overflow-hidden selection:bg-[var(--selection-bg)]">
      <div
        className="absolute top-0 left-0 right-0 h-3 z-50"
        style={{ WebkitAppRegion: 'drag' } as any}
      />
      
      <div className="w-[200px] min-w-[180px] shrink-0 bg-[var(--bg-primary)] border-r border-[var(--border-primary)] backdrop-blur-3xl flex flex-col py-4 z-10 relative">
        <div className="h-4 w-full flex items-center px-4 mb-4" />

        <div className="px-4 mb-4">
          <h1 className="font-semibold text-sm flex items-center gap-2 text-[var(--text-primary)]">
            <img 
              src="/assets/logo.svg" 
              alt="MCP Manager" 
              className="w-6 h-6 rounded-md shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
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
            shortcut="⌘1"
          />
          <SidebarItem
            icon={AppWindow}
            label="Manage apps"
            active={activeTab === 'apps'}
            onClick={() => setActiveTab('apps')}
            shortcut="⌘2"
          />
          <SidebarItem
            icon={Beaker}
            label="Studio"
            active={activeTab === 'studio'}
            onClick={() => setActiveTab('studio')}
            shortcut="⌘3"
          />
        </nav>
        
        <div className="px-2">
          <SidebarItem
            icon={Info}
            label="About"
            active={activeTab === 'about'}
            onClick={() => setActiveTab('about')}
          />
        </div>

        <div className="px-4 py-2 text-xs text-[var(--text-tertiary)] flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--switch-on)] shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          System Synced
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--bg-secondary)] relative">
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
            onDelete={handleDeleteServer}
          />
        )}
        {activeTab === 'apps' && <ManageAppsView apps={apps} servers={servers} onRefresh={loadData} />}
        {activeTab === 'studio' && <StudioView servers={servers.filter(s => s.enabled)} />}
        {activeTab === 'about' && <AboutView />}
      </div>
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  onClick,
  shortcut,
}: {
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
  shortcut?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 text-[13px] font-medium rounded-md transition-all duration-150 group',
        active
          ? 'bg-[var(--bg-active)] text-[var(--text-primary)] shadow-sm'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)]'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 transition-colors',
          active ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'
        )}
      />
      <span className="flex-1 text-left truncate">{label}</span>
      {shortcut && (
        <span className={cn(
          'text-[10px] font-mono px-1 py-0.5 rounded transition-colors shrink-0',
          active ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100'
        )}>
          {shortcut}
        </span>
      )}
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
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAdding) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setIsAdding(false);
          setNewName('');
          setNewCmd('');
          setNewIcon('');
          setNewDesc('');
        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          if (newCmd && newName) {
            handleAddSubmit(e as any);
          }
        }
      } else if (e.metaKey || e.ctrlKey) {
        if (e.key === 'n') {
          e.preventDefault();
          setIsAdding(!isAdding);
        } else if (e.key === 'i') {
          e.preventDefault();
          setIsImporting(!isImporting);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdding, isImporting, newCmd, newName]);

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

  if (isAdding) {
    return (
      <div className="flex flex-col h-full animate-in fade-in duration-300 relative">
        <div className="absolute inset-0 bg-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 sm:p-8">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-2xl bg-[var(--bg-modal)] backdrop-blur-xl rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--border-secondary)] p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Add New Server</h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">Install and configure a new MCP server</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewName('');
                  setNewCmd('');
                  setNewIcon('');
                  setNewDesc('');
                }}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Installation Command *</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <TerminalSquare className="w-4 h-4 text-[var(--text-tertiary)]" />
                  </div>
                  <Input
                    required
                    className="pl-9 font-mono text-xs"
                    placeholder="npx -y @modelcontextprotocol/server-name ..."
                    value={newCmd}
                    onChange={e => setNewCmd(e.target.value)}
                    spellCheck={false}
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <Label>Icon</Label>
                  <button
                    ref={iconButtonRef}
                    type="button"
                    onClick={() => setShowIconPicker(true)}
                    className="w-full h-8 px-3 text-sm border border-[var(--border-input)] bg-[var(--bg-input)] rounded-md hover:bg-[var(--bg-hover)] transition-colors flex items-center gap-2"
                  >
                    <ServerIcon url={newIcon} className="w-4 h-4" />
                    <span className="text-[var(--text-secondary)] flex-1 text-left truncate">
                      {newIcon ? newIcon.replace('ph:', '').replace('-light', '') : 'Choose icon...'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Input
                  placeholder="Short description of what this server provides"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
              <div className="text-xs text-[var(--text-secondary)] flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-[var(--bg-badge)] border border-[var(--border-input)] rounded text-[10px] font-mono">esc</kbd>
                  to cancel
                </span>
              </div>
              <Button type="submit" variant="primary" size="sm" className="gap-2">
                <Plus className="w-3.5 h-3.5" />
                Add server ⌘⏎
              </Button>
            </div>
          </form>
        </div>
        
        {showIconPicker && (
          <IconPicker
            value={newIcon}
            onChange={(icon) => {
              setNewIcon(icon);
              setShowIconPicker(false);
            }}
            onClose={() => setShowIconPicker(false)}
            anchorEl={iconButtonRef.current}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <header className="h-14 shrink-0 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--bg-primary)] backdrop-blur-xl">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Configured Servers</h2>
          <p className="text-xs text-[var(--text-secondary)] truncate">
            Manage MCP servers synced across your system
          </p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 hidden sm:flex"
            onClick={async () => {
              const buffer = await window.electronAPI.exportAppData();
              const blob = new Blob([buffer], { type: 'application/zip' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mcp-manager-data-${new Date().toISOString().split('T')[0]}.zip`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsImporting(!isImporting)}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] hidden sm:inline">⌘I</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="gap-2"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Server</span>
            <span className="text-[10px] font-mono opacity-70 hidden sm:inline">⌘N</span>
          </Button>
        </div>
      </header>

      {isImporting && (
        <div className="border-b border-[var(--border-primary)] bg-[var(--bg-elevated)] backdrop-blur-xl p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-2">
            Import from JSON{' '}
            <button
              onClick={async () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.zip';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const arrayBuffer = await file.arrayBuffer();
                    await window.electronAPI.importAppDataZip(arrayBuffer);
                    setIsImporting(false);
                    onRefresh();
                  }
                };
                input.click();
              }}
              className="text-[var(--text-accent)] hover:opacity-80 text-xs underline"
            >
              (Import app data zip)
            </button>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Paste a standard `mcpServers` configuration object.
          </p>
          <textarea
            className="w-full h-32 font-mono text-xs p-3 rounded-md border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-focus)] mb-3"
            placeholder={
              '{\n  "mcpServers": {\n    "myserver": { "command": "...", "args": [...] }\n  }\n}'
            }
            value={jsonImport}
            onChange={e => setJsonImport(e.target.value)}
            spellCheck={false}
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

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="rounded-xl border border-[var(--border-secondary)] bg-[var(--bg-tertiary)] backdrop-blur-xl shadow-[var(--shadow-sm)] overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead className="bg-[var(--bg-hover)] backdrop-blur-sm border-b border-[var(--border-secondary)] text-xs uppercase tracking-wider font-medium text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 w-12 text-center">On</th>
                <th className="px-4 py-3">Server</th>
                <th className="px-4 py-3 hidden sm:table-cell">Command</th>
                <th className="px-4 py-3 w-32">Apps</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-primary)]">
              {servers.map(server => (
                <tr key={server.id} className="group hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="px-4 py-3 text-center">
                    <Switch checked={server.enabled} onChange={() => onToggle(server.id)} />
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(server.id)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-input)] flex items-center justify-center overflow-hidden shrink-0">
                        <ServerIcon url={server.iconUrl} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                          <span className="truncate">{server.name}</span>
                          <ChevronRight className="w-3 h-3 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        {server.description && (
                          <div className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">
                            {server.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)] max-w-[300px] truncate cursor-pointer hidden sm:table-cell"
                    onClick={() => onSelect(server.id)}
                  >
                    <span className="text-[var(--text-accent)]">{server.command}</span> {(server.args || []).join(' ')}
                  </td>
                  <td className="px-4 py-3 cursor-pointer" onClick={() => onSelect(server.id)}>
                    {server.enabled ? (
                      server.applyToAll ? (
                        <Badge>all</Badge>
                      ) : (
                        <div className="flex items-center gap-1">
                          {(server.apps || [])
                            .filter(appName => {
                              const app = apps.find(a => a.name === appName);
                              return app && (app.syncEnabled !== false);
                            })
                            .sort()
                            .slice(0, 3)
                            .map((appName) => {
                              const app = apps.find(a => a.name === appName);
                              return app ? (
                                <img
                                  key={appName}
                                  src={app.icon}
                                  alt={app.name}
                                  className="w-5 h-5 rounded border border-[var(--border-secondary)]"
                                  title={app.name}
                                  onError={e => (e.currentTarget.style.display = 'none')}
                                />
                              ) : null;
                            })}
                          {(server.apps || []).filter(appName => {
                            const app = apps.find(a => a.name === appName);
                            return app && (app.syncEnabled !== false);
                          }).length > 3 && (
                            <span className="text-xs text-[var(--text-secondary)] italic ml-1">
                              +{(server.apps || []).filter(appName => {
                                const app = apps.find(a => a.name === appName);
                                return app && (app.syncEnabled !== false);
                              }).length - 3} more
                            </span>
                          )}
                        </div>
                      )
                    ) : (
                      <Badge>
                        Inactive
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-[var(--text-error)] hover:bg-[var(--btn-danger-bg)]"
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
  onDelete,
}: {
  server: MCPServerWithMetadata;
  apps: AppConfig[];
  onBack: () => void;
  onUpdate: (s: MCPServerWithMetadata) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(server.name);
  const [editedDescription, setEditedDescription] = useState(server.description || '');
  const [editedIconUrl, setEditedIconUrl] = useState(server.iconUrl || '');
  const [editedCommand, setEditedCommand] = useState(`${server.command} ${(server.args || []).join(' ')}`);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const [appSyncStates, setAppSyncStates] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    const loadSyncStates = async () => {
      const states = new Map<string, boolean>();
      for (const app of apps) {
        const syncEnabled = await window.electronAPI.getAppSyncState(app.name);
        states.set(app.name, syncEnabled);
      }
      setAppSyncStates(states);
    };
    loadSyncStates();
  }, [apps]);

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

  const handleSave = () => {
    const parts = editedCommand.trim().split(/\s+/);
    const updatedServer = {
      ...server,
      name: editedName,
      description: editedDescription,
      iconUrl: editedIconUrl,
      command: parts[0],
      args: parts.slice(1),
    };
    onUpdate(updatedServer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(server.name);
    setEditedDescription(server.description || '');
    setEditedIconUrl(server.iconUrl || '');
    setEditedCommand(`${server.command} ${(server.args || []).join(' ')}`);
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] backdrop-blur-xl animate-in slide-in-from-right-4 duration-300">
      <header className="h-14 shrink-0 px-4 flex items-center gap-2 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] backdrop-blur-xl sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-2"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4" /> Servers
          <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
            esc
          </span>
        </Button>
        <span className="text-[var(--text-muted)]">/</span>
        <div className="flex items-center gap-2 font-medium text-sm text-[var(--text-primary)]">
          <ServerIcon url={server.iconUrl} className="w-4 h-4" />
          <span className="truncate">{server.name}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 sm:p-8 space-y-8">
          <section className="bg-[var(--bg-tertiary)] backdrop-blur-xl rounded-xl shadow-[var(--shadow-sm)] border border-[var(--border-secondary)] p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <button
              ref={iconButtonRef}
              onClick={() => setShowIconPicker(true)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] bg-[var(--bg-badge)] border border-[var(--border-input)] flex items-center justify-center overflow-hidden shrink-0 hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
            >
              <ServerIcon url={isEditing ? editedIconUrl : server.iconUrl} className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
            <div className="flex-1 space-y-4 w-full">
              {!isEditing ? (
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h1 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">{server.name}</h1>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${server.name}"? This action cannot be undone.`)) {
                            onDelete(server.id);
                          }
                        }}
                        title="Delete server"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={server.enabled}
                        onChange={() => onToggle(server.id)}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1"
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  <p className="text-[var(--text-secondary)] mt-1">
                    {server.description || 'No description provided.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label>Server Name</Label>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Server name"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      placeholder="Short description"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="primary" size="sm" onClick={handleSave}>
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label>Command</Label>
                {!isEditing ? (
                  <div className="font-mono text-xs bg-[var(--bg-code)] backdrop-blur-sm text-[var(--text-primary)] p-3 rounded-md overflow-x-auto flex items-center border border-[var(--border-secondary)]">
                    <span className="text-[var(--text-tertiary)] mr-2">$</span>
                    <span className="text-[var(--text-accent)]">{server.command}</span>
                    <span className="ml-2">{(server.args || []).join(' ')}</span>
                  </div>
                ) : (
                  <Input
                    value={editedCommand}
                    onChange={(e) => setEditedCommand(e.target.value)}
                    className="font-mono text-xs"
                    placeholder="npx -y @modelcontextprotocol/server-name ..."
                    spellCheck={false}
                  />
                )}
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            <div className="lg:col-span-3 space-y-6">
              <section>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[var(--text-secondary)]" />
                  Permissions
                </h3>
                <div className="bg-[var(--bg-tertiary)] backdrop-blur-xl rounded-lg border border-[var(--border-secondary)] overflow-hidden">
                  <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-primary)] group">
                    <div>
                      <div className="font-medium text-sm text-[var(--text-primary)]">Always Ask</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        Prompt user before executing tools or accessing resources
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="radio"
                        name="perms"
                        checked={server.permissions === 'always_ask'}
                        onChange={() => onUpdate({ ...server, permissions: 'always_ask' })}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--radio-unchecked)] bg-[var(--bg-input)] transition-all peer-checked:border-[var(--radio-checked)] peer-checked:border-[6px] group-hover:border-[var(--border-hover)] peer-checked:group-hover:border-[var(--radio-checked)]" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors group">
                    <div>
                      <div className="font-medium text-sm text-[var(--text-primary)]">Allow without asking</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        Automatically approve all requests from this server
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="radio"
                        name="perms"
                        checked={server.permissions === 'allow'}
                        onChange={() => onUpdate({ ...server, permissions: 'allow' })}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--radio-unchecked)] bg-[var(--bg-input)] transition-all peer-checked:border-[var(--radio-checked)] peer-checked:border-[6px] group-hover:border-[var(--border-hover)] peer-checked:group-hover:border-[var(--radio-checked)]" />
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-[var(--text-secondary)]" />
                Application Sync
              </h3>
              <div className="bg-[var(--bg-tertiary)] backdrop-blur-xl rounded-lg border border-[var(--border-secondary)] overflow-hidden">
                <div 
                  className="flex items-center justify-between p-3 border-b border-[var(--border-secondary)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
                  onClick={() => onUpdate({ ...server, applyToAll: !server.applyToAll })}
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[var(--text-primary)]">Apply to All</div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Sync to all applications automatically
                    </div>
                  </div>
                  <Switch
                    checked={server.applyToAll ?? false}
                    onChange={() => onUpdate({ ...server, applyToAll: !server.applyToAll })}
                  />
                </div>
                {(apps || []).filter(app => {
                  const syncEnabled = appSyncStates.get(app.name) ?? true;
                  return syncEnabled;
                }).map(app => {
                  const isIncluded = server.applyToAll || (server.apps || []).includes(app.name);
                  return (
                    <div
                      key={app.name}
                      className={cn(
                        'flex items-center gap-3 p-3 border-b border-[var(--border-primary)] last:border-0 transition-colors',
                        server.applyToAll ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                        isIncluded ? 'bg-[var(--bg-hover)]' : 'bg-transparent'
                      )}
                      onClick={() => !server.applyToAll && toggleAppInclusion(app.name)}
                    >
                      <img
                        src={app.icon}
                        className={cn(
                          'w-8 h-8 rounded-md border border-[var(--border-secondary)] transition-all',
                          isIncluded ? '' : 'grayscale opacity-70'
                        )}
                        onError={e => (e.currentTarget.src = '')}
                      />
                      <div className="flex-1">
                        <div
                          className={cn(
                            'text-sm font-medium',
                            isIncluded ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                          )}
                        >
                          {app.name}
                        </div>
                      </div>
                      {isIncluded ? (
                        <CheckCircle2 className="w-5 h-5 text-[var(--text-success)]" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[var(--text-muted)]" />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-2 px-1">
                {server.applyToAll 
                  ? 'Server is synced to all applications. Disable "Apply to All" to select specific apps.'
                  : 'Click an application to toggle this server\'s availability for it.'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {showIconPicker && (
        <IconPicker
          value={isEditing ? editedIconUrl : server.iconUrl}
          onChange={(icon) => {
            if (isEditing) {
              setEditedIconUrl(icon);
            } else {
              // Update directly if not in edit mode
              onUpdate({ ...server, iconUrl: icon });
            }
            setShowIconPicker(false);
          }}
          onClose={() => setShowIconPicker(false)}
          anchorEl={iconButtonRef.current}
        />
      )}
    </div>
  );
}

function ManageAppsView({ apps, servers, onRefresh }: { apps: AppConfig[]; servers: MCPServerWithMetadata[]; onRefresh: () => void }) {
  const [appSyncStates, setAppSyncStates] = useState<Map<string, boolean>>(new Map());
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [appDetails, setAppDetails] = useState<{
    appliedServers: MCPServerWithMetadata[];
    backup: any;
    current: any;
  } | null>(null);

  useEffect(() => {
    const loadSyncStates = async () => {
      const states = new Map<string, boolean>();
      for (const app of apps) {
        const syncEnabled = await window.electronAPI.getAppSyncState(app.name);
        states.set(app.name, syncEnabled);
      }
      setAppSyncStates(states);
    };
    loadSyncStates();
  }, [apps]);

  useEffect(() => {
    if (selectedApp) {
      const loadAppDetails = async () => {
        const [appliedServers, backup, current] = await Promise.all([
          window.electronAPI.getAppAppliedServers(selectedApp),
          window.electronAPI.getAppBackup(selectedApp),
          window.electronAPI.getAppCurrentConfig(selectedApp),
        ]);
        setAppDetails({ appliedServers, backup, current });
      };
      loadAppDetails();
    } else {
      setAppDetails(null);
    }
  }, [selectedApp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedApp && e.key === 'Escape') {
        e.preventDefault();
        setSelectedApp(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedApp]);

  const handleSync = async () => {
    await window.electronAPI.syncServers();
    onRefresh();
  };

  const handleToggleSync = async (appName: string, currentState: boolean) => {
    if (currentState) {
      // Turning sync off - show confirmation
      const hasBackup = await window.electronAPI.hasAppBackup(appName);
      if (hasBackup) {
        const confirmed = confirm(
          `Turning off sync will restore ${appName}'s configuration to its backup state. Any synced servers will be removed from this app. Continue?`
        );
        if (!confirmed) return;
      }
    }
    
    await window.electronAPI.toggleAppSync(appName, !currentState);
    setAppSyncStates(prev => new Map(prev).set(appName, !currentState));
    
    if (!currentState) {
      // If turning sync back on, refresh to re-sync
      await handleSync();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] backdrop-blur-xl animate-in fade-in duration-300">
      <header className="h-14 shrink-0 px-4 sm:px-6 flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--bg-primary)] backdrop-blur-xl">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            Target Applications ({(apps || []).length})
          </h2>
          <p className="text-xs text-[var(--text-secondary)] truncate">Manage MCP-compatible applications</p>
        </div>
        <div className="flex gap-1 sm:gap-2 shrink-0">
          <Button variant="secondary" size="sm" className="gap-1" onClick={handleSync}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync All</span>
          </Button>
          <Button variant="secondary" size="sm" className="gap-1" onClick={onRefresh}>
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </header>
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(apps || []).map(app => {
          const syncEnabled = appSyncStates.get(app.name) ?? true;
          return (
            <div
              key={app.name}
              className="bg-[var(--bg-tertiary)] backdrop-blur-xl rounded-xl border border-[var(--border-secondary)] p-4 sm:p-5 shadow-[var(--shadow-sm)] flex gap-4 hover:shadow-[var(--shadow-md)] transition-all cursor-pointer"
              onClick={() => setSelectedApp(app.name)}
            >
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border border-[var(--border-secondary)] flex items-center justify-center overflow-hidden bg-[var(--bg-input)] shadow-[var(--shadow-sm)]">
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                    onError={e =>
                      (e.currentTarget.src = 'https://placehold.co/40x40?text=' + app.name[0])
                    }
                  />
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 border-[3px] border-[var(--bg-tertiary)] rounded-full",
                  syncEnabled ? "bg-[var(--switch-on)]" : "bg-[var(--text-muted)]"
                )} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-base font-medium text-[var(--text-primary)] truncate">{app.name}</h3>
                  <Badge>Detected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--text-secondary)]">
                    {syncEnabled ? 'Sync enabled' : 'Sync disabled'}
                  </p>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-[var(--text-secondary)] hidden sm:inline">Sync</span>
                    <Switch
                      checked={syncEnabled}
                      onChange={() => handleToggleSync(app.name, syncEnabled)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedApp && appDetails && (
        <div 
          className="fixed inset-0 bg-[var(--bg-modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedApp(null)}
        >
          <div 
            className="bg-[var(--bg-modal)] backdrop-blur-xl rounded-2xl shadow-[var(--shadow-xl)] border border-[var(--border-secondary)] max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 sm:px-6 py-4 border-b border-[var(--border-secondary)] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{selectedApp} Details</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[var(--text-tertiary)]">esc</span>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              <section>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Applied MCP Servers</h3>
                <div className="bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-secondary)] divide-y divide-[var(--border-primary)]">
                  {appDetails.appliedServers.length === 0 ? (
                    <div className="p-4 text-sm text-[var(--text-secondary)] italic text-center">
                      No servers applied to this application
                    </div>
                  ) : (
                    appDetails.appliedServers.map(server => (
                      <div key={server.id} className="p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-input)] flex items-center justify-center overflow-hidden shrink-0">
                          <ServerIcon url={server.iconUrl} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[var(--text-primary)]">{server.name}</div>
                          {server.description && (
                            <div className="text-xs text-[var(--text-secondary)] truncate">{server.description}</div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
              
              <section>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Backup Settings</h3>
                {appDetails.backup ? (
                  <SyntaxHighlightedText text={JSON.stringify(appDetails.backup, null, 2)} />
                ) : (
                  <div className="p-4 text-sm text-[var(--text-secondary)] italic bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-secondary)]">
                    No backup available
                  </div>
                )}
              </section>
              
              <section>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Current Settings</h3>
                {appDetails.current && Object.keys(appDetails.current).length > 0 ? (
                  <SyntaxHighlightedText text={JSON.stringify(appDetails.current, null, 2)} />
                ) : (
                  <div className="p-4 text-sm text-[var(--text-secondary)] italic bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-secondary)]">
                    No configuration found
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
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

type StudioTab = 'console' | 'parameters' | 'response';

function StudioView({ servers }: { servers: MCPServerWithMetadata[] }) {
  const [selectedServer, setSelectedServer] = useState<string>(servers[0]?.id || '');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
  const [lastResult, setLastResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<StudioTab>('console');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = window.electronAPI.onStudioLog((serverId: string, message: string) => {
      if (serverId === selectedServer) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
      }
    });
    
    return () => unsubscribe();
  }, [selectedServer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && selectedTool && isRunning && !isExecuting) {
        e.preventDefault();
        handleRunTool();
      } else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !isRunning) {
        e.preventDefault();
        handleStartStop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool, isRunning, isExecuting]);

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
    
    if (selectedTool) {
      setActiveTab('parameters');
    }
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
    setActiveTab('response');
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
  
  // Check if all required parameters are filled
  const areRequiredParametersFilled = () => {
    if (!selectedTool?.inputSchema?.required) return true;
    
    return selectedTool.inputSchema.required.every((key: string) => {
      const value = toolArgs[key];
      if (value === undefined || value === null || value === '') return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    });
  };

  const renderInputForProperty = (key: string, prop: any, required: boolean) => {
    const value = toolArgs[key] ?? '';
    
    if (prop.type === 'boolean') {
      return (
        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => updateToolArg(key, !value)}
          >
            <Switch
              checked={!!value}
              onChange={() => updateToolArg(key, !value)}
            />
            <div className="flex-1">
              <Label className="text-sm font-medium cursor-pointer">
                {prop.description || key} <code className="text-xs text-gray-500 font-mono">({key})</code>
              </Label>
            </div>
          </div>
        </div>
      );
    }
    
    if (prop.enum) {
      return (
        <div key={key}>
          <Label>
            {prop.description || key} <code className="text-xs text-gray-500 font-mono">({key})</code>
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
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
            {prop.description || key} <code className="text-xs text-gray-500 font-mono">({key})</code>
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
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
            {prop.description || key} <code className="text-xs text-gray-500 font-mono">({key})</code>
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
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
          {prop.description || key} <code className="text-xs text-gray-500 font-mono">({key})</code>
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
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
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] backdrop-blur-xl animate-in fade-in duration-300">
      <header className="h-14 shrink-0 px-4 flex items-center gap-2 sm:gap-4 border-b border-[var(--border-primary)] bg-[var(--bg-primary)] backdrop-blur-xl flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--text-secondary)] hidden sm:inline">Server:</span>
          <div className="relative">
            <select
              className="pl-8 pr-8 py-1.5 h-9 text-sm bg-[var(--bg-input)] border border-[var(--border-input)] text-[var(--text-primary)] rounded-md appearance-none font-medium outline-none focus:ring-2 focus:ring-[var(--ring-focus)]"
              value={selectedServer}
              onChange={async e => {
                const newServerId = e.target.value;
                if (isRunning) {
                  await window.electronAPI.studioStopServer(selectedServer);
                  setIsRunning(false);
                  setTools([]);
                  setSelectedTool(null);
                  addLog(`[${new Date().toLocaleTimeString()}] Server stopped.`);
                }
                setSelectedServer(newServerId);
                setLogs([]);
              }}
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
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
          </div>
        </div>

        <div className="h-6 w-px bg-[var(--border-primary)] mx-1 sm:mx-2 hidden sm:block" />

        <Button
          variant={isRunning ? 'danger' : 'primary'}
          className="gap-2"
          onClick={handleStartStop}
        >
          {isRunning ? (
            <Square className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          {isRunning ? 'Stop' : 'Start'}
          {!isRunning && (
            <span className="text-[10px] font-mono opacity-70 hidden sm:inline">
              ⏎
            </span>
          )}
        </Button>

        {isRunning ? (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-success)] bg-[var(--bg-success)] px-2.5 py-1 rounded-full border border-[var(--border-success)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--text-success)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--switch-on)]"></span>
            </span>
            <span className="hidden sm:inline">Running on stdio</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-badge)] px-2.5 py-1 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
            <span className="hidden sm:inline">Stopped</span>
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-48 sm:w-64 shrink-0 bg-[var(--bg-primary)] backdrop-blur-xl border-r border-[var(--border-primary)] flex flex-col">
          <div className="px-4 py-3 border-b border-[var(--border-primary)] flex justify-between items-center">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Tools
            </h3>
            <Badge>{tools.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {!isRunning && (
              <div className="px-4 py-8 text-center text-sm text-[var(--text-secondary)] italic">
                Start server to load tools
              </div>
            )}
            {tools.map(tool => (
              <button
                key={tool.name}
                onClick={() => setSelectedTool(tool)}
                className={cn(
                  'w-full text-left px-4 py-2 text-sm flex items-center gap-2 border-l-[3px] transition-colors',
                  selectedTool?.name === tool.name
                    ? 'bg-[var(--bg-info)] border-[var(--text-accent)] text-[var(--text-accent)]'
                    : 'border-transparent hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                )}
              >
                <TerminalSquare className="w-4 h-4 opacity-70" />
                <span className="truncate font-mono text-[13px]">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[var(--bg-elevated)] backdrop-blur-xl overflow-hidden min-w-0">
          <div className="border-b border-[var(--border-primary)] px-2 sm:px-4 flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('console')}
                className={cn(
                  'px-2 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === 'console'
                    ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                Console
              </button>
              <button
                onClick={() => setActiveTab('parameters')}
                disabled={!selectedTool}
                className={cn(
                  'px-2 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === 'parameters'
                    ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  !selectedTool && 'opacity-40 cursor-not-allowed'
                )}
              >
                Params
                {selectedTool && (
                  <span className="ml-1 sm:ml-2 font-mono text-xs text-[var(--text-accent)] bg-[var(--bg-info)] px-1.5 py-0.5 rounded hidden sm:inline">
                    {selectedTool.name}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('response')}
                disabled={!lastResult}
                className={cn(
                  'px-2 sm:px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  activeTab === 'response'
                    ? 'border-[var(--text-primary)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                  !lastResult && 'opacity-40 cursor-not-allowed'
                )}
              >
                Response
              </button>
            </div>
            {activeTab === 'parameters' && selectedTool && (
              <Button
                size="sm"
                variant="primary"
                disabled={!isRunning || isExecuting || !areRequiredParametersFilled()}
                className="gap-2 shrink-0"
                onClick={handleRunTool}
              >
                <Play className="w-3 h-3" /> {isExecuting ? 'Running...' : 'Run'}
                {!isExecuting && (
                  <span className="text-[10px] font-mono opacity-70 hidden sm:inline">
                    ⌘⏎
                  </span>
                )}
              </Button>
            )}
            {activeTab === 'response' && lastResult && (
              <button
                onClick={() => setLastResult(null)}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Clear
              </button>
            )}
            {activeTab === 'console' && logs.length > 0 && (
              <button
                onClick={() => setLogs([])}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'console' && (
              <div className="h-full flex flex-col bg-[var(--bg-code)] text-[var(--text-primary)] overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
                  {logs.length === 0 && (
                    <div className="text-[var(--text-tertiary)] italic text-center py-8">
                      No console output yet...
                    </div>
                  )}
                  {logs.map((log, i) => (
                    <div key={i} className="break-all leading-relaxed">
                      <span className="text-[var(--text-tertiary)] mr-2">{'>'}</span>
                      {log}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            )}

            {activeTab === 'parameters' && (
              <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4">
                {!selectedTool && (
                  <div className="text-center text-sm text-[var(--text-tertiary)] italic py-8">
                    Select a tool to configure parameters
                  </div>
                )}
                {selectedTool && (!selectedTool.inputSchema?.properties || Object.keys(selectedTool.inputSchema.properties).length === 0) && (
                  <div className="text-center text-sm text-[var(--text-secondary)] py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--bg-badge)] mb-3">
                      <CheckCircle2 className="w-6 h-6 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="font-medium text-[var(--text-primary)]">No parameters required</div>
                    <p className="text-xs mt-1">This tool can be executed without any input</p>
                  </div>
                )}
                {selectedTool?.inputSchema?.properties && 
                  Object.entries(selectedTool.inputSchema.properties).map(([key, prop]) => {
                    const required = selectedTool.inputSchema?.required?.includes(key) || false;
                    return renderInputForProperty(key, prop, required);
                  })
                }
              </div>
            )}

            {activeTab === 'response' && (
              <div className="h-full overflow-y-auto p-4 sm:p-6">
                {!lastResult && (
                  <div className="text-center text-sm text-[var(--text-tertiary)] italic py-8">
                    Tool response will appear here after execution
                  </div>
                )}
                {lastResult && (
                  <div className="space-y-4">
                    <div className={cn(
                      'rounded-lg border p-3 flex items-center gap-2',
                      lastResult.error 
                        ? 'bg-[var(--btn-danger-bg)] backdrop-blur-sm border-[var(--border-error)]' 
                        : 'bg-[var(--bg-success)] backdrop-blur-sm border-[var(--border-success)]'
                    )}>
                      {lastResult.error ? (
                        <>
                          <XCircle className="w-5 h-5 text-[var(--text-error)]" />
                          <span className="text-sm font-medium text-[var(--text-error)]">Error</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-[var(--text-success)]" />
                          <span className="text-sm font-medium text-[var(--text-success)]">Success</span>
                        </>
                      )}
                    </div>
                    <div className="space-y-3">
                      {Array.isArray(lastResult.data) ? (
                        lastResult.data.map((item: any, idx: number) => (
                          <div key={idx} className="bg-[var(--bg-tertiary)] backdrop-blur-sm rounded-md p-3 border border-[var(--border-secondary)]">
                            {item.type === 'text' && (
                              <div>
                                <div className="text-xs font-medium text-[var(--text-secondary)] mb-2">Text Content</div>
                                <SyntaxHighlightedText text={item.text} />
                              </div>
                            )}
                            {item.type === 'resource' && (
                              <div>
                                <div className="text-xs font-medium text-[var(--text-secondary)] mb-2">Resource</div>
                                <div className="text-sm text-[var(--text-primary)]">
                                  <div className="font-medium mb-1">{item.resource?.uri}</div>
                                  <pre className="text-xs whitespace-pre-wrap font-mono bg-[var(--bg-code)] p-2 rounded max-h-[500px] overflow-y-auto">
                                    {item.resource?.text || JSON.stringify(item.resource, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                            {item.type === 'image' && (
                              <div>
                                <div className="text-xs font-medium text-[var(--text-secondary)] mb-2">Image</div>
                                <img 
                                  src={`data:${item.mimeType};base64,${item.data}`} 
                                  alt="Tool result"
                                  className="max-w-full h-auto rounded"
                                />
                              </div>
                            )}
                            {!['text', 'resource', 'image'].includes(item.type) && (
                              <pre className="text-xs text-[var(--text-primary)] whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto">
                                {JSON.stringify(item, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="bg-[var(--bg-tertiary)] backdrop-blur-sm rounded-md border border-[var(--border-secondary)] overflow-hidden">
                          <SyntaxHighlightedText 
                            text={typeof lastResult.data === 'string' 
                              ? lastResult.data 
                              : JSON.stringify(lastResult.data, null, 2)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutView() {
  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] backdrop-blur-xl animate-in fade-in duration-300">
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="flex justify-center">
            <img 
              src="/assets/logo.svg" 
              alt="MCP Manager" 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] shadow-[var(--shadow-xl)] ring-1 ring-[var(--border-secondary)]"
              onError={(e) => {
                const div = document.createElement('div');
                div.className = 'w-24 h-24 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950 rounded-[24px] flex items-center justify-center text-white shadow-2xl ring-1 ring-gray-900/10';
                div.innerHTML = '<svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M18 3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h12zM8 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>';
                e.currentTarget.parentElement?.replaceChild(div, e.currentTarget);
              }}
            />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]">MCP Manager</h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] backdrop-blur-sm rounded-full border border-[var(--border-secondary)]">
              <div className="w-2 h-2 rounded-full bg-[var(--switch-on)]" />
              <span className="text-sm font-medium text-[var(--text-secondary)]">Version 1.0.0</span>
            </div>
          </div>
          
          <div className="pt-6 border-t border-[var(--border-primary)]">
            <p className="text-sm text-[var(--text-secondary)] mb-3">
              A beautiful tool for managing Model Context Protocol servers across all your AI applications
            </p>
            <a
              href="https://github.com/explosion-scratch"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
            >
              Made by
              <span className="font-medium text-[var(--text-accent)] group-hover:opacity-80 underline underline-offset-2">
                @Explosion-Scratch
              </span>
            </a>
          </div>
          
          <div className="pt-4">
            <p className="text-xs text-[var(--text-tertiary)]">
              Press <kbd className="px-2 py-1 bg-[var(--bg-badge)] border border-[var(--border-input)] rounded text-[10px] font-mono">esc</kbd> to return
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
