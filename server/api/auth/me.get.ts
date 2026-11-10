import { defineEventHandler } from 'h3'
import { getUserFromSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getUserFromSession(event)
  return {
    authenticated: Boolean(user),
    user: user || null,
  }
})
