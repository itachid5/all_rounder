import { IModule, ModuleContext, ModuleStatus } from './sdk';
import { platformEventBus } from './event-bus';
import { logger } from "@/shared/utils/logger";

export class ModuleEngine {
  private modules: Map<string, IModule> = new Map();
  private services: Map<string, any> = new Map();

  /**
   * Register a module with the platform (Auto Discovery mechanism)
   */
  registerModule(module: IModule): void {
    if (this.modules.has(module.metadata.id)) {
      throw new Error(`Module ${module.metadata.id} is already registered.`);
    }
    
    // Check circular dependencies upon registration
    this.modules.set(module.metadata.id, module);
    try {
      this.checkCircularDependencies(module.metadata.id);
    } catch (error) {
      this.modules.delete(module.metadata.id);
      throw error;
    }

    module.metadata.status = 'registered';
    logger.info(`Registered module: ${module.metadata.id} v${module.metadata.version}`);
  }

  getModule(id: string): IModule | undefined {
    return this.modules.get(id);
  }

  getAllModules(): IModule[] {
    return Array.from(this.modules.values());
  }

  /**
   * Validate if a module's dependencies are satisfied by the currently enabled modules
   */
  validateDependencies(moduleId: string, enabledModuleIds: string[]): boolean {
    const mod = this.modules.get(moduleId);
    if (!mod) return false;

    const deps = mod.metadata.dependencies || {};
    for (const [depId, versionRange] of Object.entries(deps)) {
      if (!enabledModuleIds.includes(depId)) {
        logger.warn(`Missing dependency for ${moduleId}: ${depId}`);
        return false;
      }
      
      const depMod = this.modules.get(depId);
      if (!depMod) return false;
      
      // Basic version check could be added here (e.g., using semver)
      // For now, if it's enabled, we assume satisfaction.
    }
    return true;
  }

  /**
   * Detects circular dependencies in the registered modules using DFS
   */
  checkCircularDependencies(startModuleId: string): void {
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const dfs = (moduleId: string) => {
      visited.add(moduleId);
      recStack.add(moduleId);

      const mod = this.modules.get(moduleId);
      if (mod && mod.metadata.dependencies) {
        for (const depId of Object.keys(mod.metadata.dependencies)) {
          if (!visited.has(depId)) {
            dfs(depId);
          } else if (recStack.has(depId)) {
            throw new Error(`Circular dependency detected: ${moduleId} -> ${depId}`);
          }
        }
      }
      recStack.delete(moduleId);
    };

    dfs(startModuleId);
  }

  private createContext(tenantId?: string): ModuleContext {
    return {
      tenantId,
      events: platformEventBus,
      services: {
        register: (serviceName: string, implementation: any) => {
          const key = tenantId ? `${tenantId}:${serviceName}` : serviceName;
          this.services.set(key, implementation);
          logger.debug(`Service registered: ${serviceName}`, { tenantId });
        },
        invoke: async (serviceName: string, ...args: any[]) => {
          const key = tenantId ? `${tenantId}:${serviceName}` : serviceName;
          const service = this.services.get(key);
          if (!service) {
            throw new Error(`Service not found: ${serviceName}`);
          }
          return service(...args);
        }
      }
    };
  }

  // --- MODULE LIFECYCLE ---

  async installModule(moduleId: string, tenantId?: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Cannot install unknown module ${moduleId}`);

    const context = this.createContext(tenantId);
    logger.info(`Installing module ${moduleId}...`);
    try {
      if (mod.onInstall) await mod.onInstall(context);
      mod.metadata.status = 'installed';
      await platformEventBus.publish('module.installed', { moduleId, tenantId });
    } catch (error) {
      mod.metadata.status = 'error';
      logger.error(`Failed to install module ${moduleId}`, error);
      throw error;
    }
  }

  async initializeModule(moduleId: string, tenantId?: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Cannot initialize unknown module ${moduleId}`);

    const context = this.createContext(tenantId);
    logger.info(`Initializing module ${moduleId}...`);
    try {
      if (mod.onInitialize) await mod.onInitialize(context);
    } catch (error) {
      logger.error(`Failed to initialize module ${moduleId}`, error);
      throw error;
    }
  }

  async enableModule(moduleId: string, tenantId?: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Cannot enable unknown module ${moduleId}`);

    const context = this.createContext(tenantId);
    logger.info(`Enabling module ${moduleId}...`);
    try {
      if (mod.onEnable) await mod.onEnable(context);
      mod.metadata.status = 'enabled';
      await platformEventBus.publish('module.enabled', { moduleId, tenantId });
    } catch (error) {
      mod.metadata.status = 'error';
      logger.error(`Failed to enable module ${moduleId}`, error);
      throw error;
    }
  }

  async disableModule(moduleId: string, tenantId?: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Cannot disable unknown module ${moduleId}`);

    const context = this.createContext(tenantId);
    logger.info(`Disabling module ${moduleId}...`);
    try {
      if (mod.onDisable) await mod.onDisable(context);
      mod.metadata.status = 'disabled';
      await platformEventBus.publish('module.disabled', { moduleId, tenantId });
    } catch (error) {
      logger.error(`Failed to disable module ${moduleId}`, error);
      throw error;
    }
  }

  async upgradeModule(moduleId: string, fromVersion: string, tenantId?: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Cannot upgrade unknown module ${moduleId}`);

    const context = this.createContext(tenantId);
    logger.info(`Upgrading module ${moduleId} from version ${fromVersion}...`);
    try {
      if (mod.onUpgrade) await mod.onUpgrade(context, fromVersion);
      await platformEventBus.publish('module.upgraded', { moduleId, tenantId, fromVersion, toVersion: mod.metadata.version });
    } catch (error) {
      logger.error(`Failed to upgrade module ${moduleId}`, error);
      throw error;
    }
  }

  async rollbackModule(moduleId: string, toVersion: string, tenantId?: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Cannot rollback unknown module ${moduleId}`);

    const context = this.createContext(tenantId);
    logger.info(`Rolling back module ${moduleId} to version ${toVersion}...`);
    try {
      if (mod.onRollback) await mod.onRollback(context, toVersion);
      await platformEventBus.publish('module.rolled_back', { moduleId, tenantId, toVersion });
    } catch (error) {
      logger.error(`Failed to rollback module ${moduleId}`, error);
      throw error;
    }
  }

  async uninstallModule(moduleId: string, tenantId?: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Cannot uninstall unknown module ${moduleId}`);

    const context = this.createContext(tenantId);
    logger.info(`Uninstalling module ${moduleId}...`);
    try {
      if (mod.onUninstall) await mod.onUninstall(context);
      this.modules.delete(moduleId); // Assuming global uninstallation for now
      await platformEventBus.publish('module.uninstalled', { moduleId, tenantId });
    } catch (error) {
      logger.error(`Failed to uninstall module ${moduleId}`, error);
      throw error;
    }
  }

  async configureModule(moduleId: string, config: any, tenantId?: string): Promise<void> {
    const mod = this.modules.get(moduleId);
    if (!mod) throw new Error(`Cannot configure unknown module ${moduleId}`);
    
    // Emit configuration event
    await platformEventBus.publish('module.configured', { moduleId, tenantId, config });
    logger.info(`Module ${moduleId} configured.`);
  }
}

// Singleton Engine for the platform
export const moduleEngine = new ModuleEngine();
