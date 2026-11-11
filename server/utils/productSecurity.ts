/** @format */

import { createError } from "h3";
import path from "node:path";

export type AvailabilityStatus = "ready" | "indent" | "out_of_stock";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const PDF_EXTENSIONS = new Set([".pdf"]);
const ALLOWED_DOC_TYPES = new Set(["SDS", "TDS", "COA", "Izin Edar Kemenkes", "Brosur Teknis"]);

/**
 * Normalizes B2B availability status with backward-compatible inference from leadTime.
 */
export function normalizeAvailabilityStatus(status?: unknown, leadTime?: unknown): AvailabilityStatus {
  const raw = String(status || "")
    .trim()
    .toLowerCase();
  if (raw === "ready" || raw === "Tersedia" || raw === "Tersedia") return "ready";
  if (raw === "indent" || raw === "Pre-Order" || raw === "pre-order" || raw === "preorder") {
    return "indent";
  }
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

function getSupabaseOrigin(): string | null {
  const raw = process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL || "";
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function hasUnsafeCharacters(value: string): boolean {
  return value.includes("..") || value.includes("\\") || value.includes("\0") || /[\r\n]/.test(value) || /^(javascript|data|vbscript|file):/i.test(value);
}

/**
 * Validates that a media path came strictly from system storage or static internal assets.
 */
export function isSafeStoredMediaUrl(rawUrl: unknown, kind: "image" | "pdf", preservedLegacyUrls: Set<string> = new Set()): boolean {
  if (typeof rawUrl !== "string") return false;
  const val = rawUrl.trim();
  if (!val || hasUnsafeCharacters(val)) return false;

  if (preservedLegacyUrls.has(val)) {
    return true;
  }

  const allowedExts = kind === "image" ? IMAGE_EXTENSIONS : PDF_EXTENSIONS;

  // 1. Safe internal asset paths
  if (val.startsWith("/") && !val.startsWith("//")) {
    const cleanPath = val.split("?")[0] || "";
    const ext = path.extname(cleanPath).toLowerCase();
    if (!allowedExts.has(ext)) return false;

    if (kind === "image") {
      return val.startsWith("/images/products/") || val.startsWith("/brand/");
    }
    return val.startsWith("/documents/products/");
  }

  // 2. Safe Supabase Storage public object URL (matches configured Supabase project only)
  const supabaseOrigin = getSupabaseOrigin();
  if (supabaseOrigin && val.startsWith(`${supabaseOrigin}/storage/v1/object/public/products/`)) {
    try {
      const parsed = new URL(val);
      const ext = path.extname(parsed.pathname).toLowerCase();
      return allowedExts.has(ext);
    } catch {
      return false;
    }
  }

  return false;
}

export function sanitizeImageUrl(rawUrl: unknown, fallback = "/brand/logo_akm.jpg", preservedExistingUrl?: string): string {
  const val = typeof rawUrl === "string" ? rawUrl.trim() : "";
  if (!val) return fallback;

  const preserved = new Set<string>();
  if (preservedExistingUrl && !hasUnsafeCharacters(preservedExistingUrl)) {
    preserved.add(preservedExistingUrl);
  }

  if (!isSafeStoredMediaUrl(val, "image", preserved)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Path gambar tidak valid atau tidak berasal dari unggahan sistem resmi (.jpg, .jpeg, .png, .webp).",
    });
  }

  return val;
}

export function sanitizeDocumentsPayload(rawDocs: unknown, existingDocs: any[] = []): any[] {
  if (!Array.isArray(rawDocs)) return [];

  const preservedLegacyUrls = new Set<string>(["/brand/logo_akm.jpg"]);
  for (const existing of existingDocs) {
    if (typeof existing?.fileUrl === "string" && !hasUnsafeCharacters(existing.fileUrl.trim())) {
      preservedLegacyUrls.add(existing.fileUrl.trim());
    }
  }

  return rawDocs.map((doc: any) => {
    const title = String(doc?.title || "").trim();
    if (!title) {
      throw createError({
        statusCode: 400,
        statusMessage: "Setiap baris dokumen teknis wajib memiliki judul berkas.",
      });
    }

    const type = ALLOWED_DOC_TYPES.has(doc?.type) ? doc.type : "Brosur Teknis";
    const fileUrl = typeof doc?.fileUrl === "string" ? doc.fileUrl.trim() : "";

    if (!fileUrl || !isSafeStoredMediaUrl(fileUrl, "pdf", preservedLegacyUrls)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Dokumen "${title}" harus menggunakan berkas PDF resmi yang diunggah melalui form.`,
      });
    }

    const fileName = typeof doc?.fileName === "string" && doc.fileName.trim() ? doc.fileName.trim().slice(0, 180) : undefined;
    const fileSize = typeof doc?.fileSize === "string" && doc.fileSize.trim() ? doc.fileSize.trim().slice(0, 48) : "PDF";

    return {
      title: title.slice(0, 180),
      type,
      fileUrl,
      ...(fileName ? { fileName } : {}),
      fileSize,
      isActive: doc?.isActive !== false,
    };
  });
}
