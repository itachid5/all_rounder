"use client";

import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent } from "@/shared/components/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/table";
import { Button } from "@/shared/components/button";
import { Badge } from "@/shared/components/badge";
import { StatusBadge } from "@/shared/components/status-badge";
import { Settings, Plus, Power, PowerOff } from "lucide-react";

const modules = [
  { id: "mod_1", name: "Inventory Management", version: "v2.4.1", status: "active", category: "Core" },
  { id: "mod_2", name: "Human Resources", version: "v1.2.0", status: "active", category: "Core" },
  { id: "mod_3", name: "Payroll Processing", version: "v3.0.5", status: "inactive", category: "Finance" },
  { id: "mod_4", name: "Customer Portal", version: "v1.0.0", status: "active", category: "External" },
  { id: "mod_5", name: "Advanced Analytics", version: "v2.1.2", status: "pending", category: "Reporting" },
];

export default function ModulesPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Module Management" 
        description="Install, configure, and manage modules for your business."
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Install Module
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((mod) => (
                <TableRow key={mod.id}>
                  <TableCell className="font-medium">{mod.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{mod.category}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{mod.version}</TableCell>
                  <TableCell>
                    <StatusBadge status={mod.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" title="Configure Module">
                      <Settings className="h-4 w-4" />
                      <span className="sr-only">Configure</span>
                    </Button>
                    {mod.status === "active" ? (
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" title="Disable Module">
                        <PowerOff className="h-4 w-4" />
                        <span className="sr-only">Disable</span>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600 hover:bg-green-50" title="Enable Module">
                        <Power className="h-4 w-4" />
                        <span className="sr-only">Enable</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
