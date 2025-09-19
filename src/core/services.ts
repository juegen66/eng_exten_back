import { UserService } from './user.service'
import { AuthService } from './auth.service'
import { getDatabase } from '../data/database'
import { ExtenService } from './exten.service'

// Service instances
let userService: UserService | null = null
let authService: AuthService | null = null
let extenService: ExtenService | null = null
let isInitialized = false

/**
 * Initialize all service instances.
 * This only needs to be called once when the application starts.
 */
export function initializeServices(d1: D1Database, jwtSecret?: string, jwtExpiresIn?: string) {
  if (isInitialized) {
    return // Avoid re-initialization
  }

  const database = getDatabase(d1)
  const secret = jwtSecret || 'hono_jwt_secret_key_2024_random_generated_string_abcdef123456789'
  const expiresIn = jwtExpiresIn || '7d'

  // Create service instances
  userService = new UserService(database)
  authService = new AuthService(database, secret, expiresIn)
  extenService = new ExtenService(database)
  
  isInitialized = true
}

/**
 * Get the user service instance.
 */
export function getUserService(): UserService {
  if (!userService) {
    throw new Error('Services not initialized. Call initializeServices() first.')
  }
  return userService
}

/**
 * Get the authentication service instance.
 */
export function getAuthService(): AuthService {
  if (!authService) {
    throw new Error('Services not initialized. Call initializeServices() first.')
  }
  return authService
}


export function getExtenService(): ExtenService {
  if (!extenService) {
    throw new Error('Services not initialized. Call initializeServices() first.')
  }
  return extenService
}

/**
 * Check if services have been initialized.
 */
export function isServicesInitialized(): boolean {
  return isInitialized
}

/**
 * Reset service instances (mainly for testing).
 */
export function resetServices(): void {
  userService = null
  authService = null
  extenService = null
  isInitialized = false
}