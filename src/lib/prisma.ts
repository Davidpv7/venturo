import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Next.js dev mode clears the module cache on every file save, which would
// normally create a brand new PrismaClient (and a brand new pool of DB
// connections) on every hot reload. Stashing the instance on `globalThis`
// survives the reload, so dev mode reuses the same client instead of slowly
// exhausting Supabase's connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
