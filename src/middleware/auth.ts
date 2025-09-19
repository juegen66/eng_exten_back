import type { MiddlewareHandler, Context } from 'hono'
import { verify } from 'hono/jwt'
import type { JWTPayload } from '../types'

// Optional JWT authentication middleware (allows proceeding even if the token is invalid)
export const optionalAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('authorization')
  
  if (!authHeader) {
    // No token provided, set user to null and continue
    c.set('user', null)
    return next()
  }

  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    c.set('user', null)
    return next()
  }

  try {
    const jwtSecret = c.env?.JWT_SECRET || 'hono_jwt_secret_key_2024_random_generated_string_abcdef123456789'
    const payload = await verify(token, jwtSecret) as JWTPayload
    c.set('user', payload)
  } catch (error) {
    // Token is invalid, set user to null but continue execution
    c.set('user', null)
  }

  await next()
}

// Required JWT authentication middleware (returns 401 if the token is invalid)
export const requireAuth: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('authorization')
  
  if (!authHeader) {
    return c.json({ error: 'Authentication token must be provided' }, 401)
  }

  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return c.json({ error: 'Invalid token format' }, 401)
  }

  try {
    const jwtSecret = c.env?.JWT_SECRET || 'hono_jwt_secret_key_2024_random_generated_string_abcdef123456789'
    const payload = await verify(token, jwtSecret) as JWTPayload
    
    // Simple check if the token has expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return c.json({ error: 'Token has expired' }, 401)
    }
    
    c.set('user', payload)
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401)
  }

  await next()
}

// Admin role middleware
export const requireAdmin: MiddlewareHandler = async (c, next) => {
  // First, perform authentication check
  await requireAuth(c, async () => {})
  
  const user = c.get('user') as JWTPayload | null
  
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Admin role required' }, 403)
  }

  await next()
}

// Role check middleware factory
export const requireRole = (roles: string[]): MiddlewareHandler => {
  return async (c, next) => {
    // First, perform authentication check
    await requireAuth(c, async () => {})
    
    const user = c.get('user') as JWTPayload | null
    
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: `One of the following roles is required: ${roles.join(', ')}` }, 403)
    }

    await next()
  }
}

// Backward compatible auth middleware (defaults to optional auth)
export const auth = optionalAuth

// Helper function: get current user
export const getCurrentUser = (c: Context): JWTPayload | null => {
  return c.get('user') as JWTPayload | null
}

// Helper function: check if user is authenticated
export const isAuthenticated = (c: Context): boolean => {
  const user = c.get('user') as JWTPayload | null
  return user !== null
}

// Helper function: check if user has a specific role
export const hasRole = (c: Context, role: string): boolean => {
  const user = c.get('user') as JWTPayload | null
  return user?.role === role
}