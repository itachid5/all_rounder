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
  navigation: any;
  routes: string[];
  permissions: string[];
  modules: string[];
  theme: any;
  Layout: React.ComponentType<{ 
    children: ReactNode; 
    navigation: any[]; 
    user: any; 
    branding?: any; 
    userPermissions?: string[]; 
    isOwner?: boolean; 
  }>;
}
