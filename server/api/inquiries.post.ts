import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { useDb } from '../utils/db'

const inquirySchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap wajib diisi minimal 2 karakter').max(100),
  companyOrInstitution: z.string().min(2, 'Instansi wajib diisi').max(150),
  workEmail: z.string().email('Format email tidak valid'),
  phoneNumber: z.string().optional(),
  productName: z.string().optional(),
  productSlug: z.string().optional(),
  estimatedQuantity: z.string().optional(),
  message: z.string().min(10, 'Pesan minimal 10 karakter').max(3000),
  honeypot: z.string().max(0, 'Spam terdeteksi').optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const validation = inquirySchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validasi Gagal',
      data: validation.error.flatten(),
    })
  }

  // Honeypot check
  if (body.honeypot && body.honeypot.length > 0) {
    return {
      success: true,
      message: 'Permintaan penawaran telah diterima.',
      inquiryId: `ARM-${Date.now().toString().slice(-6)}`,
    }
  }

  const db = useDb()
  const inquiryId = `ARM-${Date.now().toString().slice(-6)}`

  // Insert into SQLite
  try {
    const stmt = db.prepare(`
      INSERT INTO inquiries (
        id, full_name, company_or_institution, work_email, phone_number,
        product_name, product_slug, estimated_quantity, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      inquiryId,
      body.fullName,
      body.companyOrInstitution,
      body.workEmail,
      body.phoneNumber || '',
      body.productName || '',
      body.productSlug || '',
      body.estimatedQuantity || '',
      body.message
    )
  } catch (dbErr) {
    console.error('Failed to save inquiry to SQLite:', dbErr)
  }

  console.info('[ANGKASA RAYA MEDIKA - INQUIRY B2B TERSIMPAN DI SQLITE]', {
    id: inquiryId,
    waktu: new Date().toISOString(),
    data: validation.data,
  })

  return {
    success: true,
    message: 'Terima kasih atas permintaan penawaran harga Anda. Tim penjualan Angkasa Raya Medika akan meninjau spesifikasi kebutuhan dan mengirimkan penawaran resmi dalam waktu 1 hari kerja.',
    inquiryId,
  }
})
