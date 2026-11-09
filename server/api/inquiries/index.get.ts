import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'
import { requireUser } from '../../utils/auth'

export default defineEventHandler((event) => {
  requireUser(event)
  const db = useDb()
  const rows = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all() as any[]

  return rows.map((r) => ({
    id: r.id,
    fullName: r.full_name,
    companyOrInstitution: r.company_or_institution,
    workEmail: r.work_email,
    phoneNumber: r.phone_number,
    productName: r.product_name,
    productSlug: r.product_slug,
    estimatedQuantity: r.estimated_quantity,
    message: r.message,
    createdAt: r.created_at,
  }))
})
