"use client";

import React, { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ShoppingCart, Trash2, Printer } from "lucide-react";
import { FormSection, FormGrid, Button, Table, Thead, Tbody, Tr, Th, Td, Combobox } from "@/templates/egg-tasta/components";
import { createPurchaseAction } from "@/templates/egg-tasta/actions/purchases";
import { useCurrency } from "@/shared/components/regional-context";

export function NewPurchaseClient({ suppliers, products }: { suppliers: any[], products: any[] }) {
  const { formatMoney } = useCurrency();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [date, setDate] = useState("");

  React.useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);
  
  const [supplierId, setSupplierId] = useState("");
  
  // Find selected supplier due
  const selectedSupplier = suppliers.find(s => s.id === supplierId);
  const supplierDue = selectedSupplier ? selectedSupplier.previousDue : 0;

  // New POS style state
  const productSelectRef = useRef<HTMLDivElement>(null);
  const [pendingProductId, setPendingProductId] = useState("");
  const [pendingVariantId, setPendingVariantId] = useState("");

  const pendingProduct = products.find(p => p.id === pendingProductId);
  const pendingHasVariants = pendingProduct?.hasVariants && pendingProduct?.variants?.length > 0 && pendingProduct?.variantInventoryMode === 'VARIANT_LEVEL';

  const [items, setItems] = useState<any[]>([]);

  const [discount, setDiscount] = useState(0);
  const [transportCost, setTransportCost] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  const addProductToTable = (prodId: string, varId: string = "") => {
    setError(null);
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    const isVariantLevel = prod.variantInventoryMode === 'VARIANT_LEVEL';
    const exists = items.some((item: any) => {
      if (isVariantLevel) {
        return item.productId === prodId && item.variantId === varId;
      }
      return item.productId === prodId;
    });

    if (exists) {
      setError("This product has already been added.");
      setPendingProductId("");
      setPendingVariantId("");
      setTimeout(() => {
        productSelectRef.current?.focus();
      }, 10);
      return;
    }

    setItems(prev => [...prev, {
      id: Date.now() + Math.random(),
      productId: prodId,
      variantId: varId,
      purchasePrice: prod.purchasePrice || 0,
      quantity: 1,
      itemDiscount: 0,
      total: prod.purchasePrice || 0
    }]);

    setPendingProductId("");
    setPendingVariantId("");

    setTimeout(() => {
      productSelectRef.current?.focus();
    }, 10);
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: number, field: string, value: any) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.total = (parseFloat(updated.purchasePrice || 0) * parseFloat(updated.quantity || 0)) - parseFloat(updated.itemDiscount || 0);
        return updated;
      }
      return item;
    }));
  };

  const subTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const grandTotal = subTotal - discount + transportCost + otherCharges;
  const remainingDue = grandTotal - paidAmount;

  const handleSave = () => {
    setError(null);
    setSuccess(null);
    setFormErrors({});

    const errors: Record<string, string> = {};

    if (!supplierId) errors.supplierId = "Supplier is required.";

    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) errors.items = "Please add at least one valid product.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    startTransition(async () => {
      const data = {
        supplierId,
        date,
        items: validItems,
        subTotal,
        discount,
        transportCost,
        otherCharges,
        grandTotal,
        paidAmount,
        paymentMethod,
        referenceNo,
        notes
      };

      const res = await createPurchaseAction(data);
      if (res.success && res.purchase) {
        setSuccess(`Purchase Invoice ${res.purchase.invoiceNo} saved successfully!`);
        setItems([]);
        setSupplierId("");
        setDiscount(0);
        setTransportCost(0);
        setOtherCharges(0);
        setPaidAmount(0);
        setReferenceNo("");
        setNotes("");
        setPendingProductId("");
        setPendingVariantId("");
        window.scrollTo(0,0);
      } else {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {formErrors.items && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <p>{formErrors.items}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-4 rounded-md flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <FormSection title="Purchase Details" icon={ShoppingCart}>
          <FormGrid>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Invoice No</label>
              <input type="text" disabled placeholder="Auto Generated" className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-500 w-full" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Purchase Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Supplier *</label>
              <Combobox 
                options={suppliers.map(s => ({ value: s.id, label: `${s.name} (${s.supplierCode})` }))}
                value={supplierId}
                onChange={(val) => setSupplierId(val)}
                placeholder="Select Supplier"
                error={!!formErrors.supplierId}
              />
              {formErrors.supplierId && <span className="text-red-500 text-xs mt-1">{formErrors.supplierId}</span>}
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Supplier Due</label>
              <input type="text" disabled value={formatMoney(supplierDue)} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 w-full" />
            </div>
          </FormGrid>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex flex-col md:w-1/2">
                <label className="text-xs font-medium text-slate-500 mb-1">Product Select *</label>
                <div ref={productSelectRef}>
                  <Combobox 
                    options={products.map(p => ({ value: p.id, label: `${p.name} (${p.productCode})` }))}
                    value={pendingProductId}
                    onChange={(selectedId) => {
                      setPendingProductId(selectedId);
                      setPendingVariantId("");
                      
                      if (selectedId) {
                        const prod = products.find(p => p.id === selectedId);
                        const hasVars = prod?.hasVariants && prod?.variants?.length > 0 && prod?.variantInventoryMode === 'VARIANT_LEVEL';
                        if (!hasVars) {
                          addProductToTable(selectedId, "");
                        }
                      }
                    }}
                    placeholder="Search Products..."
                  />
                </div>
              </div>
              
              {pendingHasVariants && (
                <div className="flex flex-col md:w-1/2">
                  <label className="text-xs font-medium text-slate-500 mb-1">Variant Select *</label>
                  <Combobox 
                    options={pendingProduct.variants.map((v: any) => ({ value: v.id, label: v.name }))}
                    value={pendingVariantId}
                    onChange={(selectedVarId) => {
                      setPendingVariantId(selectedVarId);
                      if (selectedVarId) {
                        addProductToTable(pendingProductId, selectedVarId);
                      }
                    }}
                    placeholder="Select Variant..."
                  />
                </div>
              )}
            </div>
          </div>
        </FormSection>

        {/* Product Table */}
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Products</h3>
          <div>
            <Table>
              <Thead>
                <Tr>
                  <Th className="w-[20%]">Selected Product</Th>
                  <Th className="w-[15%]">Selected Variant</Th>
                  <Th className="w-[15%] text-right">Purchase Price</Th>
                  <Th className="w-[15%] text-right">Quantity</Th>
                  <Th className="w-[15%] text-right">Discount</Th>
                  <Th className="w-[15%] text-right">Total</Th>
                  <Th className="w-[5%]">Delete</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.length === 0 && (
                  <Tr>
                    <Td colSpan={7} className="text-center py-6 text-slate-500 italic">No products added. Select a product above.</Td>
                  </Tr>
                )}
                {items.map((item) => {
                  const selectedProduct = products.find(p => p.id === item.productId);
                  const selectedVariant = selectedProduct?.variants?.find((v:any) => v.id === item.variantId);
                  
                  return (
                  <Tr key={item.id}>
                    <Td className="font-medium text-slate-900 dark:text-white">
                      {selectedProduct?.name || "Unknown"}
                    </Td>
                    <Td className="text-slate-600 dark:text-slate-400">
                      {selectedVariant ? selectedVariant.name : ""}
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={item.purchasePrice} 
                        onChange={e => handleItemChange(item.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-right bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm" 
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        value={item.quantity} 
                        onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-right bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm" 
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={item.itemDiscount} 
                        onChange={e => handleItemChange(item.id, 'itemDiscount', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-right bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm" 
                      />
                    </Td>
                    <Td className="text-right font-medium">
                      ${item.total.toFixed(2)}
                    </Td>
                    <Td>
                      <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Td>
                  </Tr>
                )})}
              </Tbody>
            </Table>
          </div>
        </div>

        {/* Calculations and Payment */}
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Notes and Ref */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Reference No (Optional)</label>
              <input type="text" value={referenceNo} onChange={e => setReferenceNo(e.target.value)} placeholder="e.g. Challan No" className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm w-full" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Notes (Optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm w-full" />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-lg p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Sub Total</span>
              <span className="font-medium">${subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Global Discount (-)</span>
              <input type="number" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 text-right bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md" />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Transport Cost (+)</span>
              <input type="number" value={transportCost} onChange={e => setTransportCost(parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 text-right bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md" />
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Other Charges (+)</span>
              <input type="number" value={otherCharges} onChange={e => setOtherCharges(parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 text-right bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md" />
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
            
            <div className="flex justify-between items-center text-base font-bold text-slate-900 dark:text-white">
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">Paid Amount</span>
              <input type="number" value={paidAmount} onChange={e => setPaidAmount(parseFloat(e.target.value) || 0)} className="w-28 px-2 py-1 text-right bg-white dark:bg-slate-950 border border-blue-400 rounded-md font-medium text-blue-700 dark:text-blue-400" />
            </div>
            
            {paidAmount > 0 && (
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-slate-500">Payment Method</span>
                <Combobox 
                  options={[
                    { value: "CASH", label: "Cash" },
                    { value: "BANK", label: "Bank" },
                    { value: "MOBILE_BANKING", label: "Mobile Banking" }
                  ]}
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val)}
                  className="w-40"
                />
              </div>
            )}

            <div className="flex justify-between items-center text-sm text-red-600 dark:text-red-400 font-medium pt-2">
              <span>Remaining Due</span>
              <span>${remainingDue.toFixed(2)}</span>
            </div>

          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={() => router.push('/app/purchases/manage')} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="outline" type="button" onClick={() => alert("Print feature pending PDF generation integration.")} disabled={isPending}>
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
          <Button variant="primary" type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Purchase"}
          </Button>
        </div>
      </div>
    </div>
  );
}
