"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, AlertCircle, CheckCircle2, FileText, Upload } from "lucide-react";
import { FormSection, FormGrid, Button, TextField, SelectField, Textarea } from "@/templates/egg-tasta/components";
import { createExpenseAction } from "@/templates/egg-tasta/actions/expenses";
import { useCurrency } from "@/shared/components/regional-context";

export function NewExpenseClient({ categories }: { categories: any[] }) {
  const { symbol, formatMoney } = useCurrency();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [notes, setNotes] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const errors: Record<string, string> = {};

    if (!categoryId) {
      errors.categoryId = "Expense Head is required.";
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = "Amount must be greater than zero.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    startTransition(async () => {
      const res = await createExpenseAction({
        expenseDate,
        categoryId,
        amount: parsedAmount,
        paymentMethod,
        referenceNo,
        paidTo,
        notes,
        attachmentUrl,
      });

      if (res.success) {
        setSuccess(`Expense ${res.data?.expenseNo || ""} recorded successfully!`);
        // Reset form
        setAmount("");
        setReferenceNo("");
        setPaidTo("");
        setNotes("");
        setAttachmentUrl("");
        window.scrollTo(0, 0);
      } else {
        setError(res.error || "Failed to save expense.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-sm flex items-center gap-3 border border-rose-200 dark:border-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl text-sm flex items-center gap-3 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <FormSection title="Expense Details" description="Fill out the details below to record a new business expense.">
        <FormGrid>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Expense Date *</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Expense Head *</label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                if (formErrors.categoryId) setFormErrors({ ...formErrors, categoryId: "" });
              }}
              className={`px-3 py-2 bg-white dark:bg-slate-950 border ${formErrors.categoryId ? "border-rose-500" : "border-slate-200 dark:border-slate-800"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">-- Select Expense Head --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {formErrors.categoryId && <span className="text-xs text-rose-500 mt-1">{formErrors.categoryId}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Amount ({symbol}) *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-slate-400 font-medium">{symbol}</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (formErrors.amount) setFormErrors({ ...formErrors, amount: "" });
                }}
                className={`w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-950 border ${formErrors.amount ? "border-rose-500" : "border-slate-200 dark:border-slate-800"} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            {formErrors.amount && <span className="text-xs text-rose-500 mt-1">{formErrors.amount}</span>}
          </div>

          <SelectField
            label="Payment Method *"
            value={paymentMethod}
            onChange={(e: any) => setPaymentMethod(e.target.value)}
            options={[
              { label: "Cash", value: "CASH" },
              { label: "Bank", value: "BANK" },
              { label: "Mobile Banking", value: "MOBILE_BANKING" },
              { label: "Other", value: "OTHER" },
            ]}
          />

          <TextField
            label="Reference Number (Optional)"
            placeholder="e.g. INV-1092, TXN-5012"
            value={referenceNo}
            onChange={(e: any) => setReferenceNo(e.target.value)}
          />

          <TextField
            label="Paid To / Payee (Optional)"
            placeholder="e.g. Landlord, Electric Company"
            value={paidTo}
            onChange={(e: any) => setPaidTo(e.target.value)}
          />
        </FormGrid>

        <div className="mt-4 space-y-4">
          <Textarea
            label="Notes (Optional)"
            placeholder="Additional details regarding this expense..."
            value={notes}
            onChange={(e: any) => setNotes(e.target.value)}
            rows={3}
          />

          <TextField
            label="Attachment URL / Receipt Reference (Optional)"
            placeholder="https://... or receipt link"
            value={attachmentUrl}
            onChange={(e: any) => setAttachmentUrl(e.target.value)}
          />
        </div>
      </FormSection>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/app/expenses/manage")}
          className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <Button type="submit" disabled={isPending} className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          {isPending ? "Saving Expense..." : "Save Expense"}
        </Button>
      </div>
    </form>
  );
}
