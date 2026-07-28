"use client";

import React from "react";
import { Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, FormGrid, SelectField } from "@/templates/egg-shop/components";

export default function AutomationRulesPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Notifications</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Automation Rules</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Automation Rules</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure automated triggers and routine reports.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        <FormGrid>
          <div className="col-span-full mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Alert Rules</h3>
          </div>
          
          <SelectField 
            label="Low Stock Notifications" 
            name="lowStockRule" 
            options={[
              { value: "enabled", label: "Enabled" },
              { value: "disabled", label: "Disabled" },
            ]}
          />
          <SelectField 
            label="Customer Due Reminders" 
            name="customerDueRule" 
            options={[
              { value: "enabled", label: "Enabled" },
              { value: "disabled", label: "Disabled" },
            ]}
          />
          <SelectField 
            label="Supplier Due Reminders" 
            name="supplierDueRule" 
            options={[
              { value: "enabled", label: "Enabled" },
              { value: "disabled", label: "Disabled" },
            ]}
          />

          <div className="col-span-full mt-6 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Scheduled Summaries</h3>
          </div>

          <SelectField 
            label="Daily Sales Summary" 
            name="dailySalesRule" 
            options={[
              { value: "enabled", label: "Enabled" },
              { value: "disabled", label: "Disabled" },
            ]}
          />
          <SelectField 
            label="Daily Purchase Summary" 
            name="dailyPurchaseRule" 
            options={[
              { value: "enabled", label: "Enabled" },
              { value: "disabled", label: "Disabled" },
            ]}
          />
          <SelectField 
            label="Expense Summary" 
            name="expenseSummaryRule" 
            options={[
              { value: "enabled", label: "Enabled" },
              { value: "disabled", label: "Disabled" },
            ]}
          />
          <SelectField 
            label="Weekly Business Summary" 
            name="weeklySummaryRule" 
            options={[
              { value: "enabled", label: "Enabled" },
              { value: "disabled", label: "Disabled" },
            ]}
          />
          <SelectField 
            label="Monthly Business Summary" 
            name="monthlySummaryRule" 
            options={[
              { value: "enabled", label: "Enabled" },
              { value: "disabled", label: "Disabled" },
            ]}
          />
        </FormGrid>

        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" type="button">Discard Changes</Button>
          <Button variant="primary" type="button" onClick={() => alert("Settings saved.")}>
            <Zap className="h-4 w-4 mr-2" />
            Save Automation Rules
          </Button>
        </div>
      </div>
      
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-md text-sm border border-purple-100 dark:border-purple-800/50">
        <strong>Future Ready:</strong> Birthday Wishes, Anniversary Greetings, and complex Promotional Campaigns will be available in V2.
      </div>
    </div>
  );
}
