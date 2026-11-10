import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireSuperAdmin } from '../../utils/auth'
import { hashPassword } from '../../utils/crypto'
import { isSupabaseConfigured, useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  const targetId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!targetId) {
    throw createError({ statusCode: 400, statusMessage: 'ID pengguna tidak valid.' })
  }

  const password = typeof body?.password === 'string' ? body.password.trim() : ''
  if (password && password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kata sandi baru minimal 6 karakter.',
    })
  }

  if (isSupabaseConfigured()) {
    const sb = useSupabase()
    const { data: user } = await sb.from('users').select('*').eq('id', targetId).maybeSingle()
    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan.' })
    }

    const name = typeof body?.name === 'string' ? body.name.trim() : user.name
    const role = body?.role === 'superadmin' ? 'superadmin' : body?.role === 'admin' ? 'admin' : user.role

    const updateFields: any = {
      name,
      role,
      updated_at: new Date().toISOString(),
    }

    if (password) {
      const { hash, salt } = hashPassword(password)
      updateFields.password_hash = hash
      updateFields.salt = salt
    }

    const { error } = await sb.from('users').update(updateFields).eq('id', targetId)
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    return {
      success: true,
      message: `Data pengguna @${user.username} berhasil diperbarui.`,
    }
  }

  const db = useDb()
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(targetId) as any

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Pengguna tidak ditemukan.' })
  }

  const name = typeof body?.name === 'string' ? body.name.trim() : user.name
  const role = body?.role === 'superadmin' ? 'superadmin' : body?.role === 'admin' ? 'admin' : user.role

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
