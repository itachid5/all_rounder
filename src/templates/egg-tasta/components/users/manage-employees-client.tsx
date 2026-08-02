"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, Plus, Edit, Trash2, KeyRound, Loader2, UserCheck, UserX, AlertCircle, CheckCircle2, X
} from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge } from "@/templates/egg-tasta/components";
import { 
  getEmployeesAction, 
  toggleEmployeeStatusAction, 
  deleteEmployeeAction,
  updateEmployeeAction 
} from "@/templates/egg-tasta/actions/employees";
import { getRolesAction } from "@/shared/actions/rbac";
import { PermissionGuard } from "@/shared/components/permission-context";

interface EmployeeItem {
  id: string;
  empId: string;
  fullName: string;
  mobile: string;
  email: string | null;
  designation: string;
  joinDate: string;
  status: string;
  username: string;
  lastLogin: string;
}

export function ManageEmployeesClient() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EmployeeItem[]>([]);
  const [rolesList, setRolesList] = useState<{ id: string; name: string }[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Modal State
  const [editingEmp, setEditingEmp] = useState<EmployeeItem | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [empRes, rolesRes] = await Promise.all([
      getEmployeesAction(),
      getRolesAction()
    ]);

    if (empRes.success && empRes.data) {
      setData(empRes.data as EmployeeItem[]);
    }

    if (rolesRes.success && rolesRes.data) {
      setRolesList(rolesRes.data.map((r: any) => ({ id: r.id, name: r.name })));
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (emp: EmployeeItem) => {
    setMessage(null);
    const res = await toggleEmployeeStatusAction(emp.id);
    if (res.success) {
      setMessage({
        type: "success",
        text: `Employee ${emp.fullName} status updated to ${res.newStatus}!`
      });
      loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update status." });
    }
  };

  const handleDelete = async (emp: EmployeeItem) => {
    if (!confirm(`Are you sure you want to delete employee "${emp.fullName}" (${emp.empId})? This action cannot be undone.`)) {
      return;
    }
    setMessage(null);
    const res = await deleteEmployeeAction(emp.id);
    if (res.success) {
      setMessage({ type: "success", text: `Employee ${emp.fullName} deleted successfully.` });
      loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete employee." });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEmp) return;

    setUpdating(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await updateEmployeeAction(editingEmp.id, formData);

    setUpdating(false);

    if (res.success) {
      setEditingEmp(null);
      setMessage({ type: "success", text: "Employee updated successfully!" });
      loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update employee." });
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.fullName.toLowerCase().includes(search.toLowerCase()) ||
      item.empId.toLowerCase().includes(search.toLowerCase()) ||
      item.designation.toLowerCase().includes(search.toLowerCase()) ||
      item.username.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Top Search & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <PermissionGuard permission="create:employees">
          <Link href="/app/users/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </Link>
        </PermissionGuard>
      </div>

      {/* Employee Data Table */}
      <Table>
        <Thead>
          <Tr>
            <Th>Emp ID</Th>
            <Th>Name & Mobile</Th>
            <Th>Designation</Th>
            <Th>Username</Th>
            <Th>Joining Date</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <Tr>
              <Td colSpan={7} className="text-center py-8 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                Loading employees...
              </Td>
            </Tr>
          ) : filteredData.length === 0 ? (
            <Tr>
              <Td colSpan={7}>
                <EmptyState
                  title="No Employees Found"
                  description="Add an employee to manage their business access and permissions."
                  icon={Search}
                />
              </Td>
            </Tr>
          ) : (
            filteredData.map((item) => (
              <Tr key={item.id}>
                <Td className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {item.empId}
                </Td>
                <Td>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{item.fullName}</div>
                    <div className="text-xs text-slate-500">{item.mobile}</div>
                  </div>
                </Td>
                <Td>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    {item.designation}
                  </span>
                </Td>
                <Td className="text-slate-600 dark:text-slate-400 text-xs">
                  {item.username ? (
                    <span className="font-mono font-medium">{item.username}</span>
                  ) : (
                    <span className="text-slate-400 italic">No login</span>
                  )}
                </Td>
                <Td className="text-slate-500 text-xs">{item.joinDate}</Td>
                <Td>
                  <StatusBadge status={item.status as any} />
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <PermissionGuard permission="edit:employees">
                      <button
                        onClick={() => setEditingEmp(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Employee"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </PermissionGuard>

                    <PermissionGuard permission="edit:employees">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.status === "ACTIVE"
                            ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        }`}
                        title={item.status === "ACTIVE" ? "Suspend Employee" : "Activate Employee"}
                      >
                        {item.status === "ACTIVE" ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </button>
                    </PermissionGuard>

                    <PermissionGuard permission="delete:employees">
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </PermissionGuard>
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      {/* Edit Employee Modal */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-600" />
                <span>Edit Employee ({editingEmp.empId})</span>
              </h2>
              <button
                type="button"
                onClick={() => setEditingEmp(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={editingEmp.fullName}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    defaultValue={editingEmp.mobile}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingEmp.email || ""}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation (Role)
                  </label>
                  <select
                    name="designation"
                    defaultValue={editingEmp.designation}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {rolesList.length > 0 ? (
                      rolesList.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))
                    ) : (
                      <option value={editingEmp.designation}>{editingEmp.designation}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingEmp.status}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {editingEmp.username && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password if changing"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
