import { defineEventHandler, readBody, createError } from 'h3'
import { useDb } from '../../utils/db'
import { requireSuperAdmin } from '../../utils/auth'
import { isSupabaseConfigured, supabaseGetSettings, supabaseUpdateSettings } from '../../utils/supabase'
import { sanitizeImageUrl } from '../../utils/productSecurity'

export default defineEventHandler(async (event) => {
  await requireSuperAdmin(event)
  const body = await readBody<Record<string, string>>(event)

  if (!body || typeof body !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid payload. Object expected.',
    })
  }

  const sanitizedBody: Record<string, string> = {}
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      sanitizedBody[key] = value
    }
  }

  if (isSupabaseConfigured()) {
    if (sanitizedBody.logo_url !== undefined) {
      const currentSettings = await supabaseGetSettings().catch(() => ({} as Record<string, string>))
      sanitizedBody.logo_url = sanitizeImageUrl(
        sanitizedBody.logo_url,
        '/brand/logo_akm.jpg',
        currentSettings.logo_url,
      )
    }

    const updatedSettings = await supabaseUpdateSettings(sanitizedBody)
    return {
      success: true,
      message: 'Pengaturan website berhasil diperbarui.',
      settings: updatedSettings,
    }
  }

  const db = useDb()

  if (sanitizedBody.logo_url !== undefined) {
    const existingLogo = db
      .prepare("SELECT value FROM site_settings WHERE key = 'logo_url'")
      .get() as { value: string } | undefined
    sanitizedBody.logo_url = sanitizeImageUrl(
      sanitizedBody.logo_url,
      '/brand/logo_akm.jpg',
      existingLogo?.value,
    )
  }

  const upsertStmt = db.prepare(`
    INSERT INTO site_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `)

  const updateAll = db.transaction((settings: Record<string, string>) => {
    for (const [key, value] of Object.entries(settings)) {
      upsertStmt.run(key, value)
    }
  })

  updateAll(sanitizedBody)

  // Fetch updated settings
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[]
  const updatedSettings: Record<string, string> = {}
  for (const row of rows) {
    updatedSettings[row.key] = row.value
  }

  return {
    success: true,
    message: 'Pengaturan website berhasil diperbarui.',
    settings: updatedSettings,
  }
})
