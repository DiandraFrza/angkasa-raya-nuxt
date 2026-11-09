import { defineEventHandler, readBody, createError } from 'h3'
import crypto from 'node:crypto'
import { useDb } from '../../utils/db'
import { requireSuperAdmin } from '../../utils/auth'
import { hashPassword } from '../../utils/crypto'

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event)

  const body = await readBody(event)
  const username = typeof body?.username === 'string' ? body.username.trim().toLowerCase() : ''
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const role = body?.role === 'superadmin' ? 'superadmin' : 'admin'

  if (!username || username.length < 3) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username minimal 3 karakter (hanya huruf, angka, atau underscore).',
    })
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Format username tidak valid. Gunakan huruf kecil, angka, atau underscore tanpa spasi.',
    })
  }

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nama lengkap pengguna wajib diisi.',
    })
  }

  if (!password || password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kata sandi minimal 6 karakter demi keamanan akun.',
    })
  }

  const db = useDb()

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?').get(username)
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: `Username "${username}" sudah digunakan oleh akun lain.`,
    })
  }

  const id = `usr-${crypto.randomUUID().slice(0, 8)}`
  const { hash, salt } = hashPassword(password)

  db.prepare(
    'INSERT INTO users (id, username, name, password_hash, salt, role) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, username, name, hash, salt, role)

  return {
    success: true,
    message: `Pengguna ${name} (@${username}) berhasil ditambahkan sebagai ${role === 'superadmin' ? 'Super Admin' : 'Admin Biasa'}.`,
    user: {
      id,
      username,
      name,
      role,
    },
  }
})
