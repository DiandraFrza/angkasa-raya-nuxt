/** @format */

import { defineEventHandler, readBody, createError } from "h3";
import { useDb } from "../../utils/db";
import { requireUser } from "../../utils/auth";
import { isSupabaseConfigured, supabaseCreateProduct, useSupabase } from "../../utils/supabase";
import { normalizeAvailabilityStatus, sanitizeDocumentsPayload, sanitizeImageUrl } from "../../utils/productSecurity";

export default defineEventHandler(async (event) => {
  await requireUser(event);
  const body = await readBody(event);

  if (!body.name || !body.categorySlug || !body.sku) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nama produk, kategori, dan SKU wajib diisi.",
    });
  }

  const availabilityStatus = normalizeAvailabilityStatus(body.availabilityStatus, body.leadTime);
  const safeImageUrl = sanitizeImageUrl(body.imageUrl, "/brand/logo_akm.jpg");
  const safeDocuments = sanitizeDocumentsPayload(body.documents || [], []);

  // Generate ID and slug
  const id = `prod-${Date.now()}`;
  let slug = (body.slug || body.name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (isSupabaseConfigured()) {
    const sb = useSupabase();
    const { data: existing } = await sb.from("products").select("id").eq("slug", slug).maybeSingle();
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    await supabaseCreateProduct({
      id,
      slug,
      name: body.name,
      categorySlug: body.categorySlug,
      categoryName: body.categoryName,
      sku: body.sku,
      brand: body.brand || "Angkasa Karya Medika",
      grade: body.grade || "",
      casNumber: body.casNumber || "",
      chemicalFormula: body.chemicalFormula || "",
      shortDescription: body.shortDescription || "",
      description: body.description || "",
      packaging: body.packaging || [],
      specifications: body.specifications || [],
      documents: safeDocuments,
      imageUrl: safeImageUrl,
      isFeatured: body.isFeatured,
      isVerified: body.isVerified,
      availabilityStatus,
      leadTime: body.leadTime || "Tersedia Jabodetabek",
      minOrderQuantity: body.minOrderQuantity || "1 Box",
    });
  } else {
    const db = useDb();

    // Check SKU uniqueness
    const existingSku = db.prepare("SELECT id, name FROM products WHERE UPPER(sku) = UPPER(?)").get(body.sku.trim()) as any;
    if (existingSku) {
      throw createError({
        statusCode: 409,
        statusMessage: `Nomor SKU "${body.sku.trim()}" sudah digunakan oleh produk "${existingSku.name}". Harap gunakan SKU yang unik.`,
      });
    }

    // Check unique slug
    const existing = db.prepare("SELECT id FROM products WHERE slug = ?").get(slug);
    if (existing) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }

    // Map category name
    const cat = db.prepare("SELECT name FROM categories WHERE slug = ?").get(body.categorySlug) as { name: string } | undefined;
    const categoryName = cat ? cat.name : body.categorySlug;

    const packagingJson = JSON.stringify(body.packaging || []);
    const specificationsJson = JSON.stringify(body.specifications || []);
    const documentsJson = JSON.stringify(safeDocuments);

    const stmt = db.prepare(`
      INSERT INTO products (
        id, slug, name, category_slug, category_name, sku, brand, grade,
        cas_number, chemical_formula, short_description, description,
        packaging_json, specifications_json, documents_json, image_url,
        is_featured, is_verified, availability_status, lead_time, min_order_quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, slug, body.name, body.categorySlug, categoryName, body.sku, body.brand || "Angkasa Karya Medika", body.grade || "", body.casNumber || "", body.chemicalFormula || "", body.shortDescription || "", body.description || "", packagingJson, specificationsJson, documentsJson, safeImageUrl, body.isFeatured ? 1 : 0, body.isVerified !== undefined ? (body.isVerified ? 1 : 0) : 1, availabilityStatus, body.leadTime || "Tersedia Jabodetabek", body.minOrderQuantity || "1 Box");
  }

  return {
    success: true,
    message: "Produk berhasil ditambahkan ke katalog.",
    id,
    slug,
  };
});
