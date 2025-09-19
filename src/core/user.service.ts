import type { Database } from '../data/database'
import { UserRepository } from '../data/user.repository'
import type { User, CreateUserInput, UpdateUserInput, UserLoginInfo, UserPublicInfo, UserRoleType, UserStatusType } from '../types'

/**
 * User Business Logic Layer
 * Responsible for handling and validating user-related business logic.
 */
export class UserService {
  private userRepository: UserRepository

  constructor(db: Database) {
    this.userRepository = new UserRepository(db)
  }

  /**
   * Get all users.
   */
  async listUsers(): Promise<User[]> {
    return await this.userRepository.findAll()
  }

  /**
   * Get a user by ID.
   */
  async getUserById(id: number): Promise<User | undefined> {
    if (id <= 0) {
      throw new Error('Invalid user ID')
    }
    return await this.userRepository.findById(id)
  }

  /**
   * Get a user by username.
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username || username.trim().length === 0) {
      throw new Error('Username cannot be empty')
    }
    return await this.userRepository.findByUsername(username.trim())
  }

  /**
   * Get a user by email.
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email || !this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }
    return await this.userRepository.findByEmail(email.toLowerCase())
  }

  /**
   * Create a new user (with validation).
   */
  async createUser(userData: CreateUserInput): Promise<User> {
    // Validate required fields
    this.validateCreateUserInput(userData)

    // Check if username already exists
    const usernameExists = await this.userRepository.usernameExists(userData.username)
    if (usernameExists) {
      throw new Error('Username already exists')
    }

    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(userData.email)
    if (emailExists) {
      throw new Error('Email already exists')
    }

    // Normalize data
    const normalizedData = {
      ...userData,
      username: userData.username.trim(),
      email: userData.email.toLowerCase(),
      firstName: userData.firstName?.trim(),
      lastName: userData.lastName?.trim(),
      displayName: userData.displayName?.trim(),
    }

    return await this.userRepository.create(normalizedData)
  }

  /**
   * Update user information.
   */
  async updateUser(id: number, userData: UpdateUserInput): Promise<User | undefined> {
    if (id <= 0) {
      throw new Error('Invalid user ID')
    }

    // Check if user exists
    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new Error('User not found')
    }

    // If updating username, check for conflicts
    if (userData.username && userData.username !== existingUser.username) {
      const usernameExists = await this.userRepository.usernameExists(userData.username)
      if (usernameExists) {
        throw new Error('Username already exists')
      }
    }

    // If updating email, check for conflicts
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.userRepository.emailExists(userData.email)
      if (emailExists) {
        throw new Error('Email already exists')
      }
    }

    // Normalize data
    const normalizedData = { ...userData }
    if (normalizedData.username) normalizedData.username = normalizedData.username.trim()
    if (normalizedData.email) normalizedData.email = normalizedData.email.toLowerCase()
    if (normalizedData.firstName) normalizedData.firstName = normalizedData.firstName.trim()
    if (normalizedData.lastName) normalizedData.lastName = normalizedData.lastName.trim()
    if (normalizedData.displayName) normalizedData.displayName = normalizedData.displayName.trim()

    return await this.userRepository.update(id, normalizedData)
  }

  /**
   * Delete a user (soft delete).
   */
  async deleteUser(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error('Invalid user ID')
    }

    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.status === 'deleted') {
      throw new Error('User already deleted')
    }

    return await this.userRepository.softDelete(id)
  }

  /**
   * Get user authentication information.
   */
  async getUserForAuth(identifier: string): Promise<UserLoginInfo | undefined> {
    if (!identifier || identifier.trim().length === 0) {
      throw new Error('Identifier cannot be empty')
    }
    return await this.userRepository.getLoginInfo(identifier.trim())
  }

  /**
   * Get public user information.
   */
  async getPublicUserInfo(id: number): Promise<UserPublicInfo | undefined> {
    if (id <= 0) {
      throw new Error('Invalid user ID')
    }
    return await this.userRepository.getPublicInfo(id)
  }

  /**
   * Verify a user's email.
   */
  async verifyEmail(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error('Invalid user ID')
    }

    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.emailVerified) {
      throw new Error('Email already verified')
    }

    return await this.userRepository.verifyEmail(id)
  }

  /**
   * Record a user login.
   */
  async recordUserLogin(id: number, ip?: string): Promise<boolean> {
    if (id <= 0) {
      throw new Error('Invalid user ID')
    }

    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }

    if (user.status !== 'active') {
      throw new Error('User account is not active')
    }

    return await this.userRepository.updateLastLogin(id, ip)
  }

  /**
   * Get users by role.
   */
  async getUsersByRole(role: UserRoleType): Promise<User[]> {
    return await this.userRepository.findByRole(role)
  }

  /**
   * Get users by status.
   */
  async getUsersByStatus(status: UserStatusType): Promise<User[]> {
    return await this.userRepository.findByStatus(status)
  }

  /**
   * Validate email format.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate input data for creating a user.
   */
  private validateCreateUserInput(userData: CreateUserInput): void {
    if (!userData.username || userData.username.trim().length === 0) {
      throw new Error('Username is required')
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      throw new Error('Valid email is required')
    }

    if (!userData.passwordHash || userData.passwordHash.length === 0) {
      throw new Error('Password hash is required')
    }

    if (!userData.salt || userData.salt.length === 0) {
      throw new Error('Salt is required')
    }

    if (userData.username.length < 3) {
      throw new Error('Username must be at least 3 characters long')
    }

    if (userData.username.length > 50) {
      throw new Error('Username must be less than 50 characters')
    }
  }
}