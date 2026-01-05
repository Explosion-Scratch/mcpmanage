import __farmNodeModule from 'node:module';global.nodeRequire = __farmNodeModule.createRequire(import.meta.url);global['e20309b3317686f6c8a7cfe5559430f9'] = {__FARM_TARGET_ENV__: 'node'};function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) return obj;
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
        default: obj
    };
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}const __global_this__ = typeof globalThis !== 'undefined' ? globalThis : window;
var index_js_default = {
    name: 'farm-runtime-import-meta',
    _moduleSystem: {},
    bootstrap (system) {
        this._moduleSystem = system;
    },
    moduleCreated (module) {
        const publicPath = this._moduleSystem.publicPaths?.[0] || "";
        const isSSR = this._moduleSystem.targetEnv === "node";
        const { location } = __global_this__;
        let baseUrl;
        try {
            baseUrl = (location ? new URL(publicPath, `${location.protocol}//${location.host}`) : new URL(module.resource_pot)).pathname;
        } catch (_) {
            baseUrl = '/';
        }
        module.meta.env = {
            ...{
                "FARM_DEV_SERVER_URL": "http://localhost:5173",
                "NODE_ENV": "production",
                "mode": "production"
            } ?? {},
            dev: process.env.NODE_ENV === 'development',
            prod: process.env.NODE_ENV === 'production',
            BASE_URL: baseUrl,
            SSR: isSSR
        };
        const url = location ? `${location.protocol}//${location.host}${publicPath.replace(/\/$/, '')}/${module.id}?t=${Date.now()}` : module.resource_pot;
        module.meta.url = url;
    }
};

class Module {
    constructor(id, require){
        this.resource_pot = "";
        this.id = id;
        this.exports = {};
        this.meta = {
            env: {}
        };
        this.require = require;
    }
    o(to, to_k, get) {
        Object.defineProperty(to, to_k, {
            enumerable: true,
            get
        });
    }
    d(to, to_k, val) {
        this.o(to, to_k, function() {
            return val;
        });
    }
    _m(to) {
        const key = '__esModule';
        if (to[key]) return;
        Object.defineProperty(to, key, {
            value: true
        });
    }
    _e(to, from) {
        Object.keys(from).forEach(function(k) {
            if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
                Object.defineProperty(to, k, {
                    value: from[k],
                    enumerable: true,
                    configurable: true
                });
            }
        });
        return from;
    }
    i(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }
    _g(nodeInterop) {
        if (typeof WeakMap !== "function") return null;
        var cacheBabelInterop = new WeakMap();
        var cacheNodeInterop = new WeakMap();
        return (this._g = function(nodeInterop) {
            return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
        })(nodeInterop);
    }
    w(obj, nodeInterop) {
        if (!nodeInterop && obj && obj.__esModule) return obj;
        if (obj === null || typeof obj !== "object" && typeof obj !== "function") return {
            default: obj
        };
        var cache = this._g(nodeInterop);
        if (cache && cache.has(obj)) return cache.get(obj);
        var newObj = {
            __proto__: null
        };
        var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
        for(var key$1 in obj){
            if (key$1 !== "default" && Object.prototype.hasOwnProperty.call(obj, key$1)) {
                var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key$1) : null;
                if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key$1, desc);
                else newObj[key$1] = obj[key$1];
            }
        }
        newObj.default = obj;
        if (cache) cache.set(obj, newObj);
        return newObj;
    }
    _(to, to_k, from, from_k) {
        this.d(to, to_k, from[from_k || to_k]);
    }
    p(to, val) {
        for (const key$2 of Object.keys(val)){
            const newKey = to[key$2];
            if (newKey && !Object.prototype.hasOwnProperty.call(val, newKey)) {
                this.d(val, newKey, val[key$2]);
            }
        }
    }
    f(v) {
        if (typeof v.default !== 'undefined') {
            return v.default;
        }
        return v;
    }
}

class FarmRuntimePluginContainer {
    constructor(plugins){
        this.plugins = [];
        this.plugins = plugins;
    }
    hookSerial(hookName, ...args) {
        for (const plugin of this.plugins){
            const hook = plugin[hookName];
            if (hook) {
                hook.apply(plugin, args);
            }
        }
    }
    hookBail(hookName, ...args) {
        for (const plugin$1 of this.plugins){
            const hook$1 = plugin$1[hookName];
            if (hook$1) {
                const result = hook$1.apply(plugin$1, args);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }
}

const __farm_global_this__ = global['e20309b3317686f6c8a7cfe5559430f9'];
const __global_this__$1 = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {};
const targetEnv = __farm_global_this__.__FARM_TARGET_ENV__ || 'node';
const isBrowser = targetEnv === 'browser' && __global_this__$1.document;
class ResourceLoader {
    constructor(moduleSystem, publicPaths){
        this.moduleSystem = moduleSystem;
        this._loadedResources = {};
        this._loadingResources = {};
        this.publicPaths = publicPaths;
    }
    load(resource, index = 0) {
        if (!isBrowser) {
            const result$1 = this.moduleSystem.pluginContainer.hookBail('loadResource', resource);
            if (result$1) {
                return result$1.then((res)=>{
                    if (!res.success && res.retryWithDefaultResourceLoader) {
                        if (resource.type === 0) {
                            return this._loadScript(`./${resource.path}`);
                        } else if (resource.type === 1) {
                            return this._loadLink(`./${resource.path}`);
                        }
                    } else if (!res.success) {
                        throw new Error(`[Farm] Failed to load resource: "${resource.path}, type: ${resource.type}". Original Error: ${res.err}`);
                    }
                });
            } else {
                if (resource.type === 0) {
                    return this._loadScript(`./${resource.path}`);
                } else if (resource.type === 1) {
                    return this._loadLink(`./${resource.path}`);
                }
            }
        }
        const publicPath = this.publicPaths[index];
        const url = `${publicPath.endsWith('/') ? publicPath.slice(0, -1) : publicPath}/${resource.path}`;
        if (this._loadedResources[resource.path]) {
            return Promise.resolve();
        } else if (this._loadingResources[resource.path]) {
            return this._loadingResources[resource.path];
        }
        const result$2 = this.moduleSystem.pluginContainer.hookBail('loadResource', resource);
        if (result$2) {
            return result$2.then((res)=>{
                if (res.success) {
                    this.setLoadedResource(resource.path);
                } else if (res.retryWithDefaultResourceLoader) {
                    return this._load(url, resource, index);
                } else {
                    throw new Error(`[Farm] Failed to load resource: "${resource.path}, type: ${resource.type}". Original Error: ${res.err}`);
                }
            });
        } else {
            return this._load(url, resource, index);
        }
    }
    setLoadedResource(path, loaded = true) {
        this._loadedResources[path] = loaded;
    }
    isResourceLoaded(path) {
        return this._loadedResources[path];
    }
    _load(url, resource, index) {
        let promise = Promise.resolve();
        if (resource.type === 0) {
            promise = this._loadScript(url);
        } else if (resource.type === 1) {
            promise = this._loadLink(url);
        }
        this._loadingResources[resource.path] = promise;
        promise.then(()=>{
            this._loadedResources[resource.path] = true;
            this._loadingResources[resource.path] = null;
        }).catch((e)=>{
            console.warn(`[Farm] Failed to load resource "${url}" using publicPath: ${this.publicPaths[index]}`);
            index++;
            if (index < this.publicPaths.length) {
                return this._load(url, resource, index);
            } else {
                this._loadingResources[resource.path] = null;
                throw new Error(`[Farm] Failed to load resource: "${resource.path}, type: ${resource.type}". ${e}`);
            }
        });
        return promise;
    }
    _loadScript(path) {
        if ("node" !== 'browser') {
            return import(path);
        } else {
            return new Promise((resolve, reject)=>{
                const script = document.createElement('script');
                script.src = path;
                document.body.appendChild(script);
                script.onload = ()=>{
                    resolve();
                };
                script.onerror = (e)=>{
                    reject(e);
                };
            });
        }
    }
    _loadLink(path) {
        if ("node" !== 'browser') {
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject)=>{
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = path;
                document.head.appendChild(link);
                link.onload = ()=>{
                    resolve();
                };
                link.onerror = (e)=>{
                    reject(e);
                };
            });
        }
    }
}
var resource_loader_js_ns = {
    ResourceLoader: ResourceLoader,
    __farm_global_this__: __farm_global_this__,
    __global_this__: __global_this__$1,
    isBrowser: isBrowser,
    targetEnv: targetEnv,
    __esModule: true
};

