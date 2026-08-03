import { getCurrencyByCode } from "@/shared/constants/currencies";

/**
 * Format a numeric amount into a locale-formatted currency string with symbol.
 * E.g., formatMoney(1250.5, "৳") => "৳1,250.50"
 * E.g., formatMoney(1250.5, "$") => "$1,250.50"
 * E.g., formatMoney(1250.5, "₹") => "₹1,250.50"
 */
export function formatMoney(
  amount: number | string | null | undefined,
  symbol: string = "৳",
  decimals: number = 2
): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  const validNum = isNaN(num) ? 0 : num;
  const formatted = validNum.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

/**
 * Format a numeric amount without currency symbol.
 * E.g., formatAmount(1250.5) => "1,250.50"
 */
export function formatAmount(
  amount: number | string | null | undefined,
  decimals: number = 2
): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount || 0));
  const validNum = isNaN(num) ? 0 : num;
  return validNum.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Helper to get business settings and currency symbol in server components or server actions.
 */
export function getSymbolFromCurrencyCode(code?: string): string {
  const info = getCurrencyByCode(code);
  return info.symbol || "৳";
}
