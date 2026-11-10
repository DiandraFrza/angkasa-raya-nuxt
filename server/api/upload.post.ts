/** @format */

import { defineEventHandler, readMultipartFormData, createError } from "h3";
import path from "path";
import fs from "fs";
import { isSupabaseConfigured, supabaseUploadFile } from "../utils/supabase";

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 KB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event);

  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: "Tidak ada berkas yang diunggah." });
  }

  const file = files.find((f) => f.name === "file" || f.name === "image" || f.name === "document") || files[0];

  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: "Berkas tidak valid atau kosong." });
  }

  const ext = (path.extname(file.filename || "") || "").toLowerCase();

  const allowedDocExts = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"];
  const allowedImgExts = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"];
  const isDoc = allowedDocExts.includes(ext) || file.type?.startsWith("application/") || file.type?.startsWith("text/");
  const isImg = allowedImgExts.includes(ext) || file.type?.startsWith("image/");

  if (!isDoc && !isImg) {
    throw createError({
      statusCode: 400,
      statusMessage: "Format berkas tidak didukung. Harap unggah gambar (JPG, PNG, WEBP, SVG) atau dokumen (PDF, DOC, XLS, TXT).",
    });
  }

  // Generate safe filename
  const safeExt = ext || (isDoc ? ".pdf" : ".png");
  const baseName = path.basename(file.filename || (isDoc ? "dokumen" : "product"), ext).replace(/[^\w-]/g, "_");
  const uniqueName = `${baseName}_${Date.now()}${safeExt}`;
  const fileSizeStr = formatBytes(file.data.length);

  // If Supabase Storage is configured (e.g. on Vercel)
  if (isSupabaseConfigured()) {
    const publicUrl = await supabaseUploadFile(uniqueName, file.data, file.type || (isDoc ? "application/pdf" : "image/png"));
    return {
      success: true,
      url: publicUrl,
      filename: uniqueName,
      originalName: file.filename || uniqueName,
      fileSize: fileSizeStr,
      isDocument: isDoc,
    };
  }

  // Local filesystem fallback (Laragon / local development)
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
    originalName: file.filename || uniqueName,
    fileSize: fileSizeStr,
    isDocument: isDoc,
  };
});
