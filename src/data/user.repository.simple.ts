import { eq, sql } from 'drizzle-orm'
import type { Database } from './database'
import { userTable } from './schema'

/**
 * 简化版本的用户仓库，只使用当前schema中实际存在的字段
 */
export class SimpleUserRepository {
  constructor(private db: Database) {}

  /**
   * 查找所有用户
   */
  async findAll() {
    return await this.db.select().from(userTable)
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: number) {
    const result = await this.db.select().from(userTable).where(eq(userTable.id, id))
    return result.length > 0 ? result[0] : undefined
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username: string) {
    const result = await this.db.select().from(userTable).where(eq(userTable.username, username))
    return result.length > 0 ? result[0] : undefined
  }

  /**
   * 创建新用户
   */
  async create(userData: {
    username: string
    password: string
    nickname?: string
    userType?: number
    userEmail?: string
    userStatus?: number
    userPhone?: string
    avatar?: string
    sex?: number
    remarks?: string
    clientHost?: string
  }) {
    const result = await this.db.insert(userTable).values(userData).returning()
    return result[0]
  }

  /**
   * 删除测试用户
   */
  async deleteTestUsers() {
    return await this.db.delete(userTable).where(sql`username LIKE 'test_user_%'`)
  }
}
