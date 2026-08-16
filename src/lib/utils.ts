import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const numeric = typeof amount === "string" ? parseFloat(amount) : Number(amount || 0);
  if (isNaN(numeric)) return "৳0";
  return `৳${numeric.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
