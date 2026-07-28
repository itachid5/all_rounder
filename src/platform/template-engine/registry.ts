import { TemplateMetadata } from "./types";

export class TemplateRegistry {
  private static templates: Map<string, TemplateMetadata> = new Map();

  static register(metadata: TemplateMetadata) {
    if (this.templates.has(metadata.id)) {
      throw new Error(`Template with id ${metadata.id} is already registered.`);
    }
    
    // Validate required fields
    if (!metadata.id || !metadata.name || !metadata.status) {
      throw new Error("Template metadata is missing required fields (id, name, status).");
    }

    this.templates.set(metadata.id, metadata);
  }

  static get(id: string): TemplateMetadata | undefined {
    return this.templates.get(id);
  }

  static getAll(): TemplateMetadata[] {
    return Array.from(this.templates.values());
  }

  static validateAtStartup() {
    console.log("[TemplateRegistry] Validating registered templates...");
    const all = this.getAll();
    if (all.length === 0) {
      console.warn("[TemplateRegistry] No templates registered.");
    }
    for (const template of all) {
      if (template.status === "active") {
        console.log(`[TemplateRegistry] Verified active template: ${template.id}`);
      }
    }
  }
}
