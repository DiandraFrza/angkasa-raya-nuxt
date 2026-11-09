import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'

export default defineEventHandler(() => {
  const db = useDb()
  const rows = db.prepare('SELECT * FROM categories ORDER BY id ASC').all() as any[]

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    isInstrument: Boolean(r.is_instrument),
  }))
})
