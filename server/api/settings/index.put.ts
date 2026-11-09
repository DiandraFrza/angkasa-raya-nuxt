import { defineEventHandler, readBody, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireSuperAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  requireSuperAdmin(event)
  const db = useDb()
  const body = await readBody<Record<string, string>>(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid payload. Object expected.'
    })
  }

  const upsertStmt = db.prepare(`
    INSERT INTO site_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `)

  const updateAll = db.transaction((settings: Record<string, string>) => {
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string') {
        upsertStmt.run(key, value)
      }
    }
  })

  updateAll(body)

  // Fetch updated settings
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[]
  const updatedSettings: Record<string, string> = {}
  for (const row of rows) {
    updatedSettings[row.key] = row.value
  }

  return {
    success: true,
    message: 'Pengaturan website berhasil diperbarui.',
    settings: updatedSettings
  }
})
