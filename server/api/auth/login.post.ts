import { defineEventHandler, readBody, createError } from 'h3'
import { useDb } from '../../utils/db'
import { verifyPassword } from '../../utils/crypto'
import { createSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username dan kata sandi wajib diisi.',
    })
  }

  const db = useDb()
  const user = db
    .prepare('SELECT id, username, name, password_hash, salt, role FROM users WHERE LOWER(username) = LOWER(?)')
    .get(username) as any

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Kredensial login tidak cocok. Periksa kembali username dan kata sandi.',
    })
  }

  const isValid = verifyPassword(password, user.password_hash, user.salt)
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Kredensial login tidak cocok. Periksa kembali username dan kata sandi.',
    })
  }

  createSession(event, user.id)

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  }
})
