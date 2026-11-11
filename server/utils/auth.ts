import crypto from 'node:crypto'
import { H3Event, getCookie, setCookie, deleteCookie, createError } from 'h3'
import { useDb } from './db'
import { isSupabaseConfigured, supabaseCreateSession, supabaseDestroySession, supabaseGetSessionUser } from './supabase'

export interface UserSession {
  id: string
  username: string
  name: string
  role: 'superadmin' | 'admin'
  is_active?: boolean
  created_at: string
}

const SESSION_COOKIE_NAME = 'arm_admin_session'
const SESSION_DURATION_DAYS = 7

export const createSession = async (event: H3Event, userId: string): Promise<string> => {
  const sessionId = crypto.randomUUID()
  const expiresAt = Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000

  if (isSupabaseConfigured()) {
    await supabaseCreateSession(sessionId, userId, expiresAt)
  } else {
    const db = useDb()
    db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
      sessionId,
      userId,
      expiresAt
    )
  }

  setCookie(event, SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    secure: process.env.NODE_ENV === 'production',
  })

  return sessionId
}

export const destroySession = async (event: H3Event): Promise<void> => {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  if (sessionId) {
    if (isSupabaseConfigured()) {
      await supabaseDestroySession(sessionId)
    } else {
      const db = useDb()
      db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
    }
  }
  deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
}

export const getUserFromSession = async (event: H3Event): Promise<UserSession | null> => {
  const sessionId = getCookie(event, SESSION_COOKIE_NAME)
  if (!sessionId) return null

  const now = Date.now()

  if (isSupabaseConfigured()) {
    const user = await supabaseGetSessionUser(sessionId, now)
    if (!user) {
      deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
      return null
    }
    return user as UserSession
  }

  const db = useDb()

  // Clean expired sessions periodically
  try {
    db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(now)
  } catch {}

  const session = db
    .prepare(
      `SELECT s.id as session_id, s.expires_at, u.id, u.username, u.name, u.role, u.is_active, u.created_at 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.id = ? AND s.expires_at > ?`
    )
    .get(sessionId, now) as any

  if (!session || session.is_active === 0 || session.is_active === false) {
    try {
      db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
    } catch {}
    deleteCookie(event, SESSION_COOKIE_NAME, { path: '/' })
    return null
  }

  return {
    id: session.id,
    username: session.username,
    name: session.name,
    role: session.role,
    is_active: session.is_active !== 0,
    created_at: session.created_at,
  }
}

export const requireUser = async (event: H3Event): Promise<UserSession> => {
  const user = await getUserFromSession(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesi login telah berakhir atau tidak valid. Silakan login kembali.',
    })
  }
  return user
}

export const requireSuperAdmin = async (event: H3Event): Promise<UserSession> => {
  const user = await requireUser(event)
  if (user.role !== 'superadmin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Akses ditolak: Operasi ini membutuhkan hak akses Super Admin.',
    })
  }
  return user
}
