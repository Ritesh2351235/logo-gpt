import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export async function POST(request: NextRequest) {
  try {
    const { amount, currency, receipt_id } = await request.json();

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: "receipt_" + Math.random().toString(36).substring(2, 15),
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