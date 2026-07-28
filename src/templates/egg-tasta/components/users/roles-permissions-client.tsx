"use client";

import React, { useState } from "react";
import { Search, Plus, Edit, ShieldAlert, Check } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-tasta/components";

export function RolesPermissionsClient() {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  const roles = [
    { id: "1", name: "Manager", users: 1, permissions: "All Access", isSystem: false },
    { id: "2", name: "Salesman", users: 3, permissions: "Sales, Customers", isSystem: false },
    { id: "3", name: "Cashier", users: 2, permissions: "Sales, Cash Book", isSystem: false },
    { id: "4", name: "Business Admin", users: 1, permissions: "Full Control", isSystem: true },
  ];

  const permissionModules = [
    { name: "Products", perms: ["View", "Add", "Edit", "Delete", "Archive", "Restore", "Export", "Print"] },
    { name: "Sales", perms: ["View", "Create", "Edit", "Return", "Reports"] },
    { name: "Special Permissions", perms: ["View Cost Price", "View Profit", "Change Selling Price", "Give Discount", "Sell Below Minimum Price", "Edit Completed Sales", "Delete Records"] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'roles' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Manage Roles
        </button>
        <button 
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'permissions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          Edit Permissions
        </button>
      </div>

      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search roles..." 
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <Button variant="primary" onClick={() => alert("Create Role feature coming soon.")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>

          <Table>
            <Thead>
              <Tr>
                <Th>Role Name</Th>
                <Th>Assigned Users</Th>
                <Th>Access Level</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {roles.map((role) => (
                <Tr key={role.id}>
                  <Td className="font-medium text-slate-900 dark:text-slate-200">
                    <div className="flex items-center">
                      {role.name}
                      {role.isSystem && <ShieldAlert className="h-3 w-3 ml-2 text-rose-500" />}
                    </div>
                  </Td>
                  <Td>{role.users} Users</Td>
                  <Td className="text-slate-500">{role.permissions}</Td>
                  <Td className="text-right">
                    {!role.isSystem && (
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Role" onClick={() => setActiveTab("permissions")}>
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Select Role to Edit</label>
              <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]">
                <option value="1">Manager</option>
                <option value="2">Salesman</option>
                <option value="3">Cashier</option>
              </select>
            </div>
            <Button variant="primary">Save Permissions</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {permissionModules.map((mod, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 font-medium text-slate-900 dark:text-white flex justify-between items-center">
                  {mod.name}
                  <label className="flex items-center text-xs text-blue-600 dark:text-blue-400 cursor-pointer">
                    <input type="checkbox" className="mr-1.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Select All
                  </label>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {mod.perms.map((perm, j) => (
                    <label key={j} className="flex items-start cursor-pointer group">
                      <div className="flex items-center h-5">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4" defaultChecked={j % 2 === 0} />
                      </div>
                      <div className="ml-2 text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                        {perm}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
