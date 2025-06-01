import crypto from "crypto";
import { prisma, userService } from "@/lib/db";

// Credit mapping: LemonSqueezy Product IDs -> Plan Details
// Uses environment variables for configured product IDs
const PRODUCT_CREDITS = {
  [process.env.STANDARD_PLAN || "805962"]: {
    credits: 30,
    amount: 299, // $2.99 in cents
    planId: "standard",
    configuredId: process.env.STANDARD_PLAN || "805962"
  }, // Standard Plan from environment
  [process.env.PRO_PLAN || "805971"]: {
    credits: 75,
    amount: 999, // $9.99 in cents
    planId: "pro",
    configuredId: process.env.PRO_PLAN || "805971"
  }, // Pro Plan from environment
  // Add the actual product ID being sent by LemonSqueezy webhook
  "516476": {
    credits: 30,
    amount: 299, // $2.99 in cents
    planId: "standard",
    configuredId: "516476"
  }, // Actual LemonSqueezy product ID for standard plan
};

export async function POST(req: Request) {
  console.log("Webhook POST request received");

  try {
    // Early return for health checks
    if (req.headers.get("user-agent")?.includes("curl") || req.headers.get("user-agent")?.includes("Postman")) {
      return Response.json({ message: "Webhook endpoint is working" });
    }

    // Catch the event type
    const clonedReq = req.clone();
    const eventType = req.headers.get("X-Event-Name");

    console.log("Event type:", eventType);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Failed to parse JSON body:", parseError);
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Check signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET is not set");
      return Response.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const signature = req.headers.get("X-Signature");
    if (!signature) {
      console.error("No X-Signature header found");
      return Response.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify signature
    try {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = Buffer.from(
        hmac.update(await clonedReq.text()).digest("hex"),
        "utf8"
      );
      const signatureBuffer = Buffer.from(signature, "utf8");

      if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
        console.error("Invalid signature");
        return Response.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch (signatureError) {
      console.error("Signature verification error:", signatureError);
      return Response.json({ error: "Signature verification failed" }, { status: 401 });
    }

    console.log("Webhook body:", JSON.stringify(body, null, 2));
    console.log("Available product mappings:", Object.keys(PRODUCT_CREDITS));

    // Logic according to event
    if (eventType === "order_created") {
      // Fix: Use user_id instead of userId (LemonSqueezy uses snake_case)
      const userId = body.meta?.custom_data?.user_id;
      const email = body.meta?.custom_data?.email;
      const productId = body.data?.attributes?.first_order_item?.product_id?.toString();
      const isSuccessful = body.data?.attributes?.status === "paid";
      const orderId = body.data?.id;
      const paymentId = body.data?.attributes?.identifier;

      console.log("Payment details:", { userId, email, productId, isSuccessful, orderId, paymentId });

      if (!userId) {
        console.error("No user ID found in webhook data");
        return Response.json({ error: "Missing user ID" }, { status: 400 });
      }

      if (isSuccessful && productId && PRODUCT_CREDITS[productId as keyof typeof PRODUCT_CREDITS]) {
        const planInfo = PRODUCT_CREDITS[productId as keyof typeof PRODUCT_CREDITS];

        try {
          // Find user by clerk ID
          const user = await userService.getUserByClerkId(userId);

          if (!user) {
            console.error("User not found for clerkId:", userId);
            return Response.json({ message: "User not found" }, { status: 404 });
          }

          console.log(`User found: ${user.id}, current credits: ${user.credits}`);

          // Add credits to user account
          const updatedUser = await userService.updateUserCredits(user.id, planInfo.credits);
          console.log(`Added ${planInfo.credits} credits to user ${user.id}. New total: ${updatedUser.credits}`);

          // Save payment record in the database
          const paymentRecord = await prisma.payment.create({
            data: {
              userId: user.id,
              amount: planInfo.amount,
              credits: planInfo.credits,
              paymentId: paymentId,
              orderId: orderId,
              status: "completed",
              planId: planInfo.planId,
            },
          });
          console.log("Payment record saved successfully:", paymentRecord.id);

        } catch (dbError) {
          console.error("Database error:", dbError);
          return Response.json({ message: "Database error" }, { status: 500 });
        }
      } else {
        console.log("Conditions not met:", {
          isSuccessful,
          productId,
          hasProductInMapping: productId ? !!PRODUCT_CREDITS[productId as keyof typeof PRODUCT_CREDITS] : false,
          availableProducts: Object.keys(PRODUCT_CREDITS),
          receivedProductId: productId
        });
      }
    }

    return Response.json({ message: "Webhook received successfully" });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ message: "Server error", error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// Add GET method for testing
export async function GET() {
  return Response.json({
    message: "LemonSqueezy Webhook endpoint is working",
    timestamp: new Date().toISOString(),
    availableProducts: Object.keys(PRODUCT_CREDITS)
  });
}