import { lemonsqueezyApiInstance } from "@/lib/lemonsqueezy";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic"

export async function POST(request: Request) {

  try {
    const reqData = await request.json();

    if (!reqData.productId) {
      return new Response("Product ID is required", { status: 400 })
    }

    const response = await lemonsqueezyApiInstance.post("/checkouts", {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              user_id: reqData.userId,
              email: reqData.email,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.LEMONSQUEEZY_STORE_ID?.toString(),
            },
          },
          variant: {
            data: {
              type: "variants",
              id: reqData.productId.toString(),
            },
          },
        }
      }
    })
    const checkoutUrl = response.data.data.attributes.url;
    console.log(response.data);
    return new Response(JSON.stringify({ url: checkoutUrl }), { status: 200 })

  } catch (error) {
    console.error(error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
