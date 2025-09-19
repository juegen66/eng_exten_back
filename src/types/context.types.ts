import type { UserService } from '../core/user.service'
import type { AuthService } from '../core/auth.service'
import type { Database } from '../data/database'
import type { JWTPayload } from './user.types'

/**
 * Application context type definitions.
 * Defines the types of variables available in the Hono context.
 */
export interface AppVariables {
  userService: UserService
  authService: AuthService
  user: JWTPayload | null
  services: {
    db: Database
    userService: UserService
    authService: AuthService
  }
}

/**
 * Application environment bindings type.
 */
export interface AppBindings extends CloudflareBindings {
  JWT_SECRET?: string
  JWT_EXPIRES_IN?: string
  // Additional environment variables can be added here
}

/**
 * Complete application context type.
 */
export interface AppContext {
  Bindings: AppBindings
  Variables: AppVariables
}