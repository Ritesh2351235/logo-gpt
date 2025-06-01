"use client";
import { useRouter } from "next/navigation";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentFailure({ error }: { error: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <BlurFade delay={0.1} inView>
        <div className="relative mb-6">
          <div className="absolute -inset-4">
            <div className="w-full h-full max-w-sm mx-auto blur-lg bg-gradient-to-r from-red-500 to-pink-500 opacity-30" />
          </div>
          <XCircle className="h-16 w-16 text-red-500 relative animate-pulse" />
        </div>
      </BlurFade>
      <BlurFadeText delay={0.2}>
        <h2 className="text-2xl font-bold mb-2 text-center">Payment Failed</h2>
      </BlurFadeText>
      <BlurFade delay={0.3} inView>
        <div className="text-lg text-neutral-700 dark:text-neutral-200 mb-2 text-center">
          {error || "Something went wrong. Please try again."}
        </div>
        <Button
          className="mt-4 px-8 py-3 text-base rounded-full"
          variant="destructive"
          onClick={() => router.push("/payment")}
        >
          Try Again
        </Button>
      </BlurFade>
    </div>
  );
} 