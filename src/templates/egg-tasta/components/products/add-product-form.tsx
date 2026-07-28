"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/templates/egg-tasta/actions/products";
import { Save, RotateCcw, X, PlusCircle, DollarSign, Package } from "lucide-react";
import { FormLayout, FormGrid, TextField, NumberField, SelectField, Button } from "@/templates/egg-tasta/components";

export function AddProductForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAction, setSubmitAction] = useState<'save' | 'save_add'>('save');
  const formRef = useRef<HTMLFormElement>(null);
  const productNameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto focus on Product Name on mount
  useEffect(() => {
    productNameRef.current?.focus();
  }, []);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setSubmitAction('save');
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Enter key moves to next field
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type !== 'submit') {
      e.preventDefault();
      const form = e.target.form;
      if (form) {
        const index = Array.prototype.indexOf.call(form, e.target);
        const nextEl = form.elements[index + 1] as HTMLElement;
        if (nextEl) {
          nextEl.focus();
        }
      }
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await createProductAction(formData);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(`Product created successfully! Product Code: ${result.productCode}`);
      
      if (submitAction === 'save') {
        setTimeout(() => {
          router.push("/app/products");
        }, 1500);
      } else {
        formRef.current?.reset();
        productNameRef.current?.focus();
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto md:mx-0">
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-900">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900 flex items-center justify-between shadow-sm">
          <span className="font-medium">{success}</span>
          <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form 
        ref={formRef} 
        onSubmit={handleSubmit} 
        onKeyDown={handleKeyDown}
      >
        <FormLayout>
          <FormGrid>
            {/* Product Code */}
            <TextField 
              label="Product Code"
              name="productCode" 
              placeholder="(Auto-generated on save)" 
              disabled 
            />

            {/* Product Name */}
            <TextField 
              label="Product Name"
              name="name" 
              required 
              placeholder="e.g. Large White Eggs"
              ref={productNameRef}
            />

            {/* Purchase Price */}
            <NumberField 
              label="Purchase Price"
              name="purchasePrice" 
              required 
              step="0.01" 
              min="0"
              placeholder="0.00"
              icon={<DollarSign className="h-4 w-4" />}
            />

            {/* Selling Price */}
            <NumberField 
              label="Selling Price"
              name="sellingPrice" 
              required 
              step="0.01"
              min="0"
              placeholder="0.00"
              icon={<DollarSign className="h-4 w-4" />}
            />

            {/* Wholesale Price */}
            <NumberField 
              label="Wholesale Price"
              name="wholesalePrice" 
              step="0.01"
              min="0"
              placeholder="0.00"
              icon={<DollarSign className="h-4 w-4" />}
            />

            {/* Minimum Selling Price */}
            <NumberField 
              label="Min. Selling Price"
              name="minimumSellingPrice" 
              step="0.01"
              min="0"
              placeholder="0.00"
              icon={<DollarSign className="h-4 w-4" />}
            />

            {/* Opening Quantity */}
            <NumberField 
              label="Opening Quantity"
              name="openingStock" 
              min="0"
              placeholder="0"
              defaultValue="0"
              icon={<Package className="h-4 w-4" />}
            />

            {/* Low Stock Alert */}
            <NumberField 
              label="Low Stock Alert"
              name="minimumStockAlert" 
              min="0"
              placeholder="e.g. 10"
              icon={<Package className="h-4 w-4" />}
            />
            
            {/* Status */}
            <SelectField 
              label="Status"
              name="status" 
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" }
              ]}
              defaultValue="ACTIVE"
            />
            
            {/* Barcode */}
            <TextField 
              label="Barcode (Optional)"
              name="barcode" 
              placeholder="Scan or enter barcode"
            />

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notes (Optional)</label>
              <textarea 
                name="notes" 
                rows={3}
                placeholder="Product details or notes..."
                className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
              />
            </div>
          </FormGrid>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Button 
              type="submit" 
              variant="primary"
              onClick={() => setSubmitAction('save')}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {isSubmitting && submitAction === 'save' ? "Saving..." : "Save Product"}
            </Button>
            
            <Button 
              type="submit" 
              variant="secondary"
              onClick={() => setSubmitAction('save_add')}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              <PlusCircle className="h-4 w-4" />
              {isSubmitting && submitAction === 'save_add' ? "Saving..." : "Save & Add Another"}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={() => { formRef.current?.reset(); productNameRef.current?.focus(); }}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            
            <Button 
              type="button"
              variant="ghost"
              onClick={() => router.push('/app/products')}
              className="w-full sm:w-auto sm:ml-auto"
            >
              Cancel
            </Button>
          </div>
        </FormLayout>
      </form>
    </div>
  );
}
