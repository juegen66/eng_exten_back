import type { MiddlewareHandler } from 'hono'

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next()
  } catch (err) {
    console.log("err", err)
    return c.json({ message: 'Internal Server Error' }, 500)
  }
}
