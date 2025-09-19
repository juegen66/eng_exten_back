import bcrypt from 'bcryptjs'
import { sign, verify } from 'hono/jwt'
import type { Database } from '../data/database'
import { UserRepository } from '../data/user.repository'
import {getDatabase} from '../data/database'
import type { 
  User, 
  CreateUserInput, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  JWTPayload,
  GenderType,
  UserRoleType
} from '../types'

/**
 * Authentication Service Class
 * Responsible for business logic related to user authentication, including login, registration, JWT generation, and validation.
 */
export class AuthService {
  private userRepository: UserRepository
  private jwtSecret: string
  private jwtExpiresIn: string

  constructor(db: Database, jwtSecret: string, jwtExpiresIn: string = '7d') {
    this.userRepository = new UserRepository(db)
    this.jwtSecret = jwtSecret
    this.jwtExpiresIn = jwtExpiresIn
  }

  /**
   * User registration.
   */
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    // Validate input data
    this.validateRegisterInput(registerData)

    // Check if username and email already exist
    const [usernameExists, emailExists] = await Promise.all([
      this.userRepository.usernameExists(registerData.username),
      this.userRepository.emailExists(registerData.email)
    ])

    if (usernameExists) {
      throw new Error('Username already exists')
    }

    if (emailExists) {
      throw new Error('Email already exists')
    }

    // Generate password hash and salt
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(registerData.password, salt)

    // Create user data
    const createUserData: CreateUserInput = {
      username: registerData.username.trim(),
      email: registerData.email.toLowerCase().trim(),
      passwordHash,
      salt,
      firstName: registerData.firstName?.trim(),
      lastName: registerData.lastName?.trim(),
      displayName: registerData.displayName?.trim() || registerData.username.trim(),
      gender: registerData.gender,
      phone: registerData.phone?.trim()
    }

    // Create the user
    const user = await this.userRepository.create(createUserData)

    // Generate JWT token
    const token = await this.generateToken(user)

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        gender: user.gender as GenderType,
        role: user.role as UserRoleType
      }
    }
  }

  /**
   * User login.
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    // Validate input data
    this.validateLoginInput(loginData)

    // Get user authentication info (supports username or email login)
    const user = await this.userRepository.getLoginInfo(loginData.username.trim())
    
    if (!user) {
      throw new Error('Incorrect username or password')
    }

    // Validate user status
    if (user.status !== 'active') {
      throw new Error('Account is disabled')
    }

    // Get full user info to retrieve password hash
    const fullUser = await this.userRepository.findById(user.id)
    if (!fullUser) {
      throw new Error('User not found')
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(loginData.password, fullUser.passwordHash)
    if (!isValidPassword) {
      throw new Error('Incorrect username or password')
    }

    // Record login information
    await this.userRepository.updateLastLogin(user.id)

    // Generate JWT token
    const token = await this.generateToken(fullUser)

    return {
      token,
      user: {
        id: fullUser.id,
        username: fullUser.username,
        email: fullUser.email,
        gender: fullUser.gender as GenderType,
        role: fullUser.role as UserRoleType
      }
    }
  }

  /**
   * Verify JWT token.
   */
  async verifyToken(token: string): Promise<JWTPayload> {
    try {
      const payload = await verify(token, this.jwtSecret) as JWTPayload
      
      // Verify that the user still exists and is active
      const user = await this.userRepository.findById(payload.userId)
      if (!user || user.status !== 'active') {
        throw new Error('User not found or is disabled')
      }

      return payload
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  /**
   * Generate JWT token.
   */
  private async generateToken(user: User): Promise<string> {
    const now = Math.floor(Date.now() / 1000)
    const expiresIn = this.parseExpiresIn(this.jwtExpiresIn)
    
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      gender: user.gender as GenderType,
      role: user.role as UserRoleType,
      iat: now,
      exp: now + expiresIn
    }

    return await sign(payload, this.jwtSecret)
  }

  /**
   * Parse expiration time string.
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([dhms])$/)
    if (!match) {
      throw new Error('Invalid expiration time format')
    }

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's': return value
      case 'm': return value * 60
      case 'h': return value * 60 * 60
      case 'd': return value * 60 * 60 * 24
      default: throw new Error('Invalid time unit')
    }
  }

  /**
   * Validate registration input.
   */
  private validateRegisterInput(data: RegisterRequest): void {
    if (!data.username || data.username.trim().length === 0) {
      throw new Error('Username cannot be empty')
    }

    if (data.username.length < 3) {
      throw new Error('Username must be at least 3 characters long')
    }

    if (data.username.length > 50) {
      throw new Error('Username must not exceed 50 characters')
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Please enter a valid email address')
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    if (data.password.length > 100) {
      throw new Error('Password must not exceed 100 characters')
    }

    // Validate gender field
    if (data.gender && !['male', 'female', 'other'].includes(data.gender)) {
      throw new Error('Invalid value for gender field')
    }
  }

  /**
   * Validate login input.
   */
  private validateLoginInput(data: LoginRequest): void {
    if (!data.username || data.username.trim().length === 0) {
      throw new Error('Username cannot be empty')
    }

    if (!data.password || data.password.length === 0) {
      throw new Error('Password cannot be empty')
    }
  }

  /**
   * Validate email format.
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Refresh token (optional feature).
   */
  async refreshToken(oldToken: string): Promise<string> {
    const payload = await this.verifyToken(oldToken)
    const user = await this.userRepository.findById(payload.userId)
    
    if (!user) {
      throw new Error('User not found')
    }

    return await this.generateToken(user)
  }

  /**
   * Change password.
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Validate old password
    const isValidOldPassword = await bcrypt.compare(oldPassword, user.passwordHash)
    if (!isValidOldPassword) {
      throw new Error('Incorrect old password')
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long')
    }

    // Generate new password hash
    const salt = await bcrypt.genSalt(12)
    const newPasswordHash = await bcrypt.hash(newPassword, salt)

    // Update password
    return await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
      salt
    }) !== undefined
  }
}

