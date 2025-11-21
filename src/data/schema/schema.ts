import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { user } from './auth-schema';

// 定义 User 表

export const testTable = sqliteTable("test", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
});

// 收藏夹表
export const favoriteCollections = sqliteTable("favorite_collections", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

// 单词表
export const words = sqliteTable("words", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  word: text("word").notNull(),
  meaning: text("meaning").notNull(),
  partOfSpeech: text("part_of_speech"), // 词性（可选）
  collectionId: integer("collection_id")
    .notNull()
    .references(() => favoriteCollections.id, { onDelete: "cascade" }), // 删除收藏夹时级联删除单词
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});