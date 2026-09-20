"use client";

/**
 * Shared table page-size preference (min 3, max 20).
 * Stored in localStorage so Settings can control every DataTable page size.
 */

const STORAGE_KEY = "handwith.tablePageSize";
export const TABLE_PAGE_SIZE_MIN = 3;
export const TABLE_PAGE_SIZE_MAX = 20;
export const TABLE_PAGE_SIZE_DEFAULT = 10;

export function clampTablePageSize(value: number): number {
  if (!Number.isFinite(value)) return TABLE_PAGE_SIZE_DEFAULT;
  return Math.min(TABLE_PAGE_SIZE_MAX, Math.max(TABLE_PAGE_SIZE_MIN, Math.round(value)));
}

export function readTablePageSize(): number {
  if (typeof window === "undefined") return TABLE_PAGE_SIZE_DEFAULT;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return TABLE_PAGE_SIZE_DEFAULT;
  return clampTablePageSize(Number(raw));
}

export function writeTablePageSize(value: number): number {
  const next = clampTablePageSize(value);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, String(next));
    window.dispatchEvent(new CustomEvent("handwith:table-page-size", { detail: next }));
  }
  return next;
}
