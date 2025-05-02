import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { userService } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const clerkId = user.id;

    // Try to find the user in our database
    const dbUser = await userService.getUserByClerkId(clerkId);

    // If user doesn't exist yet, create one
    if (!dbUser) {
      // Get the user's email from Clerk
      const email = user.emailAddresses[0]?.emailAddress;

      if (!email) {
        return NextResponse.json(
          { error: "User email not found" },
          { status: 400 }
        );
      }

      // Create a new user
      const newUser = await userService.findOrCreateUser(clerkId, email);

      return NextResponse.json({
        id: newUser.id,
        email: newUser.email,
        credits: newUser.credits,
        createdAt: newUser.createdAt
      });
    }

    return NextResponse.json({
      id: dbUser.id,
      email: dbUser.email,
      credits: dbUser.credits,
      createdAt: dbUser.createdAt
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
} 