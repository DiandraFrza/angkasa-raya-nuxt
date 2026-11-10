import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireSuperAdmin } from '../../utils/auth'
import { isSupabaseConfigured, supabaseDeleteProduct } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Parameter ID diperlukan.' })
  }

  if (isSupabaseConfigured()) {
    return await supabaseDeleteProduct(id)
  }

  const db = useDb()
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
