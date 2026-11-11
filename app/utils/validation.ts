/** @format */

export const MAX_IMAGE_MB = 2;
export const MAX_DOC_MB = 5;

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;
export const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_PDF_EXTENSIONS = [".pdf"] as const;
export const ALLOWED_PDF_MIMES = ["application/pdf"] as const;

export function getFileExtension(filename: string): string {
  const name = String(filename || "").trim().toLowerCase();
  const lastDot = name.lastIndexOf(".");
  return lastDot >= 0 ? name.slice(lastDot) : "";
}

export function isImageFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  const mime = String(file.type || "").toLowerCase();
  const validExt = (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(ext);
  const validMime = !mime || (ALLOWED_IMAGE_MIMES as readonly string[]).includes(mime);
  return validExt && validMime;
}

export function isPdfFile(file: File): boolean {
  const ext = getFileExtension(file.name);
  const mime = String(file.type || "").toLowerCase();
  const validExt = (ALLOWED_PDF_EXTENSIONS as readonly string[]).includes(ext);
  const validMime = !mime || (ALLOWED_PDF_MIMES as readonly string[]).includes(mime);
  return validExt && validMime;
}

export function validateImageUpload(file: File): { valid: boolean; message: string } {
  if (!isImageFile(file)) {
    return {
      valid: false,
      message: "Format gambar harus JPG, JPEG, PNG, atau WebP.",
    };
  }
  return validateFileSize(file, MAX_IMAGE_MB);
}

export function validatePdfUpload(file: File): { valid: boolean; message: string } {
  if (!isPdfFile(file)) {
    return {
      valid: false,
      message: "Dokumen hanya menerima format PDF (.pdf).",
    };
  }
  return validateFileSize(file, MAX_DOC_MB);
}

/**
 * Hanya mengizinkan digit angka (0-9).
 */
export function sanitizeNumeric(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

/**
 * Hanya mengizinkan huruf (teks), spasi, titik, koma, apostrof, dan tanda hubung.
 * Angka dan simbol lain otomatis dihapus.
 */
export function sanitizeTextOnly(value: string): string {
  return String(value || "").replace(/[^\p{L}\s.,'-]/gu, "");
}

export function isValidNumeric(value: string): boolean {
  return /^\d+$/.test(String(value || "").trim());
}

export function isValidTextOnly(value: string): boolean {
  return /^[\p{L}\s.,'-]+$/u.test(String(value || "").trim());
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

export function validateFileSize(
  file: File,
  maxMB: number,
): { valid: boolean; message: string } {
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const actualMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      message: `Ukuran berkas melebihi batas maksimal ${maxMB} MB (berkas Anda: ${actualMB} MB).`,
    };
  }
  return { valid: true, message: "" };
}

/**
 * Helper binding input HTML agar input hanya menerima angka secara langsung.
 */
export function onNumericInput(event: Event, setter: (val: string) => void): void {
  const target = event.target as HTMLInputElement | null;
  if (!target) return;
  const cleaned = sanitizeNumeric(target.value);
  if (target.value !== cleaned) {
    target.value = cleaned;
  }
  setter(cleaned);
}

/**
 * Helper binding input HTML agar input hanya menerima huruf/teks secara langsung.
 */
export function onTextOnlyInput(event: Event, setter: (val: string) => void): void {
  const target = event.target as HTMLInputElement | null;
  if (!target) return;
  const cleaned = sanitizeTextOnly(target.value);
  if (target.value !== cleaned) {
    target.value = cleaned;
  }
  setter(cleaned);
}
