"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, UserPlus, Trash2, UserX, UserCheck, Loader2, AlertCircle, CheckCircle2, X, Lock
} from "lucide-react";
import { 
  getInternalAdminsAction, 
  createInternalAdminAction, 
  toggleInternalAdminStatusAction, 
  deleteInternalAdminAction 
} from "@/shared/actions/internal-admins";

interface InternalAdminItem {
  id: string;
  empId: string;
  username: string;
  fullName: string;
  mobile: string;
  email: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

export function InternalAdminsClient({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const [data, setData] = useState<InternalAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await getInternalAdminsAction(tenantId);
    if (res.success && res.data) {
      setData(res.data as InternalAdminItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createInternalAdminAction(tenantId, formData);
    setSubmitting(false);

    if (res.success) {
      setIsModalOpen(false);
      setMessage({ type: "success", text: "Internal Business Administrator created successfully!" });
      loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to create internal admin." });
    }
  };

  const handleToggleStatus = async (item: InternalAdminItem) => {
    setMessage(null);
    const res = await toggleInternalAdminStatusAction(tenantId, item.id);
    if (res.success) {
      setMessage({ type: "success", text: `Internal Admin "${item.username}" status updated to ${res.newStatus}!` });
      loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update status." });
    }
  };

  const handleDelete = async (item: InternalAdminItem) => {
    if (!confirm(`Are you sure you want to delete Internal Admin "${item.username}"?`)) return;

    setMessage(null);
    const res = await deleteInternalAdminAction(tenantId, item.id);
    if (res.success) {
      setMessage({ type: "success", text: `Internal Admin "${item.username}" deleted successfully.` });
      loadData();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to delete internal admin." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold">Internal Business Administrators</h2>
            <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Super Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Hidden internal administrators for <strong className="text-white">{tenantName}</strong>. These accounts are 100% invisible to the Business Owner and employees.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors shadow-md shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          Add Internal Administrator
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm font-medium border ${
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

      {/* Table */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b font-bold text-muted-foreground">
            <tr>
              <th className="p-4">Username & Name</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Role</th>
              <th className="p-4">Last Login</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-amber-500" />
                  Loading internal admins...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted-foreground">
                  <Lock className="h-6 w-6 mx-auto mb-2 opacity-30" />
                  No Internal Business Administrators assigned to this business.
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-foreground">{item.fullName}</div>
                    <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400">{item.username}</div>
                  </td>
                  <td className="p-4 text-muted-foreground">{item.mobile}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300">
                      Internal Admin
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{item.lastLogin}</td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          item.status === "ACTIVE"
                            ? "text-muted-foreground hover:text-amber-600 hover:bg-amber-50"
                            : "text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title={item.status === "ACTIVE" ? "Disable Account" : "Enable Account"}
                      >
                        {item.status === "ACTIVE" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Internal Admin"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
              <h2 className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Create Internal Administrator</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. Support Specialist"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="e.g. int_support_bhaibhai"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
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
                    placeholder="01700000000"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="internal@platform.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                This account will be completely hidden from all business screens, staff lists, and user statistics within <strong>{tenantName}</strong>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Create Internal Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
