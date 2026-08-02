"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Edit, ShieldAlert, Check, Copy, Trash2, Loader2, CheckCircle2, AlertCircle, X, Shield, Eye
} from "lucide-react";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-tasta/components";
import { 
  getRolesAction, 
  getAllPermissionsAction, 
  createRoleAction, 
  updateRolePermissionsAction, 
  duplicateRoleAction, 
  deleteRoleAction 
} from "@/shared/actions/rbac";

interface RoleItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissionIds: string[];
}

interface PermissionItem {
  id: string;
  name: string;
  slug: string;
  group: string;
}

const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  suppliers: "Suppliers",
  supplier_payments: "Supplier Payments",
  customers: "Customers",
  customer_collections: "Customer Collection",
  purchases: "Purchases",
  sales: "Sales",
  sales_returns: "Sale Return",
  inventory: "Inventory",
  expenses: "Expenses",
  cashbook: "Cashbook",
  reports: "Reports",
  users: "User Management",
  data_management: "Data Management",
  settings: "Settings",
  branding: "Business Branding",
  profile: "Profile"
};

const ACTIONS = ["view", "create", "edit", "delete", "print", "export", "approve"];

export function RolesPermissionsClient() {
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionItem[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, PermissionItem[]>>({});

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [selectedPermIds, setSelectedPermIds] = useState<Set<string>>(new Set());

  const [roleSearch, setRoleSearch] = useState("");
  const [matrixSearch, setMatrixSearch] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create/Edit Role Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  const [modalRoleName, setModalRoleName] = useState("");
  const [modalRoleDesc, setModalRoleDesc] = useState("");
  const [modalPermIds, setModalPermIds] = useState<Set<string>>(new Set());
  const [submittingModal, setSubmittingModal] = useState(false);

  // View Role Details Modal State
  const [viewingRole, setViewingRole] = useState<RoleItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    const rRes = await getRolesAction();
    const pRes = await getAllPermissionsAction();

    if (rRes.success && rRes.data) {
      setRoles(rRes.data);
      if (rRes.data.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rRes.data[0].id);
        setSelectedPermIds(new Set(rRes.data[0].permissionIds));
      }
    }

    if (pRes.success && pRes.grouped) {
      setAllPermissions(pRes.permissions || []);
      setGroupedPermissions(pRes.grouped);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    const role = roles.find((r) => r.id === roleId);
    if (role) {
      setSelectedPermIds(new Set(role.permissionIds));
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setModalRoleName("");
    setModalRoleDesc("");
    setModalPermIds(new Set());
    setIsModalOpen(true);
  };

  const openEditModal = (role: RoleItem) => {
    setEditingRole(role);
    setModalRoleName(role.name);
    setModalRoleDesc(role.description || "");
    setModalPermIds(new Set(role.permissionIds));
    setIsModalOpen(true);
  };

  const toggleModalPermission = (permId: string) => {
    const next = new Set(modalPermIds);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    setModalPermIds(next);
  };

  const toggleModalModuleAll = (groupKey: string) => {
    const groupPerms = groupedPermissions[groupKey] || [];
    const groupPermIds = groupPerms.map((p) => p.id);
    const allSelected = groupPermIds.every((id) => modalPermIds.has(id));

    const next = new Set(modalPermIds);
    if (allSelected) {
      groupPermIds.forEach((id) => next.delete(id));
    } else {
      groupPermIds.forEach((id) => next.add(id));
    }
    setModalPermIds(next);
  };

  const toggleModalActionColumn = (action: string) => {
    const actionPerms = allPermissions.filter((p) => p.slug.startsWith(`${action}:`));
    const actionPermIds = actionPerms.map((p) => p.id);
    const allSelected = actionPermIds.every((id) => modalPermIds.has(id));

    const next = new Set(modalPermIds);
    if (allSelected) {
      actionPermIds.forEach((id) => next.delete(id));
    } else {
      actionPermIds.forEach((id) => next.add(id));
    }
    setModalPermIds(next);
  };

  const toggleModalSelectAll = () => {
    const allIds = allPermissions.map((p) => p.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => modalPermIds.has(id));

    if (allSelected) {
      setModalPermIds(new Set());
    } else {
      setModalPermIds(new Set(allIds));
    }
  };

  const copyPermissionsIntoModal = (sourceRoleId: string) => {
    const sourceRole = roles.find((r) => r.id === sourceRoleId);
    if (sourceRole) {
      setModalPermIds(new Set(sourceRole.permissionIds));
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalRoleName.trim()) return;

    setSubmittingModal(true);
    setMessage(null);

    if (editingRole) {
      // Update existing role permissions
      const res = await updateRolePermissionsAction(editingRole.id, Array.from(modalPermIds));
      setSubmittingModal(false);

      if (res.success) {
        setIsModalOpen(false);
        setMessage({ type: "success", text: `Role "${modalRoleName}" updated successfully!` });
        loadData();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update role." });
      }
    } else {
      // Create new role
      const res = await createRoleAction(modalRoleName, modalRoleDesc, Array.from(modalPermIds));
      setSubmittingModal(false);

      if (res.success) {
        setIsModalOpen(false);
        setMessage({ type: "success", text: `Custom Role "${modalRoleName}" created with ${modalPermIds.size} permissions!` });
        loadData();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to create role." });
      }
    }
  };

  const handleDuplicate = async (role: RoleItem) => {
    setMessage(null);
    const res = await duplicateRoleAction(role.id);
    if (res.success) {
      setMessage({ type: "success", text: `Duplicated role as "${role.name} (Copy)"!` });
      loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to duplicate role." });
    }
  };

  const handleDelete = async (role: RoleItem) => {
    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;

    setMessage(null);
    const res = await deleteRoleAction(role.id);
    if (res.success) {
      setMessage({ type: "success", text: `Role "${role.name}" deleted successfully.` });
      loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete role." });
    }
  };

  const togglePermission = (permId: string) => {
    const next = new Set(selectedPermIds);
    if (next.has(permId)) next.delete(permId);
    else next.add(permId);
    setSelectedPermIds(next);
  };

  const toggleModuleAll = (groupKey: string) => {
    const groupPerms = groupedPermissions[groupKey] || [];
    const groupPermIds = groupPerms.map((p) => p.id);
    const allSelected = groupPermIds.every((id) => selectedPermIds.has(id));

    const next = new Set(selectedPermIds);
    if (allSelected) groupPermIds.forEach((id) => next.delete(id));
    else groupPermIds.forEach((id) => next.add(id));
    setSelectedPermIds(next);
  };

  const toggleActionColumn = (action: string) => {
    const actionPerms = allPermissions.filter((p) => p.slug.startsWith(`${action}:`));
    const actionPermIds = actionPerms.map((p) => p.id);
    const allSelected = actionPermIds.every((id) => selectedPermIds.has(id));

    const next = new Set(selectedPermIds);
    if (allSelected) actionPermIds.forEach((id) => next.delete(id));
    else actionPermIds.forEach((id) => next.add(id));
    setSelectedPermIds(next);
  };

  const toggleSelectAll = () => {
    const allIds = allPermissions.map((p) => p.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedPermIds.has(id));
    if (allSelected) setSelectedPermIds(new Set());
    else setSelectedPermIds(new Set(allIds));
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    setMessage(null);

    const res = await updateRolePermissionsAction(selectedRoleId, Array.from(selectedPermIds));
    setSaving(false);

    if (res.success) {
      setMessage({ type: "success", text: "Permissions matrix saved successfully!" });
      loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to save permissions." });
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
      r.slug.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const moduleKeys = Object.keys(MODULE_LABELS).filter((modKey) =>
    MODULE_LABELS[modKey].toLowerCase().includes(matrixSearch.toLowerCase())
  );

  const activeRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border animate-in fade-in duration-200 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "roles"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Manage Business Roles
        </button>
        <button
          onClick={() => setActiveTab("permissions")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "permissions"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Full Permission Matrix
        </button>
      </div>

      {/* Tab 1: Roles List */}
      {activeTab === "roles" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
            <Button variant="primary" onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>

          <Table>
            <Thead>
              <Tr>
                <Th>Role Name</Th>
                <Th>Assigned Employees</Th>
                <Th>Granted Permissions</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={4} className="text-center py-8 text-slate-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading roles...
                  </Td>
                </Tr>
              ) : filteredRoles.length === 0 ? (
                <Tr>
                  <Td colSpan={4}>
                    <EmptyState title="No Roles Found" description="Create a custom role to manage employee access." icon={Shield} />
                  </Td>
                </Tr>
              ) : (
                filteredRoles.map((role) => (
                  <Tr key={role.id}>
                    <Td className="font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{role.name}</span>
                        {role.isSystem && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <ShieldAlert className="h-3 w-3" /> Protected
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>{role.userCount} Employee(s)</Td>
                    <Td className="text-slate-500 text-xs">
                      {role.permissionIds.length} / {allPermissions.length} Active Permissions
                    </Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingRole(role)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Role Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(role)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Role & Permissions Matrix"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(role)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Duplicate Role"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {!role.isSystem && role.slug !== "business_owner" && (
                          <button
                            onClick={() => handleDelete(role)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Delete Role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>
      )}

      {/* Tab 2: Full Permission Matrix */}
      {activeTab === "permissions" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                  Selected Role
                </label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.isSystem ? "(Protected)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter modules..."
                  value={matrixSearch}
                  onChange={(e) => setMatrixSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <Button variant="primary" onClick={handleSavePermissions} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : (
                  "Save Permissions Matrix"
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 text-xs font-medium text-slate-500">
            <span>
              Editing permissions for: <strong className="text-slate-900 dark:text-white">{activeRole?.name}</strong>
            </span>
            <button
              onClick={toggleSelectAll}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              Toggle Select All Matrix
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-3.5 min-w-[180px]">ERP Module</th>
                  <th className="p-3.5 text-center min-w-[90px]">Module All</th>
                  {ACTIONS.map((act) => (
                    <th key={act} className="p-3.5 text-center min-w-[90px] capitalize">
                      <button
                        onClick={() => toggleActionColumn(act)}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                        title={`Toggle all ${act} permissions`}
                      >
                        <span>{act}</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {moduleKeys.map((modKey) => {
                  const modLabel = MODULE_LABELS[modKey];
                  const groupPerms = groupedPermissions[modKey] || [];

                  return (
                    <tr key={modKey} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {modLabel}
                      </td>

                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          onChange={() => toggleModuleAll(modKey)}
                          checked={
                            groupPerms.length > 0 &&
                            groupPerms.every((p) => selectedPermIds.has(p.id))
                          }
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {ACTIONS.map((act) => {
                        const perm = groupPerms.find((p) => p.slug === `${act}:${modKey}`);
                        if (!perm) return <td key={act} className="p-3.5 text-center text-slate-300">-</td>;

                        const isChecked = selectedPermIds.has(perm.id);
                        return (
                          <td key={act} className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(perm.id)}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Role Modal with Embedded Matrix */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>{editingRole ? `Edit Role (${editingRole.name})` : "Create Custom Role with Permissions"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sales Executive, Accountant, Purchase Manager"
                    value={modalRoleName}
                    onChange={(e) => setModalRoleName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of responsibilities..."
                    value={modalRoleDesc}
                    onChange={(e) => setModalRoleDesc(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Embedded Permission Matrix */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Assign Permissions ({modalPermIds.size} Selected)
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      onChange={(e) => {
                        if (e.target.value) copyPermissionsIntoModal(e.target.value);
                      }}
                      defaultValue=""
                      className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300"
                    >
                      <option value="" disabled>Copy Permissions From...</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={toggleModalSelectAll}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      Toggle Select All
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-[350px]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="p-3 min-w-[160px]">Module</th>
                        <th className="p-3 text-center min-w-[80px]">All</th>
                        {ACTIONS.map((act) => (
                          <th key={act} className="p-3 text-center min-w-[80px] capitalize">
                            <button
                              type="button"
                              onClick={() => toggleModalActionColumn(act)}
                              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {act}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {Object.keys(MODULE_LABELS).map((modKey) => {
                        const modLabel = MODULE_LABELS[modKey];
                        const groupPerms = groupedPermissions[modKey] || [];

                        return (
                          <tr key={modKey} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                            <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                              {modLabel}
                            </td>

                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                onChange={() => toggleModalModuleAll(modKey)}
                                checked={
                                  groupPerms.length > 0 &&
                                  groupPerms.every((p) => modalPermIds.has(p.id))
                                }
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>

                            {ACTIONS.map((act) => {
                              const perm = groupPerms.find((p) => p.slug === `${act}:${modKey}`);
                              if (!perm) return <td key={act} className="p-3 text-center text-slate-300">-</td>;

                              const isChecked = modalPermIds.has(perm.id);
                              return (
                                <td key={act} className="p-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleModalPermission(perm.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingModal}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingModal ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    editingRole ? "Save Changes" : "Create Role with Permissions"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Role Details Modal */}
      {viewingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span>Role Details ({viewingRole.name})</span>
              </h2>
              <button
                type="button"
                onClick={() => setViewingRole(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Name</label>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{viewingRole.name}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <p className="text-xs text-slate-600 dark:text-slate-300">{viewingRole.description || "No description provided."}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                  Active Permissions ({viewingRole.permissionIds.length})
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allPermissions
                    .filter((p) => viewingRole.permissionIds.includes(p.id))
                    .map((p) => (
                      <span
                        key={p.id}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900"
                      >
                        {p.slug}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <button
                type="button"
                onClick={() => setViewingRole(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
