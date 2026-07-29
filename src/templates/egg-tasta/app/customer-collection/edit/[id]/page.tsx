import React from "react";
import { getCustomerCollectionByIdAction } from "@/templates/egg-tasta/actions/customerCollections";
import { listCustomersAction } from "@/templates/egg-tasta/actions/customers";
import { notFound } from "next/navigation";
import { EditCollectionClient } from "@/templates/egg-tasta/components/customer-collection/edit-collection-client";

export default async function EditCollectionPage({ params }: { params: Promise<{ id?: string }> | { id?: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (!id) return notFound();
  
  const res = await getCustomerCollectionByIdAction(id);
  if (!res.success || !res.data) {
    return notFound();
  }
  
  const customersRes = await listCustomersAction();
  const customers = customersRes.success ? customersRes.data : [];

  return (
    <div className="max-w-4xl mx-auto">
      <EditCollectionClient customers={customers} initialCollection={res.data} />
    </div>
  );
}
