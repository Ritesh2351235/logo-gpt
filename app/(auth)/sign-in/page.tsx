import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mb-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h2 className="text-3xl font-bold">Logo Master</h2>
          </Link>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            Sign in to your account
          </p>
        </div>
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                card: "bg-white dark:bg-neutral-900 shadow-none border border-neutral-200 dark:border-neutral-800",
                headerTitle: "text-neutral-900 dark:text-neutral-50",
                headerSubtitle: "text-neutral-500 dark:text-neutral-400",
                formButtonPrimary: "bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300",
                formFieldLabel: "text-neutral-500 dark:text-neutral-400",
                formFieldInput: "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-50",
                footerActionLink: "text-neutral-900 dark:text-neutral-50 hover:text-neutral-700 dark:hover:text-neutral-300",
                identityPreviewText: "text-neutral-900 dark:text-neutral-50",
                formFieldAction: "text-neutral-900 dark:text-neutral-50 hover:text-neutral-700 dark:hover:text-neutral-300",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/dashboard"
          />
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="font-medium text-neutral-900 dark:text-neutral-50 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Link href="/" className="mt-8">
        <Button variant="outline" size="sm">
          Back to home
        </Button>
      </Link>
    </div>
  );
} 