import { Hono } from 'hono'
import { api } from './api'
import { logger } from './middleware/logger'
import { errorHandler } from './middleware/errorHandler'
import { auth } from './middleware/auth'
import { initializeServices, isServicesInitialized } from './core/services'
import { loadConfig } from './config'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Application-level service initialization middleware
// Initialize services on the first request, then reuse for subsequent requests
app.use('*', async (c, next) => {
  if (!isServicesInitialized()) {
    const config = loadConfig(c.env)
    initializeServices(c.env.DB, config.JWT_SECRET, config.JWT_EXPIRES_IN)
  }
  
  await next()
})

app.use('*', logger)
app.use('*', errorHandler)
app.use('/api/*', auth)

// Mount API routes under the /api prefix
app.route('/api', api)

export default app