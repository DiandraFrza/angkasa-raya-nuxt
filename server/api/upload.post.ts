/** @format */

import { defineEventHandler, readMultipartFormData, createError } from "h3";
import path from "node:path";
import fs from "node:fs";
import { requireUser } from "../utils/auth";
import { isSupabaseConfigured, supabaseUploadFile } from "../utils/supabase";

const ALLOWED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_DOC_EXTS = new Set([".pdf"]);
const ALLOWED_DOC_MIMES = new Set(["application/pdf"]);

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_DOC_BYTES = 5 * 1024 * 1024; // 5 MB

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 KB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function matchesImageSignature(buf: Buffer, ext: string): boolean {
  if (buf.length < 12) return false;
  // JPEG: FF D8 FF
  if (ext === ".jpg" || ext === ".jpeg") {
    return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (ext === ".png") {
    return (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a
    );
  }
  // WebP: RIFF....WEBP
  if (ext === ".webp") {
    return (
      buf.subarray(0, 4).toString("ascii") === "RIFF" &&
      buf.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

function matchesPdfSignature(buf: Buffer): boolean {
  if (buf.length < 5) return false;
  return buf.subarray(0, 16).toString("ascii").includes("%PDF-");
}

export default defineEventHandler(async (event) => {
  await requireUser(event);

  const files = await readMultipartFormData(event);
  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Tidak ada berkas yang diunggah." });
  }

  const file =
    files.find((f) => f.name === "file" || f.name === "image" || f.name === "logo" || f.name === "document") ||
    files[0];

  if (!file || !file.data || file.data.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Berkas tidak valid atau kosong." });
  }

  const rawFilename = path.basename(file.filename || "");
  const ext = path.extname(rawFilename).toLowerCase();
  const mime = String(file.type || "").toLowerCase();

  const expectsImage = file.name === "image" || file.name === "logo";
  const expectsDoc = file.name === "document";

  const isDoc =
    !expectsImage &&
    ALLOWED_DOC_EXTS.has(ext) &&
    (!mime || ALLOWED_DOC_MIMES.has(mime));
  const isImg =
    !expectsDoc &&
    ALLOWED_IMAGE_EXTS.has(ext) &&
    (!mime || ALLOWED_IMAGE_MIMES.has(mime));

  if (expectsImage && !isImg) {
    throw createError({
      statusCode: 400,
      statusMessage: "Format gambar tidak valid. Hanya menerima file .jpg, .jpeg, .png, atau .webp.",
    });
  }

  if (expectsDoc && !isDoc) {
    throw createError({
      statusCode: 400,
      statusMessage: "Format dokumen tidak valid. Hanya menerima file .pdf.",
    });
  }

  if (!isDoc && !isImg) {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Format berkas tidak didukung. Hanya menerima gambar (.jpg, .jpeg, .png, .webp) atau dokumen (.pdf).",
    });
  }

  if (isImg && !matchesImageSignature(file.data, ext)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Isi berkas gambar rusak atau tidak sesuai dengan ekstensi .jpg/.png/.webp.",
    });
  }

  if (isDoc && !matchesPdfSignature(file.data)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Isi berkas bukan file PDF yang valid.",
    });
  }

  const maxAllowedBytes = isDoc ? MAX_DOC_BYTES : MAX_IMAGE_BYTES;
  const maxAllowedMB = isDoc ? 5 : 2;

  if (file.data.length > maxAllowedBytes) {
    throw createError({
      statusCode: 400,
      statusMessage: `Ukuran berkas melebihi batas maksimal ${maxAllowedMB} MB (ukuran Anda: ${formatBytes(file.data.length)}).`,
    });
  }

  const baseName =
    path
      .basename(rawFilename || (isDoc ? "dokumen" : "product"), ext)
      .replace(/[^\w-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 64) || (isDoc ? "dokumen" : "product");
  const uniqueName = `${baseName}_${Date.now()}${ext}`;
  const fileSizeStr = formatBytes(file.data.length);
  const safeContentType = isDoc
    ? "application/pdf"
    : ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

  if (isSupabaseConfigured()) {
    const publicUrl = await supabaseUploadFile(uniqueName, file.data, safeContentType);
    return {
      success: true,
      url: publicUrl,
      filename: uniqueName,
      originalName: rawFilename || uniqueName,
      fileSize: fileSizeStr,
      isDocument: isDoc,
    };
  }

  const subFolder = isDoc ? "documents" : "images";
  const targetDir = path.resolve(process.cwd(), "public", subFolder, "products");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, uniqueName);
  fs.writeFileSync(filePath, file.data);

  return {
    success: true,
    url: `/${subFolder}/products/${uniqueName}`,
    filename: uniqueName,
    originalName: rawFilename || uniqueName,
    fileSize: fileSizeStr,
    isDocument: isDoc,
  };
});
