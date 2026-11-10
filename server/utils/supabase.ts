/** @format */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createError } from "h3";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Checks whether Supabase environment variables are configured.
 */
export const isSupabaseConfigured = (): boolean => {
  const url = process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL || "";
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_SUPABASE_KEY || "";
  return Boolean(url && key && url.startsWith("http"));
};

/**
 * Returns a singleton Supabase Client (Service Role for backend operations).
 */
export const useSupabase = (): SupabaseClient => {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL || process.env.NUXT_SUPABASE_URL || "";
  const key = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_SUPABASE_KEY || "";

  if (!url || !key) {
    throw createError({
      statusCode: 500,
      statusMessage: "Supabase belum terkonfigurasi. Pastikan SUPABASE_URL dan SUPABASE_KEY telah diisi.",
    });
  }

  supabaseInstance = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseInstance;
};

// Helper to safely parse JSON or return object
function parseJsonSafe(val: any) {
  if (!val) return [];
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

// ==========================================
// 1. CATEGORIES REPOSITORY
// ==========================================

export const supabaseGetCategories = async () => {
  const sb = useSupabase();
  const { data, error } = await sb.from("categories").select("*").order("id", { ascending: true });
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return (data || []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    isInstrument: Boolean(r.is_instrument),
  }));
};

export const supabaseCreateCategory = async (cat: { id: string; slug: string; name: string; description: string; isInstrument: boolean }) => {
  const sb = useSupabase();
  const { error } = await sb.from("categories").insert({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    is_instrument: cat.isInstrument,
  });
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return cat;
};

export const supabaseDeleteCategory = async (idOrSlug: string) => {
  const sb = useSupabase();

  // Find category first
  const { data: cat } = await sb.from("categories").select("id, slug, name").or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).maybeSingle();

  if (!cat) {
    throw createError({ statusCode: 404, statusMessage: "Kategori tidak ditemukan." });
  }

  // Check if any product is using this category
  const { count } = await sb.from("products").select("id", { count: "exact", head: true }).eq("category_slug", cat.slug);

  if (count && count > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Kategori "${cat.name}" tidak dapat dihapus karena masih digunakan oleh ${count} produk aktif dalam katalog.`,
    });
  }

  const { error } = await sb.from("categories").delete().eq("id", cat.id);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return { success: true, message: `Kategori "${cat.name}" berhasil dihapus.` };
};

// ==========================================
// 2. PRODUCTS REPOSITORY
// ==========================================

export const supabaseGetProducts = async (category?: string, search?: string) => {
  const sb = useSupabase();
  let query = sb.from("products").select("*");

  if (category && category !== "all") {
    query = query.eq("category_slug", category);
  }

  if (search && search.trim() !== "") {
    const s = search.trim();
    query = query.or(`name.ilike.%${s}%,sku.ilike.%${s}%,brand.ilike.%${s}%,short_description.ilike.%${s}%`);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return (data || []).map((r) => ({
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
    packaging: parseJsonSafe(r.packaging_json),
    specifications: parseJsonSafe(r.specifications_json),
    documents: parseJsonSafe(r.documents_json),
    imageUrl: r.image_url,
    isFeatured: Boolean(r.is_featured),
    isVerified: Boolean(r.is_verified),
    leadTime: r.lead_time,
    minOrderQuantity: r.min_order_quantity,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
};

export const supabaseGetProductByIdOrSlug = async (idOrSlug: string) => {
  const sb = useSupabase();
  const { data: r, error } = await sb.from("products").select("*").or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`).maybeSingle();

  if (error || !r) {
    throw createError({ statusCode: 404, statusMessage: "Produk tidak ditemukan." });
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
    packaging: parseJsonSafe(r.packaging_json),
    specifications: parseJsonSafe(r.specifications_json),
    documents: parseJsonSafe(r.documents_json),
    imageUrl: r.image_url,
    isFeatured: Boolean(r.is_featured),
    isVerified: Boolean(r.is_verified),
    leadTime: r.lead_time,
    minOrderQuantity: r.min_order_quantity,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
};

