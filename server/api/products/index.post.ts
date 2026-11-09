import { defineEventHandler, readBody, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireUser(event)
  const db = useDb()
  const body = await readBody(event)

  if (!body.name || !body.categorySlug || !body.sku) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nama produk, kategori, dan SKU wajib diisi.',
    })
  }

  // Check SKU uniqueness to prevent human error
  const existingSku = db.prepare('SELECT id, name FROM products WHERE UPPER(sku) = UPPER(?)').get(body.sku.trim()) as any
  if (existingSku) {
    throw createError({
      statusCode: 409,
      statusMessage: `Nomor SKU "${body.sku.trim()}" sudah digunakan oleh produk "${existingSku.name}". Harap gunakan SKU yang unik.`,
    })
  }

  // Generate ID and slug
  const id = `prod-${Date.now()}`
  let slug = (body.slug || body.name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Check unique slug
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug)
  if (existing) {
    slug = `${slug}-${Math.floor(Math.random() * 1000)}`
  }

  // Map category name
  const cat = db.prepare('SELECT name FROM categories WHERE slug = ?').get(body.categorySlug) as { name: string } | undefined
  const categoryName = cat ? cat.name : body.categorySlug

  const packagingJson = JSON.stringify(body.packaging || [])
  const specificationsJson = JSON.stringify(body.specifications || [])
  const documentsJson = JSON.stringify(body.documents || [])

  const stmt = db.prepare(`
    INSERT INTO products (
      id, slug, name, category_slug, category_name, sku, brand, grade,
      cas_number, chemical_formula, short_description, description,
      packaging_json, specifications_json, documents_json, image_url,
      is_featured, is_verified, lead_time, min_order_quantity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    slug,
    body.name,
    body.categorySlug,
    categoryName,
    body.sku,
    body.brand || 'Angkasa Raya Medika',
    body.grade || '',
    body.casNumber || '',
    body.chemicalFormula || '',
    body.shortDescription || '',
    body.description || '',
    packagingJson,
    specificationsJson,
    documentsJson,
    body.imageUrl || '/brand/logo_akm.jpg',
    body.isFeatured ? 1 : 0,
    body.isVerified !== undefined ? (body.isVerified ? 1 : 0) : 1,
    body.leadTime || 'Ready Stock Jabodetabek',
    body.minOrderQuantity || '1 Box'
  )

  return {
    success: true,
    message: 'Produk berhasil ditambahkan ke katalog.',
    id,
    slug,
  }
})
