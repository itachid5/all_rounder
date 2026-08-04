"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ShoppingCart, Trash2, Printer, Box, Tag, Calendar, User, FileText, Phone, MapPin } from "lucide-react";
import { Button, Combobox } from "@/templates/egg-tasta/components";
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

  // Auto-generate invoice number
  const [invoiceNo, setInvoiceNo] = useState("");
  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    setInvoiceNo(`INV-${randomCode}`);
  }, []);

  // Customer Selection & Auto-fill
  const [customerId, setCustomerId] = useState("");
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const customerName = selectedCustomer ? selectedCustomer.name : "";
  const customerAddress = selectedCustomer ? selectedCustomer.address || "N/A" : "";
  const customerMobile = selectedCustomer ? selectedCustomer.mobile || "N/A" : "";
  const customerDue = selectedCustomer ? selectedCustomer.previousDue || 0 : 0;

  // Pending Product & Variant Selection
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

  // Helper to determine stock tracking status
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
        if (selectedVariant.currentStock !== undefined && selectedVariant.currentStock !== null) {
          return {
            isStockTracked: true,
            availableStock: selectedVariant.currentStock,
            label: `Stock: ${selectedVariant.currentStock}`,
            isSalesOnly: false,
          };
        }
      }

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

    // Duplicate check
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
      addProductToTable(selectedId, "");
    } else if (prod.variants.length === 1) {
      // Auto-select single variant
      addProductToTable(selectedId, prod.variants[0].id);
    }
    // If multiple variants exist, wait for user selection
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
              `Stock limit exceeded! Max available for ${prod?.name || "product"} is ${currentStockInfo.availableStock}.`
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

    if (!customerId) errors.customerId = "Customer selection is required.";
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) errors.items = "Please add at least one valid product to the sale.";

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
        invoiceNo,
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
        setSuccess(`Sales Invoice ${res.sale.invoiceNo || invoiceNo} saved successfully!`);
        setItems([]);
        setCustomerId("");
        setDiscount(0);
        setOtherCharges(0);
        setPaidAmount(0);
        setReferenceNo("");
        setNotes("");
        setPendingProductId("");
        setPendingVariantId("");
        const randomCode = Math.floor(100000 + Math.random() * 900000);
        setInvoiceNo(`INV-${randomCode}`);
        window.scrollTo(0, 0);
      } else {
        setError(res.error || "Failed to save sale. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-4 max-w-full">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-start gap-2.5 shadow-sm text-xs font-medium">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {formErrors.items && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded-lg flex items-start gap-2.5 shadow-sm text-xs font-medium">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{formErrors.items}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg flex items-start gap-2.5 shadow-sm text-xs font-medium">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* HEADER SECTION: Sits directly on page background (NO outer card/container) */}
      <div className="space-y-3">
        {/* FIRST ROW: 4 fields on a single row on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Customer Selector */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Select Customer *
            </label>
            <Combobox
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.customerCode})`,
              }))}
              value={customerId}
              onChange={(val) => setCustomerId(val)}
              placeholder="Search Customer..."
              error={!!formErrors.customerId}
            />
            {formErrors.customerId && (
              <span className="text-red-500 text-[11px] mt-0.5">{formErrors.customerId}</span>
            )}
          </div>

          {/* 2. Customer Name (Auto-filled, Read-only) */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              readOnly
              value={customerName}
              placeholder="Auto-filled"
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 w-full focus:outline-none"
            />
          </div>

          {/* 3. Customer Address (Auto-filled, Read-only) */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              Customer Address
            </label>
            <input
              type="text"
              readOnly
              value={customerAddress}
              placeholder="Auto-filled"
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 w-full focus:outline-none"
            />
          </div>

          {/* 4. Customer Contact Number (Auto-filled, Read-only) */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-slate-400" />
              Contact Number
            </label>
            <input
              type="text"
              readOnly
              value={customerMobile}
              placeholder="Auto-filled"
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 w-full focus:outline-none"
            />
          </div>
        </div>

        {/* SECOND ROW: Customer Due & Editable Invoice Number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Customer Current Due */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Current Due
            </label>
            <input
              type="text"
              readOnly
              value={formatMoney(customerDue)}
              className="px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-300 w-full focus:outline-none"
            />
          </div>

          {/* 2. Invoice Number (Editable, Auto-generated by default) */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Invoice Number *
              </span>
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="text-[11px] text-blue-600 hover:underline dark:text-blue-400 flex items-center gap-0.5"
                title="Change Sale Date"
              >
                <Calendar className="h-3 w-3" />
                {date || "Date"}
              </button>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="Invoice No"
                className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {showDatePicker && (
              <div className="mt-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-md flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Sale Date:</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs"
                />
              </div>
            )}
          </div>
        </div>

        {/* PRODUCT SECTION: Full-width searchable Product Selector immediately below */}
        <div className="pt-2">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className={pendingHasMultipleVariants ? "md:col-span-8" : "md:col-span-12"}>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Box className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Product Selector (Search Product) *
              </label>
              <div ref={productSelectRef} className="w-full">
                <Combobox
                  options={products.map((p) => {
                    const hasVars = p.hasVariants && Array.isArray(p.variants) && p.variants.length > 0;
                    const varTag = hasVars ? ` [${p.variants.length} Variants]` : "";
                    return {
                      value: p.id,
                      label: `${p.name} (${p.productCode})${varTag}`,
                    };
                  })}
                  value={pendingProductId}
                  onChange={handleProductSelect}
                  placeholder="Type product name or scan code to add..."
                />
              </div>
            </div>

            {/* Compact Variant Selector if multiple variants exist */}
            {pendingHasMultipleVariants && (
              <div className="md:col-span-4">
                <label className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  Select Variant *
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
                  placeholder="Select Variant..."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMPACT SALE TABLE & SUMMARY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Sale Items</span>
            <span className="text-xs font-normal text-slate-500">
              ({items.length} {items.length === 1 ? "item" : "items"})
            </span>
          </h3>
        </div>

        {/* Compact Table — NO Horizontal Scrollbar */}
        <div className="w-full max-w-full overflow-hidden border border-slate-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Product</th>
                <th className="py-2.5 px-3">Variant / Stock</th>
                <th className="py-2.5 px-2 text-right w-20">Qty</th>
                <th className="py-2.5 px-2 text-right w-24">Unit Price</th>
                <th className="py-2.5 px-2 text-right w-20">Discount</th>
                <th className="py-2.5 px-3 text-right w-24">Total</th>
                <th className="py-2.5 px-2 text-center w-10">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 dark:text-slate-500 italic">
                    No products added yet. Use the product selector above to add items.
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
                    {/* Product Info */}
                    <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          {selectedProduct?.name || "Product"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Code: {selectedProduct?.productCode || "-"}
                        </span>
                      </div>
                    </td>

                    {/* Variant & Stock Status */}
                    <td className="py-2 px-3">
                      <div className="flex flex-col gap-0.5">
                        {hasVariants ? (
                          selectedProduct.variants.length > 1 ? (
                            <select
                              value={item.variantId}
                              onChange={(e) => handleItemChange(item.id, "variantId", e.target.value)}
                              className="px-1.5 py-0.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-[11px] font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[140px]"
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
                          <span className="text-[11px] text-slate-400 font-normal">-</span>
                        )}

                        {stockInfo.isStockTracked ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 max-w-fit">
                            {stockInfo.label}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 max-w-fit">
                            {stockInfo.label}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)}
                        className="w-16 px-1.5 py-0.5 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs font-semibold text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* Selling Price */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.sellingPrice}
                        onChange={(e) => handleItemChange(item.id, "sellingPrice", parseFloat(e.target.value) || 0)}
                        className="w-20 px-1.5 py-0.5 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* Discount */}
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.itemDiscount}
                        onChange={(e) => handleItemChange(item.id, "itemDiscount", parseFloat(e.target.value) || 0)}
                        className="w-16 px-1.5 py-0.5 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>

                    {/* Total */}
                    <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white text-xs">
                      {formatMoney(item.total)}
                    </td>

                    {/* Action */}
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Calculation & Payment Summary */}
        <div className="pt-2 grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Reference No (Optional)
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. PO-9912"
                className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs w-full focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Notes / Terms (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Additional notes for customer or invoice..."
                className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs w-full focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Sub Total</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatMoney(subTotal)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Global Discount (-)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-0.5 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Other Charges (+)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={otherCharges}
                onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                className="w-24 px-2 py-0.5 text-right bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
              <span>Grand Total</span>
              <span className="text-base text-blue-700 dark:text-blue-400">{formatMoney(grandTotal)}</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Paid Amount</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="w-28 px-2 py-1 text-right bg-white dark:bg-slate-950 border-2 border-blue-500 rounded font-bold text-blue-700 dark:text-blue-400 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {paidAmount > 0 && (
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Payment Method</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-36 px-2 py-0.5 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                  <option value="MOBILE_BANKING">Mobile Banking</option>
                </select>
              </div>
            )}

            <div className="flex justify-between items-center text-xs font-bold pt-1.5 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-700 dark:text-slate-300">Remaining Due</span>
              <span className={remainingDue > 0 ? "text-red-600 dark:text-red-400 text-sm" : "text-emerald-600 dark:text-emerald-400"}>
                {formatMoney(remainingDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
            onClick={() => alert("Print invoice feature initialized.")}
            disabled={isPending}
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
          >
            {isPending ? "Saving..." : "Save Sale"}
          </Button>
        </div>
      </div>
    </div>
  );
}
