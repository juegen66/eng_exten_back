import type { users } from '../data/schema'

// User status enum
export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive', 
  SUSPENDED: 'suspended',
  DELETED: 'deleted'
} as const

// User role enum  
export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPER_ADMIN: 'super_admin'
} as const

// Theme enum
export const Theme = {
  LIGHT: 'light',
  DARK: 'dark', 
  AUTO: 'auto'
} as const

// Gender enum
export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
} as const

// Basic type definitions
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserStatusType = typeof UserStatus[keyof typeof UserStatus]
export type UserRoleType = typeof UserRole[keyof typeof UserRole]
export type ThemeType = typeof Theme[keyof typeof Theme]
export type GenderType = typeof Gender[keyof typeof Gender]

// Type for required fields when creating a user
export type CreateUserInput = {
  username: string
  email: string
  passwordHash: string
  salt: string
  firstName?: string
  lastName?: string
  displayName?: string
  gender?: GenderType
  phone?: string
}

// Type for optional fields when updating a user
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> & {
  updatedAt?: Date
}

// Type for user login information
export type UserLoginInfo = {
  id: number
  username: string
  email: string
  role: UserRoleType
  status: UserStatusType
  emailVerified: boolean
}

// Type for public user information (without sensitive data)
export type UserPublicInfo = Pick<User, 
  'id' | 'username' | 'displayName' | 'avatar' | 'bio' | 'createdAt'
>

// User authentication related types
export type UserAuth = {
  id: number
  username: string
  email: string
  passwordHash: string
  salt: string
  role: UserRoleType
  status: UserStatusType
  emailVerified: boolean
  twoFactorEnabled: boolean
}

// Type for user preferences
export type UserPreferences = {
  language: string
  timezone: string
  theme: ThemeType
}

// Type for user security information
export type UserSecurity = {
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  recoveryToken?: string
  recoveryTokenExpiresAt?: Date
  lastLoginAt?: Date
  lastLoginIp?: string
  loginCount: number
}

// Type for complete user profile
export type UserProfile = {
  id: number
  username: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  gender?: GenderType
  avatar?: string
  bio?: string
  phone?: string
  address?: string
  preferences: UserPreferences
  createdAt: Date
  updatedAt: Date
}

// JWT Payload type
export type JWTPayload = {
  userId: number
  username: string
  gender?: GenderType
  role: UserRoleType
  iat?: number
  exp?: number
}

// Login request type
export type LoginRequest = {
  username: string
  password: string
}

// Registration request type
export type RegisterRequest = {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
  displayName?: string
  gender?: GenderType
  phone?: string
}

// Authentication response type
export type AuthResponse = {
  token: string
  user: {
    id: number
    username: string
    email: string
    gender?: GenderType
    role: UserRoleType
  }
}