import { eq, or, sql } from 'drizzle-orm'
import type { Database } from './database'
import { userTable } from './schema'
import type { User, CreateUserInput, UpdateUserInput, UserLoginInfo, UserPublicInfo, UserRoleType, UserStatusType } from '../types'

/**
 * User Data Access Layer
 * Responsible for all database operations related to userTable.
 */
export class UserRepository {
  constructor(private db: Database) {}

  /**
   * Find all userTable.
   */
  async findAll(): Promise<User[]> {
    const rows = await this.db.select().from(userTable)
    return rows.map((r) => this.mapRowToDomain(r))
  }

  /**
   * Find a user by ID.
   */
  async findById(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(userTable).where(eq(userTable.id, id))
    if (result.length === 0) return undefined
    return this.mapRowToDomain(result[0])
  }

  /**
   * Find a user by username.
   */
  async findByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(userTable).where(eq(userTable.username, username))
    if (result.length === 0) return undefined
    return this.mapRowToDomain(result[0])
  }

  /**
   * Find a user by email.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(userTable).where(eq(userTable.userEmail, email))
    if (result.length === 0) return undefined
    return this.mapRowToDomain(result[0])
  }

  /**
   * Create a new user.
   */
  async create(userData: CreateUserInput): Promise<User> {
    // Map API input to current schema
    const insertData = {
      username: userData.username,
      password: userData.passwordHash, // store hashed password in `password`
      nickname: userData.displayName || userData.username,
      userType: 2,
      userEmail: userData.email,
      userStatus: 1,
      userPhone: userData.phone,
    }
    const result = await this.db.insert(userTable).values(insertData as any).returning()
    return this.mapRowToDomain(result[0])
  }

  /**
   * Update user information.
   */
  async update(id: number, userData: UpdateUserInput): Promise<User | undefined> {
    // Only map fields that exist in schema
    const setData: Record<string, unknown> = {}
    if (userData.username !== undefined) setData.username = userData.username
    if (userData.passwordHash !== undefined) setData.password = userData.passwordHash
    if ((userData as any).displayName !== undefined) setData.nickname = (userData as any).displayName
    if (userData.email !== undefined) setData.userEmail = userData.email
    if ((userData as any).phone !== undefined) setData.userPhone = (userData as any).phone

    const result = await this.db.update(userTable)
      .set(setData as any)
      .where(eq(userTable.id, id))
      .returning()
    if (result.length === 0) return undefined
    return this.mapRowToDomain(result[0])
  }

  /**
   * Soft delete a user.
   */
  async softDelete(id: number): Promise<boolean> {
    const result = await this.db.update(userTable)
      .set({
        userStatus: 3, // map to deleted
      })
      .where(eq(userTable.id, id))
      .returning()
    return result.length > 0
  }

  /**
   * Get user login information (for authentication).
   */
  async getLoginInfo(identifier: string): Promise<UserLoginInfo | undefined> {
    const result = await this.db.select({
      id: userTable.id,
      username: userTable.username,
      userEmail: userTable.userEmail,
      userStatus: userTable.userStatus,
    }).from(userTable)
      .where(or(eq(userTable.username, identifier), eq(userTable.userEmail, identifier)))

    if (result.length === 0) return undefined

    const row = result[0]
    return {
      id: row.id,
      username: row.username,
      email: row.userEmail ?? '',
      role: 'user',
      status: this.mapStatusToDomain(row.userStatus),
      emailVerified: false,
    }
  }

  /**
   * Get public user information.
   */
  async getPublicInfo(id: number): Promise<UserPublicInfo | undefined> {
    const result = await this.db.select({
      id: userTable.id,
      username: userTable.username,
      nickname: userTable.nickname,
      avatar: userTable.avatar,
    }).from(userTable).where(eq(userTable.id, id))

    if (result.length === 0) return undefined
    const row = result[0]
    return {
      id: row.id,
      username: row.username,
      displayName: row.nickname ?? undefined,
      avatar: row.avatar ?? undefined,
      bio: undefined,
      createdAt: undefined,
    }
  }

  /**
   * Verify a user's email.
   */
  async verifyEmail(id: number): Promise<boolean> {
    // Not supported by current schema; no-op for compatibility
    const result = await this.db.select({ id: userTable.id }).from(userTable).where(eq(userTable.id, id))
    return result.length > 0
  }

  /**
   * Update last login information.
   */
  async updateLastLogin(id: number, ip?: string): Promise<boolean> {
    const result = await this.db.update(userTable)
      .set({
        loginTime: new Date(),
        clientHost: ip,
      })
      .where(eq(userTable.id, id))
      .returning()
    return result.length > 0
  }

  /**
   * Check if a username already exists.
   */
  async usernameExists(username: string): Promise<boolean> {
    const result = await this.db.select({ id: userTable.id }).from(userTable).where(eq(userTable.username, username))
    return result.length > 0
  }

  /**
   * Check if an email already exists.
   */
  async emailExists(email: string): Promise<boolean> {
    const result = await this.db.select({ id: userTable.id }).from(userTable).where(eq(userTable.userEmail, email))
    return result.length > 0
  }

  /**
   * Find userTable by role.
   */
  async findByRole(role: UserRoleType): Promise<User[]> {
    // Role not stored in current schema; return all mapped with default role
    const rows = await this.db.select().from(userTable)
    return rows.map((r) => this.mapRowToDomain(r))
  }

  /**
   * Find userTable by status.
   */
  async findByStatus(status: UserStatusType): Promise<User[]> {
    const code = this.mapStatusToCode(status)
    const rows = await this.db.select().from(userTable).where(eq(userTable.userStatus, code))
    return rows.map((r) => this.mapRowToDomain(r))
  }

  private mapRowToDomain(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.userEmail ?? undefined,
      role: 'user',
      status: this.mapStatusToDomain(row.userStatus),
      emailVerified: false,
      nickname: row.nickname ?? undefined,
      avatar: row.avatar ?? undefined,
      userType: row.userType ?? undefined,
      userPhone: row.userPhone ?? undefined,
      sex: row.sex ?? undefined,
      remarks: row.remarks ?? undefined,
      clientHost: row.clientHost ?? undefined,
      loginTime: row.loginTime ? new Date(row.loginTime) : undefined,
      // expose hashed password for auth flow compatibility
      passwordHash: row.password,
    } as User
  }

  private mapStatusToDomain(userStatus?: number): UserStatusType {
    switch (userStatus) {
      case 0: return 'inactive'
      case 1: return 'active'
      case 2: return 'suspended'
      case 3: return 'deleted'
      default: return 'active'
    }
  }

  private mapStatusToCode(status: UserStatusType): number {
    switch (status) {
      case 'inactive': return 0
      case 'active': return 1
      case 'suspended': return 2
      case 'deleted': return 3
      default: return 1
    }
  }
}