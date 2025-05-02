import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/magicui/blur-fade";
import { BlurFadeText } from "@/components/magicui/blur-fade-text";

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950">
      <BlurFade delay={0.1} inView className="w-full max-w-md mb-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">LogoGPT</h2>
          </Link>
          <p className="mt-3 text-xl text-neutral-600 dark:text-neutral-400">
            Start creating amazing logos
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp
            appearance={{
              elements: {
                card: "bg-white dark:bg-neutral-900 shadow-lg rounded-xl border border-neutral-200 dark:border-neutral-800",
                headerTitle: "text-2xl font-bold tracking-tighter",
                headerSubtitle: "text-neutral-500 dark:text-neutral-400",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium shadow-md hover:shadow-lg transition-all",
                formFieldLabel: "text-neutral-700 dark:text-neutral-300 font-medium",
                formFieldInput: "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-50 rounded-lg py-2.5 focus:ring-2 focus:ring-blue-500",
                footerActionLink: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium",
                identityPreviewText: "text-neutral-900 dark:text-neutral-50",
                formFieldAction: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium",
              },
            }}
            routing="hash"
            signInUrl="/sign-in"
            redirectUrl="/dashboard"
          />
        </div>
        <div className="mt-8 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </BlurFade>
      <BlurFade delay={0.2} inView>
        <Link href="/" className="mt-8">
          <Button variant="outline" size="lg" className="rounded-full px-6">
            Back to home
          </Button>
        </Link>
      </BlurFade>
    </div>
  );
} 