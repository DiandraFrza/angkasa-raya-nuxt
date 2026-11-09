import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireUser(event)
  const db = useDb()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter ID diperlukan.' })
  }

  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id)
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan.' })
  }

  // Check SKU uniqueness (exclude current product id)
  if (body.sku) {
    const existingSku = db
      .prepare('SELECT id, name FROM products WHERE UPPER(sku) = UPPER(?) AND id != ?')
      .get(body.sku.trim(), id) as any

    if (existingSku) {
      throw createError({
        statusCode: 409,
        statusMessage: `Nomor SKU "${body.sku.trim()}" sudah digunakan oleh produk "${existingSku.name}".`,
      })
    }
  }

  const cat = db.prepare('SELECT name FROM categories WHERE slug = ?').get(body.categorySlug) as { name: string } | undefined
  const categoryName = cat ? cat.name : (body.categoryName || body.categorySlug)

  const packagingJson = JSON.stringify(body.packaging || [])
  const specificationsJson = JSON.stringify(body.specifications || [])
  const documentsJson = JSON.stringify(body.documents || [])

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
      lead_time = ?,
      min_order_quantity = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)

  stmt.run(
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
    body.isVerified ? 1 : 0,
    body.leadTime || 'Ready Stock Jabodetabek',
    body.minOrderQuantity || '1 Box',
    id
  )

  return {
    success: true,
    message: 'Data produk berhasil diperbarui di SQLite.',
    id,
  }
})
