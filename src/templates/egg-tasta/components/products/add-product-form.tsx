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
  const [variantMode, setVariantMode] = useState<'PRODUCT_LEVEL' | 'VARIANT_LEVEL'>('PRODUCT_LEVEL');
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
            
            {/* Variant Inventory Mode */}
            <div className="md:col-span-2">
              <SelectField 
                label="Variant Inventory Mode"
                name="variantInventoryMode" 
                options={[
                  { value: "PRODUCT_LEVEL", label: "Product-Level Inventory (Variants only used in sales)" },
                  { value: "VARIANT_LEVEL", label: "Variant-Level Inventory (Each variant has stock/SKU)" }
                ]}
                value={variantMode}
                onChange={(e: any) => setVariantMode(e.target.value as any)}
              />
            </div>
          </FormGrid>

          {/* Variants Section */}
          <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Product Variants (Optional)</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add variations like White Egg, Red Egg, etc.</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const container = document.getElementById('variants-container');
                  if (!container) return;
                  
                  const row = document.createElement('div');
                  row.className = variantMode === 'VARIANT_LEVEL' 
                    ? 'grid grid-cols-12 gap-3 mb-3 items-end'
                    : 'grid grid-cols-12 gap-3 mb-3 items-end';
                  
                  if (variantMode === 'VARIANT_LEVEL') {
                    row.innerHTML = `
                      <div class="col-span-4">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Variant Name</label>
                        <input type="text" name="variant_name[]" required placeholder="e.g. White Egg" class="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      </div>
                      <div class="col-span-3">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU (Optional)</label>
                        <input type="text" name="variant_sku[]" placeholder="e.g. WH-01" class="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      </div>
                      <div class="col-span-3">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opening Stock</label>
                        <input type="number" name="variant_stock[]" min="0" placeholder="0" class="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      </div>
                      <div class="col-span-2 flex justify-end">
                        <button type="button" onclick="this.parentElement.parentElement.remove()" class="h-10 px-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                    `;
                  } else {
                    row.innerHTML = `
                      <div class="col-span-10">
                        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Variant Name</label>
                        <input type="text" name="variant_name[]" required placeholder="e.g. White Egg" class="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      </div>
                      <div class="col-span-2 flex justify-end">
                        <button type="button" onclick="this.parentElement.parentElement.remove()" class="h-10 px-3 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                        </button>
                      </div>
                    `;
                  }
                  container.appendChild(row);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>
            <div id="variants-container"></div>
            {variantMode === 'VARIANT_LEVEL' && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Note: In Variant-Level Inventory mode, the main Product&apos;s Opening Quantity will be ignored and stock will be managed per variant.
              </p>
            )}
          </div>

          <FormGrid>
            {/* Notes */}
            <div className="space-y-2 md:col-span-2 mt-4">
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
