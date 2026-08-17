/** Currency + number formatting helpers for the Mawj treasury app. */

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

export function formatBalanceParts(amount: number): { whole: string; cents: string } {
  const fixed = Math.abs(amount).toFixed(2);
  const [whole, cents] = fixed.split(".");
  return { whole: numberFormatter.format(Number(whole)), cents };
}

export function formatCompactEUR(amount: number): string {
  if (amount >= 1_000_000) return `€${(amount / 1_000_000).toFixed(1)}M+`;
  if (amount >= 1_000) return `€${(amount / 1_000).toFixed(1)}K+`;
  return formatEUR(amount);
}

export function getGreeting(hour: number = new Date().getHours()): string {
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function generateReference(): string {
  return `REF-MWJ-${Math.floor(100000 + Math.random() * 900000)}`;
}

/** Relative date label for a timestamp. */
export function relativeDateLabel(ts: number | string | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startOfToday - startOfDay) / 86_400_000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function timeLabel(ts: number | string | Date): string {
  const d = ts instanceof Date ? ts : new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
