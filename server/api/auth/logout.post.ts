import { defineEventHandler } from 'h3'
import { destroySession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await destroySession(event)
  return {
    success: true,
    message: 'Berhasil keluar dari sesi admin.',
  }
})
