import crypto from "crypto";
import { prisma, userService } from "@/lib/db";

// Credit mapping: LemonSqueezy Product IDs -> Plan Details
// Uses environment variables for configured product IDs
const PRODUCT_CREDITS = {
  [process.env.STANDARD_PLAN || "805962"]: {
    credits: 30,
    amount: 500,
    planId: "standard",
    configuredId: process.env.STANDARD_PLAN || "805962"
  }, // Standard Plan from environment
  [process.env.PRO_PLAN || "805971"]: {
    credits: 75,
    amount: 1000,
    planId: "pro",
    configuredId: process.env.PRO_PLAN || "805971"
  }, // Pro Plan from environment
};

export async function POST(req: Request) {
  try {
    // Catch the event type
    const clonedReq = req.clone();
    const eventType = req.headers.get("X-Event-Name");
    const body = await req.json();

    // Check signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error("LEMONSQUEEZY_WEBHOOK_SECRET is not set");
    }
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(
      hmac.update(await clonedReq.text()).digest("hex"),
      "utf8"
    );
    const signature = Buffer.from(req.headers.get("X-Signature") || "", "utf8");

    if (!crypto.timingSafeEqual(digest, signature)) {
      throw new Error("Invalid signature.");
    }

    console.log("Webhook body:", body);

    // Logic according to event
    if (eventType === "order_created") {
      // Fix: Use user_id instead of userId (LemonSqueezy uses snake_case)
      const userId = body.meta.custom_data.user_id;
      const email = body.meta.custom_data.email;
      const productId = body.data.attributes.first_order_item?.product_id?.toString();
      const isSuccessful = body.data.attributes.status === "paid";
      const orderId = body.data.id;
      const paymentId = body.data.attributes.identifier;

      console.log("Payment details:", { userId, email, productId, isSuccessful, orderId, paymentId });

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
          availableProducts: Object.keys(PRODUCT_CREDITS)
        });
      }
    }

    return Response.json({ message: "Webhook received" });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}