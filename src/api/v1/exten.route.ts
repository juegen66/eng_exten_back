import { Hono } from 'hono'
import { z } from 'zod'
import { successResponse } from '../../tools/response.tools'
import type { AppContext } from '../../types'
import { getAuth } from '../../lib/auth'
import { openai } from '../../lib/ai'
import { generateText } from 'ai'
import { validateJson } from '../../tools/zod.tools'
import { useAuth } from '../../lib/useAuth'
import { getExtenService } from '../../core/services'

// Zod schemas
const translateSchema = z.object({
    text: z.string().min(1),
    targetLang: z.string().min(1)
})

const collectSchema = z.object({
    text: z.string().min(1),
    translate_text: z.string().min(1),
    collection_name: z.string().min(1).optional().default('default') // 默认使用 'default' 收藏夹
})




export const extensionRoutes = new Hono<AppContext>()

extensionRoutes.post('/translate', validateJson(translateSchema), async (c) => {
    try {
        // 验证用户是否登录
        const { user } = await useAuth(c)

        console.log(c.req.valid('json'))

        const model = openai('openai/gpt-oss-20b:free')
        const { text, targetLang } = c.req.valid('json')
        const result = await generateText({
            model,
            prompt: `You just need to give the translation meaning, don't give anything else.Translate the following text to ${targetLang} : ${text}`
        })

        return c.json(successResponse('翻译成功', result.text))
    } catch (error) {
        console.error(error)
        // 如果 useAuth 抛出错误响应，直接返回
        if (error instanceof Response) {
            return error
        }
        return c.json({ error: '翻译失败' }, 500)
    }
})

// 收藏单词
extensionRoutes.post('/collect', validateJson(collectSchema), async (c) => {
    try {
        // 验证用户是否登录
        const { user } = await useAuth(c)
        const extenService = getExtenService()

        const { text, translate_text, collection_name } = c.req.valid('json')

        const result = await extenService.collect(
            user.id,
            text,
            translate_text,
            collection_name
        )

        return c.json(successResponse('收藏成功', result))
    } catch (error) {
        console.error('收藏失败:', error)
        // 如果 useAuth 抛出错误响应，直接返回
        if (error instanceof Response) {
            return error
        }
        return c.json({ error: error instanceof Error ? error.message : '收藏失败' }, 500)
    }
})

// 获取收藏夹列表（不含单词）
extensionRoutes.get('/collections', async (c) => {
    try {
        const { user } = await useAuth(c)
        const extenService = getExtenService()

        const collections = await extenService.getCollectionList(user.id)

        return c.json(successResponse('获取收藏夹列表成功', collections))
    } catch (error) {
        console.error('获取收藏夹列表失败:', error)
        if (error instanceof Response) {
            return error
        }
        return c.json({ error: '获取收藏夹列表失败' }, 500)
    }
})




