import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import path from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
  const files = await readMultipartFormData(event)

  if (!files || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Tidak ada berkas yang diunggah.' })
  }

  const file = files.find((f) => f.name === 'file' || f.name === 'image') || files[0]

  if (!file || !file.data) {
    throw createError({ statusCode: 400, statusMessage: 'Berkas gambar tidak valid.' })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  if (file.type && !allowedTypes.includes(file.type)) {
    throw createError({ statusCode: 400, statusMessage: 'Format berkas harus JPEG, PNG, WEBP, atau SVG.' })
  }

  const targetDir = path.resolve(process.cwd(), 'public', 'images', 'products')
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
  }

  // Generate safe filename
  const ext = path.extname(file.filename || '') || '.png'
  const baseName = path.basename(file.filename || 'product', ext).replace(/[^\w-]/g, '_')
  const uniqueName = `${baseName}_${Date.now()}${ext}`
  const filePath = path.join(targetDir, uniqueName)

  fs.writeFileSync(filePath, file.data)

  return {
    success: true,
    url: `/images/products/${uniqueName}`,
    filename: uniqueName,
  }
})
