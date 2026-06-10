import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,  // baca dari .env
  },
  migrations: {
    seed: 'node ./prisma/seed.js',
  },
})