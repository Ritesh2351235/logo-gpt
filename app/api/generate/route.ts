import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { generateLogo } from "@/lib/openai";
import { prisma, userService } from "@/lib/db";

// Set a longer timeout (120 seconds) for image generation
export const maxDuration = 120; // seconds

export async function POST(req: Request) {
  try {
    // Debug: Log the request headers
    console.log("API Request Headers:", Object.fromEntries(req.headers.entries()));

    const user = await currentUser();

    // Debug: Log the auth result
    console.log("Auth result:", { clerkId: user?.id });

    if (!user || !user.id) {
      console.log("Unauthorized: No user found");
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated" },
        { status: 401 }
      );
    }

    const clerkId = user.id;

    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Get the user's email from Clerk
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Find or create user
    const dbUser = await userService.findOrCreateUser(clerkId, email);

    // Check if user has enough credits
    if (dbUser.credits < 1) {
      return NextResponse.json(
        { error: "Insufficient credits. Please purchase more credits to continue." },
        { status: 403 }
      );
    }

    console.log("Starting logo generation with prompt:", prompt);

    // Run logo generation with try-catch to handle timeouts and network errors
    let imageUrl;
    try {
      imageUrl = await generateLogo(prompt);
      console.log("Logo generation successful");
    } catch (error: any) {
      console.error("Logo generation error:", error.message);
      return NextResponse.json(
        { error: `Failed to generate logo: ${error.message}` },
        { status: 500 }
      );
    }

    try {
      // Decrease user credits
      await userService.decrementUserCredits(dbUser.id);
    } catch (error) {
      console.error("Error decreasing credits:", error);
      // Continue execution even if credit decrement fails
    }

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error("[LOGO_GENERATION_ERROR]", {
      error: error.message,
      status: error.status,
      stack: error.stack,
    });

    // Return a more informative error response
    return NextResponse.json(
      { error: error.message || "Failed to generate logo" },
      { status: error.status || 500 }
    );
  }
} 