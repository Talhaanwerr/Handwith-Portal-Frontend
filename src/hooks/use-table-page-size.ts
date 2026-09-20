"use client";

import { useEffect, useState } from "react";
import { clampTablePageSize, readTablePageSize, writeTablePageSize } from "@/lib/table-page-size";

/** Live table page size from Settings / localStorage (3–20). */
export function useTablePageSize(): number {
  const [pageSize, setPageSize] = useState(() => readTablePageSize());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "handwith.tablePageSize") {
        setPageSize(readTablePageSize());
      }
    }
    function onCustom(e: Event) {
      const detail = (e as CustomEvent<number>).detail;
      setPageSize(clampTablePageSize(detail));
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("handwith:table-page-size", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("handwith:table-page-size", onCustom);
    };
  }, []);

  return pageSize;
}

export function useTablePageSizeSetting() {
  const [value, setValue] = useState(() => readTablePageSize());

  function save(next: number) {
    const clamped = writeTablePageSize(next);
    setValue(clamped);
    return clamped;
  }

  return { value, setValue, save };
}
