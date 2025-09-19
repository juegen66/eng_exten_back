// Domain enums
export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const

export const UserRole = {
  USER: 'user',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  SUPER_ADMIN: 'super_admin',
} as const

export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const

export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const

// Enum types
export type UserStatusType = typeof UserStatus[keyof typeof UserStatus]
export type UserRoleType = typeof UserRole[keyof typeof UserRole]
export type ThemeType = typeof Theme[keyof typeof Theme]
export type GenderType = typeof Gender[keyof typeof Gender]

// Domain User (decoupled from DB schema)
export type User = {
  id: number
  username: string
  email?: string
  role: UserRoleType
  status: UserStatusType
  emailVerified?: boolean
  passwordHash?: string
  gender?: GenderType
  nickname?: string
  avatar?: string
  userType?: number
  userPhone?: string
  sex?: number
  remarks?: string
  clientHost?: string
  loginTime?: Date
}

// Create/Update inputs (kept for current routes/service compatibility)
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

export type UpdateUserInput = Partial<{
  username: string
  email: string
  passwordHash: string
  salt: string
  firstName?: string
  lastName?: string
  displayName?: string
  gender?: GenderType
  phone?: string
}>

// Auth/public view models
export type UserLoginInfo = {
  id: number
  username: string
  email: string
  role: UserRoleType
  status: UserStatusType
  emailVerified: boolean
}

export type UserPublicInfo = {
  id: number
  username: string
  displayName?: string
  avatar?: string
  bio?: string
  createdAt?: Date
}

// Misc models (left for completeness)
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

export type UserPreferences = {
  language: string
  timezone: string
  theme: ThemeType
}

export type UserSecurity = {
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  recoveryToken?: string
  recoveryTokenExpiresAt?: Date
  lastLoginAt?: Date
  lastLoginIp?: string
  loginCount?: number
}

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
  preferences?: UserPreferences
  createdAt?: Date
  updatedAt?: Date
}

export type JWTPayload = {
  userId: number
  username: string
  gender?: GenderType
  role: UserRoleType
  iat?: number
  exp?: number
}

export type LoginRequest = {
  username: string
  password: string
}

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


