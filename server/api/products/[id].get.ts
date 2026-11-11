/** @format */

import { defineEventHandler, getRouterParam, getQuery, createError } from "h3";
import { useDb } from "../../utils/db";
import { getUserFromSession } from "../../utils/auth";
import { isSupabaseConfigured, supabaseGetProductByIdOrSlug } from "../../utils/supabase";
import { normalizeAvailabilityStatus } from "../../utils/productSecurity";

export default defineEventHandler(async (event) => {
  const idOrSlug = getRouterParam(event, "id");
  const query = getQuery(event);
  const wantInactive = query.includeInactive === "true" || query.includeInactive === "1";
  const session = wantInactive ? await getUserFromSession(event) : null;
  const includeInactive = Boolean(wantInactive && session);

  if (!idOrSlug) {
    throw createError({ statusCode: 400, statusMessage: "Parameter ID atau Slug diperlukan." });
  }

  if (isSupabaseConfigured()) {
    return await supabaseGetProductByIdOrSlug(idOrSlug, includeInactive);
  }

  const db = useDb();
  const r = db
    .prepare(
      `SELECT p.*, c.is_active as category_is_active
       FROM products p
       LEFT JOIN categories c ON p.category_slug = c.slug
       WHERE p.id = ? OR p.slug = ?`,
    )
    .get(idOrSlug, idOrSlug) as any;

  if (!r) {
    throw createError({ statusCode: 404, statusMessage: "Produk tidak ditemukan." });
  }

  if (!includeInactive && (r.is_active === 0 || r.category_is_active === 0)) {
    throw createError({ statusCode: 404, statusMessage: "Produk sedang dinonaktifkan." });
  }

  let docs: any[] = [];
  try {
    const parsed = JSON.parse(r.documents_json || "[]");
    if (Array.isArray(parsed)) {
      docs = parsed
        .map((d: any) => ({ ...d, isActive: d?.isActive !== false }))
        .filter((d: any) => includeInactive || d.isActive !== false);
    }
  } catch {
    docs = [];
  }

  return {
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
    imageUrl: r.image_url,
    isFeatured: Boolean(r.is_featured),
    isVerified: Boolean(r.is_verified),
    isActive: r.is_active !== 0,
    availabilityStatus: normalizeAvailabilityStatus(r.availability_status, r.lead_time),
    leadTime: r.lead_time,
    minOrderQuantity: r.min_order_quantity,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
});
