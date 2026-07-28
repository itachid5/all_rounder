import { ReactNode } from "react";

export interface TemplateMetadata {
  id: string;
  name: string;
  version: string;
  description: string;
  icon?: string;
  status: "active" | "inactive";
}

export interface TemplateContract {
  metadata: TemplateMetadata;
  navigation: any; // Can be a static list or a function returning a list
  routes: string[];
  permissions: string[];
  modules: string[];
  theme: any;
  Layout: React.ComponentType<{ children: ReactNode; navigation: any[]; user: any }>;
}
