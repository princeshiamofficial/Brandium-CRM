"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useMemo, useCallback } from "react";

export function useAppFilters<T extends Record<string, any>>(defaultFilters: T = {} as T) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();

  const filters = useMemo(() => {
    const params: Record<string, any> = { ...defaultFilters };
    rawSearchParams.forEach((value, key) => {
      if (key === "page" || key === "pageSize") {
        const num = Number(value);
        params[key] = Number.isFinite(num) ? num : value;
      } else {
        params[key] = value;
      }
    });
    return params as T;
  }, [rawSearchParams, defaultFilters]);

  const setFilters = useCallback(
    (updater: Record<string, any> | ((prev: T) => Record<string, any>)) => {
      const current = { ...filters };
      const nextUpdates = typeof updater === "function" ? updater(current) : updater;
      const merged = { ...current, ...nextUpdates };
      const newParams = new URLSearchParams();
      Object.entries(merged).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "" && v !== "all") {
          newParams.set(k, String(v));
        }
      });
      const qs = newParams.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [filters, pathname, router],
  );

  return [filters, setFilters] as const;
}
