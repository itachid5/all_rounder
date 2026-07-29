import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./src/platform/db/schema/*.ts', './src/templates/*/db/schema/*.ts'],
  out: './src/db/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL as string,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
