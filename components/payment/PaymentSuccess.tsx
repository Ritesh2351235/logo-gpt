"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";
import { Sparkles } from "lucide-react";

export default function PaymentSuccess({ credits, plan }: { credits: number; plan: string }) {
  const router = useRouter();
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <BlurFade delay={0.1} inView>
        <div className="relative mb-6">
          <div className="absolute -inset-4">
            <div className="w-full h-full max-w-sm mx-auto blur-lg bg-gradient-to-r from-blue-500 to-purple-500 opacity-30" />
          </div>
          <Sparkles className="h-16 w-16 text-blue-500 relative animate-pulse" />
        </div>
      </BlurFade>
      <BlurFadeText delay={0.2}>
        <h2 className="text-2xl font-bold mb-2 text-center">Payment Successful!</h2>
      </BlurFadeText>
      <BlurFade delay={0.3} inView>
        <div className="text-lg text-neutral-700 dark:text-neutral-200 mb-2 text-center">
          You have purchased <span className="font-bold text-blue-600">{credits} credits</span> ({plan}).
        </div>
        <div className="text-neutral-500 text-center">Redirecting to your dashboard...</div>
      </BlurFade>
    </div>
  );
} 