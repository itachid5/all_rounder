import React from "react";
import { getCustomerCollectionByIdAction } from "@/templates/egg-tasta/actions/customerCollections";
import { formatDate } from "@/shared/utils/date";
import { notFound } from "next/navigation";

export default async function ViewCollectionPage({ params }: { params: Promise<{ id?: string }> | { id?: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (!id) return notFound();
  
  const res = await getCustomerCollectionByIdAction(id);
  if (!res.success || !res.data) {
    return notFound();
  }
  
  const item = res.data;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Collection Details: {item.collectionNo}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Customer</p>
            <p className="font-medium">{item.customerName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Amount</p>
            <p className="font-medium text-emerald-600">${item.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Date</p>
            <p className="font-medium">{formatDate(item.date)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="font-medium">{item.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
