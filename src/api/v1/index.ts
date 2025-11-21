import { Hono } from 'hono'
import userRoutes from './user.routes'
import { extensionRoutes } from './exten.route'
import { officialRoutes } from './offcial.route'


const v1 = new Hono()

v1.route('/users', userRoutes)
v1.route('/extension', extensionRoutes)
v1.route('/official', officialRoutes)


export default v1
