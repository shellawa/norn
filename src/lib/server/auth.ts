import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto"
import { db } from "./db"

export const AUTH_COOKIE_NAME = "norn_session"
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30
const SCRYPT_N = 16_384
const SCRYPT_R = 8
const SCRYPT_P = 1
const SCRYPT_KEY_LENGTH = 64

export type AuthUser = {
  id: string
  username: string
}

const normalizeUsername = (username: string) => username.trim().toLowerCase()

const isValidUsername = (username: string) => /^[a-z0-9._-]{3,32}$/i.test(username)

const sha256Hex = (value: string) => createHash("sha256").update(value).digest("hex")

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P })
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt}$${hash.toString("hex")}`
}

export const verifyPassword = (password: string, storedHash: string) => {
  const [scheme, n, r, p, salt, expectedHex] = storedHash.split("$")
  if (scheme !== "scrypt" || !n || !r || !p || !salt || !expectedHex) return false

  const rounds = Number(n)
  const blockSize = Number(r)
  const parallelization = Number(p)
  if (!Number.isFinite(rounds) || !Number.isFinite(blockSize) || !Number.isFinite(parallelization)) return false

  try {
    const derived = scryptSync(password, salt, expectedHex.length / 2, {
      N: rounds,
      r: blockSize,
      p: parallelization
    })
    const expected = Buffer.from(expectedHex, "hex")
    return expected.length === derived.length && timingSafeEqual(expected, derived)
  } catch {
    return false
  }
}

export const isSetupComplete = () => {
  const row = db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count?: number } | undefined
  return Number(row?.count ?? 0) > 0
}

export const getUserByUsername = (username: string): AuthUser | null => {
  const row = db.prepare("SELECT id, username FROM users WHERE username = ?").get(normalizeUsername(username)) as
    | { id?: string; username?: string }
    | undefined
  return row?.id && row.username ? { id: row.id, username: row.username } : null
}

export const getUserById = (userId: string): AuthUser | null => {
  const row = db.prepare("SELECT id, username FROM users WHERE id = ?").get(userId) as
    | { id?: string; username?: string }
    | undefined
  return row?.id && row.username ? { id: row.id, username: row.username } : null
}

export const createUser = (username: string, password: string): AuthUser => {
  const normalizedUsername = normalizeUsername(username)
  if (!isValidUsername(normalizedUsername)) {
    throw new Error("Username must be 3-32 characters and only use letters, numbers, dots, underscores, or dashes.")
  }
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long.")
  }
  if (isSetupComplete()) {
    throw new Error("An admin account already exists.")
  }

  const user: AuthUser = {
    id: randomBytes(16).toString("hex"),
    username: normalizedUsername
  }
  const createdAt = new Date().toISOString()
  db.prepare("INSERT INTO users (id, username, passwordHash, createdAt) VALUES (?, ?, ?, ?)").run(
    user.id,
    user.username,
    hashPassword(password),
    createdAt
  )
  return user
}

export const authenticateUser = (username: string, password: string): AuthUser | null => {
  const normalizedUsername = normalizeUsername(username)
  const row = db.prepare("SELECT id, username, passwordHash FROM users WHERE username = ?").get(normalizedUsername) as
    | { id?: string; username?: string; passwordHash?: string }
    | undefined

  if (!row?.id || !row.username || !row.passwordHash) return null
  if (!verifyPassword(password, row.passwordHash)) return null
  return { id: row.id, username: row.username }
}

export const createSession = (userId: string) => {
  const token = randomBytes(32).toString("base64url")
  const tokenHash = sha256Hex(token)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)
  const sessionId = randomBytes(16).toString("hex")

  db.prepare(
    "INSERT INTO sessions (id, userId, tokenHash, createdAt, expiresAt, lastUsedAt) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(sessionId, userId, tokenHash, now.toISOString(), expiresAt.toISOString(), now.toISOString())

  return { token, expiresAt }
}

export const getUserFromSessionToken = (token: string): AuthUser | null => {
  const tokenHash = sha256Hex(token)
  const row = db
    .prepare(
      `
      SELECT sessions.id AS sessionId, sessions.expiresAt, users.id AS userId, users.username
      FROM sessions
      INNER JOIN users ON users.id = sessions.userId
      WHERE sessions.tokenHash = ?
    `
    )
    .get(tokenHash) as
    | { sessionId?: string; expiresAt?: string; userId?: string; username?: string }
    | undefined

  if (!row?.sessionId || !row.expiresAt || !row.userId || !row.username) return null

  const expiresAt = new Date(row.expiresAt)
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    db.prepare("DELETE FROM sessions WHERE id = ?").run(row.sessionId)
    return null
  }

  db.prepare("UPDATE sessions SET lastUsedAt = ? WHERE id = ?").run(new Date().toISOString(), row.sessionId)
  return { id: row.userId, username: row.username }
}

export const deleteSession = (token: string) => {
  db.prepare("DELETE FROM sessions WHERE tokenHash = ?").run(sha256Hex(token))
}

export const getSafeRedirect = (redirectTo: string | null | undefined, fallback = "/") => {
  if (!redirectTo) return fallback
  if (!redirectTo.startsWith("/")) return fallback
  if (redirectTo.startsWith("//")) return fallback
  return redirectTo
}

export const setAuthCookie = (
  cookies: { set: (name: string, value: string, options: any) => void },
  token: string,
  expiresAt: Date,
  secure = false
) => {
  cookies.set(AUTH_COOKIE_NAME, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
    expires: expiresAt
  })
}

export const clearAuthCookie = (
  cookies: { delete: (name: string, options: any) => void },
  secure = false
) => {
  cookies.delete(AUTH_COOKIE_NAME, {
    path: "/",
    secure
  })
}
