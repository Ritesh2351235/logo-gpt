import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { userService, logoService } from "@/lib/db";
import { deleteImageFromS3 } from "@/lib/s3";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Logo ID is required" }, { status: 400 });
    }

    // Get the user
    const dbUser = await userService.getUserByClerkId(userId);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the logo to check the S3 URL
    const logos = await logoService.getLogosByUserId(dbUser.id);
    const logoToDelete = logos.find(logo => logo.id === id);

    if (!logoToDelete) {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 });
    }

    // Delete from S3
    try {
      await deleteImageFromS3(logoToDelete.imageUrl);
    } catch (error) {
      console.error("Error deleting from S3:", error);
      // Continue execution even if S3 deletion fails
    }

    // Delete from database
    await logoService.deleteLogo(id, dbUser.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[LOGO_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 