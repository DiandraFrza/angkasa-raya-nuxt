import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireSuperAdmin } from '../../utils/auth'

export default defineEventHandler((event) => {
  const currentUser = requireSuperAdmin(event)
  const targetId = getRouterParam(event, 'id')

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'ID pengguna tidak valid.' })
  }

  if (currentUser.id === targetId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.',
    })
  }

  const db = useDb()
  const targetUser = db.prepare('SELECT id, role, username FROM users WHERE id = ?').get(targetId) as any

  if (!targetUser) {
    throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan.' })
  }

  if (targetUser.role === 'superadmin') {
    const superAdminCount = db
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'")
      .get() as { count: number }

    if (superAdminCount.count <= 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Tidak dapat menghapus satu-satunya Super Admin dalam sistem.',
      })
    }
  }

  // Delete sessions first, then user
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(targetId)
  db.prepare('DELETE FROM users WHERE id = ?').run(targetId)

  return {
    success: true,
    message: `Pengguna @${targetUser.username} berhasil dihapus.`,
  }
})
