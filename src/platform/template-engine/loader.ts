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
    // Dynamic import for the page component.
    // Webpack will trace this and include all page.tsx files under src/templates/*/app/**/page.tsx
    const TemplatePage = (await import(`@/templates/${templateId}/app/${path}/page`)).default;
    return TemplatePage;
  } catch (error) {
    console.error(`[Template Engine] Route not found in template ${templateId}: ${path}`, error);
    notFound();
  }
}
