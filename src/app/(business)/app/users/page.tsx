"use client";

import { useState } from "react";
import { PageHeader } from "@/shared/components/page-header";
import { DataTable, Column } from "@/shared/components/data-table";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Badge } from "@/shared/components/badge";
import { Avatar, AvatarFallback } from "@/shared/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/dropdown-menu";
import { MoreHorizontal, Plus, Search, Shield, UserCog, KeyRound, Ban, CheckCircle } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  lastActive: string;
};

const mockUsers: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@business.com", role: "Owner", status: "active", lastActive: "2 mins ago" },
  { id: "2", name: "Bob Smith", email: "bob@business.com", role: "Manager", status: "active", lastActive: "1 hour ago" },
  { id: "3", name: "Charlie Davis", email: "charlie@business.com", role: "Staff", status: "inactive", lastActive: "5 days ago" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  
  const filteredUsers = mockUsers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      )
    },
    {
      key: "role",
      header: "Role",
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span>{user.role}</span>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <Badge variant={user.status === "active" ? "success" : "secondary"}>
          {user.status === "active" ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      key: "lastActive",
      header: "Last Active",
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCog className="w-4 h-4 mr-2" /> Edit User
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="w-4 h-4 mr-2" /> Assign Roles
            </DropdownMenuItem>
            <DropdownMenuItem>
              <KeyRound className="w-4 h-4 mr-2" /> Reset Password
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === "active" ? (
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <Ban className="w-4 h-4 mr-2" /> Disable User
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-green-600 focus:text-green-600">
                <CheckCircle className="w-4 h-4 mr-2" /> Activate User
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
        title="Users"
        description="Manage your business users, assign roles, and handle access control."
        actions={
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        }
      />
      
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">Filters</Button>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredUsers} 
      />
    </div>
  );
}
