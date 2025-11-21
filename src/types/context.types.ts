import type { UserService } from '../core/user.service'
import type { ExtenService } from '../core/exten.service'
import type { Database } from '../data/schema/database'
import type { JWTPayload } from './user.types'
import type { loadConfig } from '../config'

/**
 * Application context type definitions.
 * Defines the types of variables available in the Hono context.
 */
export interface AppVariables {
  user: any
  session: any
  config: ReturnType<typeof loadConfig>
  services: {
    db: Database
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