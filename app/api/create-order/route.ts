import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Define plans
const PLANS = {
  starter: { amount: 500, credits: 30 },
  pro: { amount: 1000, credits: 80 },
};

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, currency, plan } = await request.json();

    // Validate plan
    if (plan && !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Create receipt ID
    const receiptId = "receipt_" + Math.random().toString(36).substring(2, 15);

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to smallest currency unit
      currency: currency || "INR",
      receipt: receiptId,
      notes: {
        planId: plan,
      },
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}