import prismaClient from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis;
const { PrismaClient } = prismaClient;

if (!globalForPrisma.prisma) {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;