class ModuleSystem {
    constructor(){
        this.dynamicResources = [];
        this.modules = {};
        this.cache = {};
        this.publicPaths = [];
        this.dynamicModuleResourcesMap = {};
        this.resourceLoader = new ResourceLoader(this, this.publicPaths);
        this.pluginContainer = new FarmRuntimePluginContainer([]);
        this.targetEnv = targetEnv;
        this.externalModules = {};
        this.reRegisterModules = false;
    }
    require(moduleId, isCJS = false) {
        if (this.cache[moduleId]) {
            const shouldSkip = this.pluginContainer.hookBail("readModuleCache", this.cache[moduleId]);
            if (!shouldSkip) {
                const cachedModule = this.cache[moduleId];
                return cachedModule.initializer || cachedModule.exports;
            }
        }
        const initializer = this.modules[moduleId];
        if (!initializer) {
            if (this.externalModules[moduleId]) {
                const exports = this.externalModules[moduleId];
                if (isCJS) {
                    return exports.default || exports;
                }
                return exports;
            }
            if ((this.targetEnv === "node" || !isBrowser) && nodeRequire) {
                const externalModule = nodeRequire(moduleId);
                return externalModule;
            }
            this.pluginContainer.hookSerial("moduleNotFound", moduleId);
            console.debug(`[Farm] Module "${moduleId}" is not registered`);
            return {};
        }
        const module = new Module(moduleId, this.require.bind(this));
        module.resource_pot = initializer.__farm_resource_pot__;
        this.pluginContainer.hookSerial("moduleCreated", module);
        this.cache[moduleId] = module;
        if (!__global_this__$1.require) {
            __global_this__$1.require = this.require.bind(this);
        }
        const result$3 = initializer(module, module.exports, this.require.bind(this), this.farmDynamicRequire.bind(this));
        if (result$3 && result$3 instanceof Promise) {
            module.initializer = result$3.then(()=>{
                this.pluginContainer.hookSerial("moduleInitialized", module);
                module.initializer = undefined;
                return module.exports;
            });
            return module.initializer;
        } else {
            this.pluginContainer.hookSerial("moduleInitialized", module);
            return module.exports;
        }
    }
    farmDynamicRequire(moduleId) {
        if (this.modules[moduleId]) {
            const exports$1 = this.require(moduleId);
            if (exports$1.__farm_async) {
                return exports$1.default;
            } else {
                return Promise.resolve(exports$1);
            }
        }
        return this.loadDynamicResources(moduleId);
    }
    loadDynamicResourcesOnly(moduleId, force = false) {
        const resources = this.dynamicModuleResourcesMap[moduleId].map((index)=>this.dynamicResources[index]);
        if (!resources || resources.length === 0) {
            throw new Error(`Dynamic imported module "${moduleId}" does not belong to any resource`);
        }
        if (force) {
            this.clearCache(moduleId);
        }
        return Promise.all(resources.map((resource)=>{
            if (force) {
                const resourceLoaded = this.resourceLoader.isResourceLoaded(resource.path);
                this.resourceLoader.setLoadedResource(resource.path, false);
                if (resourceLoaded) {
                    return this.resourceLoader.load({
                        ...resource,
                        path: `${resource.path}?t=${Date.now()}`
                    });
                }
            }
            return this.resourceLoader.load(resource);
        }));
    }
    loadDynamicResources(moduleId, force = false) {
        const resources$1 = this.dynamicModuleResourcesMap[moduleId].map((index)=>this.dynamicResources[index]);
        return this.loadDynamicResourcesOnly(moduleId, force).then(()=>{
            if (resources$1.every((resource)=>resource.type !== 0)) {
                return;
            }
            if (!this.modules[moduleId]) {
                throw new Error(`Dynamic imported module "${moduleId}" is not registered.`);
            }
            const result$4 = this.require(moduleId);
            if (result$4.__farm_async) {
                return result$4.default;
            } else {
                return result$4;
            }
        }).catch((err)=>{
            console.error(`[Farm] Error loading dynamic module "${moduleId}"`, err);
            throw err;
        });
    }
    register(moduleId, initializer) {
        if (this.modules[moduleId] && !this.reRegisterModules) {
            console.warn(`Module "${moduleId}" has registered! It should not be registered twice`);
            return;
        }
        this.modules[moduleId] = initializer;
    }
    update(moduleId, init) {
        this.modules[moduleId] = init;
        this.clearCache(moduleId);
    }
    delete(moduleId) {
        if (this.modules[moduleId]) {
            this.clearCache(moduleId);
            delete this.modules[moduleId];
            return true;
        } else {
            return false;
        }
    }
    getModuleUrl(moduleId) {
        const publicPath$1 = this.publicPaths[0] ?? "";
        if (isBrowser) {
            const url$1 = `${window.location.protocol}//${window.location.host}${publicPath$1.endsWith("/") ? publicPath$1.slice(0, -1) : publicPath$1}/${this.modules[moduleId].__farm_resource_pot__}`;
            return url$1;
        } else {
            return this.modules[moduleId].__farm_resource_pot__;
        }
    }
    getCache(moduleId) {
        return this.cache[moduleId];
    }
    clearCache(moduleId) {
        if (this.cache[moduleId]) {
            delete this.cache[moduleId];
            return true;
        } else {
            return false;
        }
    }
    setInitialLoadedResources(resources) {
        for (const resource of resources){
            this.resourceLoader.setLoadedResource(resource);
        }
    }
    setDynamicModuleResourcesMap(dynamicResources, dynamicModuleResourcesMap) {
        this.dynamicResources = dynamicResources;
        this.dynamicModuleResourcesMap = dynamicModuleResourcesMap;
    }
    setPublicPaths(publicPaths) {
        this.publicPaths = publicPaths;
        this.resourceLoader.publicPaths = this.publicPaths;
    }
    setPlugins(plugins) {
        this.pluginContainer.plugins = plugins;
    }
    addPlugin(plugin) {
        if (this.pluginContainer.plugins.every((p)=>p.name !== plugin.name)) {
            this.pluginContainer.plugins.push(plugin);
        }
    }
    removePlugin(pluginName) {
        this.pluginContainer.plugins = this.pluginContainer.plugins.filter((p)=>p.name !== pluginName);
    }
    setExternalModules(externalModules) {
        Object.assign(this.externalModules, externalModules || {});
    }
    bootstrap() {
        this.pluginContainer.hookSerial("bootstrap", this);
    }
}

