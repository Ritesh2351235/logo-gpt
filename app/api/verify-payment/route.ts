import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import { prisma, userService } from "@/lib/db";
import crypto from "crypto";

const PLANS = {
  starter: { amount: 5, credits: 30 },
  pro: { amount: 10, credits: 80 },
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId, orderId, signature, planId } = await request.json();
    if (!paymentId || !orderId || !signature || !planId) {
      return NextResponse.json({ error: "Missing required payment information" }, { status: 400 });
    }

    const plan = PLANS[planId as keyof typeof PLANS];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await userService.updateUserCredits(user.id, plan.credits);

    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: plan.amount,
        credits: plan.credits,
        paymentId,
        orderId,
        status: "completed",
        planId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Payment verified and credits added to your account",
      credits: plan.credits,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
} 