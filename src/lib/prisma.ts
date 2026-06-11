import { PrismaClient } from '@prisma/client';

// Pola Singleton untuk mencegah banyak instance PrismaClient di mode pengembangan
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'], // Opsional: untuk membantu debugging
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}