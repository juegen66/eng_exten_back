import { createMiddleware } from 'hono/factory'
import { getDatabase } from '../data/database'
import { getUserService, getAuthService } from '../core/services'
import type { AppContext } from '../types'

/**
 * Service injection middleware.
 * Injects service instances into the Hono context for easy use in routes.
 * Optimization: Directly uses module-level service instances to avoid repeated instantiation.
 */
export const servicesMiddleware = createMiddleware<AppContext>(async (c, next) => {
  // Get database connection (for service objects)
  const db = getDatabase(c.env.DB)
  
  // Get service instances and inject them into the context
  const services = {
    db,
    userService: getUserService(),
    authService: getAuthService()
  }
  
  c.set('userService', services.userService)
  c.set('authService', services.authService)
  
  await next()
})