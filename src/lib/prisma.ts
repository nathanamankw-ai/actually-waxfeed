import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Add connection_limit to DATABASE_URL if not present (for serverless)
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || ''

  // If URL already has query params, check if connection_limit exists
  if (url.includes('?')) {
    if (!url.includes('connection_limit')) {
      return `${url}&connection_limit=1`
    }
    return url
  }

  // Add connection_limit for serverless environments
  return `${url}?connection_limit=1`
}

// Configure Prisma client with connection pool limits for serverless
// Each Vercel function instance creates its own client, so we limit connections
// to prevent exhausting the database connection pool
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
})

// Reuse client in development to prevent connection leaks during hot reload
// In production serverless, each function instance manages its own client
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
