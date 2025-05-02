import { PrismaClient } from "@/lib/generated/prisma";

// Debug log for database connection
function logDatabaseConnection() {
  console.log('Database connection attempt:');
  // Log a safe version of the connection string (hide credentials)
  const dbUrl = process.env.DATABASE_URL || 'not set';
  const safeUrl = dbUrl.replace(/(postgresql:\/\/[^:]+:)[^@]+(@.+)/, '$1*****$2');
  console.log('Database URL:', safeUrl);

  // Check if running on Vercel
  console.log('Running on Vercel:', !!process.env.VERCEL);
  console.log('Node environment:', process.env.NODE_ENV);
}

// Initialize Prisma client globally
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Log connection info
logDatabaseConnection();

// Test database connection on startup
(async () => {
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Database connection successful');
  } catch (e) {
    console.error('Database connection failed:', e);
  }
})();

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
          credits: 1, // Default 1 credit on signup
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

  async updateUserCredits(userId: string, creditsToAdd: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        credits: user.credits + creditsToAdd,
      },
    });
  },

  async decrementUserCredits(userId: string, amount: number = 1) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.credits < amount) {
      throw new Error("Insufficient credits");
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        credits: user.credits - amount,
      },
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