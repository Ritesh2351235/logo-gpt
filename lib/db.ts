import { PrismaClient } from "@/lib/generated/prisma";

// Initialize Prisma client globally
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// User service
export const userService = {
  async findOrCreateUser(clerkId: string, email: string) {
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
        },
      });
    }

    return user;
  },

  async getUserByClerkId(clerkId: string) {
    return prisma.user.findUnique({
      where: { clerkId },
    });
  },
};

// Logo service
export const logoService = {
  async createLogo(userId: string, prompt: string, imageUrl: string) {
    return prisma.logo.create({
      data: {
        prompt,
        imageUrl,
        userId,
      },
    });
  },

  async getLogosByUserId(userId: string) {
    return prisma.logo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async deleteLogo(id: string, userId: string) {
    return prisma.logo.deleteMany({
      where: {
        id,
        userId,
      },
    });
  },
}; 