import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma, userService, logoService } from "@/lib/db";
import { uploadImageToS3FromUrl } from "@/lib/s3";

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { prompt, imageUrl } = body;

    if (!prompt || !imageUrl) {
      return new NextResponse("Prompt and imageUrl are required", { status: 400 });
    }

    // Get user email from Clerk
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return new NextResponse("User email not found", { status: 400 });
    }

    // Find or create user with Clerk ID
    const dbUser = await userService.findOrCreateUser(user.id, email);

    // Upload to S3 or local storage
    console.log("Saving logo to storage...");
    const storedImageUrl = await uploadImageToS3FromUrl(imageUrl);

    // Save logo to database
    const logo = await logoService.createLogo(dbUser.id, prompt, storedImageUrl);
    console.log("Logo saved successfully with ID:", logo.id);

    return NextResponse.json(logo);
  } catch (error) {
    console.error("[LOGO_SAVE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find or create user with Clerk ID
    const email = user.emailAddresses[0]?.emailAddress;

    if (!email) {
      return new NextResponse("User email not found", { status: 400 });
    }

    const dbUser = await userService.findOrCreateUser(user.id, email);

    const logos = await logoService.getLogosByUserId(dbUser.id);

    return NextResponse.json(logos);
  } catch (error) {
    console.error("[LOGOS_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 