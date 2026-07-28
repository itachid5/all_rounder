"use client";

import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { FormSection, FormGrid, TextField, SelectField, Button } from "@/templates/egg-tasta/components";

export function AddEmployeeClient() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Employee creation logic pending backend integration.");
    }, 500);
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <FormSection title="Employee Details" description="Personal and login information." icon={UserPlus}>
        <FormGrid>
          <TextField 
            label="Employee ID" 
            name="empId" 
            placeholder="EMP-001" 
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
            options={[
              { value: "manager", label: "Manager" },
              { value: "salesman", label: "Salesman" },
              { value: "cashier", label: "Cashier" },
              { value: "accountant", label: "Accountant" },
              { value: "store_keeper", label: "Store Keeper" },
            ]}
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

      <FormSection title="Login Credentials" description="Credentials used for platform access." icon={UserPlus}>
        <FormGrid>
          <TextField 
            label="Username" 
            name="username" 
            placeholder="e.g. john_doe"
            required 
          />
          <div className="hidden sm:block"></div>
          <TextField 
            label="Password" 
            name="password" 
            type="password"
            required 
          />
          <TextField 
            label="Confirm Password" 
            name="confirmPassword" 
            type="password"
            required 
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
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Employee"}
        </Button>
      </div>
    </form>
  );
}
