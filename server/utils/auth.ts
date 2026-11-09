import crypto from 'node:crypto'
import { H3Event, getCookie, setCookie, deleteCookie, createError } from 'h3'
import { useDb } from './db'
import { hashPassword, verifyPassword } from './crypto'

export interface UserSession {
  id: string
  username: string
  name: string
  role: 'superadmin' | 'admin'
  created_at: string
}

const SESSION_COOKIE_NAME = 'arm_admin_session'
const SESSION_DURATION_DAYS = 7

export const createSession = (event: H3Event, userId: string) => {
  const db = useDb()
  const sessionId = crypto.randomUUID()
  const expiresAt = Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000

  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    sessionId,
    userId,
    expiresAt
  )

  setCookie(event, SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  })

  return sessionId
}

export const destroySession = (event: H3Event) => {
  const db = useDb()
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  if (sessionId) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
  }
  deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
}

export const getUserFromSession = (event: H3Event): UserSession | null => {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  if (!sessionId) return null

  const db = useDb()
  const now = Date.now()

  // Clean expired sessions periodically
  try {
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now)
  } catch {}

  const session = db
    .prepare(
      `SELECT s.id as session_id, s.expires_at, u.id, u.username, u.name, u.role, u.created_at 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = ? AND s.expires_at > ?`
    )
    .get(sessionId, now) as any

  if (!session) {
    deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
    return null
  }

  return {
    id: session.id,
    username: session.username,
    name: session.name,
    role: session.role,
    created_at: session.created_at,
  }
}

export const requireUser = (event: H3Event): UserSession => {
  const user = getUserFromSession(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesi login telah berakhir atau tidak valid. Silakan login kembali.',
    })
  }
  return user
}

export const requireSuperAdmin = (event: H3Event): UserSession => {
  const user = requireUser(event)
  if (user.role !== 'superadmin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Akses ditolak: Operasi ini membutuhkan hak akses Super Admin.',
    })
  }
  return user
}
