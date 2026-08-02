"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormSection, FormGrid, TextField, SelectField, Button } from "@/templates/egg-tasta/components";
import { createEmployeeAction, getNextEmpIdAction } from "@/templates/egg-tasta/actions/employees";
import { getRolesAction } from "@/shared/actions/rbac";

export function AddEmployeeClient() {
  const router = useRouter();
  const [empId, setEmpId] = useState("EMP-001");
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      const [empRes, rolesRes] = await Promise.all([
        getNextEmpIdAction(),
        getRolesAction()
      ]);

      if (empRes.success && empRes.empId) {
        setEmpId(empRes.empId);
      }

      if (rolesRes.success && rolesRes.data) {
        const roleOpts = rolesRes.data.map((r: any) => ({
          value: r.name,
          label: r.name,
        }));
        setRoles(roleOpts.length > 0 ? roleOpts : [{ value: "Staff", label: "Staff" }]);
      }

      setFetchingData(false);
    }
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createEmployeeAction(formData);

    setLoading(false);

    if (res.success) {
      setMessage({
        type: "success",
        text: `Employee created successfully with ID: ${res.empId || empId}!`
      });
      setTimeout(() => {
        router.push("/app/users/manage");
      }, 1200);
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to create employee."
      });
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
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

      <FormSection title="Employee Details" description="Personal and organization details." icon={UserPlus}>
        <FormGrid>
          <TextField 
            label="Employee ID" 
            name="empId" 
            value={empId} 
            disabled 
          />
          <TextField 
            label="Full Name" 
            name="fullName" 
            placeholder="e.g. John Doe"
            required 
          />
          <TextField 
            label="Mobile Number" 
            name="mobile" 
            placeholder="e.g. 01700000000"
            required 
          />
          <TextField 
            label="Email (Optional)" 
            name="email" 
            type="email"
            placeholder="employee@business.com"
          />
          <SelectField 
            label="Designation (Role)" 
            name="role" 
            required
            options={roles.length > 0 ? roles : [{ value: "Staff", label: "Loading roles..." }]}
          />
          <TextField 
            label="Joining Date" 
            name="joinDate" 
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required 
          />
          <SelectField 
            label="Status" 
            name="status" 
            required
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Login Credentials (Optional)" description="Create platform user account if login access is required." icon={UserPlus}>
        <FormGrid>
          <TextField 
            label="Username" 
            name="username" 
            placeholder="e.g. john_doe"
          />
          <div className="hidden sm:block"></div>
          <TextField 
            label="Password" 
            name="password" 
            type="password"
            placeholder="At least 6 characters"
          />
          <TextField 
            label="Confirm Password" 
            name="confirmPassword" 
            type="password"
            placeholder="Re-enter password"
          />
        </FormGrid>
      </FormSection>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <Button variant="ghost" type="reset">
          Reset
        </Button>
        <Link href="/app/users/manage">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>
        <Button variant="primary" type="submit" disabled={loading || fetchingData}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Employee...
            </span>
          ) : (
            "Save Employee"
          )}
        </Button>
      </div>
    </form>
  );
}
