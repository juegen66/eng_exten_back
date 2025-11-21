import type { Database } from '../data/schema/database'
import { CollectionRepository } from '../data/collection.repository'

/**
 * Extension Service
 * 处理浏览器扩展相关的业务逻辑
 */
export class ExtenService {
    private collectionRepository: CollectionRepository

    constructor(db: Database) {
        this.collectionRepository = new CollectionRepository(db)
    }

    /**
     * 收藏单词
     * @param userId - 用户 ID
     * @param text - 原文
     * @param translateText - 翻译文本
     * @param collectionName - 收藏夹名称（默认为 'default'）
     */
    async collect(
        userId: string,
        text: string,
        translateText: string,
        collectionName: string = 'default'
    ) {
        // 验证输入
        if (!text || text.trim().length === 0) {
            throw new Error('原文不能为空')
        }

        if (!translateText || translateText.trim().length === 0) {
            throw new Error('翻译文本不能为空')
        }

        // 查找或创建收藏夹
        const collection = await this.collectionRepository.findOrCreateCollection(
            userId,
            collectionName
        )

        // 添加单词到收藏夹
        const word = await this.collectionRepository.addWord(
            text.trim(),
            translateText.trim(),
            collection.id
        )

        return {
            word,
            collection: {
                id: collection.id,
                name: collection.name,
            },
        }
    }

    /**
     * 获取用户的收藏夹列表（不含单词）
     * @param userId - 用户 ID
     */
    async getCollectionList(userId: string) {
        return await this.collectionRepository.getUserCollections(userId)
    }

    /**
     * 获取收藏夹详情（含单词）
     * @param userId - 用户 ID
     * @param collectionId - 收藏夹 ID（可选，不传则返回所有收藏夹）
     */
    async getCollections(userId: string, collectionId?: number) {
        return await this.collectionRepository.getCollectionWithWords(
            userId,
            collectionId
        )
    }

    /**
     * 更新收藏夹信息
     * @param userId - 用户 ID
     * @param collectionId - 收藏夹 ID
     * @param name - 新名称
     * @param description - 新描述
     */
    async updateCollection(
        userId: string,
        collectionId: number,
        name?: string,
        description?: string
    ) {
        const result = await this.collectionRepository.updateCollection(
            userId,
            collectionId,
            name,
            description
        )

        if (!result) {
            throw new Error('收藏夹不存在或更新失败')
        }

        return result
    }

    /**
     * 删除收藏夹
     * @param userId - 用户 ID
     * @param collectionId - 收藏夹 ID
     */
    async deleteCollection(userId: string, collectionId: number) {
        const result = await this.collectionRepository.deleteCollection(
            userId,
            collectionId
        )

        if (!result) {
            throw new Error('收藏夹不存在或删除失败')
        }

        return result
    }

    /**
     * 删除单词
     * @param userId - 用户 ID
     * @param wordId - 单词 ID
     */
    async deleteWord(userId: string, wordId: number) {
        const result = await this.collectionRepository.deleteWord(wordId, userId)

        if (!result) {
            throw new Error('单词不存在或删除失败')
        }

        return result
    }

    /**
     * 获取收藏夹中的单词列表
     * @param collectionId - 收藏夹 ID
     */
    async getWordsInCollection(collectionId: number) {
        return await this.collectionRepository.getWordsInCollection(collectionId)
    }

    /**
     * 确保用户有默认收藏夹
     * @param userId - 用户 ID
     */
    async ensureDefaultCollection(userId: string) {
        return await this.collectionRepository.ensureDefaultCollection(userId)
    }
}

