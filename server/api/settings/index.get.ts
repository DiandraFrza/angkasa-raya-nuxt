import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'

export default defineEventHandler((event) => {
  const db = useDb()
  const rows = db.prepare('SELECT key, value FROM site_settings').all() as { key: string; value: string }[]
  
  const settings: Record<string, string> = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }

  return settings
})
