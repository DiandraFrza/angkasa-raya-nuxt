/** @format */

import { defineEventHandler, getQuery } from "h3";
import { useDb } from "../../utils/db";
import { getUserFromSession } from "../../utils/auth";
import { isSupabaseConfigured, supabaseGetProducts } from "../../utils/supabase";
import { normalizeAvailabilityStatus } from "../../utils/productSecurity";

function filterDocuments(rawJson: string | null | undefined, includeInactive: boolean) {
  try {
    const parsed = JSON.parse(rawJson || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((d: any) => ({ ...d, isActive: d?.isActive !== false }))
      .filter((d: any) => includeInactive || d.isActive !== false);
  } catch {
    return [];
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const category = query.category as string | undefined;
  const search = query.q as string | undefined;
  const wantInactive = query.includeInactive === "true" || query.includeInactive === "1";
  const session = wantInactive ? await getUserFromSession(event) : null;
  const includeInactive = Boolean(wantInactive && session);

  if (isSupabaseConfigured()) {
    return await supabaseGetProducts(category, search, includeInactive);
  }

  const db = useDb();

  let sql = `
    SELECT p.*
    FROM products p
    LEFT JOIN categories c ON p.category_slug = c.slug
    WHERE 1=1
  `;
  const params: any[] = [];

  if (!includeInactive) {
    sql += " AND p.is_active = 1 AND (c.is_active IS NULL OR c.is_active = 1)";
  }

  if (category && category !== "all") {
    sql += " AND p.category_slug = ?";
    params.push(category);
  }

  if (search && search.trim() !== "") {
    sql += " AND (p.name LIKE ? OR p.sku LIKE ? OR p.short_description LIKE ? OR p.brand LIKE ?)";
    const term = `%${search.trim()}%`;
    params.push(term, term, term, term);
  }

  sql += " ORDER BY p.created_at DESC";

  const rows = db.prepare(sql).all(...params) as any[];

  return rows.map((r) => ({
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
    documents: filterDocuments(r.documents_json, includeInactive),
    imageUrl: r.image_url,
    isFeatured: Boolean(r.is_featured),
    isVerified: Boolean(r.is_verified),
    isActive: r.is_active !== 0,
    availabilityStatus: normalizeAvailabilityStatus(r.availability_status, r.lead_time),
    leadTime: r.lead_time,
    minOrderQuantity: r.min_order_quantity,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
});
