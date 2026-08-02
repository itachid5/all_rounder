"use client";

import React, { useState, useTransition, useRef, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { 
  Calendar, ChevronLeft, ChevronRight, Filter, RotateCcw, Check, Loader2, ChevronDown
} from "lucide-react";
import { 
  QUICK_FILTERS, 
  DateRangeKey, 
  formatFilterDisplayBanner, 
  shiftPeriod 
} from "../utils/date-filters";

interface DashboardDateFilterProps {
  activeRange: DateRangeKey;
  displayFrom: string;
  displayTo: string;
  timezone?: string;
  language?: string;
}

export function DashboardDateFilter({
  activeRange,
  displayFrom,
  displayTo,
  timezone = "Asia/Dhaka",
  language = "en"
}: DashboardDateFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showCustomFields, setShowCustomFields] = useState(activeRange === "custom");
  const [customFrom, setCustomFrom] = useState(displayFrom || "");
  const [customTo, setCustomTo] = useState(displayTo || "");

  const popoverRef = useRef<HTMLDivElement>(null);
  const isBn = language === "bn";

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popoverOpen]);

  const handleSelectQuickFilter = (rangeKey: DateRangeKey) => {
    setPopoverOpen(false);
    setShowCustomFields(false);

    const params = new URLSearchParams(searchParams.toString());
    params.set("range", rangeKey);
    params.delete("from");
    params.delete("to");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFrom || !customTo) return;

    setPopoverOpen(false);

    const params = new URLSearchParams(searchParams.toString());
    params.set("from", customFrom);
    params.set("to", customTo);
    params.delete("range");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleReset = () => {
    setPopoverOpen(false);
    setShowCustomFields(false);
    setCustomFrom("");
    setCustomTo("");

    startTransition(() => {
      router.push(pathname);
    });
  };

  const handleShiftPeriod = (direction: "prev" | "next") => {
    if (activeRange === "all" || (!displayFrom && !displayTo)) return;

    const { from, to } = shiftPeriod(displayFrom, displayTo, direction);
    if (!from || !to) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("from", from);
    params.set("to", to);
    params.delete("range");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const compactLabel = formatFilterDisplayBanner(
    activeRange,
    displayFrom,
    displayTo,
    timezone,
    language
  );

  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs mb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 py-2.5 flex items-center justify-between gap-2 transition-all">
      {/* Top Loading Progress Line */}
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500/20 overflow-hidden">
          <div className="h-full bg-blue-600 animate-pulse w-full"></div>
        </div>
      )}

      {/* Left: Compact Date Label + Prev/Next Arrows */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 rounded-lg px-3 py-1.5">
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 dark:text-blue-400 shrink-0" />
          ) : (
            <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          )}
          <span className="font-semibold text-xs sm:text-sm tracking-tight text-slate-800 dark:text-slate-100 truncate">
            {compactLabel}
          </span>
        </div>

        {/* Previous & Next Period Navigation Arrows */}
        {activeRange !== "all" && (
          <div className="flex items-center gap-0.5 bg-slate-100/70 dark:bg-slate-800/70 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
            <button
              type="button"
              onClick={() => handleShiftPeriod("prev")}
              disabled={isPending}
              title={isBn ? "পূর্ববর্তী সময়কাল" : "Previous Period"}
              className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleShiftPeriod("next")}
              disabled={isPending}
              title={isBn ? "পরবর্তী সময়কাল" : "Next Period"}
              className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Filter Button & Reset */}
      <div className="relative flex items-center gap-1.5 shrink-0" ref={popoverRef}>
        {activeRange !== "today" && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title={isBn ? "আজকে রিসেট করুন" : "Reset to Today"}
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setPopoverOpen(!popoverOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            popoverOpen || activeRange !== "today"
              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
              : "bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200/80 dark:hover:bg-slate-700"
          }`}
        >
          <Filter className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">{isBn ? "ফিল্টার" : "Filter"}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${popoverOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Popover / Dropdown Menu */}
        {popoverOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isBn ? "সময়কাল ফিল্টার" : "Date Filter"}
              </span>
              <button
                type="button"
                onClick={() => setShowCustomFields(!showCustomFields)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {showCustomFields ? (isBn ? "কুইক ফিল্টার" : "Quick Filters") : (isBn ? "কাস্টম রেঞ্জ" : "Custom Range")}
              </button>
            </div>

            {!showCustomFields ? (
              /* Quick Filters Grid */
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_FILTERS.map((f) => {
                  const isActive = activeRange === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => handleSelectQuickFilter(f.key)}
                      disabled={isPending}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <span>{isBn ? f.labelBn : f.labelEn}</span>
                      {isActive && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Custom Date Range Inputs */
              <form onSubmit={handleApplyCustom} className="space-y-3 pt-1">
                <div>
                  <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {isBn ? "হইতে (From Date)" : "From Date"}
                  </label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    {isBn ? "পর্যন্ত (To Date)" : "To Date"}
                  </label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isPending || !customFrom || !customTo}
                    className="w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors shadow-2xs"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{isBn ? "প্রয়োগ করুন" : "Apply Filter"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
