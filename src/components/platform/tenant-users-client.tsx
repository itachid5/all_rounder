"use client";

import { useState, useEffect } from "react";
import { 
  Users, Search, Filter, MoreVertical, Key, Edit2, 
  ShieldAlert, ShieldCheck, Power, Trash2, Activity,
  ChevronLeft, ChevronRight, AlertTriangle
} from "lucide-react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/shared/utils/date";
import { 
  getTenantUsersAction, resetUserPasswordAction, changeUsernameAction, 
  changeUserStatusAction, forceLogoutAction, removeUserFromTenantAction 
} from "@/platform/actions/tenantUsers";

interface TenantUser {
  id: string;
  empId: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  assignedRole: string;
  status: string;
  lastLogin: Date | null;
  createdAt: Date;
  isInternal: boolean;
  isOwner: boolean;
}

export function TenantUsersClient({ tenantId }: { tenantId: string }) {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [actionType, setActionType] = useState<"PASSWORD" | "USERNAME" | "STATUS" | "LOGOUT" | "DELETE" | null>(null);
  
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [tenantId]);

  const loadUsers = async () => {
    setLoading(true);
    const res = await getTenantUsersAction(tenantId);
    if (res.success && res.users) {
      setUsers(res.users);
    } else {
      setMessage({ type: "error", text: res.error || "Failed to load business members" });
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(u => {
    if (search) {
      const q = search.toLowerCase();
      if (!u.fullName.toLowerCase().includes(q) && !u.username.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !u.empId.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (filter === "ACTIVE") return u.status === "ACTIVE";
    if (filter === "SUSPENDED") return u.status === "SUSPENDED";
    if (filter === "INTERNAL") return u.isInternal;
    if (filter === "OWNER") return u.isOwner;
    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const openAction = (u: TenantUser, action: any) => {
    setSelectedUser(u);
    setActionType(action);
    setNewPassword("");
    setNewUsername(u.username);
  };

  const closeAction = () => {
    setSelectedUser(null);
    setActionType(null);
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    let res: any;

    try {
      if (actionType === "PASSWORD") {
        res = await resetUserPasswordAction(tenantId, selectedUser.id, newPassword);
      } else if (actionType === "USERNAME") {
        res = await changeUsernameAction(tenantId, selectedUser.id, newUsername);
      } else if (actionType === "STATUS") {
        const newStatus = selectedUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
        res = await changeUserStatusAction(tenantId, selectedUser.id, newStatus);
      } else if (actionType === "LOGOUT") {
        res = await forceLogoutAction(tenantId, selectedUser.id);
      } else if (actionType === "DELETE") {
        res = await removeUserFromTenantAction(tenantId, selectedUser.id);
      }

      if (res?.success) {
        setMessage({ type: "success", text: "Action completed successfully." });
        await loadUsers();
        closeAction();
      } else {
        setMessage({ type: "error", text: res?.error || "Action failed." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="p-6 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold leading-none tracking-tight">Business Members</h2>
            <p className="text-sm text-muted-foreground mt-1">Super Admin Management Console</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Members</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INTERNAL">Internal Admins</option>
            <option value="OWNER">Business Owners</option>
          </select>
        </div>
      </div>

      {message && (
        <div
          className={`m-4 p-4 rounded-xl flex items-center justify-between text-sm font-medium border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Login</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Loading members...</td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No members found.</td>
              </tr>
            ) : (
              paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{u.fullName}</div>
                    <div className="text-xs text-muted-foreground">@{u.username} • {u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800">
                      {u.assignedRole}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' :
                      'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {u.lastLogin ? formatDate(u.lastLogin) : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openAction(u, "PASSWORD")} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors" title="Reset Password"><Key className="h-4 w-4" /></button>
                      <button onClick={() => openAction(u, "USERNAME")} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors" title="Change Username"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => openAction(u, "STATUS")} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors" title="Toggle Status">
                        {u.status === 'ACTIVE' ? <ShieldAlert className="h-4 w-4 text-amber-500" /> : <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                      </button>
                      <button onClick={() => openAction(u, "LOGOUT")} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors" title="Force Logout"><Power className="h-4 w-4 text-orange-500" /></button>
                      {!u.isOwner && (
                        <button onClick={() => openAction(u, "DELETE")} className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors" title="Remove Member"><Trash2 className="h-4 w-4" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to Math.min(page * pageSize, filteredUsers.length) of {filteredUsers.length}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-50"><ChevronLeft className="h-5 w-5" /></button>
            <span className="px-2 font-medium">{page} / {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1 rounded-md hover:bg-slate-100 disabled:opacity-50"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      {actionType && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl border shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">
                {actionType === "PASSWORD" && "Reset Password"}
                {actionType === "USERNAME" && "Change Username"}
                {actionType === "STATUS" && (selectedUser.status === "ACTIVE" ? "Suspend Account" : "Activate Account")}
                {actionType === "LOGOUT" && "Force Logout"}
                {actionType === "DELETE" && "Remove Member"}
              </h3>
              
              <div className="mb-6 space-y-4">
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  <div className="font-medium text-foreground">{selectedUser.fullName}</div>
                  <div className="text-muted-foreground">@{selectedUser.username} • {selectedUser.assignedRole}</div>
                </div>

                {actionType === "PASSWORD" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border bg-background"
                      placeholder="Enter new strong password"
                    />
                    <p className="text-xs text-muted-foreground mt-2">The user will be immediately logged out of all active sessions and must login with this new password.</p>
                  </div>
                )}

                {actionType === "USERNAME" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">New Username</label>
                    <input 
                      type="text" 
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border bg-background"
                      placeholder="username"
                    />
                  </div>
                )}

                {actionType === "STATUS" && (
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to {selectedUser.status === "ACTIVE" ? "suspend" : "activate"} this account?
                    {selectedUser.status === "ACTIVE" && " All active sessions will be terminated immediately."}
                  </p>
                )}

                {actionType === "LOGOUT" && (
                  <p className="text-sm text-muted-foreground">
                    This will immediately terminate all active sessions for this user across all devices. They will be forced to log in again.
                  </p>
                )}

                {actionType === "DELETE" && (
                  <div className="flex gap-3 text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900 text-sm">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p>Are you sure you want to remove this user from the business? If they have no other platform affiliations, their account will be permanently deleted.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={closeAction}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || (actionType === "PASSWORD" && !newPassword) || (actionType === "USERNAME" && !newUsername)}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2 ${
                    actionType === "DELETE" || (actionType === "STATUS" && selectedUser.status === "ACTIVE") ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isSubmitting && <Activity className="h-4 w-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