export const supabaseCreateProduct = async (productData: any) => {
  const sb = useSupabase();

  // Check unique SKU
  const { data: existingSku } = await sb.from("products").select("id, name").ilike("sku", productData.sku.trim()).maybeSingle();
  if (existingSku) {
    throw createError({
      statusCode: 409,
      statusMessage: `Nomor SKU "${productData.sku.trim()}" sudah digunakan oleh produk "${existingSku.name}".`,
    });
  }

  // Check category name
  const { data: cat } = await sb.from("categories").select("name").eq("slug", productData.categorySlug).maybeSingle();
  const categoryName = cat ? cat.name : productData.categoryName || productData.categorySlug;

  const row = {
    id: productData.id,
    slug: productData.slug,
    name: productData.name,
    category_slug: productData.categorySlug,
    category_name: categoryName,
    sku: productData.sku.trim(),
    brand: productData.brand || null,
    grade: productData.grade || null,
    cas_number: productData.casNumber || null,
    chemical_formula: productData.chemicalFormula || null,
    short_description: productData.shortDescription || null,
    description: productData.description || null,
    packaging_json: productData.packaging || [],
    specifications_json: productData.specifications || [],
    documents_json: productData.documents || [],
    image_url: productData.imageUrl || null,
    is_featured: Boolean(productData.isFeatured),
    is_verified: productData.isVerified !== undefined ? Boolean(productData.isVerified) : true,
    lead_time: productData.leadTime || null,
    min_order_quantity: productData.minOrderQuantity || null,
  };

  const { error } = await sb.from("products").insert(row);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return row;
};

export const supabaseUpdateProduct = async (id: string, productData: any) => {
  const sb = useSupabase();

  // Check unique SKU (exclude this product)
  if (productData.sku) {
    const { data: existingSku } = await sb.from("products").select("id, name").ilike("sku", productData.sku.trim()).neq("id", id).maybeSingle();
    if (existingSku) {
      throw createError({
        statusCode: 409,
        statusMessage: `Nomor SKU "${productData.sku.trim()}" sudah digunakan oleh produk "${existingSku.name}".`,
      });
    }
  }

  // Get category name
  let categoryName = productData.categoryName;
  if (productData.categorySlug) {
    const { data: cat } = await sb.from("categories").select("name").eq("slug", productData.categorySlug).maybeSingle();
    if (cat) categoryName = cat.name;
  }

  const updateFields: any = {
    updated_at: new Date().toISOString(),
  };

  if (productData.name !== undefined) updateFields.name = productData.name;
  if (productData.categorySlug !== undefined) updateFields.category_slug = productData.categorySlug;
  if (categoryName !== undefined) updateFields.category_name = categoryName;
  if (productData.sku !== undefined) updateFields.sku = productData.sku.trim();
  if (productData.brand !== undefined) updateFields.brand = productData.brand;
  if (productData.grade !== undefined) updateFields.grade = productData.grade;
  if (productData.casNumber !== undefined) updateFields.cas_number = productData.casNumber;
  if (productData.chemicalFormula !== undefined) updateFields.chemical_formula = productData.chemicalFormula;
  if (productData.shortDescription !== undefined) updateFields.short_description = productData.shortDescription;
  if (productData.description !== undefined) updateFields.description = productData.description;
  if (productData.packaging !== undefined) updateFields.packaging_json = productData.packaging;
  if (productData.specifications !== undefined) updateFields.specifications_json = productData.specifications;
  if (productData.documents !== undefined) updateFields.documents_json = productData.documents;
  if (productData.imageUrl !== undefined) updateFields.image_url = productData.imageUrl;
  if (productData.isFeatured !== undefined) updateFields.is_featured = Boolean(productData.isFeatured);
  if (productData.isVerified !== undefined) updateFields.is_verified = Boolean(productData.isVerified);
  if (productData.leadTime !== undefined) updateFields.lead_time = productData.leadTime;
  if (productData.minOrderQuantity !== undefined) updateFields.min_order_quantity = productData.minOrderQuantity;

  const { error } = await sb.from("products").update(updateFields).eq("id", id);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return { success: true, message: "Data produk berhasil diperbarui." };
};

export const supabaseDeleteProduct = async (id: string) => {
  const sb = useSupabase();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return { success: true, message: "Produk berhasil dihapus." };
};

// ==========================================
// 3. INQUIRIES REPOSITORY (RFQ)
// ==========================================

