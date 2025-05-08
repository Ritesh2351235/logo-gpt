import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { generateLogo, editImage } from "@/lib/openai";
import { prisma, userService } from "@/lib/db";

// Set timeout to 60 seconds (maximum allowed on Vercel hobby plan)
export const maxDuration = 60; // seconds

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
    const { prompt, imageBase64 } = body;

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

    // Determine whether to generate a new logo or edit an existing image
    const isImageEdit = !!imageBase64;
    console.log(`Starting ${isImageEdit ? 'image edit' : 'logo generation'} with prompt:`, prompt);

    if (isImageEdit) {
      console.log(`Image data received: ${imageBase64.substring(0, 50)}... (truncated)`);
      console.log(`Image data length: ${imageBase64.length} characters`);
    }

    // Run logo generation or image editing with try-catch to handle timeouts and network errors
    let imageUrl;
    try {
      if (isImageEdit) {
        // Edit the existing image
        imageUrl = await editImage(imageBase64, prompt);
        console.log("Image edit successful");
        console.log("Image URL returned:", imageUrl ? `${imageUrl.substring(0, 50)}... (truncated, length: ${imageUrl.length})` : "No URL returned");
      } else {
        // Generate a new logo
        imageUrl = await generateLogo(prompt);
        console.log("Logo generation successful");
      }

      if (!imageUrl) {
        throw new Error(`No image URL returned from ${isImageEdit ? 'edit' : 'generation'}`);
      }
    } catch (error: any) {
      console.error(`${isImageEdit ? 'Image edit' : 'Logo generation'} error:`, error.message);
      return NextResponse.json(
        { error: `Failed to ${isImageEdit ? 'edit image' : 'generate logo'}: ${error.message}` },
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
      { error: error.message || "Failed to generate or edit logo" },
      { status: error.status || 500 }
    );
  }
} 