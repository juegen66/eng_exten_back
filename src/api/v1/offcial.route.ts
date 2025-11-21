import { Hono } from 'hono'
import { z } from 'zod'
import { successResponse } from '../../tools/response.tools'
import type { AppContext } from '../../types'
import { validateJson } from '../../tools/zod.tools'
import { useAuth } from '../../lib/useAuth'
import { getExtenService } from '../../core/services'

const updateCollectionSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional()
})

export const officialRoutes = new Hono<AppContext>()

// 获取收藏夹详情（含单词）
officialRoutes.get('/collections/:id', async (c) => {
    try {
        const { user } = await useAuth(c)
        const extenService = getExtenService()
        const collectionId = parseInt(c.req.param('id'))

        if (isNaN(collectionId)) {
            return c.json({ error: '无效的收藏夹 ID' }, 400)
        }

        const collection = await extenService.getCollections(user.id, collectionId)

        if (!collection) {
            return c.json({ error: '收藏夹不存在' }, 404)
        }

        return c.json(successResponse('获取收藏夹详情成功', collection))
    } catch (error) {
        console.error('获取收藏夹详情失败:', error)
        if (error instanceof Response) {
            return error
        }
        return c.json({ error: '获取收藏夹详情失败' }, 500)
    }
})

// 获取所有收藏夹及单词
officialRoutes.get('/collections/all/with-words', async (c) => {
    try {
        const { user } = await useAuth(c)
        const extenService = getExtenService()

        const collections = await extenService.getCollections(user.id)

        return c.json(successResponse('获取所有收藏夹成功', collections))
    } catch (error) {
        console.error('获取所有收藏夹失败:', error)
        if (error instanceof Response) {
            return error
        }
        return c.json({ error: '获取所有收藏夹失败' }, 500)
    }
})

// 更新收藏夹
officialRoutes.patch('/collections/:id', validateJson(updateCollectionSchema), async (c) => {
    try {
        const { user } = await useAuth(c)
        const extenService = getExtenService()
        const collectionId = parseInt(c.req.param('id'))

        if (isNaN(collectionId)) {
            return c.json({ error: '无效的收藏夹 ID' }, 400)
        }

        const { name, description } = c.req.valid('json')

        const result = await extenService.updateCollection(
            user.id,
            collectionId,
            name,
            description
        )

        return c.json(successResponse('更新收藏夹成功', result))
    } catch (error) {
        console.error('更新收藏夹失败:', error)
        if (error instanceof Response) {
            return error
        }
        return c.json({ error: error instanceof Error ? error.message : '更新收藏夹失败' }, 500)
    }
})

// 删除收藏夹（级联删除所有单词）
officialRoutes.delete('/collections/:id', async (c) => {
    try {
        const { user } = await useAuth(c)
        const extenService = getExtenService()
        const collectionId = parseInt(c.req.param('id'))

        if (isNaN(collectionId)) {
            return c.json({ error: '无效的收藏夹 ID' }, 400)
        }

        const result = await extenService.deleteCollection(user.id, collectionId)

        return c.json(successResponse('删除收藏夹成功', result))
    } catch (error) {
        console.error('删除收藏夹失败:', error)
        if (error instanceof Response) {
            return error
        }
        return c.json({ error: error instanceof Error ? error.message : '删除收藏夹失败' }, 500)
    }
})

// 删除单词
officialRoutes.delete('/words/:id', async (c) => {
    try {
        const { user } = await useAuth(c)
        const extenService = getExtenService()
        const wordId = parseInt(c.req.param('id'))

        if (isNaN(wordId)) {
            return c.json({ error: '无效的单词 ID' }, 400)
        }

        const result = await extenService.deleteWord(user.id, wordId)

        return c.json(successResponse('删除单词成功', result))
    } catch (error) {
        console.error('删除单词失败:', error)
        if (error instanceof Response) {
            return error
        }
        return c.json({ error: error instanceof Error ? error.message : '删除单词失败' }, 500)
    }
})

