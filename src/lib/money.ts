import type { Currency } from "@/types/database";

/** "$1,500" / "৳1,75,000" (BDT uses South Asian digit grouping). */
export function formatPrice(amount: number, currency: Currency): string {
  const opts: Intl.NumberFormatOptions = { maximumFractionDigits: amount % 1 === 0 ? 0 : 2 };
  return currency === "USD"
    ? `$${new Intl.NumberFormat("en-US", opts).format(amount)}`
    : `৳${new Intl.NumberFormat("en-IN", opts).format(amount)}`;
}
