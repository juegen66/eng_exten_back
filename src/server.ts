import app from './app'
import { initializeServices, isServicesInitialized } from './core/services'
import { loadConfig } from './config'
import { initializeAuth } from './lib/auth'

/**
 * Cloudflare Workers fetch handler
 * Services are initialized once on the first request and reused for subsequent requests
 * This is the recommended pattern for Cloudflare Workers
 */
export default {
  async fetch(request: Request, env: CloudflareBindings, ctx: ExecutionContext): Promise<Response> {
    // Initialize services on first request (lazy initialization)
    // This ensures services are initialized in the Workers runtime context
    if (!isServicesInitialized()) {
      const config = loadConfig(env)
      initializeServices(env.DB)
      // Initialize Better Auth instance
      initializeAuth(env.DB, config.BETTER_AUTH_SECRET, config.BETTER_AUTH_URL)
    }

    return app.fetch(request, env, ctx)
  }
}
