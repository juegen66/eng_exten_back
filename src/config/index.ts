type AppConfig = {
  REQUIRE_AUTH: boolean
  API_TOKEN?: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  CORS_ORIGIN: string
}

export const loadConfig = (env: {
  REQUIRE_AUTH?: string;
  API_TOKEN?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  CORS_ORIGIN?: string;
}): AppConfig => {
  return {
    REQUIRE_AUTH: env.REQUIRE_AUTH === '1',
    API_TOKEN: env.API_TOKEN,
    JWT_SECRET: env.JWT_SECRET || 'hono_jwt_secret_key_2024_random_generated_string_abcdef123456789',
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN || '7d',
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET || 'better-auth-secret-key-change-this-in-production',
    BETTER_AUTH_URL: env.BETTER_AUTH_URL || 'http://localhost:8787',
    CORS_ORIGIN: env.CORS_ORIGIN || 'http://localhost:3000',
  }
}
