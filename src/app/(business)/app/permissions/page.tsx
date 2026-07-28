"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck } from "lucide-react";

const permissionCategories = [
  {
    name: "User Management",
    description: "Control who can view, create, edit, or delete users.",
    permissions: ["View Users", "Create Users", "Edit Users", "Delete Users", "Assign Roles"]
  },
  {
    name: "Billing & Invoices",
    description: "Manage financial records and invoice settings.",
    permissions: ["View Invoices", "Create Invoices", "Edit Invoices", "Delete Invoices", "Manage Payment Methods"]
  },
  {
    name: "Business Settings",
    description: "Access and modify core business configurations.",
    permissions: ["View Settings", "Edit Profile", "Manage Integrations"]
  }
];

export default function PermissionsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Permissions Matrix"
        description="View the foundation of business permissions and categories available in the system."
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {permissionCategories.map((category, idx) => (
          <Card key={idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                {category.name}
              </CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {category.permissions.map((perm, pIdx) => (
                  <Badge key={pIdx} variant="outline" className="bg-muted/50">
                    {perm}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-primary/5 border-primary/20">
        <CardContent className="flex items-start gap-4 pt-6">
          <ShieldAlert className="w-8 h-8 text-primary mt-1" />
          <div>
            <h3 className="font-semibold text-lg mb-1">Coming Soon: Interactive Permission Matrix</h3>
            <p className="text-muted-foreground text-sm">
              In a future update, you will be able to map these permissions directly to custom roles via an interactive grid, providing granular access control for your business.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
