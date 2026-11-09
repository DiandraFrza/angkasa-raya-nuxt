import crypto from 'node:crypto'

export const hashPassword = (password: string, salt?: string) => {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512').toString('hex')
  return { hash, salt: actualSalt }
}

export const verifyPassword = (password: string, hash: string, salt: string) => {
  try {
    const result = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    return crypto.timingSafeEqual(Buffer.from(result, 'hex'), Buffer.from(hash, 'hex'))
  } catch {
    return false
  }
}
