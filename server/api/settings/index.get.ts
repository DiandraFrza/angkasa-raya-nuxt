import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'
import { isSupabaseConfigured, supabaseGetSettings } from '../../utils/supabase'

export default defineEventHandler(async () => {
  if (isSupabaseConfigured()) {
    const settings = await supabaseGetSettings()
    // If Supabase settings table is empty, fallback to SQLite / defaults
    if (Object.keys(settings).length > 0) {
      return settings
    }
  }

  const db = useDb()
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[]
  
  const settings: Record<string, string> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }

  return settings
})
