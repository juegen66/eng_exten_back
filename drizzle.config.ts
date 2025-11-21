import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./src/data/schema.ts', './src/data/auth-schema.ts'],
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/aa445d73-37e2-458c-bd97-fc5ebb4c44d1.sqlite',
  },
})
