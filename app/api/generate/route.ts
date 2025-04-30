import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateLogo } from "@/lib/openai";

export async function POST(req: Request) {
  try {
    // Debug: Log the request headers
    console.log("API Request Headers:", Object.fromEntries(req.headers.entries()));

    const { userId } = await auth();

    // Debug: Log the auth result
    console.log("Auth result:", { userId });

    if (!userId) {
      console.log("Unauthorized: No userId found");
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    console.log("Starting logo generation with prompt:", prompt);
    const imageUrl = await generateLogo(prompt);
    console.log("Logo generation successful");

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