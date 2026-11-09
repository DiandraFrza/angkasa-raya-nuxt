import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireSuperAdmin } from '../../utils/auth'

export default defineEventHandler((event) => {
  requireSuperAdmin(event)
  const idOrSlug = getRouterParam(event, 'id')

  if (!idOrSlug) {
    throw createError({ statusCode: 400, statusMessage: 'ID atau Slug kategori diperlukan.' })
  }

  const db = useDb()
  const category = db
    .prepare('SELECT id, slug, name FROM categories WHERE id = ? OR slug = ?')
    .get(idOrSlug, idOrSlug) as any

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Kategori tidak ditemukan.' })
  }

  // Check if any product is using this category
  const productCount = db
    .prepare('SELECT COUNT(*) as count FROM products WHERE category_slug = ?')
    .get(category.slug) as { count: number }

  if (productCount.count > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Kategori "${category.name}" tidak dapat dihapus karena masih digunakan oleh ${productCount.count} produk aktif dalam katalog. Pindahkan produk ke kategori lain terlebih dahulu.`,
    })
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(category.id)

  return {
    success: true,
    message: `Kategori "${category.name}" berhasil dihapus.`,
  }
})
