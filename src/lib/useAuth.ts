import { Context } from 'hono'
import { getAuth } from './auth'
import type { AppContext } from '../types'

interface UseAuthResult {
    user: any
    session: any
}

/**
 * Hook to get authenticated user and session
 * @param c - Hono context
 * @returns Object containing user and session, or throws error response
 */
export async function useAuth(c: Context<AppContext>): Promise<UseAuthResult> {
    const auth = getAuth()
    const session = await auth.api.getSession({ headers: c.req.raw.headers })

    if (!session) {
        throw c.json({ error: '请先登录' }, 401)
    }

    console.log(session.user, 'session.user')

    return {
        user: session.user,
        session: session
    }
}

