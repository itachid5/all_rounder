import { TemplateContract } from "./types";
import { notFound } from "next/navigation";
import { TemplateRegistry } from "./registry";

export async function loadTemplateContract(templateId: string): Promise<TemplateContract> {
  try {
    const templateModule = await import(`@/templates/${templateId}/index.ts`);
    const contract = templateModule.default as TemplateContract;
    
    // Automatic Registration upon load
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
    const contract = await loadTemplateContract(templateId);
    
    // VERIFY route exists before blindly importing
    if (!contract.routes.includes(path)) {
      console.warn(`[Template Engine] Attempted to load unregistered route: ${path}`);
      notFound();
    }

    // Dynamic import for the page component.
    // Webpack will trace this and include all page.tsx files under src/templates/*/app/**/page.tsx
    const TemplatePage = (await import(`@/templates/${templateId}/app/${path}/page`)).default;
    return TemplatePage;
  } catch (error) {
    // If it's a MODULE_NOT_FOUND error (meaning the physical file is missing despite being registered), 
    // or if the route verification failed and threw notFound(), handle it.
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error; // Let Next.js handle notFound()
    }
    console.error(`[Template Engine] Route not found or failed to load in template ${templateId}: ${path}`, error);
    notFound();
  }
}

