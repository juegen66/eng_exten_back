import { Hono } from 'hono'
import { getDatabase } from '../../data/database'
import { userTable, emailVerificationCodeTable } from '../../data/schema'
import { sql } from 'drizzle-orm'
import { createSuccessResponse, createErrorResponse } from '../../tools/response.tools'

interface Env {
  DB: D1Database
}

const testRoutes = new Hono<{ Bindings: Env }>()

// 测试数据库连接和表结构
testRoutes.get('/db-check', async (c) => {
  try {
    const db = getDatabase(c.env.DB)
    
    // 检查表是否存在
    const tables = await db.run(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('user', 'email_verification_code')
    `)
    
    return c.json(createSuccessResponse({
      message: '数据库连接成功',
      tables: tables.results || [],
      tablesCount: tables.results?.length || 0
    }))
  } catch (error) {
    console.error('数据库连接测试失败:', error)
    return c.json(createErrorResponse(
      '数据库连接失败', 
      error instanceof Error ? error.message : '未知错误'
    ), 500)
  }
})

// 测试用户表结构
testRoutes.get('/user-table-structure', async (c) => {
  try {
    const db = getDatabase(c.env.DB)
    
    // 获取用户表结构
    const tableInfo = await db.run(sql`PRAGMA table_info(user)`)
    
    return c.json(createSuccessResponse({
      message: '用户表结构获取成功',
      columns: tableInfo.results || []
    }))
  } catch (error) {
    console.error('获取表结构失败:', error)
    return c.json(createErrorResponse(
      '获取表结构失败', 
      error instanceof Error ? error.message : '未知错误'
    ), 500)
  }
})

// 测试邮箱验证码表结构
testRoutes.get('/email-table-structure', async (c) => {
  try {
    const db = getDatabase(c.env.DB)
    
    // 获取邮箱验证码表结构
    const tableInfo = await db.run(sql`PRAGMA table_info(email_verification_code)`)
    
    return c.json(createSuccessResponse({
      message: '邮箱验证码表结构获取成功',
      columns: tableInfo.results || []
    }))
  } catch (error) {
    console.error('获取表结构失败:', error)
    return c.json(createErrorResponse(
      '获取表结构失败', 
      error instanceof Error ? error.message : '未知错误'
    ), 500)
  }
})

// 测试插入和查询数据
testRoutes.post('/test-insert', async (c) => {
  try {
    const db = getDatabase(c.env.DB)
    
    // 插入测试用户
    const result = await db.insert(userTable).values({
      username: 'test_user_' + Date.now(),
      password: 'test_password_hash',
      nickname: '测试用户',
      userType: 2,
      userEmail: `test${Date.now()}@example.com`,
      userStatus: 1
    }).returning()
    
    return c.json(createSuccessResponse({
      message: '测试数据插入成功',
      insertedUser: result[0] || null
    }))
  } catch (error) {
    console.error('测试数据插入失败:', error)
    return c.json(createErrorResponse(
      '测试数据插入失败', 
      error instanceof Error ? error.message : '未知错误'
    ), 500)
  }
})

// 获取所有测试用户
testRoutes.get('/test-users', async (c) => {
  try {
    const db = getDatabase(c.env.DB)
    
    // 查询所有用户名包含 'test_user_' 的用户
    const users = await db.select().from(userTable)
      .where(sql`username LIKE 'test_user_%'`)
      .limit(10)
    
    return c.json(createSuccessResponse({
      message: '测试用户查询成功',
      users: users,
      count: users.length
    }))
  } catch (error) {
    console.error('查询测试用户失败:', error)
    return c.json(createErrorResponse(
      '查询测试用户失败', 
      error instanceof Error ? error.message : '未知错误'
    ), 500)
  }
})

// 清理测试数据
testRoutes.delete('/cleanup', async (c) => {
  try {
    const db = getDatabase(c.env.DB)
    
    // 删除所有测试用户
    const result = await db.delete(userTable)
      .where(sql`username LIKE 'test_user_%'`)
    
    return c.json(createSuccessResponse({
      message: '测试数据清理成功',
      deletedCount: result.rowsAffected || 0
    }))
  } catch (error) {
    console.error('清理测试数据失败:', error)
    return c.json(createErrorResponse(
      '清理测试数据失败', 
      error instanceof Error ? error.message : '未知错误'
    ), 500)
  }
})

export { testRoutes }
