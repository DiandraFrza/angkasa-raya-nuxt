import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireSuperAdmin } from '../../utils/auth'
import { hashPassword } from '../../utils/crypto'

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event)
  const targetId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'ID pengguna tidak valid.' })
  }

  const db = useDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId) as any

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan.' })
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : user.name
  const role = body?.role === 'superadmin' ? 'superadmin' : body?.role === 'admin' ? 'admin' : user.role
  const password = typeof body?.password === 'string' ? body.password.trim() : ''

  if (password && password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kata sandi baru minimal 6 karakter.',
    })
  }

  if (password) {
    const { hash, salt } = hashPassword(password)
    db.prepare(
      'UPDATE users SET name = ?, role = ?, password_hash = ?, salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(name, role, hash, salt, targetId)
  } else {
    db.prepare('UPDATE users SET name = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
      name,
      role,
      targetId
    )
  }

  return {
    success: true,
    message: `Data pengguna @${user.username} berhasil diperbarui.`,
  }
})
