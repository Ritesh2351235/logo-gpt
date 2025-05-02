import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Log environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      databaseUrlSet: !!process.env.DATABASE_URL,
      // Create a safe masked version of the database URL
      databaseUrl: process.env.DATABASE_URL
        ? process.env.DATABASE_URL.replace(/(postgresql:\/\/[^:]+:)[^@]+(@.+)/, '$1*****$2')
        : 'not set'
    };

    // Test connection with a simple query
    const testResult = await prisma.$queryRaw`SELECT 1 as result`;

    // If we get here, the connection was successful
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      env: envInfo,
      testResult
    });
  } catch (error: any) {
    // Connection failed
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      env: {
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        databaseUrlSet: !!process.env.DATABASE_URL
      }
    }, { status: 500 });
  }
} 