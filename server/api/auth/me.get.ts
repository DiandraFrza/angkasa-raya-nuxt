import { defineEventHandler } from 'h3'
import { getUserFromSession } from '../../utils/auth'

export default defineEventHandler((event) => {
  const user = getUserFromSession(event)
  return {
    authenticated: Boolean(user),
    user: user || null,
  }
})
