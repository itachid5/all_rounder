"use client";

import React, { createContext, useContext } from "react";
import { getCurrencyByCode } from "@/shared/constants/currencies";

export interface RegionalContextType {
  currency: string;
  currencySymbol: string;
  currencyName: string;
  timezone: string;
  language: string;
  formatCurrency: (amount: number, options?: { decimals?: number }) => string;
  formatAmount: (amount: number, options?: { decimals?: number }) => string;
  formatMoney: (amount: number, decimals?: number) => string;
}

const defaultRegional: RegionalContextType = {
  currency: "BDT",
  currencySymbol: "৳",
  currencyName: "Bangladeshi Taka",
  timezone: "Asia/Dhaka",
  language: "en",
  formatCurrency: (amount: number, options?: { decimals?: number }) => {
    const val = Number(amount || 0);
    const hasDecimals = options?.decimals !== undefined;
    const isWhole = Math.abs(val % 1) < 1e-9;
    const minDigits = hasDecimals ? options.decimals! : (isWhole ? 0 : 2);
    const maxDigits = hasDecimals ? options.decimals! : 2;
    const formattedNum = val.toLocaleString(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
    return `৳${formattedNum}`;
  },
  formatAmount: (amount: number, options?: { decimals?: number }) => {
    const val = Number(amount || 0);
    const hasDecimals = options?.decimals !== undefined;
    const isWhole = Math.abs(val % 1) < 1e-9;
    const minDigits = hasDecimals ? options.decimals! : (isWhole ? 0 : 2);
    const maxDigits = hasDecimals ? options.decimals! : 2;
    return val.toLocaleString(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
  },
  formatMoney: (amount: number, decimals?: number) => {
    const val = Number(amount || 0);
    const hasDecimals = decimals !== undefined;
    const isWhole = Math.abs(val % 1) < 1e-9;
    const minDigits = hasDecimals ? decimals! : (isWhole ? 0 : 2);
    const maxDigits = hasDecimals ? decimals! : 2;
    const formattedNum = val.toLocaleString(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
    return `৳${formattedNum}`;
  }
};

const RegionalContext = createContext<RegionalContextType>(defaultRegional);

export function RegionalProvider({
  children,
  settings
}: {
  children: React.ReactNode;
  settings?: {
    currency?: string;
    currencySymbol?: string;
    currencyName?: string;
    timezone?: string;
    language?: string;
  };
}) {
  const currency = settings?.currency || "BDT";
  const currencyInfo = getCurrencyByCode(currency);
  const currencySymbol = settings?.currencySymbol || currencyInfo.symbol || "৳";
  const currencyName = settings?.currencyName || currencyInfo.name || "Bangladeshi Taka";
  const timezone = settings?.timezone || "Asia/Dhaka";
  const language = settings?.language || "en";

  const formatCurrency = (amount: number, options?: { decimals?: number }) => {
    const val = Number(amount || 0);
    const hasDecimals = options?.decimals !== undefined;
    const isWhole = Math.abs(val % 1) < 1e-9;
    const minDigits = hasDecimals ? options.decimals! : (isWhole ? 0 : 2);
    const maxDigits = hasDecimals ? options.decimals! : 2;
    const formattedNum = val.toLocaleString(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
    return `${currencySymbol}${formattedNum}`;
  };

  const formatAmount = (amount: number, options?: { decimals?: number }) => {
    const val = Number(amount || 0);
    const hasDecimals = options?.decimals !== undefined;
    const isWhole = Math.abs(val % 1) < 1e-9;
    const minDigits = hasDecimals ? options.decimals! : (isWhole ? 0 : 2);
    const maxDigits = hasDecimals ? options.decimals! : 2;
    return val.toLocaleString(undefined, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
  };

  const formatMoney = (amount: number, decimals?: number) => {
    return formatCurrency(amount, decimals !== undefined ? { decimals } : undefined);
  };

  return (
    <RegionalContext.Provider value={{
      currency,
      currencySymbol,
      currencyName,
      timezone,
      language,
      formatCurrency,
      formatAmount,
      formatMoney
    }}>
      {children}
    </RegionalContext.Provider>
  );
}

export function useRegional() {
  return useContext(RegionalContext);
}

export function useCurrency() {
  const { currencySymbol, currency, currencyName, formatCurrency, formatAmount, formatMoney } = useRegional();
  return { symbol: currencySymbol, code: currency, name: currencyName, formatCurrency, formatAmount, formatMoney };
}
