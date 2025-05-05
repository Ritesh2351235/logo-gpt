import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Define plans with fixed pricing
const PLANS = {
  starter: { amount: 5, credits: 30 },
  pro: { amount: 10, credits: 80 },
};

// Define currency conversion for INR
const USD_TO_INR_CONVERSION = 83; // Approximate conversion rate

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { displayCurrency, plan } = await request.json();

    // Validate plan
    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Get the amount from the selected plan
    const selectedPlan = PLANS[plan as keyof typeof PLANS];
    
    // Always convert to INR for the actual payment
    const amountInINR = Math.round(selectedPlan.amount * USD_TO_INR_CONVERSION);

    // Create receipt ID
    const receiptId = "receipt_" + Math.random().toString(36).substring(2, 15);

    const order = await razorpay.orders.create({
      amount: amountInINR * 100, // Convert to smallest currency unit
      currency: "INR", // Always use INR for Razorpay
      receipt: receiptId,
      notes: {
        planId: plan,
        credits: selectedPlan.credits,
        userId: clerkId,
        displayCurrency: displayCurrency, // Store original display currency
      },
    });

    return NextResponse.json({
      orderId: order.id,
      plan: plan,
      amount: amountInINR,
      credits: selectedPlan.credits
    }, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}