/** @format */

import { defineEventHandler, getRouterParam, createError, setResponseHeaders } from "h3";
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { useDb } from "../../../../utils/db";
import { isSupabaseConfigured, supabaseGetProductByIdOrSlug, supabaseGetSettings } from "../../../../utils/supabase";
import { normalizeAvailabilityStatus } from "../../../../utils/productSecurity";

function sanitizeFilename(input: string): string {
  return (
    String(input || "dokumen")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "dokumen"
  );
}

function getLocalSettings(): Record<string, string> {
  try {
    const db = useDb();
    const rows = db.prepare("SELECT key, value FROM site_settings").all() as { key: string; value: string }[];
    const result: Record<string, string> = {};
    for (const r of rows) result[r.key] = r.value;
    return result;
  } catch {
    return {};
  }
}

async function generateProductPdfBuffer(product: any, docMeta: any, settings: Record<string, string>, localImagePath?: string): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const pdf = new PDFDocument({
      size: "A4",
      margin: 48,
      info: {
        Title: `${docMeta.title || product.name} - ${settings.company_legal_name || "PT Angkasa Karya Medika"}`,
        Author: settings.company_legal_name || "PT Angkasa Karya Medika",
        Subject: `${docMeta.type || "TDS"} - ${product.sku}`,
      },
    });

    const chunks: Buffer[] = [];
    pdf.on("data", (chunk: Buffer) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);

    const companyLegal = settings.company_legal_name || "PT Angkasa Karya Medika";
    const tagline = settings.tagline || "Distribusi Reagen & Alat Laboratorium B2B";
    const companyAddress = settings.address || "Perumahan Sentul Indah Residence Blok A No. 1, Cikeas, Sukaraja, Bogor, Jawa Barat 16710";
    const companyPhone = settings.phone || "021 89086234";
    const companyEmail = settings.email || "angkasakaryamedika@gmail.com";

    // Top accent bar
    pdf.rect(48, 42, 499, 6).fill("#1B7E98");

    // Header
    pdf.fillColor("#0D2235").font("Helvetica-Bold").fontSize(15).text(companyLegal, 48, 60);
    pdf.fillColor("#486581").font("Helvetica").fontSize(9).text(tagline, 48, 78);

    // Document type badge on top-right
    const badgeLabel = String(docMeta.type || "TDS").toUpperCase();
    pdf.rect(390, 58, 157, 26).fill("#E9F8FF");
    pdf.fillColor("#0E4A5C").font("Helvetica-Bold").fontSize(9).text(badgeLabel, 390, 67, {
      width: 157,
      align: "center",
    });

    pdf.moveTo(48, 96).lineTo(547, 96).strokeColor("#D0F2F9").lineWidth(1).stroke();

    // Document & Product Title
    let y = 112;
    pdf
      .fillColor("#1B7E98")
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(docMeta.title || "LEMBAR SPESIFIKASI TEKNIS", 48, y);
    y += 14;
    pdf
      .fillColor("#0D2235")
      .font("Helvetica-Bold")
      .fontSize(17)
      .text(product.name || "-", 48, y, { width: 499 });
    y = pdf.y + 8;

    if (product.shortDescription) {
      pdf.fillColor("#334E68").font("Helvetica").fontSize(10).text(product.shortDescription, 48, y, {
        width: 499,
        lineGap: 2,
      });
      y = pdf.y + 12;
    }

    // Key Identification Box
    const metaRows: [string, string][] = [
      ["Kode Katalog (SKU)", product.sku || "-"],
      ["Kategori Sediaan", product.categoryName || product.categorySlug || "-"],
      ["Merek / Produsen", product.brand || companyLegal],
      ["Standar Mutu (Grade)", product.grade || "Laboratory Grade"],
    ];
    if (product.casNumber) metaRows.push(["Nomor CAS", product.casNumber]);
    if (product.chemicalFormula) metaRows.push(["Rumus Kimia", product.chemicalFormula]);
    const availStatus = normalizeAvailabilityStatus(product.availabilityStatus, product.leadTime);
    const availLabel = availStatus === "indent" ? "Pre-Order" : availStatus === "out_of_stock" ? "Stok Habis" : "Tersedia";
    metaRows.push(["Status Ketersediaan", availLabel]);
    if (product.leadTime) metaRows.push(["Estimasi Pengiriman", product.leadTime]);
    if (product.minOrderQuantity) metaRows.push(["Minimum Pemesanan", product.minOrderQuantity]);

    pdf.fillColor("#0D2235").font("Helvetica-Bold").fontSize(11).text("Identitas & Klasifikasi Produk", 48, y);
    y = pdf.y + 6;

    for (const [label, value] of metaRows) {
      if (y > 740) {
        pdf.addPage();
        y = 48;
      }
      pdf.rect(48, y, 499, 20).fill("#F8FCFE").strokeColor("#E2F2F7").lineWidth(0.5).stroke();
      pdf
        .fillColor("#486581")
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text(label, 56, y + 6, { width: 170 });
      pdf
        .fillColor("#0D2235")
        .font("Helvetica")
        .fontSize(9)
        .text(value, 232, y + 6, { width: 308 });
      y += 20;
    }

    y += 14;

    // Packaging Options
    if (Array.isArray(product.packaging) && product.packaging.length > 0) {
      if (y > 700) {
        pdf.addPage();
        y = 48;
      }
      pdf.fillColor("#0D2235").font("Helvetica-Bold").fontSize(11).text("Pilihan Kemasan Tersedia", 48, y);
      y = pdf.y + 6;
      for (const pack of product.packaging) {
        const line = `• ${pack.size || ""} ${pack.unit || ""}${pack.container ? ` (${pack.container})` : ""}`.trim();
        pdf.fillColor("#334E68").font("Helvetica").fontSize(9.5).text(line, 56, y, { width: 485 });
        y = pdf.y + 4;
      }
      y += 10;
    }

    // Technical Specifications Table
    if (Array.isArray(product.specifications) && product.specifications.length > 0) {
      if (y > 680) {
        pdf.addPage();
        y = 48;
      }
      pdf.fillColor("#0D2235").font("Helvetica-Bold").fontSize(11).text("Spesifikasi & Parameter Pengujian", 48, y);
      y = pdf.y + 6;

      // Table header
      pdf.rect(48, y, 499, 22).fill("#0D253A");
      pdf
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("Parameter Uji / Spesifikasi", 56, y + 7, { width: 200 });
      pdf
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text("Nilai Standar / Keterangan", 264, y + 7, { width: 276 });
      y += 22;

      product.specifications.forEach((spec: any, idx: number) => {
        const rowHeight = Math.max(22, pdf.heightOfString(String(spec.value || "-"), { width: 276 }) + 10, pdf.heightOfString(String(spec.label || "-"), { width: 200 }) + 10);
        if (y + rowHeight > 760) {
          pdf.addPage();
          y = 48;
        }
        pdf
          .rect(48, y, 499, rowHeight)
          .fill(idx % 2 === 0 ? "#FFFFFF" : "#F4FAFC")
          .strokeColor("#DCEEF5")
          .lineWidth(0.5)
          .stroke();
        pdf
          .fillColor("#0D2235")
          .font("Helvetica-Bold")
          .fontSize(8.5)
          .text(String(spec.label || "-"), 56, y + 6, { width: 200 });
        pdf
          .fillColor("#334E68")
          .font("Helvetica")
          .fontSize(8.5)
          .text(String(spec.value || "-"), 264, y + 6, { width: 276 });
        y += rowHeight;
      });
      y += 14;
    }

    // Full description
    if (product.description) {
      if (y > 690) {
        pdf.addPage();
        y = 48;
      }
      pdf.fillColor("#0D2235").font("Helvetica-Bold").fontSize(11).text("Deskripsi & Peruntukan Pengujian", 48, y);
      y = pdf.y + 6;
      pdf.fillColor("#334E68").font("Helvetica").fontSize(9.5).text(product.description, 48, y, {
        width: 499,
        lineGap: 3,
      });
      y = pdf.y + 14;
    }

    // Optional embedded local brochure image (e.g. PNG flyer)
    if (localImagePath && fs.existsSync(localImagePath)) {
      try {
        pdf.addPage();
        pdf
          .fillColor("#0D2235")
          .font("Helvetica-Bold")
          .fontSize(12)
          .text(`Lampiran Visual — ${docMeta.title || product.name}`, 48, 48);
        pdf.image(localImagePath, 48, 76, {
          fit: [499, 640],
          align: "center",
        });
      } catch {
        // Ignore non-embeddable image formats gracefully
      }
    }

    // Footer block at bottom of last page
    const footerY = 768;
    pdf
      .moveTo(48, footerY - 8)
      .lineTo(547, footerY - 8)
      .strokeColor("#D0F2F9")
      .lineWidth(0.8)
      .stroke();
    pdf.fillColor("#486581").font("Helvetica").fontSize(8).text(`${companyLegal} • ${companyAddress} • Telp: ${companyPhone} • Email: ${companyEmail}`, 48, footerY, { width: 499, align: "center" });

    pdf.end();
  });
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const indexParam = getRouterParam(event, "index");
  const idx = Number.parseInt(indexParam || "", 10);

  if (!slug || Number.isNaN(idx) || idx < 0) {
    throw createError({ statusCode: 400, statusMessage: "Parameter dokumen tidak valid." });
  }

  let product: any = null;
  let settings: Record<string, string> = {};

  if (isSupabaseConfigured()) {
    product = await supabaseGetProductByIdOrSlug(slug, false);
    settings = await supabaseGetSettings();
  } else {
    const db = useDb();
    const r = db
      .prepare(
        `SELECT p.*, c.is_active as category_is_active
         FROM products p
         LEFT JOIN categories c ON p.category_slug = c.slug
         WHERE (p.slug = ? OR p.id = ?) AND p.is_active = 1 AND (c.is_active IS NULL OR c.is_active = 1)`,
      )
      .get(slug, slug) as any;

    if (!r) {
      throw createError({ statusCode: 404, statusMessage: "Produk tidak ditemukan atau tidak aktif." });
    }

    let docs: any[] = [];
    try {
      const parsed = JSON.parse(r.documents_json || "[]");
      if (Array.isArray(parsed)) {
        docs = parsed.map((d: any) => ({ ...d, isActive: d?.isActive !== false })).filter((d: any) => d.isActive !== false);
      }
    } catch {}

    product = {
      id: r.id,
      slug: r.slug,
      name: r.name,
      categorySlug: r.category_slug,
      categoryName: r.category_name,
      sku: r.sku,
      brand: r.brand,
      grade: r.grade,
      casNumber: r.cas_number,
      chemicalFormula: r.chemical_formula,
      shortDescription: r.short_description,
      description: r.description,
      packaging: JSON.parse(r.packaging_json || "[]"),
      specifications: JSON.parse(r.specifications_json || "[]"),
      documents: docs,
      availabilityStatus: normalizeAvailabilityStatus(r.availability_status, r.lead_time),
      leadTime: r.lead_time,
      minOrderQuantity: r.min_order_quantity,
    };
    settings = getLocalSettings();
  }

  const docs = Array.isArray(product?.documents) ? product.documents : [];
  const docMeta = docs[idx];
  if (!docMeta || docMeta.isActive === false) {
    throw createError({ statusCode: 404, statusMessage: "Dokumen tidak ditemukan." });
  }

  const baseFilename = sanitizeFilename(`${product.slug}-${docMeta.type || "tds"}`);
  const fileUrl = typeof docMeta.fileUrl === "string" ? docMeta.fileUrl.trim() : "";

  // 1. Remote file URL (e.g., Supabase Storage)
  if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
    try {
      const remoteRes = await fetch(fileUrl);
      if (remoteRes.ok) {
        const arrayBuf = await remoteRes.arrayBuffer();
        const urlExt = path.extname(new URL(fileUrl).pathname).toLowerCase() || ".pdf";
        const contentType = remoteRes.headers.get("content-type") || (urlExt === ".pdf" ? "application/pdf" : "application/octet-stream");
        setResponseHeaders(event, {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="${baseFilename}${urlExt}"`,
          "Cache-Control": "no-store",
        });
        return Buffer.from(arrayBuf);
      }
    } catch {
      // Fall back to PDF generation below if remote fetch fails
    }
  }

  // 2. Local file in /public
  let embedLocalImage: string | undefined;
  if (fileUrl.startsWith("/") && !fileUrl.startsWith("//")) {
    const publicRoot = path.resolve(process.cwd(), "public");
    const relPath = fileUrl.replace(/^\/+/, "");
    const resolved = path.resolve(publicRoot, relPath);
    if (resolved.startsWith(publicRoot) && fs.existsSync(resolved)) {
      const ext = path.extname(resolved).toLowerCase();
      if ([".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"].includes(ext)) {
        const mimeMap: Record<string, string> = {
          ".pdf": "application/pdf",
          ".doc": "application/msword",
          ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          ".xls": "application/vnd.ms-excel",
          ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ".txt": "text/plain; charset=utf-8",
        };
        setResponseHeaders(event, {
          "Content-Type": mimeMap[ext] || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${baseFilename}${ext}"`,
          "Cache-Control": "no-store",
        });
        return fs.readFileSync(resolved);
      }
      if ([".png", ".jpg", ".jpeg"].includes(ext)) {
        embedLocalImage = resolved;
      }
    }
  }

  // 3. Dynamically generate a clean downloadable PDF (for '#' placeholders or flyer images)
  const pdfBuffer = await generateProductPdfBuffer(product, docMeta, settings, embedLocalImage);
  setResponseHeaders(event, {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${baseFilename}.pdf"`,
    "Cache-Control": "no-store",
  });
  return pdfBuffer;
});
