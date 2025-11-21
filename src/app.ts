import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { api } from './api'
import { logger } from './middleware/logger'
import { errorHandler } from './middleware/errorHandler'
import { auth } from './middleware/auth'
import { getAuth } from './lib/auth'
import { loadConfig } from './config'
import type { AppContext } from './types'

const app = new Hono<AppContext>()

// Middleware chain
app.use('*', logger)

// Load config once and store in context for reuse (must be before CORS)
app.use('*', async (c, next) => {
    const config = loadConfig(c.env)
    c.set('config', config)
    await next()
})

// CORS middleware for Better Auth endpoints (must be before errorHandler)
app.use(
    '/api/auth/*',
    async (c, next) => {
        const config = c.get('config')
        return cors({
            origin: config.CORS_ORIGIN,
            allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
            allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
            exposeHeaders: ['Content-Length', 'Set-Cookie'],
            maxAge: 600,
            credentials: true,
        })(c, next)
    }
)

app.use('*', errorHandler)

// Better Auth session middleware - saves session and user to context
app.use('*', async (c, next) => {
    const authInstance = getAuth()
    const session = await authInstance.api.getSession({ headers: c.req.raw.headers })

    if (!session) {
        c.set('user', null)
        c.set('session', null)
        await next()
        return
    }

    c.set('user', session.user)
    c.set('session', session.session)
    await next()
})

// Better Auth handler - mount to /api/auth/* (includes OPTIONS for CORS preflight)
app.on(['POST', 'GET', 'OPTIONS'], '/api/auth/*', async (c) => {
    const authInstance = getAuth()
    return authInstance.handler(c.req.raw)
})

// Example route showing how to use Better Auth session and user
// You can access session and user in any route after the session middleware
app.get('/api/session', (c) => {
    const session = c.get('session')
    const user = c.get('user')

    if (!user) {
        return c.json({ error: 'Not authenticated' }, 401)
    }

    return c.json({
        session,
        user
    })
})

app.use('/api/*', auth)

// Mount API routes under the /api prefix
app.route('/api', api)

export default app