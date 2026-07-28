"use client";

import { PageHeader } from "@/components/shared/page-header";
import { DataTable, Column } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Role = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
};

const mockRoles: Role[] = [
  { id: "1", name: "Owner", description: "Full access to all business settings and data.", userCount: 1, isSystem: true },
  { id: "2", name: "Manager", description: "Can manage staff and view most reports.", userCount: 3, isSystem: false },
  { id: "3", name: "Supervisor", description: "Can oversee daily operations and staff.", userCount: 5, isSystem: false },
  { id: "4", name: "Staff", description: "Basic access for regular employees.", userCount: 24, isSystem: false },
  { id: "5", name: "Viewer", description: "Read-only access to selected areas.", userCount: 2, isSystem: false },
];

export default function RolesPage() {
  const columns: Column<Role>[] = [
    {
      key: "name",
      header: "Role Name",
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{role.name}</span>
          {role.isSystem && <Badge variant="secondary" className="text-[10px]">System</Badge>}
        </div>
      )
    },
    {
      key: "description",
      header: "Description",
      className: "text-muted-foreground"
    },
    {
      key: "userCount",
      header: "Assigned Users",
      render: (role: Role) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{role.userCount} users</span>
        </div>
      )
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (role: Role) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" /> Edit Role
            </DropdownMenuItem>
            {!role.isSystem && (
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Role
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Roles"
        description="Define and manage business-level roles for your organization."
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        }
      />
      
      <DataTable 
        columns={columns} 
        data={mockRoles} 
      />
    </div>
  );
}
