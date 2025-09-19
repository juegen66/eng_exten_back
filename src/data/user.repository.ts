import { eq, or, sql } from 'drizzle-orm'
import type { Database } from './database'
import { userTable } from './schema'
import type { User, NewUser, CreateUserInput, UpdateUserInput, UserLoginInfo, UserPublicInfo, UserRoleType, UserStatusType } from '../types'

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
    return await this.db.select().from(userTable)
  }

  /**
   * Find a user by ID.
   */
  async findById(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(userTable).where(eq(userTable.id, id))
    return result.length > 0 ? result[0] : undefined
  }

  /**
   * Find a user by username.
   */
  async findByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(userTable).where(eq(userTable.username, username))
    return result.length > 0 ? result[0] : undefined
  }

  /**
   * Find a user by email.
   */
  async findByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(userTable).where(eq(userTable.email, email))
    return result.length > 0 ? result[0] : undefined
  }

  /**
   * Create a new user.
   */
  async create(userData: CreateUserInput): Promise<User> {
    const result = await this.db.insert(userTable).values({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()
    return result[0]
  }

  /**
   * Update user information.
   */
  async update(id: number, userData: UpdateUserInput): Promise<User | undefined> {
    const result = await this.db.update(userTable)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, id))
      .returning()
    return result.length > 0 ? result[0] : undefined
  }

  /**
   * Soft delete a user.
   */
  async softDelete(id: number): Promise<boolean> {
    const result = await this.db.update(userTable)
      .set({
        status: 'deleted',
        deletedAt: new Date(),
        updatedAt: new Date(),
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
      email: userTable.email,
      role: userTable.role,
      status: userTable.status,
      emailVerified: userTable.emailVerified,
    }).from(userTable)
      .where(or(eq(userTable.username, identifier), eq(userTable.email, identifier)))
    
    if (result.length === 0) return undefined
    
    const user = result[0]
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as UserLoginInfo['role'],
      status: user.status as UserLoginInfo['status'],
      emailVerified: user.emailVerified,
    }
  }

  /**
   * Get public user information.
   */
  async getPublicInfo(id: number): Promise<UserPublicInfo | undefined> {
    const result = await this.db.select({
      id: userTable.id,
      username: userTable.username,
      displayName: userTable.displayName,
      avatar: userTable.avatar,
      bio: userTable.bio,
      createdAt: userTable.createdAt,
    }).from(userTable).where(eq(userTable.id, id))
    
    return result.length > 0 ? result[0] : undefined
  }

  /**
   * Verify a user's email.
   */
  async verifyEmail(id: number): Promise<boolean> {
    const result = await this.db.update(userTable)
      .set({
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, id))
      .returning()
    return result.length > 0
  }

  /**
   * Update last login information.
   */
  async updateLastLogin(id: number, ip?: string): Promise<boolean> {
    const result = await this.db.update(userTable)
      .set({
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        loginCount: sql`${userTable.loginCount} + 1`,
        updatedAt: new Date(),
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
    const result = await this.db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, email))
    return result.length > 0
  }

  /**
   * Find userTable by role.
   */
  async findByRole(role: UserRoleType): Promise<User[]> {
    return await this.db.select().from(userTable).where(eq(userTable.role, role))
  }

  /**
   * Find userTable by status.
   */
  async findByStatus(status: UserStatusType): Promise<User[]> {
    return await this.db.select().from(userTable).where(eq(userTable.status, status))
  }
}