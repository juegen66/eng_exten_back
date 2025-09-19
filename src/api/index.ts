import { Hono } from 'hono'
import v1 from './v1'

export const api = new Hono()

// Versioned API, can add v2/v3 in the future
api.route('/v1', v1)

export default api