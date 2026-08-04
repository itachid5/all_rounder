"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Copy, Trash2, ArrowLeft } from "lucide-react";
import { updateProductAction } from "@/templates/egg-tasta/actions/products";
import {
  FormLayout,
  FormSection,
  FormGrid,
  TextField,
  NumberField,
  SelectField,
  Button,
} from "@/templates/egg-tasta/components";

interface EditProductFormProps {
  product: any;
  categories: any[];
  units: any[];
}

export function EditProductForm({ product, categories, units }: EditProductFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [variantMode, setVariantMode] = useState<"PRODUCT_LEVEL" | "VARIANT_LEVEL">(
    product.variantInventoryMode || "PRODUCT_LEVEL"
  );

  const [variantsList, setVariantsList] = useState<any[]>(
    Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : [{ id: Date.now(), name: "", sku: "", openingStock: 0 }]
  );

  const handleAddVariant = () => {
    setVariantsList((prev) => [
      ...prev,
      { id: Date.now(), name: "", sku: "", openingStock: 0 },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariantsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    setVariantsList((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateProductAction(product.productCode, formData);

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(`Product "${product.name}" updated successfully!`);
      setTimeout(() => {
        router.push("/app/products/manage");
      }, 1000);
    }
  }

  return (
    <div className="max-w-4xl mx-auto md:mx-0 space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-900 text-sm font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900 flex items-center justify-between shadow-sm text-sm font-medium">
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit}>
        <FormLayout>
          {/* General Info */}
          <FormSection title="Basic Product Information">
            <FormGrid>
              <TextField
                label="Product Code"
                name="productCodeDisplay"
                defaultValue={product.productCode}
                disabled
                placeholder="Product Code"
              />

              <div className="md:col-span-2">
                <TextField
                  label="Product Name *"
                  name="name"
                  defaultValue={product.name}
                  required
                  placeholder="e.g. Layer Egg - Red"
                />
              </div>

              <SelectField
                label="Category"
                name="categoryId"
                defaultValue={product.categoryId || ""}
                options={[
                  { value: "", label: "Select Category..." },
                  ...categories.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />

              <SelectField
                label="Unit of Measurement"
                name="unitId"
                defaultValue={product.unitId || ""}
                options={[
                  { value: "", label: "Select Unit..." },
                  ...units.map((u) => ({ value: u.id, label: u.name })),
                ]}
              />
            </FormGrid>
          </FormSection>

          {/* Pricing & Stock */}
          <FormSection title="Pricing & Inventory Settings">
            <FormGrid>
              <NumberField
                label="Purchase Price *"
                name="purchasePrice"
                defaultValue={product.purchasePrice}
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />

              <NumberField
                label="Selling Price *"
                name="sellingPrice"
                defaultValue={product.sellingPrice}
                step="0.01"
                min="0"
                required
                placeholder="0.00"
              />

              <NumberField
                label="Wholesale Price (Optional)"
                name="wholesalePrice"
                defaultValue={product.wholesalePrice || 0}
                step="0.01"
                min="0"
                placeholder="0.00"
              />

              <NumberField
                label="Minimum Selling Price (Optional)"
                name="minimumSellingPrice"
                defaultValue={product.minimumSellingPrice || 0}
                step="0.01"
                min="0"
                placeholder="0.00"
              />

              <NumberField
                label="Current Stock"
                name="currentStockDisplay"
                defaultValue={product.currentStock ?? product.openingStock}
                disabled
                placeholder="0"
              />

              <NumberField
                label="Low Stock Alert Threshold"
                name="minimumStockAlert"
                defaultValue={product.minimumStockAlert || 0}
                min="0"
                placeholder="10"
              />

              <SelectField
                label="Status"
                name="status"
                defaultValue={product.status || "ACTIVE"}
                options={[
                  { value: "ACTIVE", label: "Active" },
                  { value: "INACTIVE", label: "Inactive" },
                  { value: "SOFT_DELETED", label: "Soft Deleted" },
                ]}
              />

              <div className="md:col-span-2">
                <SelectField
                  label="Variant Inventory Mode"
                  name="variantInventoryMode"
                  value={variantMode}
                  onChange={(e: any) => setVariantMode(e.target.value as any)}
                  options={[
                    {
                      value: "PRODUCT_LEVEL",
                      label: "Product-Level Inventory (Variants used in sales)",
                    },
                    {
                      value: "VARIANT_LEVEL",
                      label: "Variant-Level Inventory (Each variant tracks stock)",
                    },
                  ]}
                />
              </div>
            </FormGrid>

            {/* Dynamic Variants Editor */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Product Variants
                  </h4>
                  <p className="text-xs text-slate-500">Add or edit variants (e.g. Red, White)</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
                  + Add Variant
                </Button>
              </div>

              <div className="space-y-3">
                {variantsList.map((v, index) => (
                  <div
                    key={v.id || index}
                    className="grid grid-cols-12 gap-3 items-end p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Variant Name *
                      </label>
                      <input
                        type="text"
                        name="variant_name[]"
                        value={v.name}
                        onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                        placeholder="e.g. Red Egg"
                        className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        required
                      />
                    </div>
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        SKU / Code (Optional)
                      </label>
                      <input
                        type="text"
                        name="variant_sku[]"
                        value={v.sku || ""}
                        onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                        placeholder="e.g. RED-01"
                        className="w-full h-9 px-3 text-xs rounded-md border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        name="variant_stock[]"
                        value={v.openingStock || 0}
                        onChange={(e) =>
                          handleVariantChange(index, "openingStock", parseInt(e.target.value, 10) || 0)
                        }
                        className="w-full h-9 px-2 text-xs text-right rounded-md border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FormSection>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="ghost"
              type="button"
              onClick={() => router.push("/app/products/manage")}
              disabled={isSubmitting}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating Product..." : "Save Product Changes"}
            </Button>
          </div>
        </FormLayout>
      </form>
    </div>
  );
}
