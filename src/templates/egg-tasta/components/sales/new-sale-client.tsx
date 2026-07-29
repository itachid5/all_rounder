"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ShoppingCart, Plus, Trash2, Printer } from "lucide-react";
import { FormSection, FormGrid, Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-tasta/components";
import { createSaleAction } from "@/templates/egg-tasta/actions/sales";

export function NewSaleClient({ customers, products }: { customers: any[], products: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [date, setDate] = useState("");

  React.useEffect(() => {
    setDate(new Date().toISOString().split('T')[0]);
  }, []);
  
  const [customerId, setCustomerId] = useState("");
  
  // Find selected customer due
  const selectedCustomer = customers.find(c => c.id === customerId);
  const customerDue = selectedCustomer ? selectedCustomer.previousDue : 0;

  const [items, setItems] = useState<any[]>([
    { id: 1, productId: "", availableStock: 0, sellingPrice: 0, quantity: 1, itemDiscount: 0, total: 0 }
  ]);

  const [discount, setDiscount] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  const handleAddItem = () => {
    setItems([...items, { id: Date.now() + Math.random(), productId: "", availableStock: 0, sellingPrice: 0, quantity: 1, itemDiscount: 0, total: 0 }]);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: number, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        if (field === 'productId') {
          const prod = products.find(p => p.id === value);
          if (prod) {
            updated.sellingPrice = prod.sellingPrice;
            updated.availableStock = prod.variantInventoryMode === 'VARIANT_LEVEL' ? 0 : prod.currentStock;
          }
        }
        
        if (field === 'variantId') {
          const prod = products.find(p => p.id === item.productId);
          if (prod && prod.variantInventoryMode === 'VARIANT_LEVEL') {
            const variant = prod.variants?.find((v: any) => v.id === value);
            updated.availableStock = variant ? variant.currentStock : 0;
          }
        }
        
        if (field === 'quantity' && updated.availableStock < value) {
          setError(`Cannot sell more than available stock (${updated.availableStock})`);
          updated.quantity = updated.availableStock;
        }

        updated.total = (parseFloat(updated.sellingPrice || 0) * parseFloat(updated.quantity || 0)) - parseFloat(updated.itemDiscount || 0);
        return updated;
      }
      return item;
    }));
  };

  const subTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const grandTotal = subTotal - discount + otherCharges;
  const remainingDue = grandTotal - paidAmount;

  const handleSave = (stay: boolean) => {
    setError(null);
    setSuccess(null);

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    const validItems = items.filter(i => i.productId && i.quantity > 0);
    if (validItems.length === 0) {
      setError("Please add at least one valid product.");
      return;
    }

    for (const item of validItems) {
      const p = products.find(prod => prod.id === item.productId);
      if (p?.hasVariants && p?.variants?.length > 0 && !item.variantId) {
        setError("Please select a variant for all products that require one.");
        return;
      }
    }

    // Check stock again
    for (const item of validItems) {
      if (item.quantity > item.availableStock) {
        setError("One or more items exceed available stock.");
        return;
      }
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
        notes
      };

      const res = await createSaleAction(data);
      if (res.success && res.sale) {
        setSuccess(`Sales Invoice ${res.sale.invoiceNo} saved successfully!`);
        if (stay) {
          setItems([{ id: Date.now() + Math.random(), productId: "", availableStock: 0, sellingPrice: 0, quantity: 1, itemDiscount: 0, total: 0 }]);
          setCustomerId("");
          setDiscount(0);
          setOtherCharges(0);
          setPaidAmount(0);
          setReferenceNo("");
          setNotes("");
          window.scrollTo(0,0);
        } else {
          setTimeout(() => {
            router.push('/app/sales/manage');
          }, 1000);
        }
      } else {
        setError(res.error || "Failed to save sale.");
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

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-4 rounded-md flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <FormSection title="Sale Details" icon={ShoppingCart}>
          <FormGrid>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Invoice No</label>
              <input type="text" disabled placeholder="Auto Generated" className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-500 w-full" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Sale Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Customer *</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.customerCode})</option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Customer Due</label>
              <input type="text" disabled value={`$${customerDue.toFixed(2)}`} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 w-full" />
            </div>
          </FormGrid>
        </FormSection>

        {/* Product Table */}
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Products</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
            <Table>
              <Thead>
                <Tr>
                  <Th className="w-[20%]">Product</Th>
                  <Th className="w-[15%]">Variant</Th>
                  <Th className="w-[10%] text-right">Stock</Th>
                  <Th className="w-[15%] text-right">Selling Price</Th>
                  <Th className="w-[15%] text-right">Quantity</Th>
                  <Th className="w-[10%] text-right">Disc.</Th>
                  <Th className="w-[10%] text-right">Total</Th>
                  <Th className="w-[5%]"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item) => {
                  const selectedProduct = products.find(p => p.id === item.productId);
                  const hasVariants = selectedProduct?.hasVariants && selectedProduct?.variants?.length > 0;
                  
                  let displayStock = item.availableStock;
                  
                  return (
                  <Tr key={item.id}>
                    <Td>
                      <select 
                        value={item.productId} 
                        onChange={e => {
                          handleItemChange(item.id, 'productId', e.target.value);
                          handleItemChange(item.id, 'variantId', ''); // reset variant
                        }}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                      >
                        <option value="">Select Product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.productCode})</option>
                        ))}
                      </select>
                    </Td>
                    <Td>
                      {hasVariants ? (
                        <select 
                          value={item.variantId || ""} 
                          onChange={e => {
                            handleItemChange(item.id, 'variantId', e.target.value);
                          }}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                        >
                          <option value="">Select Variant...</option>
                          {selectedProduct.variants.map((v: any) => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400 pl-2">No variants</span>
                      )}
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        disabled
                        value={displayStock} 
                        className="w-full px-2 py-1.5 text-right bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-500" 
                      />
                    </Td>
                    <Td>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={item.sellingPrice} 
                        onChange={e => handleItemChange(item.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
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
                      <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" disabled={items.length === 1}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </Td>
                  </Tr>
                )})}
              </Tbody>
            </Table>
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Calculations and Payment */}
        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Notes and Ref */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Reference No (Optional)</label>
              <input type="text" value={referenceNo} onChange={e => setReferenceNo(e.target.value)} placeholder="e.g. PO No" className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm w-full" />
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
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-28 px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md">
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                  <option value="MOBILE_BANKING">Mobile Banking</option>
                </select>
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
          <Button variant="ghost" type="button" onClick={() => router.push('/app/sales/manage')} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="outline" type="button" onClick={() => alert("Print feature pending PDF generation integration.")} disabled={isPending}>
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
          <Button variant="outline" type="button" onClick={() => handleSave(true)} disabled={isPending}>
            {isPending ? "Saving..." : "Save & New"}
          </Button>
          <Button variant="primary" type="button" onClick={() => handleSave(false)} disabled={isPending}>
            {isPending ? "Saving..." : "Save Sale"}
          </Button>
        </div>
      </div>
    </div>
  );
}
