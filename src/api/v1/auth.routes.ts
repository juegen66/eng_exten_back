import { Hono } from 'hono'
import type { Context } from 'hono'
import { requireAuth, getCurrentUser } from '../../middleware/auth'
import type { LoginRequest, RegisterRequest } from '../../types'
import { z } from 'zod'
import { validateJson } from '../../tools/zod.tools'
import { AuthService } from '../../core/auth.service'

const authRoutes = new Hono()

const RegisterSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  displayName: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().optional()
})

const LoginSchema = z.object({
  username: z.string().min(1, 'Username cannot be empty'),
  password: z.string().min(1, 'Password cannot be empty')
})

const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password cannot be empty'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100, 'New password must not exceed 100 characters')
})

const VerifyTokenSchema = z.object({
  token: z.string().min(1, 'Token cannot be empty')
})





/**
 * POST /auth/register - User registration
 */
authRoutes.post('/register', validateJson(RegisterSchema), async (c: Context) => {
  try {
    // Get auth service instance
    const authService = c.get('authService')

   
    // Parse request data (already validated by middleware)
    const registerData: RegisterRequest = await c.req.json()

    const result = await authService.register(registerData)


    return c.json({
      success: true,
      message: 'Registration successful',
      data: result
    }, 201)

  } catch (error) {
    console.error('Registration error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    }, 400)
  }
})

/**
 * POST /auth/login - User login
 */
authRoutes.post('/login', validateJson(LoginSchema), async (c: Context) => {
  try {
    // Get auth service instance
    const authService = c.get('authService')

    // Parse request data
    const loginData: LoginRequest = await c.req.json()

    // Execute login
    const result = await authService.login(loginData)

    return c.json({
      success: true,
      message: 'Login successful',
      data: result
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    }, 401)
  }
})

/**
 * POST /auth/refresh - Refresh token
 */
authRoutes.post('/refresh', requireAuth, async (c: Context) => {
  try {
    // Get auth service instance
    const authService = c.get('authService')

    const authHeader = c.req.header('authorization')
    const token = authHeader?.replace(/^Bearer\s+/i, '') || ''

    // Refresh the token
    const newToken = await authService.refreshToken(token)

    return c.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token: newToken }
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed'
    }, 401)
  }
})

/**
 * GET /auth/me - Get current user information
 */
authRoutes.get('/me', requireAuth, async (c: Context) => {
  try {
    const services = c.get('services')
    if (!services) {
      return c.json({ error: 'Service container not initialized' }, 500)
    }

    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'User not logged in' }, 401)
    }

    // Get full user information
    const userService = services.userService
    const fullUser = await userService.getUserById(user.userId)

    if (!fullUser) {
      return c.json({ error: 'User not found' }, 404)
    }

    // Return public user information
    const publicInfo = await userService.getPublicUserInfo(user.userId)

    return c.json({
      success: true,
      data: {
        ...publicInfo,
        email: fullUser.email,
        gender: fullUser.gender,
        role: fullUser.role,
        status: fullUser.status,
        emailVerified: fullUser.emailVerified,
        lastLoginAt: fullUser.lastLoginAt,
        loginCount: fullUser.loginCount
      }
    })

  } catch (error) {
    console.error('Get current user error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get user information'
    }, 500)
  }
})

/**
 * POST /auth/change-password - Change password
 */
authRoutes.post('/change-password', requireAuth, validateJson(ChangePasswordSchema), async (c: Context) => {
  try {
    // Get auth service instance
    const authService = c.get('authService')

    const user = getCurrentUser(c)
    if (!user) {
      return c.json({ error: 'User not logged in' }, 401)
    }

    const { oldPassword, newPassword } = await c.req.json()

    // Change the password
    await authService.changePassword(user.userId, oldPassword, newPassword)

    return c.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change password'
    }, 400)
  }
})

/**
 * POST /auth/verify-token - Verify token validity
 */
authRoutes.post('/verify-token', validateJson(VerifyTokenSchema), async (c: Context) => {
  try {
    // Get auth service instance
    const authService = c.get('authService')

    const { token } = await c.req.json()

    // Verify the token
    const payload = await authService.verifyToken(token)

    return c.json({
      success: true,
      message: 'Token is valid',
      data: {
        userId: payload.userId,
        username: payload.username,
        gender: payload.gender,
        role: payload.role,
        exp: payload.exp
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Token verification failed'
    }, 401)
  }
})

/**
 * POST /auth/logout - User logout (client-side handling, server just returns success)
 */
authRoutes.post('/logout', requireAuth, async (c: Context) => {
  // JWT is stateless, logout is mainly handled by deleting the token on the client-side
  // Logout event can be logged or other actions can be performed here
  return c.json({
    success: true,
    message: 'Logout successful'
  })
})

export { authRoutes }