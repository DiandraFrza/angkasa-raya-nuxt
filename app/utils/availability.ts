/** @format */

import type { ProductAvailabilityStatus } from "~/types/catalog";

export interface AvailabilityBadgeMeta {
  status: ProductAvailabilityStatus;
  label: string;
  shortLabel: string;
  badgeClass: string;
  dotClass: string;
}

export const AVAILABILITY_OPTIONS: { label: string; value: ProductAvailabilityStatus }[] = [
  { label: "Tersedia", value: "ready" },
  { label: "Pre-Order", value: "indent" },
  { label: "Stok Habis", value: "out_of_stock" },
];

export function deriveAvailabilityStatus(status?: string | null, leadTime?: string | null): ProductAvailabilityStatus {
  const raw = String(status || "")
    .trim()
    .toLowerCase();
  if (raw === "ready" || raw === "Tersedia" || raw === "Tersedia") return "ready";
  if (raw === "indent" || raw === "Pre-Order" || raw === "pre-order" || raw === "preorder") return "indent";
  if (raw === "out_of_stock" || raw === "stok habis" || raw === "habis") return "out_of_stock";

  const lt = String(leadTime || "")
    .trim()
    .toLowerCase();
  if (lt.includes("habis") || lt.includes("kosong") || lt.includes("out of stock")) {
    return "out_of_stock";
  }
  if (lt.includes("indent") || lt.includes("pre-order") || lt.includes("preorder") || lt.includes("minggu")) {
    return "indent";
  }
  return "ready";
}

export function getAvailabilityBadge(status?: string | null, leadTime?: string | null): AvailabilityBadgeMeta {
  const normalized = deriveAvailabilityStatus(status, leadTime);

  switch (normalized) {
    case "indent":
      return {
        status: "indent",
        label: "Pre-Order",
        shortLabel: "Pre-Order",
        badgeClass: "text-amber-800",
        // dotClass: "bg-amber-500",
      };
    case "out_of_stock":
      return {
        status: "out_of_stock",
        label: "Stok Habis",
        shortLabel: "Stok Habis",
        badgeClass: "text-rose-700",
        // dotClass: "bg-rose-500",
      };
    case "ready":
    default:
      return {
        status: "ready",
        label: "Tersedia",
        shortLabel: "Tersedia",
        badgeClass: "text-emerald-700",
        dotClass: "bg-emerald-500",
      };
  }
}
