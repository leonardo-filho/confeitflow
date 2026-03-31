import 'server-only'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  // DATABASE_URL should be an absolute path or relative to the project root
  const dbPath = process.env.DATABASE_URL?.replace('file:./', '')
    || process.env.DATABASE_URL?.replace('file:', '')
    || 'dev.db'

  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  return new PrismaClient({ adapter, errorFormat: 'minimal' })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