__farm_global_this__.__farm_module_system__ = (function() {
    const moduleSystem = new ModuleSystem();
    return function() {
        return moduleSystem;
    };
})()();
global['e20309b3317686f6c8a7cfe5559430f9'].__farm_module_system__.setPlugins([
    index_js_default
]);
import * as __farm_external_module__modelcontextprotocol_sdk_client_index_js from "@modelcontextprotocol/sdk/client/index.js";import * as __farm_external_module__modelcontextprotocol_sdk_client_sse_js from "@modelcontextprotocol/sdk/client/sse.js";import * as __farm_external_module__modelcontextprotocol_sdk_client_stdio_js from "@modelcontextprotocol/sdk/client/stdio.js";import * as __farm_external_module__modelcontextprotocol_sdk_client_streamableHttp_js from "@modelcontextprotocol/sdk/client/streamableHttp.js";import * as __farm_external_module_child_process from "child_process";import * as __farm_external_module_electron from "electron";import * as __farm_external_module_electron_liquid_glass from "electron-liquid-glass";import * as __farm_external_module_fs from "fs";import * as __farm_external_module_fs_promises from "fs/promises";import * as __farm_external_module_node_path from "node:path";import * as __farm_external_module_node_url from "node:url";import * as __farm_external_module_os from "os";import * as __farm_external_module_path from "path";import * as __farm_external_module_smol_toml from "smol-toml";global['e20309b3317686f6c8a7cfe5559430f9'].__farm_module_system__.setExternalModules({"@modelcontextprotocol/sdk/client/index.js": __farm_external_module__modelcontextprotocol_sdk_client_index_js && __farm_external_module__modelcontextprotocol_sdk_client_index_js.default && !__farm_external_module__modelcontextprotocol_sdk_client_index_js.__esModule ? {...__farm_external_module__modelcontextprotocol_sdk_client_index_js,__esModule:true} : {...__farm_external_module__modelcontextprotocol_sdk_client_index_js},"@modelcontextprotocol/sdk/client/sse.js": __farm_external_module__modelcontextprotocol_sdk_client_sse_js && __farm_external_module__modelcontextprotocol_sdk_client_sse_js.default && !__farm_external_module__modelcontextprotocol_sdk_client_sse_js.__esModule ? {...__farm_external_module__modelcontextprotocol_sdk_client_sse_js,__esModule:true} : {...__farm_external_module__modelcontextprotocol_sdk_client_sse_js},"@modelcontextprotocol/sdk/client/stdio.js": __farm_external_module__modelcontextprotocol_sdk_client_stdio_js && __farm_external_module__modelcontextprotocol_sdk_client_stdio_js.default && !__farm_external_module__modelcontextprotocol_sdk_client_stdio_js.__esModule ? {...__farm_external_module__modelcontextprotocol_sdk_client_stdio_js,__esModule:true} : {...__farm_external_module__modelcontextprotocol_sdk_client_stdio_js},"@modelcontextprotocol/sdk/client/streamableHttp.js": __farm_external_module__modelcontextprotocol_sdk_client_streamableHttp_js && __farm_external_module__modelcontextprotocol_sdk_client_streamableHttp_js.default && !__farm_external_module__modelcontextprotocol_sdk_client_streamableHttp_js.__esModule ? {...__farm_external_module__modelcontextprotocol_sdk_client_streamableHttp_js,__esModule:true} : {...__farm_external_module__modelcontextprotocol_sdk_client_streamableHttp_js},"child_process": __farm_external_module_child_process && __farm_external_module_child_process.default && !__farm_external_module_child_process.__esModule ? {...__farm_external_module_child_process,__esModule:true} : {...__farm_external_module_child_process},"electron": __farm_external_module_electron && __farm_external_module_electron.default && !__farm_external_module_electron.__esModule ? {...__farm_external_module_electron,__esModule:true} : {...__farm_external_module_electron},"electron-liquid-glass": __farm_external_module_electron_liquid_glass && __farm_external_module_electron_liquid_glass.default && !__farm_external_module_electron_liquid_glass.__esModule ? {...__farm_external_module_electron_liquid_glass,__esModule:true} : {...__farm_external_module_electron_liquid_glass},"fs": __farm_external_module_fs && __farm_external_module_fs.default && !__farm_external_module_fs.__esModule ? {...__farm_external_module_fs,__esModule:true} : {...__farm_external_module_fs},"fs/promises": __farm_external_module_fs_promises && __farm_external_module_fs_promises.default && !__farm_external_module_fs_promises.__esModule ? {...__farm_external_module_fs_promises,__esModule:true} : {...__farm_external_module_fs_promises},"node:path": __farm_external_module_node_path && __farm_external_module_node_path.default && !__farm_external_module_node_path.__esModule ? {...__farm_external_module_node_path,__esModule:true} : {...__farm_external_module_node_path},"node:url": __farm_external_module_node_url && __farm_external_module_node_url.default && !__farm_external_module_node_url.__esModule ? {...__farm_external_module_node_url,__esModule:true} : {...__farm_external_module_node_url},"os": __farm_external_module_os && __farm_external_module_os.default && !__farm_external_module_os.__esModule ? {...__farm_external_module_os,__esModule:true} : {...__farm_external_module_os},"path": __farm_external_module_path && __farm_external_module_path.default && !__farm_external_module_path.__esModule ? {...__farm_external_module_path,__esModule:true} : {...__farm_external_module_path},"smol-toml": __farm_external_module_smol_toml && __farm_external_module_smol_toml.default && !__farm_external_module_smol_toml.__esModule ? {...__farm_external_module_smol_toml,__esModule:true} : {...__farm_external_module_smol_toml}});(function(_){var filename = ((function(){return import.meta.url})());for(var r in _){_[r].__farm_resource_pot__=filename;global['e20309b3317686f6c8a7cfe5559430f9'].__farm_module_system__.register(r,_[r])}})({"01630ced":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "MCPConfigManager", ()=>MCPConfigManager);
    class MCPConfigManager {
        adapters;
        constructor(adapters){
            this.adapters = adapters;
        }
        getAdapters() {
            return this.adapters;
        }
        parseCommand(command) {
            const parts = command.trim().split(/\s+/);
            if (parts.length === 0) {
                throw new Error('Empty command');
            }
            return {
                command: parts[0],
                args: parts.slice(1)
            };
        }
        async readAppConfig(adapter) {
            return await adapter.getServers();
        }
        async writeAppConfig(adapter, servers) {
            return await adapter.setServers(servers);
        }
        async getAllServers() {
            const allServers = {};
            for (const adapter of this.adapters){
                const servers = await this.readAppConfig(adapter);
                for (const [key, server] of Object.entries(servers)){
                    if (allServers[key]) {
                        if (!allServers[key].apps.includes(adapter.name)) {
                            allServers[key].apps.push(adapter.name);
                        }
                    } else {
                        allServers[key] = {
                            ...server,
                            apps: [
                                adapter.name
                            ]
                        };
                    }
                }
            }
            return allServers;
        }
        async addServer(name, server, appNames) {
            const targetAdapters = appNames ? this.adapters.filter((adapter)=>appNames.includes(adapter.name)) : this.adapters;
            let success = true;
            for (const adapter of targetAdapters){
                const servers = await this.readAppConfig(adapter);
                servers[name] = server;
                const written = await this.writeAppConfig(adapter, servers);
                if (!written) {
                    success = false;
                }
            }
            return success;
        }
        async updateServer(name, server, appNames) {
            return await this.addServer(name, server, appNames);
        }
        async removeServer(name, appNames) {
            const targetAdapters = appNames ? this.adapters.filter((adapter)=>appNames.includes(adapter.name)) : this.adapters;
            let success = true;
            for (const adapter of targetAdapters){
                const servers = await this.readAppConfig(adapter);
                delete servers[name];
                const written = await this.writeAppConfig(adapter, servers);
                if (!written) {
                    success = false;
                }
            }
            return success;
        }
        async toggleServer(name, enabled, server, appNames) {
            if (enabled) {
                return await this.addServer(name, server, appNames);
            } else {
                return await this.removeServer(name, appNames);
            }
        }
    }
}
,
"0b861e2b":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "MCPStudioService", ()=>MCPStudioService);
    var _f_index = farmRequire('@modelcontextprotocol/sdk/client/index.js');
    var _f_stdio = farmRequire('@modelcontextprotocol/sdk/client/stdio.js');
    var _f_sse = farmRequire('@modelcontextprotocol/sdk/client/sse.js');
    var _f_streamableHttp = farmRequire('@modelcontextprotocol/sdk/client/streamableHttp.js');
    class MCPStudioService {
        connections = new Map();
        mainWindow = null;
        setMainWindow(window) {
            this.mainWindow = window;
        }
        sendLog(serverId, message) {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                this.mainWindow.webContents.send('studio:log', serverId, message);
            }
        }
        createTransport(server) {
            const transportType = server.transportType || 'stdio';
            switch(transportType){
                case 'streamable-http':
                    {
                        if (!server.url) {
                            throw new Error('URL is required for Streamable HTTP transport');
                        }
                        const transport = new _f_streamableHttp.StreamableHTTPClientTransport(new URL(server.url));
                        transport.onerror = (error)=>{
                            this.sendLog(server.id, `[Error] ${error.message}`);
                        };
                        transport.onclose = ()=>{
                            this.sendLog(server.id, '[Connection] Transport closed');
                        };
                        return {
                            transport,
                            transportType
                        };
                    }
                case 'sse':
                    {
                        if (!server.url) {
                            throw new Error('URL is required for SSE transport');
                        }
                        const transport = new _f_sse.SSEClientTransport(new URL(server.url));
                        transport.onerror = (error)=>{
                            this.sendLog(server.id, `[Error] ${error.message}`);
                        };
                        transport.onclose = ()=>{
                            this.sendLog(server.id, '[Connection] Transport closed');
                        };
                        return {
                            transport,
                            transportType
                        };
                    }
                case 'stdio':
                default:
                    {
                        const transport = new _f_stdio.StdioClientTransport({
                            command: server.command,
                            args: server.args,
                            env: server.env
                        });
                        return {
                            transport,
                            transportType: 'stdio'
                        };
                    }
            }
        }
        attachStdioListeners(transport, serverId) {
            const attachProcessListeners = ()=>{
                const process = transport._process;
                if (!process) {
                    setTimeout(attachProcessListeners, 50);
                    return;
                }
                if (process.stderr) {
                    process.stderr.on('data', (data)=>{
                        const message = data.toString();
                        if (message) {
                            const lines = message.split('\n').filter((line)=>line.trim());
                            lines.forEach((line)=>this.sendLog(serverId, line));
                        }
                    });
                }
                if (process.stdout) {
                    const stdoutBuffer = [];
                    process.stdout.on('data', (data)=>{
                        const message = data.toString();
                        stdoutBuffer.push(message);
                        const combined = stdoutBuffer.join('');
                        const lines = combined.split('\n');
                        stdoutBuffer.length = 0;
                        if (lines[lines.length - 1] !== '') {
                            stdoutBuffer.push(lines.pop());
                        }
                        lines.forEach((line)=>{
                            const trimmed = line.trim();
                            if (trimmed && !trimmed.startsWith('{"jsonrpc"') && !trimmed.startsWith('Content-Length:')) {
                                this.sendLog(serverId, line);
                            }
                        });
                    });
                }
            };
            attachProcessListeners();
        }
        async startServer(server) {
            try {
                if (this.connections.has(server.id)) {
                    await this.stopServer(server.id);
                }
                const client = new _f_index.Client({
                    name: 'mcp-studio-client',
                    version: '1.0.0'
                }, {
                    capabilities: {}
                });
                const { transport, transportType } = this.createTransport(server);
                if (transportType === 'stdio') {
                    this.attachStdioListeners(transport, server.id);
                } else {
                    this.sendLog(server.id, `[Connection] Connecting to ${server.url} via ${transportType}...`);
                }
                await client.connect(transport);
                if (transportType !== 'stdio') {
                    this.sendLog(server.id, '[Connection] Connected successfully');
                }
                this.connections.set(server.id, {
                    client,
                    transport,
                    server,
                    transportType
                });
                return {
                    success: true
                };
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.sendLog(server.id, `[Error] Failed to start: ${errorMessage}`);
                return {
                    success: false,
                    error: errorMessage
                };
            }
        }
        async stopServer(serverId) {
            const connection = this.connections.get(serverId);
            if (!connection) {
                return false;
            }
            try {
                await connection.client.close();
                this.connections.delete(serverId);
                return true;
            } catch (error) {
                this.connections.delete(serverId);
                return false;
            }
        }
        async listTools(serverId) {
            const connection = this.connections.get(serverId);
            if (!connection) {
                throw new Error('Server not started');
            }
            try {
                const result = await connection.client.listTools();
                return result.tools;
            } catch (error) {
                throw new Error(`Failed to list tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        async callTool(serverId, toolName, args) {
            const connection = this.connections.get(serverId);
            if (!connection) {
                throw new Error('Server not started');
            }
            try {
                const result = await connection.client.callTool({
                    name: toolName,
                    arguments: args
                });
                return result;
            } catch (error) {
                throw new Error(`Failed to call tool: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        isServerRunning(serverId) {
            return this.connections.has(serverId);
        }
        getConnectionType(serverId) {
            const connection = this.connections.get(serverId);
            return connection ? connection.transportType : null;
        }
        stopAllServers() {
            for (const [serverId] of this.connections){
                this.stopServer(serverId);
            }
        }
    }
}
,
"0ca95b01":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "ClaudeAdapter", ()=>ClaudeAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_FileService = farmRequire("454c8ae6");
    class ClaudeAdapter {
        name = 'Claude Desktop';
        icon = 'https://www.claude.ai/favicon.ico';
        color = '#e28743';
        getPath() {
            return path.join(os.homedir(), 'Library/Application Support/Claude/claude_desktop_config.json');
        }
        async configExists() {
            const appPath = '/Applications/Claude.app';
            return fs.existsSync(appPath);
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.mcpServers) {
                return {};
            }
            return data.mcpServers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {};
            }
            data.mcpServers = servers;
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,
"0e9b2207":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "CustomAppStore", ()=>CustomAppStore);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_electron = farmRequire('electron');
    class CustomAppStore {
        storePath;
        apps = [];
        constructor(){
            const userDataPath = _f_electron.app.getPath('userData');
            this.storePath = path.join(userDataPath, 'custom-apps.json');
            this.load();
        }
        load() {
            try {
                if (fs.existsSync(this.storePath)) {
                    const data = JSON.parse(fs.readFileSync(this.storePath, 'utf-8'));
                    this.apps = data.apps || [];
                }
            } catch (error) {
                console.error('Error loading custom apps:', error);
                this.apps = [];
            }
        }
        save() {
            try {
                const dir = path.dirname(this.storePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, {
                        recursive: true
                    });
                }
                fs.writeFileSync(this.storePath, JSON.stringify({
                    apps: this.apps
                }, null, 2));
            } catch (error) {
                console.error('Error saving custom apps:', error);
            }
        }
        async getAllApps() {
            return this.apps;
        }
        async addApp(app) {
            const existingIndex = this.apps.findIndex((a)=>a.id === app.id);
            if (existingIndex >= 0) {
                this.apps[existingIndex] = app;
            } else {
                this.apps.push(app);
            }
            this.save();
            return true;
        }
        async removeApp(id) {
            const initialLength = this.apps.length;
            this.apps = this.apps.filter((a)=>a.id !== id);
            if (this.apps.length !== initialLength) {
                this.save();
                return true;
            }
            return false;
        }
        async getApp(id) {
            return this.apps.find((a)=>a.id === id);
        }
    }
}
,
"1e52c97c":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "OpencodeAdapter", ()=>OpencodeAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_FileService = farmRequire("454c8ae6");
    class OpencodeAdapter {
        name = 'opencode CLI';
        icon = 'https://github.com/sst/opencode/blob/dev/packages/identity/avatar-dark.png?raw=true';
        color = '#6366f1';
        getPath() {
            return path.join(os.homedir(), '.config/opencode/opencode.json');
        }
        async configExists() {
            const configDir = path.dirname(this.getPath());
            return fs.existsSync(configDir);
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.mcp) {
                return {};
            }
            const mcpServers = {};
            for (const [name, config] of Object.entries(data.mcp)){
                const mcpConfig = config;
                if (mcpConfig.type === 'local') {
                    const server = {
                        command: mcpConfig.command?.[0] || '',
                        args: mcpConfig.command?.slice(1) || [],
                        env: mcpConfig.environment || {}
                    };
                    mcpServers[name] = server;
                }
            }
            return mcpServers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {
                    "$schema": "https://opencode.ai/config.json"
                };
            }
            const newMcp = {};
            for (const [name, config] of Object.entries(servers)){
                newMcp[name] = {
                    type: 'local',
                    command: [
                        config.command,
                        ...config.args || []
                    ],
                    enabled: true
                };
                if (config.env && Object.keys(config.env).length > 0) {
                    newMcp[name].environment = config.env;
                }
            }
            data.mcp = newMcp;
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,
"290335cd":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "ClineAdapter", ()=>ClineAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_FileService = farmRequire("454c8ae6");
    class ClineAdapter {
        name = 'Cline';
        icon = 'https://raw.githubusercontent.com/cline/cline/refs/heads/main/docs/assets/robot_panel_light.png';
        color = '#edab49';
        getConfigPaths() {
            const homeDir = os.homedir();
            return [
                path.join(homeDir, 'Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'),
                path.join(homeDir, 'Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json'),
                path.join(homeDir, 'Library/Application Support/VSCodium/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json')
            ];
        }
        findExistingPath() {
            for (const configPath of this.getConfigPaths()){
                if (fs.existsSync(configPath)) {
                    return configPath;
                }
            }
            return null;
        }
        getPath() {
            const existingPath = this.findExistingPath();
            if (existingPath) {
                return existingPath;
            }
            return this.getConfigPaths()[0];
        }
        async configExists() {
            return this.findExistingPath() !== null;
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.mcpServers) {
                return {};
            }
            return data.mcpServers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {};
            }
            data.mcpServers = servers;
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,
"324d43da":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "BackupService", ()=>BackupService);
    var _f_promises = module.w(farmRequire('fs/promises'));
    var fs = _f_promises;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_electron = farmRequire('electron');
    class BackupService {
        backupDir;
        constructor(){
            this.backupDir = path.join(_f_electron.app.getPath('userData'), 'backups');
        }
        async ensureBackupDir() {
            try {
                await fs.access(this.backupDir);
            } catch  {
                await fs.mkdir(this.backupDir, {
                    recursive: true
                });
            }
        }
        async createBackup(appName, config) {
            try {
                await this.ensureBackupDir();
                const backupPath = path.join(this.backupDir, `${appName}.json`);
                const backupData = {
                    appName,
                    config,
                    timestamp: Date.now()
                };
                await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
                return true;
            } catch (error) {
                console.error(`Failed to create backup for ${appName}:`, error);
                return false;
            }
        }
        async getBackup(appName) {
            try {
                const backupPath = path.join(this.backupDir, `${appName}.json`);
                const data = await fs.readFile(backupPath, 'utf-8');
                const backupData = JSON.parse(data);
                return backupData.config;
            } catch (error) {
                console.error(`Failed to read backup for ${appName}:`, error);
                return null;
            }
        }
        async hasBackup(appName) {
            try {
                const backupPath = path.join(this.backupDir, `${appName}.json`);
                await fs.access(backupPath);
                return true;
            } catch  {
                return false;
            }
        }
        async deleteBackup(appName) {
            try {
                const backupPath = path.join(this.backupDir, `${appName}.json`);
                await fs.unlink(backupPath);
                return true;
            } catch (error) {
                console.error(`Failed to delete backup for ${appName}:`, error);
                return false;
            }
        }
    }
}
,
"32818e82":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "WindsurfAdapter", ()=>WindsurfAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_VSCodeAdapter = farmRequire("3624460c");
    class WindsurfAdapter extends _f_VSCodeAdapter.VSCodeAdapter {
        name = 'Windsurf';
        icon = 'https://codeium.com/favicon.ico';
        color = '#09B6A2';
        getPath() {
            return path.join(os.homedir(), 'Library/Application Support/Windsurf/mcp_server_config.json');
        }
        async configExists() {
            const appPath = '/Applications/Windsurf.app';
            return fs.existsSync(appPath);
        }
    }
}
,
"3624460c":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "VSCodeAdapter", ()=>VSCodeAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_FileService = farmRequire("454c8ae6");
    var _f_path = module.i(farmRequire('path'));
    var _f_os = module.i(farmRequire('os'));
    class VSCodeAdapter {
        name = 'VSCode';
        icon = 'https://code.visualstudio.com/favicon.ico';
        color = '#007acc';
        getPath() {
            return module.f(_f_path).join(module.f(_f_os).homedir(), 'Library/Application Support/Code/User/mcp.json');
        }
        async configExists() {
            const appPath = '/Applications/Visual Studio Code.app';
            return fs.existsSync(appPath);
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.servers) {
                return {};
            }
            const servers = {};
            for (const [key, value] of Object.entries(data.servers)){
                const vsServer = value;
                if (vsServer.command) {
                    servers[key] = {
                        command: vsServer.command,
                        args: vsServer.args || [],
                        env: vsServer.env,
                        settings: {
                            type: vsServer.type,
                            url: vsServer.url,
                            headers: vsServer.headers,
                            gallery: vsServer.gallery,
                            version: vsServer.version
                        }
                    };
                } else if (vsServer.type === 'http' && vsServer.url) {
                    servers[key] = {
                        command: '',
                        args: [],
                        settings: {
                            type: vsServer.type,
                            url: vsServer.url,
                            headers: vsServer.headers,
                            gallery: vsServer.gallery,
                            version: vsServer.version
                        }
                    };
                }
            }
            return servers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {};
            }
            const existingServers = data.servers || {};
            const transformedServers = {};
            for (const [key, server] of Object.entries(servers)){
                const isStreamingViaTransport = server.transportType && server.transportType !== 'stdio' && server.url;
                const isStreamingViaSettings = server.settings?.type === 'http' && server.settings?.url;
                if (isStreamingViaTransport) {
                    const vsType = server.transportType === 'sse' ? 'sse' : 'http';
                    transformedServers[key] = {
                        type: vsType,
                        url: server.url,
                        ...server.env && {
                            env: server.env
                        }
                    };
                } else if (isStreamingViaSettings) {
                    transformedServers[key] = {
                        type: server.settings.type,
                        url: server.settings.url,
                        ...server.settings.headers && {
                            headers: server.settings.headers
                        },
                        ...server.settings.gallery && {
                            gallery: server.settings.gallery
                        },
                        ...server.settings.version && {
                            version: server.settings.version
                        }
                    };
                } else if (server.command) {
                    transformedServers[key] = {
                        command: server.command,
                        args: server.args || [],
                        ...server.env && {
                            env: server.env
                        }
                    };
                }
            }
            for (const [key, value] of Object.entries(existingServers)){
                if (!transformedServers[key]) {
                    const existing = value;
                    const isSupported = !!existing.command || existing.type === 'http' && !!existing.url;
                    if (!isSupported) {
                        transformedServers[key] = existing;
                    }
                }
            }
            data.servers = transformedServers;
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,
"454c8ae6":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "FileService", ()=>FileService);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_jsonParser = farmRequire("87f18120");
    class FileService {
        static expandPath(filePath) {
            if (filePath.startsWith('~/')) {
                return path.join(os.homedir(), filePath.slice(2));
            }
            return filePath;
        }
        static async readJSON(filePath) {
            const expandedPath = this.expandPath(filePath);
            try {
                if (!fs.existsSync(expandedPath)) {
                    return null;
                }
                const content = await fs.promises.readFile(expandedPath, 'utf-8');
                return _f_jsonParser.parseJSON(content);
            } catch (error) {
                console.error(`Error reading JSON from ${expandedPath}:`, error);
                return null;
            }
        }
        static async writeJSON(filePath, data) {
            const expandedPath = this.expandPath(filePath);
            try {
                const dir = path.dirname(expandedPath);
                if (!fs.existsSync(dir)) {
                    await fs.promises.mkdir(dir, {
                        recursive: true
                    });
                }
                await fs.promises.writeFile(expandedPath, _f_jsonParser.stringifyJSON(data, 2), 'utf-8');
                return true;
            } catch (error) {
                console.error(`Error writing JSON to ${expandedPath}:`, error);
                return false;
            }
        }
        static async ensureFile(filePath, defaultContent = {}) {
            const expandedPath = this.expandPath(filePath);
            if (!fs.existsSync(expandedPath)) {
                await this.writeJSON(filePath, defaultContent);
            }
        }
    }
}
,
"4a89c147":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "ClaudeCodeAdapter", ()=>ClaudeCodeAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_FileService = farmRequire("454c8ae6");
    class ClaudeCodeAdapter {
        name = 'Claude Code';
        icon = 'https://claude.ai/favicon.ico';
        color = '#d97706';
        getPath() {
            return path.join(os.homedir(), '.claude.json');
        }
        async configExists() {
            const configPath = this.getPath();
            if (!fs.existsSync(configPath)) {
                return false;
            }
            const data = await _f_FileService.FileService.readJSON(configPath);
            return data !== null;
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.mcpServers) {
                return {};
            }
            return data.mcpServers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {};
            }
            data.mcpServers = servers;
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,
"4d691808":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "ZedAdapter", ()=>ZedAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_FileService = farmRequire("454c8ae6");
    var _f_packageRunner = farmRequire("6d8f9985");
    class ZedAdapter {
        name = 'Zed';
        icon = 'https://zed.dev/favicon_black_64.png';
        color = '#606266';
        getPath() {
            return path.join(os.homedir(), '.config/zed/settings.json');
        }
        async configExists() {
            return fs.existsSync('/Applications/Zed.app') || fs.existsSync('/Applications/Zed Preview.app');
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.context_servers) {
                return {};
            }
            const servers = {};
            for (const [key, value] of Object.entries(data.context_servers)){
                const zedServer = value;
                if (zedServer.source !== 'custom') {
                    servers[key] = {
                        command: zedServer.command || '',
                        args: zedServer.args || [],
                        source: zedServer.source || 'custom',
                        env: zedServer.env || undefined,
                        settings: zedServer.settings || undefined
                    };
                }
            }
            return servers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {};
            }
            const existingContextServers = data.context_servers || {};
            const customServers = {};
            for (const [key, value] of Object.entries(existingContextServers)){
                const server = value;
                if (server.source === 'custom') {
                    customServers[key] = value;
                }
            }
            const transformedServers = {};
            for (const [key, server] of Object.entries(servers)){
                const isStreamingViaTransport = server.transportType && server.transportType !== 'stdio' && server.url;
                const isStreamingViaSettings = server.settings?.type === 'http' && server.settings?.url;
                if (isStreamingViaTransport && server.url) {
                    const remoteConfig = _f_packageRunner.createMcpRemoteConfig(server.url, server.settings?.headers);
                    transformedServers[key] = {
                        command: remoteConfig.command,
                        args: remoteConfig.args,
                        env: server.env || null,
                        enabled: server.enabled ?? true
                    };
                } else if (isStreamingViaSettings) {
                    const remoteConfig = _f_packageRunner.createMcpRemoteConfig(server.settings.url, server.settings?.headers);
                    transformedServers[key] = {
                        command: remoteConfig.command,
                        args: remoteConfig.args,
                        env: server.env || null,
                        enabled: server.enabled ?? true
                    };
                } else {
                    transformedServers[key] = {
                        command: server.command,
                        args: server.args,
                        env: server.env || null,
                        settings: server.settings || undefined,
                        enabled: server.enabled ?? true
                    };
                }
            }
            data.context_servers = {
                ...customServers,
                ...transformedServers
            };
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,
"5aaf0170":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "MasterServerStore", ()=>MasterServerStore);
    var _f_electron = farmRequire('electron');
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_FileService = farmRequire("454c8ae6");
    class MasterServerStore {
        storePath;
        servers = new Map();
        initialized;
        constructor(){
            this.storePath = path.join(_f_electron.app.getPath('userData'), 'mcp_servers.json');
            this.initialized = this.initializeStore();
        }
        async initializeStore() {
            await _f_FileService.FileService.ensureFile(this.storePath, {
                servers: []
            });
            await this.load();
        }
        async load() {
            const data = await _f_FileService.FileService.readJSON(this.storePath);
            if (data && data.servers) {
                this.servers.clear();
                for (const server of data.servers){
                    this.servers.set(server.id, server);
                }
            }
        }
        async save() {
            const data = {
                servers: Array.from(this.servers.values()),
                lastUpdated: Date.now()
            };
            return await _f_FileService.FileService.writeJSON(this.storePath, data);
        }
        async getAllServers() {
            await this.initialized;
            return Array.from(this.servers.values());
        }
        async getServer(id) {
            await this.initialized;
            return this.servers.get(id);
        }
        async addServer(server) {
            await this.initialized;
            const now = Date.now();
            const newServer = {
                ...server,
                createdAt: now,
                updatedAt: now
            };
            this.servers.set(server.id, newServer);
            return await this.save();
        }
        async updateServer(id, updates) {
            await this.initialized;
            const existing = this.servers.get(id);
            if (!existing) return false;
            const updated = {
                ...existing,
                ...updates,
                id,
                updatedAt: Date.now()
            };
            this.servers.set(id, updated);
            return await this.save();
        }
        async removeServer(id) {
            await this.initialized;
            if (!this.servers.has(id)) return false;
            this.servers.delete(id);
            return await this.save();
        }
        async toggleServer(id, enabled) {
            return await this.updateServer(id, {
                enabled
            });
        }
        async addAppToServer(serverId, appName) {
            await this.initialized;
            const server = this.servers.get(serverId);
            if (!server) return false;
            if (!server.apps.includes(appName)) {
                server.apps.push(appName);
                server.updatedAt = Date.now();
                return await this.save();
            }
            return true;
        }
        async removeAppFromServer(serverId, appName) {
            await this.initialized;
            const server = this.servers.get(serverId);
            if (!server) return false;
            const index = server.apps.indexOf(appName);
            if (index !== -1) {
                server.apps.splice(index, 1);
                server.updatedAt = Date.now();
                return await this.save();
            }
            return true;
        }
        async syncFromAppConfigs(appServers) {
            await this.initialized;
            for (const [id, serverData] of Object.entries(appServers)){
                const existing = this.servers.get(id);
                if (!existing) {
                    const now = Date.now();
                    const newServer = {
                        id,
                        name: id.charAt(0).toUpperCase() + id.slice(1),
                        command: serverData.command,
                        args: serverData.args,
                        env: serverData.env,
                        settings: serverData.settings,
                        source: serverData.source,
                        enabled: serverData.enabled ?? true,
                        permissions: 'always_ask',
                        apps: serverData.apps,
                        iconUrl: undefined,
                        description: undefined,
                        transportType: serverData.transportType,
                        url: serverData.url,
                        createdAt: now,
                        updatedAt: now
                    };
                    this.servers.set(id, newServer);
                    await this.save();
                }
            }
        }
    }
}
,
"5df6d6a0":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "APP_ADAPTERS", ()=>APP_ADAPTERS);
    module.o(exports, "initCustomAppStore", ()=>initCustomAppStore);
    module.o(exports, "getAvailableAdapters", ()=>getAvailableAdapters);
    var _f_ClaudeAdapter = farmRequire("0ca95b01");
    var _f_ClaudeCodeAdapter = farmRequire("4a89c147");
    var _f_MistralVibeAdapter = farmRequire("6f17f27f");
    var _f_ZedAdapter = farmRequire("4d691808");
    var _f_CursorAdapter = farmRequire("94d886ec");
    var _f_VSCodeAdapter = farmRequire("3624460c");
    var _f_WindsurfAdapter = farmRequire("32818e82");
    var _f_GeminiAdapter = farmRequire("666da5e9");
    var _f_QwenAdapter = farmRequire("8fb0384e");
    var _f_OpencodeAdapter = farmRequire("1e52c97c");
    var _f_KiloCodeAdapter = farmRequire("cc18dfe6");
    var _f_ClineAdapter = farmRequire("290335cd");
    var _f_AntigravityAdapter = farmRequire("f8cca18d");
    var _f_CustomAppAdapter = farmRequire("8a78f2eb");
    var APP_ADAPTERS = [
        new _f_ClaudeAdapter.ClaudeAdapter(),
        new _f_ClaudeCodeAdapter.ClaudeCodeAdapter(),
        new _f_MistralVibeAdapter.MistralVibeAdapter(),
        new _f_ZedAdapter.ZedAdapter(),
        new _f_CursorAdapter.CursorAdapter(),
        new _f_VSCodeAdapter.VSCodeAdapter(),
        new _f_WindsurfAdapter.WindsurfAdapter(),
        new _f_GeminiAdapter.GeminiAdapter(),
        new _f_QwenAdapter.QwenAdapter(),
        new _f_OpencodeAdapter.OpencodeAdapter(),
        new _f_KiloCodeAdapter.KiloCodeAdapter(),
        new _f_ClineAdapter.ClineAdapter(),
        new _f_AntigravityAdapter.AntigravityAdapter()
    ];
    let customAppStore = null;
    function initCustomAppStore(store) {
        customAppStore = store;
    }
    async function getAvailableAdapters() {
        const available = [];
        for (const adapter of APP_ADAPTERS){
            const exists = await adapter.configExists();
            console.log(`[Detection] ${adapter.name}: ${exists ? '✓' : '✗'} (${adapter.getPath()})`);
            if (exists) {
                available.push(adapter);
            }
        }
        if (customAppStore) {
            const customApps = await customAppStore.getAllApps();
            for (const customApp of customApps){
                const adapter = new _f_CustomAppAdapter.CustomAppAdapter(customApp);
                console.log(`[Detection] ${adapter.name} (custom): ✓ (${adapter.getPath()})`);
                available.push(adapter);
            }
        }
        console.log(`[Detection] Total apps detected: ${available.length}/${APP_ADAPTERS.length} built-in`);
        return available;
    }
    var _f_AppAdapter = farmRequire("ea3ba68a");
    module._(exports, "AppAdapter", _f_AppAdapter);
    var _f_CustomAppAdapter1 = farmRequire("8a78f2eb");
    module._(exports, "CustomAppAdapter", _f_CustomAppAdapter1);
}
,
"666da5e9":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "GeminiAdapter", ()=>GeminiAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_FileService = farmRequire("454c8ae6");
    class GeminiAdapter {
        name = 'Gemini CLI';
        icon = 'https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png';
        color = '#4285f4';
        getPath() {
            return path.join(os.homedir(), '.gemini/settings.json');
        }
        async configExists() {
            return fs.existsSync(this.getPath());
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.mcpServers) {
                return {};
            }
            return data.mcpServers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {};
            }
            const cleanedServers = {};
            for (const [key, server] of Object.entries(servers)){
                const { enabled, ...rest } = server;
                cleanedServers[key] = rest;
            }
            data.mcpServers = cleanedServers;
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,
"6d8f9985":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "getPackageRunner", ()=>getPackageRunner);
    module.o(exports, "createMcpRemoteConfig", ()=>createMcpRemoteConfig);
    var _f_child_process = farmRequire('child_process');
    let cachedRunner = null;
    function getPackageRunner() {
        if (cachedRunner !== null) {
            return cachedRunner;
        }
        try {
            _f_child_process.execSync('which bunx', {
                stdio: 'ignore'
            });
            cachedRunner = 'bunx';
        } catch  {
            cachedRunner = 'npx';
        }
        return cachedRunner;
    }
    function createMcpRemoteConfig(url, headers) {
        const runner = getPackageRunner();
        const args = [
            '-y',
            'mcp-remote',
            url
        ];
        if (headers) {
            for (const [key, value] of Object.entries(headers)){
                args.push('--header', `${key}: ${value}`);
            }
        }
        return {
            command: runner,
            args
        };
    }
}
,
"6f17f27f":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "MistralVibeAdapter", ()=>MistralVibeAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_smol_toml = module.w(farmRequire('smol-toml'));
    var toml = _f_smol_toml;
    class MistralVibeAdapter {
        name = 'Mistral Vibe';
        icon = 'https://mistral.ai/favicon.ico';
        color = '#F3D0C1';
        getPath() {
            return path.join(os.homedir(), '.vibe/config.toml');
        }
        async configExists() {
            return fs.existsSync(this.getPath());
        }
        async getServers() {
            const expandedPath = this.getPath();
            if (!fs.existsSync(expandedPath)) {
                return {};
            }
            try {
                const content = await fs.promises.readFile(expandedPath, 'utf-8');
                const data = toml.parse(content);
                const servers = {};
                if (data.mcp_servers && Array.isArray(data.mcp_servers)) {
                    for (const s of data.mcp_servers){
                        if (s.name) {
                            servers[s.name] = {
                                command: s.command || '',
                                args: s.args || [],
                                env: s.env,
                                settings: {
                                    transport: s.transport,
                                    url: s.url,
                                    headers: s.headers,
                                    api_key_env: s.api_key_env,
                                    api_key_header: s.api_key_header,
                                    api_key_format: s.api_key_format
                                }
                            };
                        }
                    }
                }
                return servers;
            } catch (error) {
                console.error('Error reading Mistral Vibe config:', error);
                return {};
            }
        }
        async setServers(servers) {
            const expandedPath = this.getPath();
            let data = {};
            try {
                if (fs.existsSync(expandedPath)) {
                    const content = await fs.promises.readFile(expandedPath, 'utf-8');
                    data = toml.parse(content);
                }
                const mcp_servers = Object.entries(servers).map(([name, server])=>{
                    const mistralServer = {
                        name,
                        transport: server.settings?.transport || 'stdio',
                        command: server.command,
                        args: server.args,
                        env: server.env
                    };
                    if (server.settings) {
                        if (server.settings.url) mistralServer.url = server.settings.url;
                        if (server.settings.headers) mistralServer.headers = server.settings.headers;
                        if (server.settings.api_key_env) mistralServer.api_key_env = server.settings.api_key_env;
                        if (server.settings.api_key_header) mistralServer.api_key_header = server.settings.api_key_header;
                        if (server.settings.api_key_format) mistralServer.api_key_format = server.settings.api_key_format;
                    }
                    return mistralServer;
                });
                data.mcp_servers = mcp_servers;
                const newContent = toml.stringify(data);
                const dir = path.dirname(expandedPath);
                if (!fs.existsSync(dir)) {
                    await fs.promises.mkdir(dir, {
                        recursive: true
                    });
                }
                await fs.promises.writeFile(expandedPath, newContent, 'utf-8');
                return true;
            } catch (error) {
                console.error('Error writing Mistral Vibe config:', error);
                return false;
            }
        }
    }
}
,
"799f0da0":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    var _f_node_path = module.i(farmRequire('node:path'));
    var _f_node_url = farmRequire('node:url');
    var _f_electron = farmRequire('electron');
    var _f_electron_liquid_glass = module.i(farmRequire('electron-liquid-glass'));
    var _f_MCPConfigManager = farmRequire("01630ced");
    var _f_MasterServerStore = farmRequire("5aaf0170");
    var _f_MCPStudioService = farmRequire("0b861e2b");
    var _f_BackupService = farmRequire("324d43da");
    var _f_CustomAppStore = farmRequire("0e9b2207");
    var _f_apps = farmRequire("5df6d6a0");
    const __dirname = module.f(_f_node_path).dirname(_f_node_url.fileURLToPath(import.meta.url));
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
    if (!_f_electron.app.requestSingleInstanceLock()) {
        _f_electron.app.quit();
        process.exit(0);
    }
    let mainWindow = null;
    let mcpManager;
    let masterStore;
    let mcpStudioService;
    let backupService;
    let customAppStore;
    let appAdapters = [];
    let appSyncStates = new Map();
    function getRendererPath() {
        if (_f_electron.app.isPackaged) {
            return module.f(_f_node_path).join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
        }
        return module.f(_f_node_path).join(__dirname, '..', 'dist', 'index.html');
    }
    function getAssetsPath() {
        if (_f_electron.app.isPackaged) {
            return module.f(_f_node_path).join(process.resourcesPath, 'assets');
        }
        return module.f(_f_node_path).join(__dirname, '..', '..', 'src', 'renderer', 'assets');
    }
    function getIconPath() {
        if (process.platform === 'darwin') {
            if (_f_electron.app.isPackaged) {
                return module.f(_f_node_path).join(process.resourcesPath, '..', 'Resources', 'electron.icns');
            }
            const icnsPath = module.f(_f_node_path).join(__dirname, '..', '..', 'build', 'icon.icns');
            const fs = global.nodeRequire('fs', true);
            if (fs.existsSync(icnsPath)) {
                return icnsPath;
            }
        }
        return module.f(_f_node_path).join(getAssetsPath(), 'logo.svg');
    }
    function createWindow() {
        const isDev = !!process.env.FARM_DEV_SERVER_URL;
        mainWindow = new _f_electron.BrowserWindow({
            width: 1200,
            height: 800,
            transparent: true,
            titleBarStyle: 'hiddenInset',
            trafficLightPosition: {
                x: 12,
                y: 12
            },
            icon: getIconPath(),
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                preload: module.f(_f_node_path).join(__dirname, 'preload.mjs')
            }
        });
        mainWindow.setWindowButtonVisibility(true);
        if (isDev) {
            mainWindow.loadURL(process.env.FARM_DEV_SERVER_URL);
            mainWindow.webContents.openDevTools();
        } else {
            mainWindow.loadFile(getRendererPath());
        }
        mainWindow.webContents.once('did-finish-load', ()=>{
            console.log('Window loaded');
            if (mainWindow && process.platform === 'darwin') {
                console.log('Adding glass');
                const vh = mainWindow.getNativeWindowHandle();
                console.log(vh);
                const glassId = module.f(_f_electron_liquid_glass).addView(vh, {
                    cornerRadius: 12,
                    opaque: false
                });
                module.f(_f_electron_liquid_glass).unstable_setVariant(glassId, 8);
            }
        });
    }
    _f_electron.app.whenReady().then(async ()=>{
        customAppStore = new _f_CustomAppStore.CustomAppStore();
        _f_apps.initCustomAppStore(customAppStore);
        appAdapters = await _f_apps.getAvailableAdapters();
        mcpManager = new _f_MCPConfigManager.MCPConfigManager(appAdapters);
        masterStore = new _f_MasterServerStore.MasterServerStore();
        mcpStudioService = new _f_MCPStudioService.MCPStudioService();
        backupService = new _f_BackupService.BackupService();
        for (const adapter of appAdapters){
            const configExists = await adapter.configExists();
            if (configExists) {
                const servers = await mcpManager.readAppConfig(adapter);
                await backupService.createBackup(adapter.name, servers);
                appSyncStates.set(adapter.name, true);
            }
        }
        const appServers = await mcpManager.getAllServers();
        await masterStore.syncFromAppConfigs(appServers);
        setupIPCHandlers();
        createWindow();
        if (mainWindow) {
            mcpStudioService.setMainWindow(mainWindow);
        }
        _f_electron.app.on('activate', ()=>{
            if (_f_electron.BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    });
    _f_electron.app.on('window-all-closed', ()=>{
        if (mcpStudioService) {
            mcpStudioService.stopAllServers();
        }
        _f_electron.app.quit();
    });
    function setupIPCHandlers() {
        _f_electron.ipcMain.handle('get-apps', async ()=>{
            return appAdapters.map((adapter)=>{
                const isCustom = 'isCustom' in adapter && adapter.isCustom === true;
                return {
                    name: adapter.name,
                    icon: adapter.icon,
                    color: adapter.color,
                    syncEnabled: appSyncStates.get(adapter.name) ?? true,
                    isCustom
                };
            });
        });
        _f_electron.ipcMain.handle('get-all-servers', async ()=>{
            return await masterStore.getAllServers();
        });
        _f_electron.ipcMain.handle('get-app-servers', async (_, appName)=>{
            const adapter = appAdapters.find((a)=>a.name === appName);
            if (!adapter) {
                throw new Error(`App not found: ${appName}`);
            }
            return await mcpManager.readAppConfig(adapter);
        });
        _f_electron.ipcMain.handle('add-server', async (_, name, command, env, appNames, transportType, url)=>{
            const isStreaming = transportType === 'sse' || transportType === 'streamable-http';
            const parsed = isStreaming ? {
                command: '',
                args: []
            } : mcpManager.parseCommand(command);
            const server = {
                command: parsed.command,
                args: parsed.args,
                ...env && {
                    env
                },
                ...transportType && {
                    transportType: transportType
                },
                ...url && {
                    url
                }
            };
            const targetApps = appNames ?? [];
            const success = isStreaming ? true : targetApps.length > 0 ? await mcpManager.addServer(name, server, targetApps) : true;
            if (success) {
                await masterStore.addServer({
                    id: name,
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    command: parsed.command,
                    args: parsed.args,
                    env,
                    transportType: transportType || 'stdio',
                    url,
                    enabled: true,
                    permissions: 'always_ask',
                    apps: targetApps
                });
            }
            return success;
        });
        _f_electron.ipcMain.handle('update-server', async (_, name, command, env, appNames, transportType, url)=>{
            const isStreaming = transportType === 'sse' || transportType === 'streamable-http';
            const parsed = isStreaming ? {
                command: '',
                args: []
            } : mcpManager.parseCommand(command);
            const server = {
                command: parsed.command,
                args: parsed.args,
                ...env && {
                    env
                },
                ...transportType && {
                    transportType: transportType
                },
                ...url && {
                    url
                }
            };
            const success = isStreaming ? true : await mcpManager.updateServer(name, server, appNames);
            if (success) {
                await masterStore.updateServer(name, {
                    command: parsed.command,
                    args: parsed.args,
                    env,
                    transportType: transportType,
                    url,
                    apps: appNames
                });
            }
            return success;
        });
        _f_electron.ipcMain.handle('remove-server', async (_, name, appNames)=>{
            const success = await mcpManager.removeServer(name, appNames);
            if (success) {
                if (!appNames) {
                    await masterStore.removeServer(name);
                } else {
                    for (const appName of appNames){
                        await masterStore.removeAppFromServer(name, appName);
                    }
                    const server = await masterStore.getServer(name);
                    if (server && server.apps.length === 0) {
                        await masterStore.removeServer(name);
                    }
                }
            }
            return success;
        });
        _f_electron.ipcMain.handle('toggle-server', async (_, name, enabled, appNames)=>{
            const masterServer = await masterStore.getServer(name);
            if (!masterServer) {
                return false;
            }
            const isStreaming = masterServer.transportType && masterServer.transportType !== 'stdio';
            const server = isStreaming ? {
                command: '',
                args: [],
                url: masterServer.url,
                transportType: masterServer.transportType,
                env: masterServer.env,
                settings: masterServer.settings,
                enabled: enabled
            } : {
                command: masterServer.command,
                args: masterServer.args,
                env: masterServer.env,
                settings: masterServer.settings,
                enabled: enabled
            };
            const success = await mcpManager.toggleServer(name, enabled, server, appNames);
            if (success) {
                if (!appNames) {
                    await masterStore.toggleServer(name, enabled);
                } else if (enabled) {
                    for (const appName of appNames){
                        await masterStore.addAppToServer(name, appName);
                    }
                } else {
                    for (const appName of appNames){
                        await masterStore.removeAppFromServer(name, appName);
                    }
                }
            }
            return success;
        });
        _f_electron.ipcMain.handle('parse-command', async (_, command)=>{
            return mcpManager.parseCommand(command);
        });
        _f_electron.ipcMain.handle('sync-servers', async ()=>{
            const allServers = await masterStore.getAllServers();
            for (const server of allServers){
                if (server.applyToAll && server.enabled) {
                    const syncedApps = appAdapters.filter((a)=>appSyncStates.get(a.name) ?? true).map((a)=>a.name);
                    for (const appName of syncedApps){
                        const adapter = appAdapters.find((a)=>a.name === appName);
                        if (adapter) {
                            const appConfig = await mcpManager.readAppConfig(adapter);
                            const isStreaming = server.transportType && server.transportType !== 'stdio';
                            appConfig[server.id] = isStreaming ? {
                                command: '',
                                args: [],
                                url: server.url,
                                transportType: server.transportType,
                                env: server.env,
                                settings: server.settings
                            } : {
                                command: server.command,
                                args: server.args,
                                env: server.env,
                                settings: server.settings
                            };
                            await mcpManager.writeAppConfig(adapter, appConfig);
                        }
                    }
                }
            }
            return allServers;
        });
        _f_electron.ipcMain.handle('get-master-servers', async ()=>{
            return await masterStore.getAllServers();
        });
        _f_electron.ipcMain.handle('update-master-server', async (_, id, updates)=>{
            const result = await masterStore.updateServer(id, updates);
            if (result && updates.applyToAll !== undefined) {
                const server = await masterStore.getServer(id);
                if (server) {
                    const syncedApps = appAdapters.filter((a)=>appSyncStates.get(a.name) ?? true).map((a)=>a.name);
                    if (updates.applyToAll && server.enabled) {
                        for (const appName of syncedApps){
                            const adapter = appAdapters.find((a)=>a.name === appName);
                            if (adapter) {
                                const appConfig = await mcpManager.readAppConfig(adapter);
                                const isStreaming = server.transportType && server.transportType !== 'stdio';
                                appConfig[server.id] = isStreaming ? {
                                    command: '',
                                    args: [],
                                    url: server.url,
                                    transportType: server.transportType,
                                    env: server.env,
                                    settings: server.settings
                                } : {
                                    command: server.command,
                                    args: server.args,
                                    env: server.env,
                                    settings: server.settings
                                };
                                await mcpManager.writeAppConfig(adapter, appConfig);
                            }
                        }
                    }
                }
            }
            return result;
        });
        _f_electron.ipcMain.handle('studio:start-server', async (_, serverId)=>{
            const server = await masterStore.getServer(serverId);
            if (!server) {
                return {
                    success: false,
                    error: 'Server not found'
                };
            }
            return await mcpStudioService.startServer(server);
        });
        _f_electron.ipcMain.handle('studio:stop-server', async (_, serverId)=>{
            return await mcpStudioService.stopServer(serverId);
        });
        _f_electron.ipcMain.handle('studio:list-tools', async (_, serverId)=>{
            try {
                return await mcpStudioService.listTools(serverId);
            } catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to list tools');
            }
        });
        _f_electron.ipcMain.handle('studio:call-tool', async (_, serverId, toolName, args)=>{
            try {
                return await mcpStudioService.callTool(serverId, toolName, args);
            } catch (error) {
                throw new Error(error instanceof Error ? error.message : 'Failed to call tool');
            }
        });
        _f_electron.ipcMain.handle('studio:is-server-running', async (_, serverId)=>{
            return mcpStudioService.isServerRunning(serverId);
        });
        _f_electron.ipcMain.handle('get-app-sync-state', async (_, appName)=>{
            return appSyncStates.get(appName) ?? true;
        });
        _f_electron.ipcMain.handle('toggle-app-sync', async (_, appName, enabled)=>{
            const adapter = appAdapters.find((a)=>a.name === appName);
            if (!adapter) {
                throw new Error(`App not found: ${appName}`);
            }
            if (!enabled) {
                const backup = await backupService.getBackup(appName);
                if (backup) {
                    await mcpManager.writeAppConfig(adapter, backup);
                }
            }
            appSyncStates.set(appName, enabled);
            return true;
        });
        _f_electron.ipcMain.handle('has-app-backup', async (_, appName)=>{
            return await backupService.hasBackup(appName);
        });
        _f_electron.ipcMain.handle('get-app-backup', async (_, appName)=>{
            return await backupService.getBackup(appName);
        });
        _f_electron.ipcMain.handle('get-app-current-config', async (_, appName)=>{
            const adapter = appAdapters.find((a)=>a.name === appName);
            if (!adapter) {
                throw new Error(`App not found: ${appName}`);
            }
            return await mcpManager.readAppConfig(adapter);
        });
        _f_electron.ipcMain.handle('get-app-applied-servers', async (_, appName)=>{
            const allServers = await masterStore.getAllServers();
            return allServers.filter((s)=>s.applyToAll || s.apps.includes(appName));
        });
        _f_electron.ipcMain.handle('export-app-data', async ()=>{
            const AdmZip = global.nodeRequire('adm-zip', true);
            const zip = new AdmZip();
            const masterServers = await masterStore.getAllServers();
            const mcpServers = {};
            masterServers.forEach((server)=>{
                const isStreaming = server.transportType && server.transportType !== 'stdio';
                mcpServers[server.id] = isStreaming ? {
                    url: server.url,
                    transportType: server.transportType,
                    ...server.env && {
                        env: server.env
                    }
                } : {
                    command: server.command,
                    args: server.args,
                    ...server.env && {
                        env: server.env
                    }
                };
            });
            zip.addFile('mcp.json', Buffer.from(JSON.stringify({
                mcpServers
            }, null, 2)));
            const appData = {
                apps: appAdapters.map((a)=>({
                        name: a.name,
                        icon: a.icon,
                        color: a.color,
                        syncEnabled: appSyncStates.get(a.name) ?? true
                    })),
                masterServers: masterServers,
                version: _f_electron.app.getVersion(),
                exportDate: new Date().toISOString()
            };
            zip.addFile('app-data.json', Buffer.from(JSON.stringify(appData, null, 2)));
            for (const adapter of appAdapters){
                const backup = await backupService.getBackup(adapter.name);
                if (backup) {
                    zip.addFile(`backups/${adapter.name}.json`, Buffer.from(JSON.stringify({
                        config: backup
                    }, null, 2)));
                }
            }
            return zip.toBuffer();
        });
        _f_electron.ipcMain.handle('import-app-data-zip', async (_, zipBuffer)=>{
            const AdmZip = global.nodeRequire('adm-zip', true);
            const zip = new AdmZip(zipBuffer);
            const appDataEntry = zip.getEntry('app-data.json');
            if (appDataEntry) {
                const appData = JSON.parse(appDataEntry.getData().toString('utf8'));
                if (appData.masterServers) {
                    for (const server of appData.masterServers){
                        await masterStore.addServer(server);
                    }
                }
                if (appData.apps) {
                    for (const appInfo of appData.apps){
                        appSyncStates.set(appInfo.name, appInfo.syncEnabled ?? true);
                    }
                }
            }
            const backupEntries = zip.getEntries().filter((e)=>e.entryName.startsWith('backups/'));
            for (const entry of backupEntries){
                const appName = entry.entryName.replace('backups/', '').replace('.json', '');
                const backupData = JSON.parse(entry.getData().toString('utf8'));
                if (backupData.config) {
                    await backupService.createBackup(appName, backupData.config);
                }
            }
            return true;
        });
        _f_electron.ipcMain.handle('get-custom-apps', async ()=>{
            return await customAppStore.getAllApps();
        });
        _f_electron.ipcMain.handle('add-custom-app', async (_, customApp)=>{
            const success = await customAppStore.addApp(customApp);
            if (success) {
                const adapter = new _f_apps.CustomAppAdapter(customApp);
                appAdapters.push(adapter);
                mcpManager = new _f_MCPConfigManager.MCPConfigManager(appAdapters);
            }
            return success;
        });
        _f_electron.ipcMain.handle('remove-custom-app', async (_, id)=>{
            const customApp = await customAppStore.getApp(id);
            if (customApp) {
                const success = await customAppStore.removeApp(id);
                if (success) {
                    appAdapters = appAdapters.filter((a)=>a.name !== customApp.name);
                    mcpManager = new _f_MCPConfigManager.MCPConfigManager(appAdapters);
                }
                return success;
            }
            return false;
        });
    }
}
,
"87f18120":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "parseJSON", ()=>parseJSON);
    module.o(exports, "stringifyJSON", ()=>stringifyJSON);
    function parseJSON(content) {
        const lines = content.split('\n');
        const cleanedLines = [];
        for (let line of lines){
            const trimmed = line.trim();
            if (trimmed.startsWith('//')) {
                continue;
            }
            const commentIndex = line.indexOf('//');
            if (commentIndex !== -1) {
                const beforeComment = line.substring(0, commentIndex);
                const inString = isInsideString(beforeComment);
                if (!inString) {
                    cleanedLines.push(beforeComment);
                    continue;
                }
            }
            cleanedLines.push(line);
        }
        let cleanedContent = cleanedLines.join('\n');
        cleanedContent = cleanedContent.replace(/,(\s*[}\]])/g, '$1');
        return JSON.parse(cleanedContent);
    }
    function isInsideString(text) {
        let inString = false;
        let escapeNext = false;
        let quoteChar = '';
        for(let i = 0; i < text.length; i++){
            const char = text[i];
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            if ((char === '"' || char === "'") && !inString) {
                inString = true;
                quoteChar = char;
            } else if (char === quoteChar && inString) {
                inString = false;
                quoteChar = '';
            }
        }
        return inString;
    }
    function stringifyJSON(data, space = 2) {
        return JSON.stringify(data, null, space);
    }
}
,
"8a78f2eb":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "CustomAppAdapter", ()=>CustomAppAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_smol_toml = module.w(farmRequire('smol-toml'));
    var toml = _f_smol_toml;
    var _f_FileService = farmRequire("454c8ae6");
    class CustomAppAdapter {
        name;
        icon;
        color;
        isCustom = true;
        config;
        constructor(config){
            this.config = config;
            this.name = config.name;
            this.icon = config.icon || 'ph:puzzle-piece-light';
            this.color = config.color || '#888888';
        }
        getPath() {
            return this.config.configPath.replace(/^~/, os.homedir());
        }
        async configExists() {
            return true;
        }
        async getServers() {
            const expandedPath = this.getPath();
            if (!fs.existsSync(expandedPath)) {
                return {};
            }
            try {
                if (this.config.configFormat === 'toml') {
                    const content = await fs.promises.readFile(expandedPath, 'utf-8');
                    const data = toml.parse(content);
                    return this.extractServers(data);
                } else {
                    const data = await _f_FileService.FileService.readJSON(expandedPath);
                    return this.extractServers(data);
                }
            } catch (error) {
                console.error(`Error reading ${this.name} config:`, error);
                return {};
            }
        }
        extractServers(data) {
            if (!data) return {};
            const keyPath = this.config.configKey.split('.');
            let current = data;
            for (const key of keyPath){
                if (current && typeof current === 'object' && key in current) {
                    current = current[key];
                } else {
                    return {};
                }
            }
            if (!current || typeof current !== 'object') return {};
            if (Array.isArray(current)) {
                const servers = {};
                for (const s of current){
                    if (s.name) {
                        servers[s.name] = {
                            command: s.command || '',
                            args: s.args || [],
                            env: s.env,
                            settings: s
                        };
                    }
                }
                return servers;
            }
            const servers = {};
            for (const [key, value] of Object.entries(current)){
                const serverData = value;
                servers[key] = {
                    command: serverData.command || '',
                    args: serverData.args || [],
                    env: serverData.env,
                    settings: serverData.settings || serverData
                };
            }
            return servers;
        }
        async setServers(servers) {
            const expandedPath = this.getPath();
            try {
                let data = {};
                if (fs.existsSync(expandedPath)) {
                    if (this.config.configFormat === 'toml') {
                        const content = await fs.promises.readFile(expandedPath, 'utf-8');
                        data = toml.parse(content);
                    } else {
                        data = await _f_FileService.FileService.readJSON(expandedPath) || {};
                    }
                }
                const keyPath = this.config.configKey.split('.');
                let current = data;
                for(let i = 0; i < keyPath.length - 1; i++){
                    const key = keyPath[i];
                    if (!(key in current)) {
                        current[key] = {};
                    }
                    current = current[key];
                }
                const finalKey = keyPath[keyPath.length - 1];
                const transformedServers = {};
                for (const [key, server] of Object.entries(servers)){
                    transformedServers[key] = {
                        command: server.command,
                        args: server.args || [],
                        ...server.env && {
                            env: server.env
                        }
                    };
                }
                current[finalKey] = transformedServers;
                const dir = path.dirname(expandedPath);
                if (!fs.existsSync(dir)) {
                    await fs.promises.mkdir(dir, {
                        recursive: true
                    });
                }
                if (this.config.configFormat === 'toml') {
                    const content = toml.stringify(data);
                    await fs.promises.writeFile(expandedPath, content, 'utf-8');
                } else {
                    await _f_FileService.FileService.writeJSON(expandedPath, data);
                }
                return true;
            } catch (error) {
                console.error(`Error writing ${this.name} config:`, error);
                return false;
            }
        }
    }
}
,
"8fb0384e":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "QwenAdapter", ()=>QwenAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_FileService = farmRequire("454c8ae6");
    class QwenAdapter {
        name = 'Qwen Code CLI';
        icon = 'https://assets.alicdn.com/g/qwenweb/qwen-webui-fe/0.0.191/static/favicon.png';
        color = '#5f46e8';
        getPath() {
            return path.join(os.homedir(), '.qwen/settings.json');
        }
        async configExists() {
            return fs.existsSync(this.getPath());
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.mcpServers) {
                return {};
            }
            return data.mcpServers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {};
            }
            data.mcpServers = servers;
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,
"94d886ec":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "CursorAdapter", ()=>CursorAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_VSCodeAdapter = farmRequire("3624460c");
    class CursorAdapter extends _f_VSCodeAdapter.VSCodeAdapter {
        name = 'Cursor';
        icon = 'https://www.cursor.com/favicon.ico';
        color = '#000000';
        getPath() {
            return path.join(os.homedir(), 'Library/Application Support/Cursor/User/globalStorage/mcp.json');
        }
        async configExists() {
            const appPath = '/Applications/Cursor.app';
            return fs.existsSync(appPath);
        }
    }
}
,
"cc18dfe6":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "KiloCodeAdapter", ()=>KiloCodeAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_FileService = farmRequire("454c8ae6");
    class KiloCodeAdapter {
        name = 'Kilo Code';
        icon = 'https://kilocode.ai/docs/img/kilo-v1.svg';
        color = '#ede749';
        getConfigPaths() {
            const homeDir = os.homedir();
            return [
                path.join(homeDir, 'Library/Application Support/Code/User/globalStorage/kilocode.kilo-code/settings/mcp_settings.json'),
                path.join(homeDir, 'Library/Application Support/Cursor/User/globalStorage/kilocode.kilo-code/settings/mcp_settings.json'),
                path.join(homeDir, 'Library/Application Support/VSCodium/User/globalStorage/kilocode.kilo-code/settings/mcp_settings.json')
            ];
        }
        findExistingPath() {
            for (const configPath of this.getConfigPaths()){
                if (fs.existsSync(configPath)) {
                    return configPath;
                }
            }
            return null;
        }
        getPath() {
            const existingPath = this.findExistingPath();
            if (existingPath) {
                return existingPath;
            }
            return this.getConfigPaths()[0];
        }
        async configExists() {
            return this.findExistingPath() !== null;
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.mcpServers) {
                return {};
            }
            return data.mcpServers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {};
            }
            data.mcpServers = servers;
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,
"ea3ba68a":function  (module, exports, farmRequire, farmDynamicRequire) {}
,
"f8cca18d":function  (module, exports, farmRequire, farmDynamicRequire) {
    module._m(exports);
    module.o(exports, "AntigravityAdapter", ()=>AntigravityAdapter);
    var _f_fs = module.w(farmRequire('fs'));
    var fs = _f_fs;
    var _f_path = module.w(farmRequire('path'));
    var path = _f_path;
    var _f_os = module.w(farmRequire('os'));
    var os = _f_os;
    var _f_VSCodeAdapter = farmRequire("3624460c");
    var _f_FileService = farmRequire("454c8ae6");
    var _f_packageRunner = farmRequire("6d8f9985");
    class AntigravityAdapter extends _f_VSCodeAdapter.VSCodeAdapter {
        name = 'Google Antigravity';
        icon = 'https://antigravity.google/favicon.ico';
        color = '#1a73e8';
        getPath() {
            return path.join(os.homedir(), '.gemini/antigravity/mcp_config.json');
        }
        async configExists() {
            return fs.existsSync(this.getPath());
        }
        async getServers() {
            const data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data || !data.mcpServers) {
                return {};
            }
            return data.mcpServers;
        }
        async setServers(servers) {
            let data = await _f_FileService.FileService.readJSON(this.getPath());
            if (!data) {
                data = {};
            }
            const transformedServers = {};
            for (const [key, server] of Object.entries(servers)){
                const isStreamingViaTransport = server.transportType && server.transportType !== 'stdio' && server.url;
                const isStreamingViaSettings = server.settings?.type === 'http' && server.settings?.url;
                if (isStreamingViaTransport && server.url) {
                    const remoteConfig = _f_packageRunner.createMcpRemoteConfig(server.url, server.settings?.headers);
                    transformedServers[key] = {
                        command: remoteConfig.command,
                        args: remoteConfig.args,
                        ...server.env && {
                            env: server.env
                        }
                    };
                } else if (isStreamingViaSettings) {
                    const remoteConfig = _f_packageRunner.createMcpRemoteConfig(server.settings.url, server.settings?.headers);
                    transformedServers[key] = {
                        command: remoteConfig.command,
                        args: remoteConfig.args,
                        ...server.env && {
                            env: server.env
                        }
                    };
                } else if (server.command) {
                    transformedServers[key] = {
                        command: server.command,
                        args: server.args || [],
                        ...server.env && {
                            env: server.env
                        }
                    };
                }
            }
            data.mcpServers = transformedServers;
            return await _f_FileService.FileService.writeJSON(this.getPath(), data);
        }
    }
}
,});global['e20309b3317686f6c8a7cfe5559430f9'].__farm_module_system__.setInitialLoadedResources([]);global['e20309b3317686f6c8a7cfe5559430f9'].__farm_module_system__.setDynamicModuleResourcesMap([],{  });var farmModuleSystem = global['e20309b3317686f6c8a7cfe5559430f9'].__farm_module_system__;farmModuleSystem.bootstrap();var entry = farmModuleSystem.require("799f0da0");
//# sourceMappingURL=main.js.map