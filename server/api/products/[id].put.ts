/** @format */

import { defineEventHandler, getRouterParam, readBody, createError } from "h3";
import { useDb } from "../../utils/db";
import { requireUser, requireSuperAdmin } from "../../utils/auth";
import { isSupabaseConfigured, supabaseGetProductByIdOrSlug, supabaseUpdateProduct } from "../../utils/supabase";
import { normalizeAvailabilityStatus, sanitizeDocumentsPayload, sanitizeImageUrl } from "../../utils/productSecurity";

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Parameter ID diperlukan." });
  }

  if (isSupabaseConfigured()) {
    const existing = await supabaseGetProductByIdOrSlug(id, true);
    const currentIsActive = existing.isActive !== false;
    if (body?.isActive !== undefined && Boolean(body.isActive) !== currentIsActive) {
      await requireSuperAdmin(event);
    }

    const sanitizedBody = { ...body };
    if (body?.imageUrl !== undefined) {
      sanitizedBody.imageUrl = sanitizeImageUrl(body.imageUrl, "/brand/logo_akm.jpg", existing.imageUrl);
    }
    if (body?.documents !== undefined) {
      sanitizedBody.documents = sanitizeDocumentsPayload(body.documents, existing.documents || []);
    }
    if (body?.availabilityStatus !== undefined || body?.leadTime !== undefined) {
      sanitizedBody.availabilityStatus = normalizeAvailabilityStatus(
        body?.availabilityStatus ?? existing.availabilityStatus,
        body?.leadTime ?? existing.leadTime,
      );
    }

    const res = await supabaseUpdateProduct(id, sanitizedBody);
    if (body?.isActive !== undefined && Object.keys(body).length === 1) {
      return {
        success: true,
        message: `Produk "${existing.name}" berhasil ${body.isActive ? "diaktifkan" : "dinonaktifkan"}.`,
        id,
      };
    }
    return res;
  }

  const db = useDb();
  const existing = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as any;
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Produk tidak ditemukan." });
  }

  const currentIsActive = existing.is_active !== 0;
  const nextIsActive = body?.isActive !== undefined ? Boolean(body.isActive) : currentIsActive;

  if (nextIsActive !== currentIsActive) {
    await requireSuperAdmin(event);
  }

  let prevDocs: any[] = [];
  try {
    prevDocs = JSON.parse(existing.documents_json || "[]");
    if (!Array.isArray(prevDocs)) prevDocs = [];
  } catch {
    prevDocs = [];
  }

  // Check if any existing document's isActive status was toggled
  if (Array.isArray(body?.documents)) {
    const docStatusChanged = body.documents.some((doc: any, idx: number) => {
      const prev = prevDocs[idx];
      if (!prev) return doc?.isActive === false;
      return (doc?.isActive !== false) !== (prev?.isActive !== false);
    });
    if (docStatusChanged) {
      await requireSuperAdmin(event);
    }
  }

  // Check SKU uniqueness (exclude current product id)
  const nextSku = typeof body?.sku === "string" ? body.sku.trim() : existing.sku;
  if (body?.sku !== undefined) {
    const existingSku = db
      .prepare("SELECT id, name FROM products WHERE UPPER(sku) = UPPER(?) AND id != ?")
      .get(nextSku, id) as any;

    if (existingSku) {
      throw createError({
        statusCode: 409,
        statusMessage: `Nomor SKU "${nextSku}" sudah digunakan oleh produk "${existingSku.name}".`,
      });
    }
  }

  const nextCategorySlug = body?.categorySlug ?? existing.category_slug;
  const cat = db.prepare("SELECT name FROM categories WHERE slug = ?").get(nextCategorySlug) as { name: string } | undefined;
  const categoryName = cat ? cat.name : body?.categoryName || existing.category_name || nextCategorySlug;

  const nextImageUrl =
    body?.imageUrl !== undefined
      ? sanitizeImageUrl(body.imageUrl, "/brand/logo_akm.jpg", existing.image_url)
      : existing.image_url;
  const nextDocs =
    body?.documents !== undefined ? sanitizeDocumentsPayload(body.documents, prevDocs) : prevDocs;
  const nextAvailabilityStatus =
    body?.availabilityStatus !== undefined || body?.leadTime !== undefined
      ? normalizeAvailabilityStatus(
          body?.availabilityStatus ?? existing.availability_status,
          body?.leadTime ?? existing.lead_time,
        )
      : normalizeAvailabilityStatus(existing.availability_status, existing.lead_time);

  const packagingJson = body?.packaging !== undefined ? JSON.stringify(body.packaging || []) : existing.packaging_json;
  const specificationsJson = body?.specifications !== undefined ? JSON.stringify(body.specifications || []) : existing.specifications_json;
  const documentsJson = JSON.stringify(nextDocs);

  const stmt = db.prepare(`
    UPDATE products SET
      name = ?,
      category_slug = ?,
      category_name = ?,
      sku = ?,
      brand = ?,
      grade = ?,
      cas_number = ?,
      chemical_formula = ?,
      short_description = ?,
      description = ?,
      packaging_json = ?,
      specifications_json = ?,
      documents_json = ?,
      image_url = ?,
      is_featured = ?,
      is_verified = ?,
      is_active = ?,
      availability_status = ?,
      lead_time = ?,
      min_order_quantity = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  stmt.run(
    body?.name ?? existing.name,
    nextCategorySlug,
    categoryName,
    nextSku,
    body?.brand ?? existing.brand ?? "Angkasa Karya Medika",
    body?.grade ?? existing.grade ?? "",
    body?.casNumber ?? existing.cas_number ?? "",
    body?.chemicalFormula ?? existing.chemical_formula ?? "",
    body?.shortDescription ?? existing.short_description ?? "",
    body?.description ?? existing.description ?? "",
    packagingJson,
    specificationsJson,
    documentsJson,
    nextImageUrl,
    body?.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : existing.is_featured,
    body?.isVerified !== undefined ? (body.isVerified ? 1 : 0) : existing.is_verified,
    nextIsActive ? 1 : 0,
    nextAvailabilityStatus,
    body?.leadTime ?? existing.lead_time,
    body?.minOrderQuantity ?? existing.min_order_quantity,
    id,
  );

  const isToggleOnly = body?.isActive !== undefined && body?.name === undefined;

  return {
    success: true,
    message: isToggleOnly
      ? `Produk "${existing.name}" berhasil ${nextIsActive ? "diaktifkan" : "dinonaktifkan"}.`
      : "Data produk berhasil diperbarui.",
    id,
  };
});
