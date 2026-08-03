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
}

const defaultRegional: RegionalContextType = {
  currency: "BDT",
  currencySymbol: "৳",
  currencyName: "Bangladeshi Taka",
  timezone: "Asia/Dhaka",
  language: "en",
  formatCurrency: (amount: number, options?: { decimals?: number }) => {
    const decimals = options?.decimals ?? 2;
    const formattedNum = Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `৳${formattedNum}`;
  },
  formatAmount: (amount: number, options?: { decimals?: number }) => {
    const decimals = options?.decimals ?? 2;
    return Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
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
    const decimals = options?.decimals ?? 2;
    const formattedNum = Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${currencySymbol}${formattedNum}`;
  };

  const formatAmount = (amount: number, options?: { decimals?: number }) => {
    const decimals = options?.decimals ?? 2;
    return Number(amount || 0).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <RegionalContext.Provider value={{
      currency,
      currencySymbol,
      currencyName,
      timezone,
      language,
      formatCurrency,
      formatAmount
    }}>
      {children}
    </RegionalContext.Provider>
  );
}

export function useRegional() {
  return useContext(RegionalContext);
}

export function useCurrency() {
  const { currencySymbol, currency, currencyName, formatCurrency, formatAmount } = useRegional();
  return { symbol: currencySymbol, code: currency, name: currencyName, formatCurrency, formatAmount };
}
