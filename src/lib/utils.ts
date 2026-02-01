import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a Date to YYYY-MM-DD string using local timezone.
 * Unlike toISOString().split("T")[0], this preserves the local date
 * instead of converting to UTC (which can shift the date by a day).
 */
export function formatDateToString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Serializes Date fields in an object to YYYY-MM-DD strings for API calls.
 * This prevents timezone shifts when JSON.stringify converts Dates to UTC ISO strings.
 */
export function serializeDateFields<T extends object>(
  data: T,
  dateFields: (keyof T)[]
): T {
  const result = { ...data } as Record<string, unknown>;
  for (const field of dateFields) {
    const value = result[field as string];
    if (value instanceof Date) {
      result[field as string] = formatDateToString(value);
    }
  }
  return result as T;
}
