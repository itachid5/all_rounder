"use client";

import React, { useState } from "react";
import { Save, PlusCircle, RotateCcw, X, Info } from "lucide-react";
import { Button, FormGrid, TextField, SelectField } from "@/templates/egg-tasta/components";
import { createStockAdjustmentAction } from "@/templates/egg-tasta/actions/inventory";
import { useRouter } from "next/navigation";

export function StockAdjustmentClient({ products }: { products: any[] }) {
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.id || "");
  const currentProduct = products.find(p => p.id === selectedProduct);
  const systemStock = currentProduct?.currentStock || 0;
  
  const [actualStock, setActualStock] = useState("");
  const difference = actualStock ? Number(actualStock) - systemStock : 0;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      date: formData.get("adjustmentDate"),
      productId: formData.get("productId"),
      actualStock: Number(formData.get("actualStock")),
      reason: formData.get("reason"),
      notes: formData.get("notes")
    };

    const result = await createStockAdjustmentAction(data);
    setLoading(false);
    
    if (result.success) {
      router.push("/app/inventory/report");
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
      <FormGrid>
        <div className="col-span-full mb-2">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Adjustment Details</h3>
        </div>
        
        <TextField label="Adjustment Date" name="adjustmentDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
        <SelectField 
          label="Product" 
          name="productId" 
          value={selectedProduct}
          onChange={(e: any) => setSelectedProduct(e.target.value)}
          options={products.map(p => ({ value: p.id, label: p.name }))}
          required
        />
        <TextField label="Current System Stock" name="systemStock" value={systemStock} disabled />
        
        <TextField 
          label="Actual Physical Stock" 
          name="actualStock" 
          type="number" 
          placeholder="Enter counted stock" 
          value={actualStock}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActualStock(e.target.value)}
          required
        />
        
        <div className="flex flex-col gap-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Difference</label>
          <div className={`px-3 py-2 rounded-md border text-sm font-semibold ${
            difference > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' : 
            difference < 0 ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50' : 
            'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'
          }`}>
            {difference > 0 ? `+${difference}` : difference}
          </div>
        </div>

        <SelectField 
          label="Adjustment Type" 
          name="adjustmentType" 
          value={difference >= 0 ? "increase" : "decrease"}
          options={[
            { value: "decrease", label: "Decrease (Deduct Stock)" },
            { value: "increase", label: "Increase (Add Stock)" },
          ]}
          disabled
        />
        
        <SelectField 
          label="Reason" 
          name="reason" 
          required
          options={[
            { value: "damaged", label: "Damaged" },
            { value: "broken", label: "Broken Eggs" },
            { value: "lost", label: "Lost Items" },
            { value: "count_diff", label: "Stock Count Difference" },
            { value: "manual", label: "Manual Correction" },
            { value: "opening", label: "Opening Balance Correction" },
            { value: "other", label: "Other" },
          ]}
        />
        
        <div className="col-span-full">
          <TextField label="Notes (Optional)" name="notes" placeholder="Additional explanation for this adjustment" />
        </div>
      </FormGrid>
      
      <div className="flex items-center gap-2 p-3 mt-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm">
        <Info className="h-4 w-4" />
        <p>Saving this adjustment will automatically update product stock and create an inventory movement log.</p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button variant="outline" type="reset" onClick={() => setActualStock("")}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Adjustment"}
        </Button>
      </div>
    </form>
  );
}
