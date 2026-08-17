/** Static FX metadata (flags + currency names). Live rates come from the API. */

export type FxCode = "EUR" | "USD" | "AED" | "GBP" | "CHF" | "JPY";

export const FX_META: Record<string, { flag: string; name: string }> = {
  EUR: { flag: "🇪🇺", name: "Euro" },
  USD: { flag: "🇺🇸", name: "US Dollar" },
  AED: { flag: "🇦🇪", name: "UAE Dirham" },
  GBP: { flag: "🇬🇧", name: "Pound Sterling" },
  CHF: { flag: "🇨🇭", name: "Swiss Franc" },
  JPY: { flag: "🇯🇵", name: "Japanese Yen" },
};
