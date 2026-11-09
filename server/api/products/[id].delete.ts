import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireSuperAdmin } from '../../utils/auth'

export default defineEventHandler((event) => {
  requireSuperAdmin(event)
  const db = useDb()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter ID diperlukan.' })
  }

  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id)

  if (result.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Produk tidak ditemukan atau sudah dihapus.' })
  }

  return {
    success: true,
    message: 'Produk berhasil dihapus dari katalog.',
    id,
  }
})
