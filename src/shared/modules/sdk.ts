import { EventBus } from './event-bus';

export interface ModuleContext {
  tenantId?: string;
  events: EventBus;
  // Expose methods to register and invoke inter-module services securely
  services: {
    register: (serviceName: string, implementation: any) => void;
    invoke: <T = any>(serviceName: string, ...args: any[]) => Promise<T>;
  };
}

export type ModuleStatus = 'registered' | 'installed' | 'enabled' | 'disabled' | 'error';

export interface ModuleMetadata {
  id: string; // e.g. 'core.customers'
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  dependencies: Record<string, string>; // e.g. { 'core.finance': '^1.0.0' }
  minPlatformVersion: string;
  maxPlatformVersion?: string;
  status?: ModuleStatus;
}

export interface ModuleRoute {
  path: string;
  component: any; // using any for now to avoid React dependency if not needed, or just type it safely
  layout?: 'platform' | 'business' | 'public';
  permissions?: string[];
}

export interface ModuleMenu {
  id: string;
  label: string;
  icon?: string;
  href?: string;
  parent?: string;
  order?: number;
  permissions?: string[];
}

export interface ModulePermission {
  id: string;
  name: string;
  description: string;
  group: string;
}

export interface ModuleWidget {
  id: string;
  name: string;
  component: any;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface ModuleSetting {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'select';
  options?: any[];
  defaultValue?: any;
}

export interface ModuleReport {
  id: string;
  name: string;
  description?: string;
  component: any;
}

export interface ModuleCommand {
  id: string;
  name: string;
  description?: string;
  handler: (context: ModuleContext, args: any) => Promise<any>;
}

export interface ModuleJob {
  id: string;
  name: string;
  cronExpression?: string;
  handler: (context: ModuleContext) => Promise<void>;
}

export interface ModuleApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: (req: any, res: any) => Promise<void>;
}

export interface ModuleNavigation {
  id: string;
  name: string;
  path: string;
  icon?: string;
  parent?: string;
}

export interface ModuleSearchProvider {
  id: string;
  name: string;
  search: (query: string, context: ModuleContext) => Promise<any[]>;
}

export interface ModuleExport {
  id: string;
  name: string;
  format: 'csv' | 'json' | 'pdf' | 'excel' | string;
  handler: (context: ModuleContext, filters: any) => Promise<any>;
}

export interface ModuleImport {
  id: string;
  name: string;
  format: 'csv' | 'json' | 'excel' | string;
  handler: (context: ModuleContext, data: any) => Promise<any>;
}

export interface IModule {
  metadata: ModuleMetadata;
  
  // Lifecycle Hooks
  onInstall?: (context: ModuleContext) => Promise<void>;
  onInitialize?: (context: ModuleContext) => Promise<void>;
  onEnable?: (context: ModuleContext) => Promise<void>;
  onDisable?: (context: ModuleContext) => Promise<void>;
  onUninstall?: (context: ModuleContext) => Promise<void>;
  onUpgrade?: (context: ModuleContext, fromVersion: string) => Promise<void>;
  onRollback?: (context: ModuleContext, toVersion: string) => Promise<void>;

  // Capabilities
  capabilities?: {
    routes?: ModuleRoute[];
    menus?: ModuleMenu[];
    permissions?: ModulePermission[];
    widgets?: ModuleWidget[];
    settings?: ModuleSetting[];
    reports?: ModuleReport[];
    commands?: ModuleCommand[];
    backgroundJobs?: ModuleJob[];
    events?: string[];
    services?: string[];
    apiEndpoints?: ModuleApiEndpoint[];
    navigation?: ModuleNavigation[];
    searchProviders?: ModuleSearchProvider[];
    exports?: ModuleExport[];
    imports?: ModuleImport[];
    // Anything else should be extensible
    [key: string]: any;
  };
}
