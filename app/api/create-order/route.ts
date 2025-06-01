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

// --- Live USD to INR conversion with caching ---
let cachedUsdToInrRate: number | undefined = undefined;
let cachedUsdToInrTimestamp: number | undefined = undefined;
const CACHE_DURATION_MS = 10 * 60 * 1000;

async function getUsdToInrRate(): Promise<number> {
  const now = Date.now();
  if (cachedUsdToInrRate !== undefined && cachedUsdToInrTimestamp !== undefined && now - cachedUsdToInrTimestamp < CACHE_DURATION_MS) {
    return cachedUsdToInrRate;
  }
  const accessKey = process.env.EXCHANGE_RATE_HOST_ACCESS_KEY;
  const url = `https://api.exchangerate.host/live?access_key=${accessKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch USD to INR rate");
  const data = await res.json();
  if (!data.success || !data.quotes || !data.quotes.USDINR) throw new Error("Invalid rate data");
  cachedUsdToInrRate = data.quotes.USDINR;
  cachedUsdToInrTimestamp = now;
  if (cachedUsdToInrRate === undefined) throw new Error("USD to INR rate is undefined");
  return cachedUsdToInrRate;
}

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
    let amountInINR = selectedPlan.amount;

    if (displayCurrency === "USD") {
      // Use live USD to INR rate
      const rate = await getUsdToInrRate();
      amountInINR = Math.round(selectedPlan.amount * rate);
    } else if (displayCurrency === "INR") {
      amountInINR = selectedPlan.amount;
    }

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