import { TemplateContract } from "./types";
import { notFound } from "next/navigation";
import { TemplateRegistry } from "./registry";
import { eggTastaPageMap } from "@/templates/egg-tasta/pages";

export async function loadTemplateContract(templateId: string): Promise<TemplateContract> {
  try {
    const templateModule = await import(`@/templates/${templateId}/index.ts`);
    const contract = templateModule.default as TemplateContract;
    
    if (!TemplateRegistry.get(contract.metadata.id)) {
      TemplateRegistry.register(contract.metadata);
    }
    
    return contract;
  } catch (error) {
    console.error(`[Template Engine] Failed to load contract for template: ${templateId}`, error);
    throw new Error(`Template ${templateId} does not exist or has an invalid contract.`);
  }
}

export async function loadTemplatePage(templateId: string, path: string) {
  try {
    // 1. Static page map resolution (avoids Turbopack runtime ChunkLoadError)
    if (templateId === "egg-tasta") {
      const pageComponent = eggTastaPageMap[path];
      if (pageComponent) {
        return pageComponent;
      }
    }

    const contract = await loadTemplateContract(templateId);
    
    if (!contract.routes.includes(path)) {
      console.warn(`[Template Engine] Attempted to load unregistered route: ${path}`);
      notFound();
    }

    const TemplatePage = (await import(`@/templates/${templateId}/app/${path}/page`)).default;
    return TemplatePage;
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }
    console.error(`[Template Engine] Route not found or failed to load in template ${templateId}: ${path}`, error);
    notFound();
  }
}
