import { eq, and } from 'drizzle-orm'
import type { Database } from './schema/database'
import { favoriteCollections, words } from './schema/schema'

/**
 * Collection Repository
 * Handles database operations for favorite collections and words
 */
export class CollectionRepository {
    constructor(private db: Database) { }

    /**
     * 确保用户有默认收藏夹
     * @param userId - 用户 ID
     * @returns 默认收藏夹
     */
    async ensureDefaultCollection(userId: string) {
        return await this.findOrCreateCollection(userId, 'default')
    }

    /**
     * 查找或创建收藏夹
     * @param userId - 用户 ID
     * @param collectionName - 收藏夹名称
     * @returns 收藏夹 ID
     */
    async findOrCreateCollection(userId: string, collectionName: string) {
        // 先查找是否存在
        const existing = await this.db
            .select()
            .from(favoriteCollections)
            .where(
                and(
                    eq(favoriteCollections.userId, userId),
                    eq(favoriteCollections.name, collectionName)
                )
            )
            .limit(1)

        if (existing.length > 0) {
            return existing[0]
        }

        // 不存在则创建
        const result = await this.db
            .insert(favoriteCollections)
            .values({
                userId,
                name: collectionName,
                description: null,
            })
            .returning()

        return result[0]
    }

    /**
     * 添加单词到收藏夹
     * @param word - 单词
     * @param meaning - 翻译/释义
     * @param collectionId - 收藏夹 ID
     * @param partOfSpeech - 词性（可选）
     */
    async addWord(
        word: string,
        meaning: string,
        collectionId: number,
        partOfSpeech?: string
    ) {
        const result = await this.db
            .insert(words)
            .values({
                word,
                meaning,
                collectionId,
                partOfSpeech: partOfSpeech || null,
            })
            .returning()

        return result[0]
    }

    /**
     * 获取用户的所有收藏夹
     * @param userId - 用户 ID
     */
    async getUserCollections(userId: string) {
        return await this.db
            .select()
            .from(favoriteCollections)
            .where(eq(favoriteCollections.userId, userId))
            .orderBy(favoriteCollections.createdAt)
    }

    /**
     * 获取收藏夹中的所有单词
     * @param collectionId - 收藏夹 ID
     */
    async getWordsInCollection(collectionId: number) {
        return await this.db
            .select()
            .from(words)
            .where(eq(words.collectionId, collectionId))
            .orderBy(words.createdAt)
    }

    /**
     * 获取用户的收藏夹（包含单词）
     * @param userId - 用户 ID
     * @param collectionId - 收藏夹 ID（可选）
     */
    async getCollectionWithWords(userId: string, collectionId?: number) {
        if (collectionId) {
            // 获取特定收藏夹
            const collection = await this.db
                .select()
                .from(favoriteCollections)
                .where(
                    and(
                        eq(favoriteCollections.id, collectionId),
                        eq(favoriteCollections.userId, userId)
                    )
                )
                .limit(1)

            if (collection.length === 0) {
                return null
            }

            const wordsList = await this.getWordsInCollection(collectionId)

            return {
                ...collection[0],
                words: wordsList,
            }
        }

        // 获取所有收藏夹及其单词
        const collections = await this.getUserCollections(userId)
        const result = []

        for (const collection of collections) {
            const wordsList = await this.getWordsInCollection(collection.id)
            result.push({
                ...collection,
                words: wordsList,
            })
        }

        return result
    }

    /**
     * 删除收藏夹（会自动级联删除单词）
     * @param userId - 用户 ID
     * @param collectionId - 收藏夹 ID
     */
    async deleteCollection(userId: string, collectionId: number) {
        const result = await this.db
            .delete(favoriteCollections)
            .where(
                and(
                    eq(favoriteCollections.id, collectionId),
                    eq(favoriteCollections.userId, userId)
                )
            )
            .returning()

        return result.length > 0 ? result[0] : null
    }

    /**
     * 删除单词
     * @param wordId - 单词 ID
     * @param userId - 用户 ID（用于验证权限）
     */
    async deleteWord(wordId: number, userId: string) {
        // 先查询单词所属的收藏夹，验证权限
        const word = await this.db
            .select({
                wordId: words.id,
                collectionId: words.collectionId,
                userId: favoriteCollections.userId,
            })
            .from(words)
            .innerJoin(
                favoriteCollections,
                eq(words.collectionId, favoriteCollections.id)
            )
            .where(eq(words.id, wordId))
            .limit(1)

        if (word.length === 0 || word[0].userId !== userId) {
            return null
        }

        const result = await this.db
            .delete(words)
            .where(eq(words.id, wordId))
            .returning()

        return result.length > 0 ? result[0] : null
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
        const updates: any = {}
        if (name !== undefined) updates.name = name
        if (description !== undefined) updates.description = description

        if (Object.keys(updates).length === 0) {
            return null
        }

        const result = await this.db
            .update(favoriteCollections)
            .set(updates)
            .where(
                and(
                    eq(favoriteCollections.id, collectionId),
                    eq(favoriteCollections.userId, userId)
                )
            )
            .returning()

        return result.length > 0 ? result[0] : null
    }
}