export const supabaseGetInquiries = async () => {
  const sb = useSupabase();
  const { data, error } = await sb.from("inquiries").select("*").order("created_at", { ascending: false });
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return (data || []).map((r) => ({
    id: r.id,
    fullName: r.full_name,
    companyOrInstitution: r.company_or_institution,
    workEmail: r.work_email,
    phoneNumber: r.phone_number,
    productName: r.product_name,
    productSlug: r.product_slug,
    estimatedQuantity: r.estimated_quantity,
    message: r.message,
    createdAt: r.created_at,
  }));
};

export const supabaseCreateInquiry = async (inquiry: any) => {
  const sb = useSupabase();
  const row = {
    id: inquiry.id,
    full_name: inquiry.fullName,
    company_or_institution: inquiry.companyOrInstitution,
    work_email: inquiry.workEmail,
    phone_number: inquiry.phoneNumber || null,
    product_name: inquiry.productName || null,
    product_slug: inquiry.productSlug || null,
    estimated_quantity: inquiry.estimatedQuantity || null,
    message: inquiry.message,
  };

  const { error } = await sb.from("inquiries").insert(row);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return row;
};

// ==========================================
// 4. SITE SETTINGS REPOSITORY
// ==========================================

export const supabaseGetSettings = async (): Promise<Record<string, string>> => {
  const sb = useSupabase();
  const { data, error } = await sb.from("site_settings").select("key, value");
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  const settings: Record<string, string> = {};
  for (const r of data || []) {
    settings[r.key] = r.value;
  }
  return settings;
};

export const supabaseUpdateSettings = async (settings: Record<string, string>) => {
  const sb = useSupabase();
  const rows = Object.entries(settings)
    .filter(([_, v]) => typeof v === "string")
    .map(([key, value]) => ({ key, value }));

  const { error } = await sb.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });

  return await supabaseGetSettings();
};

// ==========================================
// 5. USERS & SESSIONS REPOSITORY (AUTH)
// ==========================================

export const supabaseGetUsers = async () => {
  const sb = useSupabase();
  const { data, error } = await sb.from("users").select("id, username, name, role, created_at, updated_at").order("created_at", { ascending: false });
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return data || [];
};

export const supabaseGetUserByUsername = async (username: string) => {
  const sb = useSupabase();
  const { data, error } = await sb.from("users").select("*").ilike("username", username).maybeSingle();
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return data;
};

export const supabaseCreateUser = async (user: any) => {
  const sb = useSupabase();
  const { error } = await sb.from("users").insert({
    id: user.id,
    username: user.username,
    name: user.name,
    password_hash: user.password_hash,
    salt: user.salt,
    role: user.role,
  });
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return user;
};

export const supabaseDeleteUser = async (id: string) => {
  const sb = useSupabase();
  const { error } = await sb.from("users").delete().eq("id", id);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  return { success: true };
};

export const supabaseCreateSession = async (sessionId: string, userId: string, expiresAt: number) => {
  const sb = useSupabase();
  const { error } = await sb.from("sessions").insert({
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt,
  });
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
};

export const supabaseGetSessionUser = async (sessionId: string, now: number) => {
  const sb = useSupabase();
  const { data: session } = await sb.from("sessions").select("id, expires_at, user_id, users ( id, username, name, role, created_at )").eq("id", sessionId).gt("expires_at", now).maybeSingle();

  if (!session || !session.users) return null;
  const u: any = session.users;
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    created_at: u.created_at,
  };
};

export const supabaseDestroySession = async (sessionId: string) => {
  const sb = useSupabase();
  await sb.from("sessions").delete().eq("id", sessionId);
};

// ==========================================
// 6. STORAGE UPLOADER
// ==========================================

export const supabaseUploadFile = async (uniqueName: string, fileBuffer: Buffer, contentType?: string) => {
  const sb = useSupabase();

  const { data, error } = await sb.storage.from("products").upload(uniqueName, fileBuffer, {
    contentType: contentType || "image/png",
    upsert: true,
  });

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Gagal mengunggah gambar ke Supabase Storage: ${error.message}. Pastikan bucket 'products' sudah dibuat dan diset Public.`,
    });
  }

  const { data: publicUrlData } = sb.storage.from("products").getPublicUrl(uniqueName);
  return publicUrlData.publicUrl;
};
