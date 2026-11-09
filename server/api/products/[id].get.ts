import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDb } from '../../utils/db'

export default defineEventHandler((event) => {
  const db = useDb()
  const idOrSlug = getRouterParam(event, 'id')

  if (!idOrSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter ID atau Slug diperlukan.' })
  }

  const r = db.prepare('SELECT * FROM products WHERE id = ? OR slug = ?').get(idOrSlug, idOrSlug) as any

  if (!r) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan.' })
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
    packaging: JSON.parse(r.packaging_json || '[]'),
    specifications: JSON.parse(r.specifications_json || '[]'),
    documents: JSON.parse(r.documents_json || '[]'),
    imageUrl: r.image_url,
    isFeatured: Boolean(r.is_featured),
    isVerified: Boolean(r.is_verified),
    leadTime: r.lead_time,
    minOrderQuantity: r.min_order_quantity,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
})
