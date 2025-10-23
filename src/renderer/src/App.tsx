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
  Pencil,
} from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import 'highlight.js/styles/github.css';
import { cn } from './lib/utils';
import { Button, Input, Label, Switch, Badge, ServerIcon } from './components/ui';
import type { AppConfig, MCPServerWithMetadata, PermissionLevel } from '../../shared/types';

hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);

type Tab = 'servers' | 'apps' | 'explore' | 'studio';

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
    <pre className="text-sm whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto bg-white/70 backdrop-blur-sm text-gray-900 p-3 rounded-md border border-gray-200/50">
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
          setActiveTab('explore');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveTab('studio');
        }
      } else if (e.key === 'Escape' && selectedServerId) {
        e.preventDefault();
        setSelectedServerId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedServerId]);

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
    <div className="flex h-screen w-full bg-transparent text-gray-900 font-sans overflow-hidden selection:bg-[#cce5ff]">
      <div
        className="absolute top-0 left-0 right-0 h-3 z-50"
        style={{ WebkitAppRegion: 'drag' } as any}
      />
      
      <div className="w-[220px] shrink-0 bg-white/40 border-r border-gray-200/30 backdrop-blur-3xl flex flex-col py-4 z-10 relative">
        <div className="h-10 w-full flex items-center px-4 mb-4" />

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
            icon={Compass}
            label="Explore servers"
            active={activeTab === 'explore'}
            onClick={() => setActiveTab('explore')}
            shortcut="⌘3"
          />
          <SidebarItem
            icon={Beaker}
            label="Studio"
            active={activeTab === 'studio'}
            onClick={() => setActiveTab('studio')}
            shortcut="⌘4"
          />
        </nav>

        <div className="px-4 py-2 text-xs text-gray-400 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
          System Synced
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/50 relative">
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
          ? 'bg-gray-900/10 text-gray-900 shadow-sm'
          : 'text-gray-500 hover:bg-gray-900/5 hover:text-gray-900'
      )}
    >
      <Icon
        className={cn(
          'w-4 h-4 transition-colors',
          active ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-500'
        )}
      />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className={cn(
          'text-[10px] font-mono px-1 py-0.5 rounded transition-colors',
          active ? 'text-gray-500' : 'text-gray-400 opacity-0 group-hover:opacity-100'
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
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-2xl bg-white/80 rounded-2xl shadow-2xl border border-gray-200/50 p-8 space-y-6 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add New Server</h2>
                <p className="text-sm text-gray-500 mt-1">Install and configure a new MCP server</p>
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
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
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
                    spellCheck={false}
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

            <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
              <div className="text-xs text-gray-500 flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">esc</kbd>
                  to cancel
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono">⌘⏎</kbd>
                  to install
                </span>
              </div>
              <Button type="submit" variant="primary" size="sm" className="gap-2">
                <Plus className="w-3.5 h-3.5" />
                Install & Add Server
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <header className="h-14 shrink-0 px-6 flex items-center justify-between border-b border-gray-200/30 bg-white/40 backdrop-blur-xl">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Configured Servers</h2>
          <p className="text-xs text-gray-500">
            Manage MCP servers synced across your system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setIsImporting(!isImporting)}
          >
            <FileJson className="w-4 h-4" />
            <span className="text-[10px] font-mono text-gray-400">⌘I</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="gap-2"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Server
            <span className="text-[10px] font-mono opacity-70">⌘N</span>
          </Button>
        </div>
      </header>

      {isImporting && (
        <div className="border-b border-gray-200/30 bg-white/60 backdrop-blur-xl p-6 animate-in slide-in-from-top-2 duration-200">
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

      <div className="flex-1 overflow-y-auto p-6">
        <div className="rounded-xl border border-gray-200/50 bg-white/70 backdrop-blur-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50 text-xs uppercase tracking-wider font-medium text-gray-500">
              <tr>
                <th className="px-4 py-3 w-12 text-center">On</th>
                <th className="px-4 py-3">Server</th>
                <th className="px-4 py-3">Command</th>
                <th className="px-4 py-3 w-32">Apps</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {servers.map(server => (
                <tr key={server.id} className="group hover:bg-white/50 transition-colors">
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
    <div className="flex flex-col h-full bg-white/20 backdrop-blur-xl animate-in slide-in-from-right-4 duration-300">
      <header className="h-14 shrink-0 px-4 flex items-center gap-2 border-b border-gray-200/30 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-gray-500 gap-2"
          onClick={onBack}
        >
          <ChevronLeft className="w-4 h-4" /> Servers
          <span className="text-[10px] font-mono text-gray-400">
            esc
          </span>
        </Button>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-2 font-medium text-sm">
          <ServerIcon url={server.iconUrl} className="w-4 h-4" />
          {server.name}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8 space-y-8">
          <section className="bg-white/70 backdrop-blur-xl rounded-xl shadow-sm border border-gray-200/50 p-6 flex gap-6 items-start">
            <div className="w-20 h-20 rounded-[18px] bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
              <ServerIcon url={isEditing ? editedIconUrl : server.iconUrl} className="w-10 h-10" />
            </div>
            <div className="flex-1 space-y-4">
              {!isEditing ? (
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-gray-900">{server.name}</h1>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="danger"
                        size="icon"
                        className="hover:bg-red-200"
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
                  <p className="text-gray-500 mt-1">
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
                  <div>
                    <Label>Icon URL</Label>
                    <Input
                      value={editedIconUrl}
                      onChange={(e) => setEditedIconUrl(e.target.value)}
                      placeholder="https://..."
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
                  <div className="font-mono text-xs bg-white/70 backdrop-blur-sm text-gray-900 p-3 rounded-md overflow-x-auto flex items-center border border-gray-200/50">
                    <span className="text-gray-400 mr-2">$</span>
                    <span className="text-blue-600">{server.command}</span>
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

          <div className="grid grid-cols-5 gap-8">
            <div className="col-span-3 space-y-6">
              <section>
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-gray-500" />
                  Permissions
                </h3>
                <div className="bg-white/70 backdrop-blur-xl rounded-lg border border-gray-200/50 overflow-hidden">
                  <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/40 transition-colors border-b border-gray-100/50 group">
                    <div>
                      <div className="font-medium text-sm text-gray-900">Always Ask</div>
                      <div className="text-xs text-gray-500">
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
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white transition-all peer-checked:border-gray-900 peer-checked:border-[6px] group-hover:border-gray-400 peer-checked:group-hover:border-gray-900" />
                    </div>
                  </label>
                  <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/40 transition-colors group">
                    <div>
                      <div className="font-medium text-sm text-gray-900">Allow without asking</div>
                      <div className="text-xs text-gray-500">
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
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white transition-all peer-checked:border-gray-900 peer-checked:border-[6px] group-hover:border-gray-400 peer-checked:group-hover:border-gray-900" />
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div className="col-span-2">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AppWindow className="w-4 h-4 text-gray-500" />
                Application Sync
              </h3>
              <div className="bg-white/70 backdrop-blur-xl rounded-lg border border-gray-200/50 overflow-hidden">
                {(apps || []).map(app => {
                  const isIncluded = (server.apps || []).includes(app.name);
                  return (
                    <div
                      key={app.name}
                      className={cn(
                        'flex items-center gap-3 p-3 border-b border-gray-100/50 last:border-0 transition-colors cursor-pointer',
                        isIncluded ? 'bg-white/50 hover:bg-white/70' : 'bg-white/20'
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
    <div className="flex flex-col h-full bg-white/20 backdrop-blur-xl animate-in fade-in duration-300">
      <header className="h-14 shrink-0 px-6 flex items-center justify-between border-b border-gray-200/30 bg-white/40 backdrop-blur-xl">
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
            className="bg-white/70 backdrop-blur-xl rounded-xl border border-gray-200/50 p-5 shadow-sm flex gap-4 hover:shadow-md transition-all"
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
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full" />
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

  const renderInputForProperty = (key: string, prop: any, required: boolean) => {
    const value = toolArgs[key] ?? '';
    
    if (prop.type === 'boolean') {
      return (
        <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
          <Switch
            checked={!!value}
            onChange={() => updateToolArg(key, !value)}
          />
          <div className="flex-1">
            <Label className="text-sm font-medium">{key}</Label>
            {prop.description && (
              <p className="text-xs text-gray-500 mt-0.5">{prop.description}</p>
            )}
          </div>
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
    <div className="flex flex-col h-full bg-white/20 backdrop-blur-xl animate-in fade-in duration-300">
      <header className="h-14 shrink-0 px-4 flex items-center gap-4 border-b border-gray-200/30 bg-white/40 backdrop-blur-xl">
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
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="h-6 w-px bg-gray-200 mx-2" />

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
            <span className="text-[10px] font-mono opacity-70">
              ⏎
            </span>
          )}
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
        <div className="w-64 bg-white/50 backdrop-blur-xl border-r border-gray-200/30 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200/30 flex justify-between items-center">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Available Tools
            </h3>
            <Badge>{tools.length}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {!isRunning && (
              <div className="px-4 py-8 text-center text-sm text-gray-500 italic">
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
                    ? 'bg-blue-500/10 border-blue-500 text-blue-900'
                    : 'border-transparent hover:bg-white/40 text-gray-700'
                )}
              >
                <TerminalSquare className="w-4 h-4 opacity-70" />
                <span className="truncate font-mono text-[13px]">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white/60 backdrop-blur-xl overflow-hidden">
          <div className="border-b border-gray-200/30 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('console')}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'console'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                Console
              </button>
              <button
                onClick={() => setActiveTab('parameters')}
                disabled={!selectedTool}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'parameters'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
                  !selectedTool && 'opacity-40 cursor-not-allowed'
                )}
              >
                Parameters
                {selectedTool && (
                  <span className="ml-2 font-mono text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    {selectedTool.name}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('response')}
                disabled={!lastResult}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                  activeTab === 'response'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700',
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
                disabled={!isRunning || isExecuting}
                className="gap-2"
                onClick={handleRunTool}
              >
                <Play className="w-3 h-3" /> {isExecuting ? 'Running...' : 'Run Tool'}
                {!isExecuting && (
                  <span className="text-[10px] font-mono opacity-70">
                    ⌘⏎
                  </span>
                )}
              </Button>
            )}
            {activeTab === 'response' && lastResult && (
              <button
                onClick={() => setLastResult(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
            {activeTab === 'console' && logs.length > 0 && (
              <button
                onClick={() => setLogs([])}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'console' && (
              <div className="h-full flex flex-col bg-white text-gray-900 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
                  {logs.length === 0 && (
                    <div className="text-gray-400 italic text-center py-8">
                      No console output yet...
                    </div>
                  )}
                  {logs.map((log, i) => (
                    <div key={i} className="break-all leading-relaxed">
                      <span className="text-gray-400 mr-2">{'>'}</span>
                      {log}
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            )}

            {activeTab === 'parameters' && (
              <div className="h-full overflow-y-auto p-6 space-y-4">
                {!selectedTool && (
                  <div className="text-center text-sm text-gray-400 italic py-8">
                    Select a tool to configure parameters
                  </div>
                )}
                {selectedTool && (!selectedTool.inputSchema?.properties || Object.keys(selectedTool.inputSchema.properties).length === 0) && (
                  <div className="text-center text-sm text-gray-500 py-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                      <CheckCircle2 className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="font-medium text-gray-700">No parameters required</div>
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
              <div className="h-full overflow-y-auto p-6">
                {!lastResult && (
                  <div className="text-center text-sm text-gray-400 italic py-8">
                    Tool response will appear here after execution
                  </div>
                )}
                {lastResult && (
                  <div className="space-y-4">
                    <div className={cn(
                      'rounded-lg border p-3 flex items-center gap-2',
                      lastResult.error 
                        ? 'bg-red-50/70 backdrop-blur-sm border-red-200/50' 
                        : 'bg-green-50/70 backdrop-blur-sm border-green-200/50'
                    )}>
                      {lastResult.error ? (
                        <>
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium text-red-900">Error</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Success</span>
                        </>
                      )}
                    </div>
                    <div className="space-y-3">
                      {Array.isArray(lastResult.data) ? (
                        lastResult.data.map((item: any, idx: number) => (
                          <div key={idx} className="bg-white/70 backdrop-blur-sm rounded-md p-3 border border-gray-200/50">
                            {item.type === 'text' && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 mb-2">Text Content</div>
                                <SyntaxHighlightedText text={item.text} />
                              </div>
                            )}
                            {item.type === 'resource' && (
                              <div>
                                <div className="text-xs font-medium text-gray-500 mb-2">Resource</div>
                                <div className="text-sm text-gray-800">
                                  <div className="font-medium mb-1">{item.resource?.uri}</div>
                                  <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded max-h-[500px] overflow-y-auto">
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
                              <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono max-h-[500px] overflow-y-auto">
                                {JSON.stringify(item, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="bg-white/70 backdrop-blur-sm rounded-md border border-gray-200/50 overflow-hidden">
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
