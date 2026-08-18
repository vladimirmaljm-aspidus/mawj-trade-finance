/** Currency + number formatting helpers for the CBI treasury app. */

const eurFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const aedFormatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-IE");

export function formatEUR(amount: number): string {
  return eurFormatter.format(amount);
}

export function formatUSD(amount: number): string {
  return usdFormatter.format(amount);
}

export function formatAED(amount: number): string {
  return aedFormatter.format(amount);
}

export function formatCurrency(amount: number, currency: "EUR" | "USD" | "AED") {
  if (currency === "USD") return formatUSD(amount);
  if (currency === "AED") return formatAED(amount);
  return formatEUR(amount);
}

/** Splits a EUR amount into the whole + decimal parts for the hero balance. */
export function formatBalanceParts(amount: number): { whole: string; cents: string } {
  const fixed = Math.abs(amount).toFixed(2);
  const [whole, cents] = fixed.split(".");
  return {
    whole: numberFormatter.format(Number(whole)),
    cents,
  };
}

/** Compact form like "€124.6M+" used on the payments screen. */
export function formatCompactEUR(amount: number): string {
  if (amount >= 1_000_000) return `€${(amount / 1_000_000).toFixed(1)}M+`;
  if (amount >= 1_000) return `€${(amount / 1_000).toFixed(1)}K+`;
  return formatEUR(amount);
}

/** Returns a greeting based on the hour of day. */
export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

/** Produces a short reference code like "REF-845122". */
export function generateReference(): string {
  return `REF-${Math.floor(100000 + Math.random() * 900000)}`;
}

/** Relative date label for a timestamp (Today / Yesterday / MMM D). */
export function relativeDateLabel(ts: number): string {
  const now = new Date();
  const d = new Date(ts);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDay) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** "HH:MM" for a timestamp. */
export function timeLabel(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** EUR → AED conversion rate (live value comes from /api/me fxRates, but we
    keep a static fallback so client-side helpers work before hydration). */
export const EUR_TO_AED_FALLBACK = 3.9545;

/** Convert any EUR amount to AED using the given rate (or fallback). */
export function eurToAed(amount: number, rate?: number): number {
  return amount * (rate ?? EUR_TO_AED_FALLBACK);
}

/** Format the AED equivalent of an EUR amount, e.g. "≈ AED 492,316,432".
    Uses the provided EUR→AED rate (from /api/me fxRates) or the fallback. */
export function formatAedEquivalent(eurAmount: number, rate?: number): string {
  return `≈ ${aedFormatter.format(eurToAed(eurAmount, rate))}`;
}

/** Format a relative date label grouped by month for transaction lists. */
export function monthGroupLabel(ts: number | string | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts);
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString("en-GB", {
    month: "long",
    year: sameYear ? undefined : "numeric",
  });
}
