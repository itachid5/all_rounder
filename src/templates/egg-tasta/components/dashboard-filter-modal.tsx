"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Filter, X, Calendar, ChevronLeft, ChevronRight, RotateCcw, Check, Loader2 
} from "lucide-react";
import { 
  QUICK_FILTERS, 
  DateRangeKey, 
  formatFilterDisplayBanner, 
  shiftPeriod 
} from "../utils/date-filters";

interface DashboardFilterModalProps {
  activeRange: DateRangeKey;
  displayFrom: string;
  displayTo: string;
  timezone?: string;
  language?: string;
}

export function DashboardFilterModal({
  activeRange,
  displayFrom,
  displayTo,
  timezone = "Asia/Dhaka",
  language = "en"
}: DashboardFilterModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRangeKey>(activeRange);
  const [fromVal, setFromVal] = useState(displayFrom || "");
  const [toVal, setToVal] = useState(displayTo || "");

  const isBn = language === "bn";

  // Sync state when props change
  useEffect(() => {
    setSelectedRange(activeRange);
    setFromVal(displayFrom || "");
    setToVal(displayTo || "");
  }, [activeRange, displayFrom, displayTo]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleSelectQuickFilter = (rangeKey: DateRangeKey) => {
    setSelectedRange(rangeKey);
  };

  const handleApply = () => {
    setIsOpen(false);

    const params = new URLSearchParams(searchParams.toString());

    if (fromVal && toVal && selectedRange === "custom") {
      params.set("from", fromVal);
      params.set("to", toVal);
      params.delete("range");
    } else {
      params.set("range", selectedRange);
      params.delete("from");
      params.delete("to");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setSelectedRange("today");
    setFromVal("");
    setToVal("");
    setIsOpen(false);

    startTransition(() => {
      router.push(pathname);
    });
  };

  const handleShift = (direction: "prev" | "next") => {
    if (selectedRange === "all") return;
    const currentFrom = fromVal || displayFrom;
    const currentTo = toVal || displayTo;

    if (!currentFrom || !currentTo) return;

    const shifted = shiftPeriod(currentFrom, currentTo, direction);
    if (shifted.from && shifted.to) {
      setFromVal(shifted.from);
      setToVal(shifted.to);
      setSelectedRange("custom");
    }
  };

  const [currentLabel, setCurrentLabel] = useState(
    formatFilterDisplayBanner(activeRange, displayFrom, displayTo, timezone, language)
  );

  useEffect(() => {
    setCurrentLabel(formatFilterDisplayBanner(activeRange, displayFrom, displayTo, timezone, language));
    const interval = setInterval(() => {
      setCurrentLabel(formatFilterDisplayBanner(activeRange, displayFrom, displayTo, timezone, language));
    }, 60000);
    return () => clearInterval(interval);
  }, [activeRange, displayFrom, displayTo, timezone, language]);

  return (
    <>
      {/* Filter Dashboard Trigger Button & Active Badge Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        {/* Active Filter Badge */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-medium">
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
            ) : (
              <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span>{currentLabel}</span>
          </div>

          {activeRange !== "today" && (
            <button
              type="button"
              onClick={handleReset}
              disabled={isPending}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title={isBn ? "আজকে রিসেট করুন" : "Reset to Today"}
            >
              <RotateCcw className="h-3 w-3" />
              <span>{isBn ? "রিসেট" : "Reset"}</span>
            </button>
          )}
        </div>

        {/* Filter Dashboard Button */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all group"
        >
          <Filter className="h-4 w-4 text-blue-100 group-hover:scale-110 transition-transform" />
          <span>{isBn ? "ড্যাশবোর্ড ফিল্টার" : "Filter Dashboard"}</span>
          {activeRange !== "today" && (
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>
      </div>

      {/* Filter Modal / Bottom Sheet Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          {/* Backdrop click to dismiss */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

          {/* Modal Panel */}
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Filter className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {isBn ? "ড্যাশবোর্ড ফিল্টার" : "Filter Dashboard"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isBn ? "কাস্টম সময়কাল বেছে নিন" : "Select date range or quick filters"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6">
              {/* Quick Filters */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {isBn ? "কুইক ফিল্টার" : "Quick Filters"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_FILTERS.map((f) => {
                    const isSelected = selectedRange === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => handleSelectQuickFilter(f.key)}
                        className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {isBn ? f.labelBn : f.labelEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Period Navigation */}
              {selectedRange !== "all" && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    {isBn ? "সময়কাল নেভিগেশন:" : "Shift Period:"}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShift("prev")}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span>{isBn ? "পূর্ববর্তী" : "Previous"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShift("next")}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                    >
                      <span>{isBn ? "পরবর্তী" : "Next"}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Custom Date Range */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {isBn ? "কাস্টম তারিখ রেঞ্জ" : "Custom Date Range"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {isBn ? "হইতে (From Date)" : "From Date"}
                    </label>
                    <input
                      type="date"
                      value={fromVal}
                      onChange={(e) => {
                        setFromVal(e.target.value);
                        setSelectedRange("custom");
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {isBn ? "পর্যন্ত (To Date)" : "To Date"}
                    </label>
                    <input
                      type="date"
                      value={toVal}
                      onChange={(e) => {
                        setToVal(e.target.value);
                        setSelectedRange("custom");
                      }}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isBn ? "রিসেট" : "Reset"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {isBn ? "বাতিল" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>{isBn ? "প্রয়োগ করুন" : "Apply Filter"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
