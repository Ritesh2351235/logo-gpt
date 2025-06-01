declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: string;
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string;
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string;
    DATABASE_URL: string;
    OPENAI_API_KEY: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    EXCHANGE_RATE_HOST_ACCESS_KEY: string;
    NEXT_PUBLIC_RAZORPAY_KEY_ID: string;
  }
} 