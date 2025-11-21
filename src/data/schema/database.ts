import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'
import * as authSchema from './auth-schema'

// 合并所有 schema
const allSchema = {
  ...schema,
  ...authSchema,
}

export type Database = ReturnType<typeof drizzle<typeof allSchema>>

export const getDatabase = (d1: D1Database): Database => {
  return drizzle(d1, { schema: allSchema })
}
