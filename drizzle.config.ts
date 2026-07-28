import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./src/platform/db/schema/*.ts', './src/templates/*/db/schema/*.ts'],
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL?.replace('file:', '') || './data/erp.db',
  },
});
