import axios from "axios";

export const LEMON_SQUEEZY_ENDPOINT = "https://api.lemonsqueezy.com/v1";

export const lemonsqueezyApiInstance = axios.create({
  baseURL: LEMON_SQUEEZY_ENDPOINT,
  headers: {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
  },
});

export const getProducts = async () => {
  const response = await lemonsqueezyApiInstance.get("/products");
  return response.data;
};