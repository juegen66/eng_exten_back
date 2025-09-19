import { Hono } from 'hono'
import { servicesMiddleware } from '../../middleware/services'
import type { CreateUserInput, UpdateUserInput, AppContext } from '../../types'

const user = new Hono<AppContext>()

// Use the service injection middleware
user.use('*', servicesMiddleware)

// GET /api/v1/users - Get all users
user.get('/', async (c) => {
  try {
    const userService = c.get('userService')
    const users = await userService.listUsers()
    return c.json({ users })
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500)
  }
})

// GET /api/v1/users/:id - Get a specific user
user.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    const userService = c.get('userService')
    const user = await userService.getUserById(id)
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user })
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid user ID') {
      return c.json({ error: 'Invalid user ID' }, 400)
    }
    return c.json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500)
  }
})

// GET /api/v1/users/:id/public - Get public user information
user.get('/:id/public', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    const userService = c.get('userService')
    const userInfo = await userService.getPublicUserInfo(id)
    
    if (!userInfo) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    return c.json({ user: userInfo })
  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid user ID') {
      return c.json({ error: 'Invalid user ID' }, 400)
    }
    return c.json({ error: error instanceof Error ? error.message : 'Internal server error' }, 500)
  }
})

// POST /api/v1/users - Create a new user
user.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { username, email, passwordHash, salt, firstName, lastName, displayName, phone } = body
    
    const userData: CreateUserInput = {
      username,
      email,
      passwordHash,
      salt,
      firstName,
      lastName,
      displayName,
      phone
    }
    
    const userService = c.get('userService')
    const newUser = await userService.createUser(userData)
    
    return c.json({ user: newUser }, 201)
  } catch (error) {
    if (error instanceof Error) {
      // Handle business logic errors
      if (error.message.includes('required') || 
          error.message.includes('Invalid') || 
          error.message.includes('already exists') ||
          error.message.includes('must be')) {
        return c.json({ error: error.message }, 400)
      }
    }
    return c.json({ error: error instanceof Error ? error.message : 'Failed to create user' }, 500)
  }
})

// PUT /api/v1/users/:id - Update user information
user.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    const body = await c.req.json()
    const updateData: UpdateUserInput = body
    
    const userService = c.get('userService')
    const updatedUser = await userService.updateUser(id, updateData)
    
    if (!updatedUser) {
      return c.json({ error: 'Update failed' }, 500)
    }
    
    return c.json({ user: updatedUser })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid user ID') {
        return c.json({ error: 'Invalid user ID' }, 400)
      }
      if (error.message === 'User not found') {
        return c.json({ error: 'User not found' }, 404)
      }
      if (error.message.includes('already exists')) {
        return c.json({ error: error.message }, 409)
      }
    }
    return c.json({ error: error instanceof Error ? error.message : 'Update failed' }, 500)
  }
})

// DELETE /api/v1/users/:id - Delete a user (soft delete)
user.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    const userService = c.get('userService')
    const success = await userService.deleteUser(id)
    
    if (!success) {
      return c.json({ error: 'Delete failed' }, 500)
    }
    
    return c.json({ message: 'User deleted successfully' })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid user ID') {
        return c.json({ error: 'Invalid user ID' }, 400)
      }
      if (error.message === 'User not found') {
        return c.json({ error: 'User not found' }, 404)
      }
      if (error.message === 'User already deleted') {
        return c.json({ error: 'User already deleted' }, 409)
      }
    }
    return c.json({ error: error instanceof Error ? error.message : 'Delete failed' }, 500)
  }
})

// POST /api/v1/users/:id/verify-email - Verify user email
user.post('/:id/verify-email', async (c) => {
  try {
    const id = parseInt(c.req.param('id'))
    
    const userService = c.get('userService')
    const success = await userService.verifyEmail(id)
    
    if (!success) {
      return c.json({ error: 'Email verification failed' }, 500)
    }
    
    return c.json({ message: 'Email verified successfully' })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid user ID') {
        return c.json({ error: 'Invalid user ID' }, 400)
      }
      if (error.message === 'User not found') {
        return c.json({ error: 'User not found' }, 404)
      }
      if (error.message === 'Email already verified') {
        return c.json({ error: 'Email already verified' }, 409)
      }
    }
    return c.json({ error: error instanceof Error ? error.message : 'Email verification failed' }, 500)
  }
})

export default user