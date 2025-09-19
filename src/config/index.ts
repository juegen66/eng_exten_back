type AppConfig = {
  REQUIRE_AUTH: boolean
  API_TOKEN?: string
  JWT_SECRET: string
  JWT_EXPIRES_IN: string
}

export const loadConfig = (env: { 
  REQUIRE_AUTH?: string; 
  API_TOKEN?: string;
  JWT_SECRET?: string;
  JWT_EXPIRES_IN?: string;
}): AppConfig => {
  return {
    REQUIRE_AUTH: env.REQUIRE_AUTH === '1',
    API_TOKEN: env.API_TOKEN,
    JWT_SECRET: env.JWT_SECRET || 'hono_jwt_secret_key_2024_random_generated_string_abcdef123456789',
    JWT_EXPIRES_IN: env.JWT_EXPIRES_IN || '7d',
  }
}
