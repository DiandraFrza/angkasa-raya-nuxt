import { defineEventHandler, getQuery } from 'h3'
import { useDb } from '../../utils/db'

export default defineEventHandler((event) => {
  const db = useDb()
  const query = getQuery(event)
  const category = query.category as string | undefined
  const search = query.q as string | undefined

  let sql = 'SELECT * FROM products WHERE 1=1'
  const params: any[] = []

  if (category && category !== 'all') {
    sql += ' AND category_slug = ?'
    params.push(category)
  }

  if (search && search.trim() !== '') {
    sql += ' AND (name LIKE ? OR sku LIKE ? OR short_description LIKE ? OR brand LIKE ?)'
    const term = `%${search.trim()}%`
    params.push(term, term, term, term)
  }

  sql += ' ORDER BY created_at DESC'

  const rows = db.prepare(sql).all(...params) as any[]

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
  }))
})
