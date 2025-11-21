import { UserService } from './user.service'
import { getDatabase } from '../data/schema/database'
import { ExtenService } from './exten.service'

// Service instances
let userService: UserService | null = null
let extenService: ExtenService | null = null
let isInitialized = false

/**
 * Initialize all service instances.
 * This only needs to be called once when the application starts.
 */
export function initializeServices(d1: D1Database) {
  if (isInitialized) {
    return // Avoid re-initialization
  }

  const database = getDatabase(d1)
  // Create service instances
  userService = new UserService(database)
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
  extenService = null
  isInitialized = false
}