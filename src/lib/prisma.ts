import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configure Prisma client with connection pool limits for serverless
// Each Vercel function instance creates its own client, so we limit connections
// to prevent exhausting the database connection pool
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

// Reuse client in development to prevent connection leaks during hot reload
// In production serverless, each function instance manages its own client
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
