import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema'

export type Database = ReturnType<typeof drizzle<typeof schema>>

export const getDatabase = (d1: D1Database): Database => {
  return drizzle(d1, { schema })
}
