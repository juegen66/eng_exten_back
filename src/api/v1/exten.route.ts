import { Hono } from 'hono'
import { successResponse } from '../../tools/response.tools'
import { validateJson } from '../../tools/zod.tools'
import { z } from 'zod'

export const extensionRoutes = new Hono()

extensionRoutes.post('/translate', async (c) => {
    const { text } = await c.req.json()
    console.log(text)
    return c.json(successResponse('翻译成功',  text ))
})




extensionRoutes.post('/collect', async (c) => {
    try {
        const body = await c.req.json()
        
    } catch (error) {
        return c.json({ error: '请求体解析失败' }, 400)
    }
})

extensionRoutes.post('/1',validateJson(z.object({
    text: z.string().min(5)
})), async (c) => {
    const body = await c.req.json()
    const { text } = body
    console.log(text)
  console.log('extensionRoutes')
  return c.json(successResponse('获取成功', 'extensionRoutes'))
})




