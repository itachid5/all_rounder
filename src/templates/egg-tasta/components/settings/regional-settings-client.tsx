"use client";

import React, { useState, useTransition } from "react";
import { Globe, Clock, DollarSign, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { SearchableSelect, SearchableOption } from "@/shared/components/searchable-select";
import { CURRENCIES, getCurrencyByCode } from "@/shared/constants/currencies";
import { TIMEZONES, getTimezoneByValue } from "@/shared/constants/timezones";
import { LANGUAGES } from "@/shared/constants/languages";
import { updateRegionalSettingsAction, RegionalSettingsData } from "@/shared/actions/regional";
import { Button } from "@/shared/components/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/components/card";

export function RegionalSettingsClient({ initialSettings }: { initialSettings: RegionalSettingsData }) {
  const [currency, setCurrency] = useState(initialSettings.currency || "BDT");
  const [timezone, setTimezone] = useState(initialSettings.timezone || "Asia/Dhaka");
  const [language, setLanguage] = useState(initialSettings.language || "en");

  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Format options for SearchableSelect
  const currencyOptions: SearchableOption[] = CURRENCIES.map(c => ({
    value: c.code,
    label: `${c.code} (${c.symbol}) - ${c.name}`,
    sublabel: c.country,
    badge: c.symbol,
    keywords: `${c.code} ${c.symbol} ${c.name} ${c.country}`
  }));

  const timezoneOptions: SearchableOption[] = TIMEZONES.map(t => ({
    value: t.value,
    label: t.label,
    sublabel: t.region,
    badge: t.offset,
    keywords: `${t.value} ${t.label} ${t.offset} ${t.region}`
  }));

  const selectedCurrencyInfo = getCurrencyByCode(currency);
  const selectedTimezoneInfo = getTimezoneByValue(timezone);

  const handleSave = () => {
    setStatusMessage(null);
    startTransition(async () => {
      const res = await updateRegionalSettingsAction({ currency, timezone, language });
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: `Regional settings updated successfully! Currency set to ${currency} (${selectedCurrencyInfo.symbol}).`
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || "Failed to update regional settings."
        });
      }
    });
  };

  const formatSample = (amount: number) => {
    return `${selectedCurrencyInfo.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {statusMessage && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium border ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Regional & Currency Settings
          </CardTitle>
          <CardDescription>
            Configure timezone, language, and primary business currency applied across all modules.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Currency Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span>Primary Business Currency</span>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Symbol: {selectedCurrencyInfo.symbol}
                </span>
              </label>
              <SearchableSelect 
                options={currencyOptions}
                value={currency}
                onChange={setCurrency}
                placeholder="Search ISO code, symbol, country..."
                searchPlaceholder="Type BDT, USD, EUR, INR, AED..."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selected: {selectedCurrencyInfo.name} ({selectedCurrencyInfo.country})
              </p>
            </div>

            {/* Timezone Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span>Business Timezone</span>
                <span className="text-xs font-semibold text-slate-500">
                  {selectedTimezoneInfo.offset}
                </span>
              </label>
              <SearchableSelect 
                options={timezoneOptions}
                value={timezone}
                onChange={setTimezone}
                placeholder="Search timezone or city..."
                searchPlaceholder="Type Dhaka, Dubai, London, New York..."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Region: {selectedTimezoneInfo.region}
              </p>
            </div>

            {/* Language Select */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Business Interface Language
              </label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Currency Live Preview Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Live Currency Display Preview ({currency})
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                Symbol: {selectedCurrencyInfo.symbol}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="block text-[11px] font-medium text-slate-400">Product Price</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{formatSample(500)}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="block text-[11px] font-medium text-slate-400">Sales Invoice</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatSample(2350)}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="block text-[11px] font-medium text-slate-400">Purchase Order</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{formatSample(15000)}</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="block text-[11px] font-medium text-slate-400">Report Balance</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{formatSample(120500)}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 dark:bg-slate-950/60 justify-end border-t border-slate-200 dark:border-slate-800 py-4 px-6">
          <Button onClick={handleSave} disabled={isPending} variant="default" className="min-w-[140px] bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="w-4 h-4 mr-2" />
            {isPending ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
