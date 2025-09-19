import { Hono } from 'hono'
import userRoutes from './user.routes'
import { authRoutes } from './auth.routes'
import { extensionRoutes } from './exten.route'
import { testRoutes } from './test.routes'

const v1 = new Hono()

v1.route('/auth', authRoutes)
v1.route('/users', userRoutes)
v1.route('/extension', extensionRoutes)
v1.route('/test', testRoutes)

export default v1
