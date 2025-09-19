import {
  sqliteTable,
  integer,
  text,
  index,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 定义 User 表
export const userTable = sqliteTable(
  'user',
  {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    username: text('username').notNull(),
    password: text('password').notNull(),
    nickname: text('nickname'),
    userType: integer('user_type').default(2).notNull(),
    userEmail: text('user_email').unique(),
    userStatus: integer('user_status').default(1).notNull(),
    userPhone: text('user_phone').unique(),
    loginTime: integer('login_time', { mode: 'timestamp' }),
    avatar: text('avatar'),
    sex: integer('sex').default(0),
    remarks: text('remarks'),
    clientHost: text('client_host'),
  },
  (table) => ({
    usernameIdx: index('user_username_idx').on(table.username),
    userEmailIdx: index('user_user_email_idx').on(table.userEmail),
    userPhoneIdx: index('user_user_phone_idx').on(table.userPhone),
  }),
);

// 定义 EmailVerificationCode 表
export const emailVerificationCodeTable = sqliteTable(
  'email_verification_code',
  {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    email: text('email').notNull(),
    code: text('code').notNull(),
    purpose: text('purpose').default('register').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
      sql`(CURRENT_TIMESTAMP)`,
    ).notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    emailPurposeIdx: index('email_verification_code_email_purpose_idx').on(
      table.email,
      table.purpose,
    ),
  }),
);