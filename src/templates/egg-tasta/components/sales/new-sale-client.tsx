"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ShoppingCart, Trash2, Printer, Plus, Tag, Box } from "lucide-react";
import { FormSection, FormGrid, Button, Combobox } from "@/templates/egg-tasta/components";
import { createSaleAction } from "@/templates/egg-tasta/actions/sales";
import { useCurrency } from "@/shared/components/regional-context";

interface NewSaleClientProps {
  customers: any[];
  products: any[];
}

export function NewSaleClient({ customers, products }: NewSaleClientProps) {
  const { symbol, formatMoney } = useCurrency();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const [customerId, setCustomerId] = useState("");
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const customerDue = selectedCustomer ? selectedCustomer.previousDue || 0 : 0;

  // Pending selection state
  const productSelectRef = useRef<HTMLDivElement>(null);
  const [pendingProductId, setPendingProductId] = useState("");
  const [pendingVariantId, setPendingVariantId] = useState("");

  const pendingProduct = products.find((p) => p.id === pendingProductId);
  const pendingVariants = pendingProduct?.variants || [];
  const pendingHasMultipleVariants =
    pendingProduct?.hasVariants && pendingVariants.length > 1;

  const [items, setItems] = useState<any[]>([]);

  const [discount, setDiscount] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  // Helper function to resolve stock tracking status for a product & variant
  const getStockInfo = (product: any, variantId: string) => {
    if (!product) {
      return { isStockTracked: false, availableStock: Infinity, label: "No Tracking", isSalesOnly: true };
    }

    const hasVariants = product.hasVariants && Array.isArray(product.variants) && product.variants.length > 0;
    const isVariantLevel = product.variantInventoryMode === "VARIANT_LEVEL";
    const isProductLevel = product.variantInventoryMode === "PRODUCT_LEVEL";
    const isSalesOnlyMode = product.variantInventoryMode === "SALES_ONLY" || product.variantInventoryMode === "NONE";

    if (isSalesOnlyMode) {
      return { isStockTracked: false, availableStock: Infinity, label: "Sales Only", isSalesOnly: true };
    }

    if (hasVariants) {
      const selectedVariant = product.variants.find((v: any) => v.id === variantId);

      if (isVariantLevel && selectedVariant) {
        // If variant stock is tracked
        if (selectedVariant.currentStock !== undefined && selectedVariant.currentStock !== null) {
          return {
            isStockTracked: true,
            availableStock: selectedVariant.currentStock,
            label: `Stock: ${selectedVariant.currentStock}`,
            isSalesOnly: false,
          };
        }
      }

      // If product-level tracking or variant is sales-only
      if (isProductLevel && product.currentStock !== undefined && product.currentStock !== null) {
        return {
          isStockTracked: true,
          availableStock: product.currentStock,
          label: `Stock: ${product.currentStock}`,
          isSalesOnly: false,
        };
      }

      return { isStockTracked: false, availableStock: Infinity, label: "Sales Only", isSalesOnly: true };
    } else {
      // Product without variants
      if (product.currentStock !== undefined && product.currentStock !== null) {
        return {
          isStockTracked: true,
          availableStock: product.currentStock,
          label: `Stock: ${product.currentStock}`,
          isSalesOnly: false,
        };
      }
      return { isStockTracked: false, availableStock: Infinity, label: "Sales Only", isSalesOnly: true };
    }
  };

  const addProductToTable = (prodId: string, varId: string = "") => {
    setError(null);
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    // Check duplicate
    const exists = items.some((item: any) => item.productId === prodId && item.variantId === varId);
    if (exists) {
      setError(`"${prod.name}" with this variant has already been added.`);
      setPendingProductId("");
      setPendingVariantId("");
      return;
    }

    const stockInfo = getStockInfo(prod, varId);
    const initialPrice = prod.sellingPrice || 0;

    setItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        productId: prodId,
        variantId: varId,
        isStockTracked: stockInfo.isStockTracked,
        availableStock: stockInfo.availableStock,
        isSalesOnly: stockInfo.isSalesOnly,
        sellingPrice: initialPrice,
        quantity: 1,
        itemDiscount: 0,
        total: initialPrice,
      },
    ]);

    setPendingProductId("");
    setPendingVariantId("");
  };

  const handleProductSelect = (selectedId: string) => {
    setPendingProductId(selectedId);
    setPendingVariantId("");

    if (!selectedId) return;

    const prod = products.find((p) => p.id === selectedId);
    if (!prod) return;

    const hasVars = prod.hasVariants && Array.isArray(prod.variants) && prod.variants.length > 0;

    if (!hasVars) {
      // No variants -> add immediately
      addProductToTable(selectedId, "");
    } else if (prod.variants.length === 1) {
      // Single variant -> auto select it and add immediately
      addProductToTable(selectedId, prod.variants[0].id);
    }
    // If multiple variants -> wait for user to select from variant dropdown
  };

  const handleRemoveItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: number, field: string, value: any) => {
    setError(null);
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        const prod = products.find((p) => p.id === item.productId);
        let updated = { ...item, [field]: value };

        if (field === "variantId") {
          const stockInfo = getStockInfo(prod, value);
          updated.isStockTracked = stockInfo.isStockTracked;
          updated.availableStock = stockInfo.availableStock;
          updated.isSalesOnly = stockInfo.isSalesOnly;
        }

        const currentStockInfo = getStockInfo(prod, updated.variantId);

        if (field === "quantity" && currentStockInfo.isStockTracked) {
          const numVal = Math.max(0, parseFloat(value) || 0);
          if (numVal > currentStockInfo.availableStock) {
            setError(
              `Stock limit exceeded! Only ${currentStockInfo.availableStock} available for ${prod?.name || "this product"}.`
            );
            updated.quantity = currentStockInfo.availableStock;
          } else {
            updated.quantity = numVal;
          }
        }

        const price = parseFloat(updated.sellingPrice || 0);
        const qty = parseFloat(updated.quantity || 0);
        const disc = parseFloat(updated.itemDiscount || 0);
        updated.total = Math.max(0, price * qty - disc);

        return updated;
      })
    );
  };

  const subTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const grandTotal = Math.max(0, subTotal - discount + otherCharges);
  const remainingDue = grandTotal - paidAmount;

  const handleSave = () => {
    setError(null);
    setSuccess(null);
    setFormErrors({});

    const errors: Record<string, string> = {};

    if (!customerId) errors.customerId = "Customer is required.";
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) errors.items = "Please add at least one valid product.";

    for (const item of validItems) {
      const prod = products.find((p) => p.id === item.productId);
      const stockInfo = getStockInfo(prod, item.variantId);
      if (stockInfo.isStockTracked && item.quantity > stockInfo.availableStock) {
        errors.items = `Cannot sell more than available stock (${stockInfo.availableStock}) for ${prod?.name || "product"}.`;
        break;
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    startTransition(async () => {
      const data = {
        customerId,
        date,
        items: validItems,
        subTotal,
        discount,
        otherCharges,
        grandTotal,
        paidAmount,
        paymentMethod,
        referenceNo,
        notes,
      };

      const res = await createSaleAction(data);
      if (res.success && res.sale) {
        setSuccess(`Sales Invoice ${res.sale.invoiceNo} saved successfully!`);
        setItems([]);
        setCustomerId("");
        setDiscount(0);
        setOtherCharges(0);
        setPaidAmount(0);
        setReferenceNo("");
        setNotes("");
        setPendingProductId("");
        setPendingVariantId("");
        window.scrollTo(0, 0);
      } else {
        setError(res.error || "Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-full">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {formErrors.items && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{formErrors.items}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-4 rounded-lg flex items-start gap-3 shadow-sm">
          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 md:p-6 shadow-sm space-y-6">
        {/* Invoice Metadata */}
        <FormSection title="Sale Details" icon={ShoppingCart}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Invoice No</label>
              <input
                type="text"
                disabled
                placeholder="Auto Generated"
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 font-medium w-full"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Sale Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer *</label>
              <Combobox
                options={customers.map((c) => ({ value: c.id, label: `${c.name} (${c.customerCode})` }))}
                value={customerId}
                onChange={(val) => setCustomerId(val)}
                placeholder="Select Customer..."
                error={!!formErrors.customerId}
              />
              {formErrors.customerId && (
                <span className="text-red-500 text-xs mt-1">{formErrors.customerId}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Customer Previous Due</label>
              <input
                type="text"
                disabled
                value={formatMoney(customerDue)}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-200 w-full"
              />
            </div>
          </div>

          {/* Product & Variant Selector Bar */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className={pendingHasMultipleVariants ? "md:col-span-7" : "md:col-span-12"}>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Select Product *
                </label>
                <div ref={productSelectRef}>
                  <Combobox
                    options={products.map((p) => {
                      const hasVars = p.hasVariants && Array.isArray(p.variants) && p.variants.length > 0;
                      const varCountStr = hasVars ? ` [${p.variants.length} Variants]` : "";
                      return {
                        value: p.id,
                        label: `${p.name} (${p.productCode})${varCountStr}`,
                      };
                    })}
                    value={pendingProductId}
                    onChange={handleProductSelect}
                    placeholder="Search product by name or code..."
                  />
                </div>
              </div>

              {pendingHasMultipleVariants && (
                <div className="md:col-span-5">
                  <label className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1.5 flex items-center gap-1.5">
                    <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Select Variant * (Required)
                  </label>
                  <Combobox
                    options={pendingVariants.map((v: any) => {
                      const stockInfo = getStockInfo(pendingProduct, v.id);
                      return {
                        value: v.id,
                        label: `${v.name} — ${stockInfo.label}`,
                      };
                    })}
                    value={pendingVariantId}
                    onChange={(varId) => {
                      setPendingVariantId(varId);
                      if (varId) {
                        addProductToTable(pendingProductId, varId);
                      }
                    }}
                    placeholder="Choose variant..."
                  />
                </div>
              )}
            </div>
          </div>
        </FormSection>

        {/* Compact Product Table — No Horizontal Scrollbar */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Sale Items</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            </h3>
          </div>

          <div className="w-full max-w-full overflow-hidden border border-slate-200 dark:border-slate-800 rounded-lg">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Variant / Stock</th>
                  <th className="py-3 px-2 text-right w-24">Qty</th>
                  <th className="py-3 px-2 text-right w-28">Unit Price</th>
                  <th className="py-3 px-2 text-right w-24">Discount</th>
                  <th className="py-3 px-3 text-right w-28">Total</th>
                  <th className="py-3 px-2 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 dark:text-slate-500 italic">
                      No products added yet. Select a product above to add to this sale.
                    </td>
                  </tr>
                )}
                {items.map((item) => {
                  const selectedProduct = products.find((p) => p.id === item.productId);
                  const selectedVariant = selectedProduct?.variants?.find((v: any) => v.id === item.variantId);
                  const stockInfo = getStockInfo(selectedProduct, item.variantId);
                  const hasVariants = selectedProduct?.hasVariants && Array.isArray(selectedProduct.variants) && selectedProduct.variants.length > 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Product Name & Code */}
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {selectedProduct?.name || "Unknown Product"}
                          </span>
                          <span className="text-xs text-slate-400 font-normal">
                            Code: {selectedProduct?.productCode || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Variant & Stock Badge */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col gap-1">
                          {hasVariants ? (
                            selectedProduct.variants.length > 1 ? (
                              <select
                                value={item.variantId}
                                onChange={(e) => handleItemChange(item.id, "variantId", e.target.value)}
                                className="px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[160px]"
                              >
                                <option value="">Select Variant</option>
                                {selectedProduct.variants.map((v: any) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                {selectedVariant?.name || "Standard"}
                              </span>
                            )
                          ) : (
                            <span className="text-xs text-slate-400 font-normal">-</span>
                          )}

                          {/* Stock Status Badge */}
                          {stockInfo.isStockTracked ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 max-w-fit">
                              {stockInfo.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 max-w-fit">
                              {stockInfo.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-2.5 px-2 text-right">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                          className="w-20 px-2 py-1 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>

                      {/* Selling Price */}
                      <td className="py-2.5 px-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.sellingPrice}
                          onChange={(e) => handleItemChange(item.id, "sellingPrice", parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>

                      {/* Discount */}
                      <td className="py-2.5 px-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.itemDiscount}
                          onChange={(e) => handleItemChange(item.id, "itemDiscount", parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </td>

                      {/* Total */}
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatMoney(item.total)}
                      </td>

                      {/* Remove Action */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculation & Payment Summary */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Notes and Reference */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Reference No (Optional)
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. PO-8849"
                className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Notes / Terms (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes for customer or invoice record..."
                className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Breakdown Card */}
          <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Sub Total</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatMoney(subTotal)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Global Discount (-)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Other Charges (+)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={otherCharges}
                onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

            <div className="flex justify-between items-center text-base font-bold text-slate-900 dark:text-white">
              <span>Grand Total</span>
              <span className="text-lg text-blue-700 dark:text-blue-400">{formatMoney(grandTotal)}</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>

            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Paid Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-32 px-2 py-1.5 text-right bg-white dark:bg-slate-950 border-2 border-blue-500 rounded-lg font-bold text-blue-700 dark:text-blue-400 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {paidAmount > 0 && (
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Payment Method</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-40 px-2 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                  <option value="MOBILE_BANKING">Mobile Banking</option>
                </select>
              </div>
            )}

            <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300">Remaining Due</span>
              <span className={remainingDue > 0 ? "text-red-600 dark:text-red-400 text-base" : "text-emerald-600 dark:text-emerald-400"}>
                {formatMoney(remainingDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Button
            variant="ghost"
            type="button"
            onClick={() => router.push("/app/sales/manage")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => alert("Print invoice functionality prepared.")}
            disabled={isPending}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
          >
            {isPending ? "Saving..." : "Save Sale"}
          </Button>
        </div>
      </div>
    </div>
  );
}
